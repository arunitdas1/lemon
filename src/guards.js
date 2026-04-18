const { PermissionFlagsBits } = require('discord.js');
const music = require('./music/musicManager');

function assertGuildInteraction(interaction) {
  if (!interaction.inGuild()) {
    throw new Error('This command can only be used in a server.');
  }
}

function assertUserInVoice(interaction) {
  const memberChannel = interaction.member?.voice?.channel;
  if (!memberChannel) {
    throw new Error('Join a voice channel first.');
  }

  return memberChannel;
}

function assertSameVoiceAsBot(interaction) {
  const memberChannel = assertUserInVoice(interaction);
  const botChannelId = music.currentVoiceChannelId(interaction.guildId);

  if (botChannelId && botChannelId !== memberChannel.id) {
    throw new Error('Join the same voice channel as the bot to control playback.');
  }
}

function assertManageGuild(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    throw new Error('You need the Manage Server permission to change settings.');
  }
}

module.exports = {
  assertGuildInteraction,
  assertUserInVoice,
  assertSameVoiceAsBot,
  assertManageGuild
};
