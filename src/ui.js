const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildMusicEmbed(settings, title, description) {
  const embed = new EmbedBuilder()
    .setColor(settings.embedColor)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: settings.footerText })
    .setTimestamp();

  if (settings.uiStyle === 'minimal') {
    embed.setAuthor({ name: 'Lemon Music' });
  }

  return embed;
}

function buildControlButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('music_pause').setLabel('Pause').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('music_resume').setLabel('Resume').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('music_skip').setLabel('Skip').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('music_stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('music_queue').setLabel('Queue').setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

module.exports = {
  buildMusicEmbed,
  buildControlButtons
};
