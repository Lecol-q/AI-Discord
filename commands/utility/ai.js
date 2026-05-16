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

        try {

            const response = await ai.models.generateContent({

                    model: 'gemini-2.5-flash',

                    contents: [
                        ...history,
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
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