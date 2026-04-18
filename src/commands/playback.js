const { SlashCommandBuilder } = require('discord.js');
const music = require('../music/musicManager');
const { getGuildSettings } = require('../db');
const { buildMusicEmbed } = require('../ui');

const actions = {
  skip: { title: 'Skipped', run: (guildId) => music.skip(guildId) },
  pause: { title: 'Paused', run: (guildId) => music.pause(guildId) },
  resume: { title: 'Resumed', run: (guildId) => music.resume(guildId) },
  stop: { title: 'Stopped', run: (guildId) => music.stop(guildId) }
};

function command(name) {
  return {
    data: new SlashCommandBuilder().setName(name).setDescription(`${name} playback.`),
    async execute(interaction) {
      actions[name].run(interaction.guildId);
      const settings = await getGuildSettings(interaction.guildId);
      const embed = buildMusicEmbed(settings, actions[name].title, `Playback action: ${name}`);
      await interaction.reply({ embeds: [embed] });
    }
  };
}

module.exports = [command('skip'), command('pause'), command('resume'), command('stop')];
