const { Events } = require('discord.js');

const { ConversationManager } = require('../managers/ConversationManager');

// Google Gemini API
const { GoogleGenAI } = require("@google/genai");
const { apiKey } = require("../config.json");

const ai = new GoogleGenAI({ apiKey });

const CHANNEL_ID = '1503942463260327976';
const MIN_HOURS = 2
const MAX_HOURS = 12;

function getRandomDelay() {
	const min = MIN_HOURS * 60 * 60 * 1000;
	const max = MAX_HOURS * 60 * 60 * 1000;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendConversationStarter(client) {
	try {
		const channel = client.channels.cache.get(CHANNEL_ID);
		if (!channel) return;

		const response = await ai.models.generateContent({
			mode: 'gemini-2.5-flash',
			contents: [
				{
					role: 'user',
					parts: [{ text: 'Greet any user in the server and generate a fun and engaging conversation start'

					},
				],
				}
			]
		});

		const text = response.text;
		await channel.send(text);
	} catch (error) {
		console.error('Error senidng conversation starter:', error);
	} finally {
		setTimeout(() => sendConversationStarter(client), getRandomDelay());
	}
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		for (const guild of client.guilds.cache.values()) {
			await guild.members.fetch();
			console.log('Cached members for: ${guild.name}');
		}

		setTimeout (() => sendConversationStarter(client), getRandomDelay());
	},
};