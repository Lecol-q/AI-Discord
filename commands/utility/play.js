const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song!')
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('Song name or link')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('You need to be in a voice channel...');
        }

        await interaction.deferReply();
        const player = useMainPlayer();
        const song = interaction.options.getString('song');

        try {
            const { track } = await player.play(voiceChannel, song, {
                nodeOptions: {
                    metadata: interaction,
                }
            });
            await interaction.editReply(`Now playing **${track.title}**`);
        } catch (err) {
            console.error(err);
            await interaction.editReply('Song cannot be played :(')
        }
    },
};