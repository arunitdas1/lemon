const { REST, Routes } = require('discord.js');
const config = require('./config');
const { commands } = require('./commandRegistry');

async function main() {
  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  await rest.put(Routes.applicationCommands(config.discord.clientId), {
    body: commands.map((command) => command.data.toJSON())
  });

  console.log(`Registered ${commands.length} slash commands.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
