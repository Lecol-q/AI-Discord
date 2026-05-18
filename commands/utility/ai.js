const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const { apiKey } = require('../../config.json');
const { ConversationManager } = require('../../managers/ConversationManager');

const ai = new GoogleGenAI({ apiKey });
const conversationManager = new ConversationManager();

const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Chat with the bot!')
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('What to ask')
                .setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const prompt = interaction.options.getString('prompt');
        const history = conversationManager.getHistory(interaction.user.id);

        // Gemini server conciousness
        const systemInstruction = `You are a helpful assistant in a Discord server. Here is the server info:

Server Name: ${interaction.guild.name}
Server ID: ${interaction.guild.id}
Member Count: ${interaction.guild.memberCount}
Channel being used: #${interaction.channel.name}
User talking to you: ${interaction.user.username}

Channels:
${interaction.guild.channels.cache
                .filter(c => c.type === 0)
                .map(c => `- #${c.name}`)
                .join('\n')}

Roles:
${interaction.guild.roles.cache
                .map(r => `- ${r.name}`)
                .join('\n')}

Members:
${interaction.guild.members.cache
                .map(m => `- ${m.user.username} (nickname: ${m.nickname || 'none'}, roles: ${m.roles.cache
                    .filter(r => r.name !== '@everyone')
                    .map(r => r.name)
                    .join(', ') || 'none'}, joined: ${m.joinedAt.toDateString()})`)
                .join('\n')}`;

        try {

            const response = await ai.models.generateContent({

                    model: 'gemini-2.5-flash',
                    systemInstruction,

                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: systemInstruction}],
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'Understood! I am aware of the server and will use this information to help.' }],
                        },
                        ...history,
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        }
                    ],
                });

            const text = response.text;

            conversationManager.updateChatHistory(
                interaction.user.id,
                prompt,
                text
            );

            const chunks = text.match(/[\s\S]{1,2000}/g) || ['No response.'];

            await interaction.editReply(chunks[0]);
            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp(chunks[i]);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply('Error generating response.');
        }
    },
};