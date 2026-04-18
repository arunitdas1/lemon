const { SlashCommandBuilder } = require('discord.js');
const { getGuildSettings, upsertGuildSettings } = require('../db');
const { buildMusicEmbed } = require('../ui');
const { assertGuildInteraction, assertManageGuild } = require('../guards');

const validOptions = ['embed_color', 'footer_text', 'ui_style', 'stay_in_voice'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View or update guild-specific bot settings.')
    .addSubcommand((subcommand) => subcommand.setName('view').setDescription('View current settings.'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set a setting value.')
        .addStringOption((option) =>
          option
            .setName('option')
            .setDescription('Setting option')
            .setRequired(true)
            .addChoices(...validOptions.map((item) => ({ name: item, value: item })))
        )
        .addStringOption((option) =>
          option.setName('value').setDescription('New setting value').setRequired(true)
        )
    ),
  async execute(interaction) {
    assertGuildInteraction(interaction);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const settings = await getGuildSettings(interaction.guildId);
      const embed = buildMusicEmbed(
        settings,
        'Server Settings',
        `embed_color: ${settings.embedColor}\nfooter_text: ${settings.footerText}\nui_style: ${settings.uiStyle}\nstay_in_voice: ${settings.stayInVoice}`
      );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    assertManageGuild(interaction);

    const option = interaction.options.getString('option', true);
    const value = interaction.options.getString('value', true);
    const updates = {};

    if (option === 'embed_color') {
      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
        await interaction.reply({ content: 'Use a hex color like #5865F2.', ephemeral: true });
        return;
      }
      updates.embedColor = value;
    }

    if (option === 'footer_text') {
      updates.footerText = value.trim().slice(0, 120);
    }

    if (option === 'ui_style') {
      if (!['default', 'minimal'].includes(value)) {
        await interaction.reply({ content: 'ui_style must be `default` or `minimal`.', ephemeral: true });
        return;
      }
      updates.uiStyle = value;
    }

    if (option === 'stay_in_voice') {
      if (!['true', 'false'].includes(value.toLowerCase())) {
        await interaction.reply({ content: 'stay_in_voice must be `true` or `false`.', ephemeral: true });
        return;
      }
      updates.stayInVoice = value.toLowerCase() === 'true';
    }

    const next = await upsertGuildSettings(interaction.guildId, updates);
    const embed = buildMusicEmbed(next, 'Settings Updated', `${option} set successfully.`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
