const music = require('../music/musicManager');
const { commandMap } = require('../commandRegistry');
const { getGuildSettings } = require('../db');
const { buildMusicEmbed } = require('../ui');
const { assertSameVoiceAsBot, assertUserInVoice } = require('../guards');

const buttonActions = {
  music_pause: { action: 'pause', title: 'Paused', run: (guildId) => music.pause(guildId) },
  music_resume: { action: 'resume', title: 'Resumed', run: (guildId) => music.resume(guildId) },
  music_skip: { action: 'skip', title: 'Skipped', run: (guildId) => music.skip(guildId) },
  music_stop: { action: 'stop', title: 'Stopped', run: (guildId) => music.stop(guildId) },
  music_queue: { action: 'queue' }
};

async function replySafely(interaction, payload) {
  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ ...payload, ephemeral: true });
    return;
  }

  await interaction.reply(payload);
}

module.exports = async function onInteractionCreate(interaction) {
  if (interaction.isChatInputCommand()) {
    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Command ${interaction.commandName} failed:`, error);
      const payload = { content: `❌ ${error.message || 'Command failed.'}`, ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload.content);
      } else {
        await interaction.reply(payload);
      }
    }
  }

  if (interaction.isButton()) {
    const meta = buttonActions[interaction.customId];
    if (!meta) return;

    try {
      assertUserInVoice(interaction);
      assertSameVoiceAsBot(interaction);

      const settings = await getGuildSettings(interaction.guildId);

      if (meta.action === 'queue') {
        const snapshot = music.snapshot(interaction.guildId);
        const desc = snapshot.queued.length
          ? snapshot.queued.map((song, i) => `${i + 1}. ${song.title}`).join('\n')
          : 'Queue is empty.';
        const embed = buildMusicEmbed(settings, 'Queue', desc);
        await replySafely(interaction, { embeds: [embed], ephemeral: true });
        return;
      }

      meta.run(interaction.guildId);

      if (meta.action === 'stop' && !settings.stayInVoice) {
        music.disconnect(interaction.guildId);
      }

      const embed = buildMusicEmbed(settings, meta.title, `Playback action: ${meta.action}`);
      await replySafely(interaction, { embeds: [embed], ephemeral: true });
    } catch (error) {
      await replySafely(interaction, { content: `❌ ${error.message || 'Button action failed.'}`, ephemeral: true });
    }
  }
};
