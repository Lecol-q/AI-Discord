// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { Player } = require('discord-player');
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9');
const { DefaultExtractors } = require('@discord-player/extractor');

// Create a new client instance
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
]});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log('[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.');
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Handling @mention messages
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
        const prompt = message.content.replace(/<@!?[\d]+>/g, '').trim();

    if (!prompt) {
        message.reply('Yes? Prompt me via @ messages!');
        return;
    }

    try {
        const { generateResponse } = require('./commands/utility/ai.js');

        const text = await generateResponse(prompt, message.author.id, {
            guild: message.guild,
            channel: message.channel,
            username: message.author.username,
            });

    const chunks = text.match(/[\s\S]{1,2000}/g) || ['No response.'];
    message.reply(chunks[0]);
        for (let i = 1; i < chunks.length; i++) {
            await message.channel.send(chunks[i]);
        }
    } catch (err) {
        console.error(err);
        message.reply('Something went wrong!');
    }
}
});

// music player
client.once('clientReady', async () => {
    client.player = new Player(client, {
        skipFFmeg: false,
        audioQuality: 'high',
    });
    await client.player.extractors.loadMulti(DefaultExtractors);
    console.log('Music player is ready!');
});

client.login(token);