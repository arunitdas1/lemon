const { SlashCommandBuilder } = require('discord.js');
const { getGuildSettings } = require('../db');
const { buildMusicEmbed } = require('../ui');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Show available bot commands.'),
  async execute(interaction) {
    const settings = await getGuildSettings(interaction.guildId);
    const embed = buildMusicEmbed(
      settings,
      'Help Menu',
      [
        '`/play <query>` - Queue and play a song.',
        '`/queue` - Show the next songs in queue.',
        '`/skip` - Skip current song.',
        '`/pause` - Pause playback.',
        '`/resume` - Resume playback.',
        '`/stop` - Stop playback and clear queue.',
        '`/settings view` - See this server\'s UI settings.',
        '`/settings set <option> <value>` - Update this server\'s UI settings.'
      ].join('\n')
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
