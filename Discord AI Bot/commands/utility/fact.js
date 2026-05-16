const { SlashCommandBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const { apiKey } = require('../../config.json');

const ai = new GoogleGenAI({ apiKey });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fact')
        .setDescription('Generates a random!'),

    async execute(interaction) {

        await interaction.deferReply();

        // Gemini prompt
        const systemInstruction = 'Generate a random fact'

        try {

            const response = await ai.models.generateContent({

                    model: 'gemini-2.5-flash',
                    contents: [
                        {
                           role: 'user',
                           parts:[{ text: 'Generate a random fact'}]
                        },
                    ],
                });

            const text = response.text;

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