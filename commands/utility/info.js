const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('info').setDescription('Information about Monkey Intelligence.'),
    async execute(interaction) {
		// info about Monkey AI
		await interaction.reply(
			'Monkey Intelligence is an AI Discord bot developed by Collin Le.\n\n' +
            '**Features include ~~Niggas~~**\n' +
            '- AI text prompting\n' +
            '- Random fact generation\n' +
            '- Music player\n' +

            'You can prompt the ai to display server information. But be careful! bhe hates being called **MONKEY!**\n\n' +

            '*Note: Current ai model is limited, only so many tokens(generations) in a time frame.*\n\n' +
            "That's all, fuck you guys!\n" +
            '- Collin Le'
		);
	},
};