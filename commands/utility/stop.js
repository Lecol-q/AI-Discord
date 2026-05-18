const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops playing music'),

    async execute(interaction) {
        const queue = useQueue(interaction.guild.id);

        if(!queue) {
            return interaction.reply('No music playing...');
        }

        queue.delete();
        await interaction.reply('Music has stopped playing!');
    }
}