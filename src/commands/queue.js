const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/musicManager');
const { getGuildSettings } = require('../db');
const { buildMusicEmbed } = require('../ui');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Show current queue.'),
  async execute(interaction) {
    const state = music.snapshot(interaction.guildId);
    const settings = await getGuildSettings(interaction.guildId);

    const lines = [];
    if (state.nowPlaying) {
      lines.push(`Now Playing: **${state.nowPlaying.title}**`);
    } else {
      lines.push('Now Playing: *(nothing)*');
    }

    if (state.queued.length) {
      lines.push('\nUp Next:');
      state.queued.forEach((track, index) => lines.push(`${index + 1}. ${track.title}`));
    } else {
      lines.push('\nUp Next: *(empty)*');
    }

    const embed = buildMusicEmbed(settings, 'Music Queue', lines.join('\n'));
    await interaction.reply({ embeds: [embed] });
  }
};
