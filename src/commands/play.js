const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/musicManager');
const { getGuildSettings } = require('../db');
const { buildMusicEmbed, buildControlButtons } = require('../ui');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube by URL or search query.')
    .addStringOption((option) =>
      option.setName('query').setDescription('URL or song search query').setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query', true);

    try {
      const track = await music.enqueue(interaction, query);
      const settings = await getGuildSettings(interaction.guildId);
      const embed = buildMusicEmbed(
        settings,
        'Queued Track',
        `**${track.title}**\nDuration: ${track.duration}\nRequested by: ${track.requestedBy}`
      );

      await interaction.editReply({ embeds: [embed], components: buildControlButtons() });
    } catch (error) {
      await interaction.editReply(`❌ ${error.message}`);
    }
  }
};
