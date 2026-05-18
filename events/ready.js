const { Events } = require('discord.js');

const { ConversationManager } = require('../managers/ConversationManager');

// Google Gemini API
const { GoogleGenAI } = require("@google/genai");
const { apiKey } = require("../config.json");

const ai = new GoogleGenAI({ apiKey });

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		for (const guild of client.guilds.cache.values()) {
			await guild.members.fetch();
			console.log('Cached members for: ${guild.name}');
		}
	},
};