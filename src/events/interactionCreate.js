const music = require('../music/musicManager');
const { commandMap } = require('../commandRegistry');
const { getGuildSettings } = require('../db');
const { buildMusicEmbed } = require('../ui');

const buttonActions = {
  music_pause: { action: 'pause', title: 'Paused', run: (guildId) => music.pause(guildId) },
  music_resume: { action: 'resume', title: 'Resumed', run: (guildId) => music.resume(guildId) },
  music_skip: { action: 'skip', title: 'Skipped', run: (guildId) => music.skip(guildId) },
  music_stop: { action: 'stop', title: 'Stopped', run: (guildId) => music.stop(guildId) },
  music_queue: { action: 'queue' }
};

module.exports = async function onInteractionCreate(interaction) {
  if (interaction.isChatInputCommand()) {
    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      const content = `Command failed: ${error.message}`;
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(content);
      } else {
        await interaction.reply({ content, ephemeral: true });
      }
    }
  }

  if (interaction.isButton()) {
    const meta = buttonActions[interaction.customId];
    if (!meta) return;

    const settings = await getGuildSettings(interaction.guildId);

    if (meta.action === 'queue') {
      const snapshot = music.snapshot(interaction.guildId);
      const desc = snapshot.queued.length
        ? snapshot.queued.map((song, i) => `${i + 1}. ${song.title}`).join('\n')
        : 'Queue is empty.';
      const embed = buildMusicEmbed(settings, 'Queue', desc);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    meta.run(interaction.guildId);

    if (meta.action === 'stop' && !settings.stayInVoice) {
      music.disconnect(interaction.guildId);
    }

    const embed = buildMusicEmbed(settings, meta.title, `Playback action: ${meta.action}`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
