const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const { initializeDatabase } = require('./db');
const onInteractionCreate = require('./events/interactionCreate');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', onInteractionCreate);

async function start() {
  await initializeDatabase();
  await client.login(config.discord.token);
}

start().catch((error) => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
