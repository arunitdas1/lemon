const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  AudioPlayerError,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');
const play = require('play-dl');

class MusicManager {
  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      const player = createAudioPlayer();
      const queue = {
        tracks: [],
        connection: null,
        player,
        textChannelId: null,
        nowPlaying: null,
        isAdvancing: false
      };

      player.on(AudioPlayerStatus.Idle, () => {
        this.playNext(guildId).catch((error) => {
          console.error(`Failed while advancing queue for guild ${guildId}:`, error);
        });
      });

      player.on(AudioPlayerError, (error) => {
        console.error(`Playback error for guild ${guildId}:`, error.message);
        queue.nowPlaying = null;
        this.playNext(guildId).catch((nextError) => {
          console.error(`Failed to recover after playback error for guild ${guildId}:`, nextError);
        });
      });

      this.queues.set(guildId, queue);
    }

    return this.queues.get(guildId);
  }

  async connect(interaction) {
    const memberChannel = interaction.member.voice.channel;
    if (!memberChannel) {
      throw new Error('Join a voice channel first.');
    }

    const queue = this.getQueue(interaction.guildId);
    queue.textChannelId = interaction.channelId;

    const existingChannelId = queue.connection?.joinConfig?.channelId;
    if (existingChannelId && existingChannelId !== memberChannel.id) {
      throw new Error('Join the same voice channel as the bot to control playback.');
    }

    if (!queue.connection) {
      queue.connection = joinVoiceChannel({
        channelId: memberChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      queue.connection.subscribe(queue.player);

      try {
        await entersState(queue.connection, VoiceConnectionStatus.Ready, 15_000);
      } catch {
        queue.connection.destroy();
        queue.connection = null;
        throw new Error('Could not connect to voice channel in time.');
      }
    }

    return queue;
  }

  async enqueue(interaction, query) {
    const safeQuery = query.trim();
    if (!safeQuery || safeQuery.length > 200) {
      throw new Error('Query must be between 1 and 200 characters.');
    }

    const queue = await this.connect(interaction);

    let url = safeQuery;
    if (!play.yt_validate(safeQuery)) {
      const searchResults = await play.search(safeQuery, { limit: 1 });
      if (!searchResults.length) {
        throw new Error('No track found for that query.');
      }
      url = searchResults[0].url;
    }

    const info = await play.video_basic_info(url);
    const track = {
      title: info.video_details.title,
      url,
      requestedBy: interaction.user.tag,
      duration: info.video_details.durationRaw || 'Unknown'
    };

    queue.tracks.push(track);

    if (!queue.nowPlaying) {
      await this.playNext(interaction.guildId);
    }

    return track;
  }

  async playNext(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.isAdvancing) return;

    queue.isAdvancing = true;
    try {
      const next = queue.tracks.shift();

      if (!next) {
        queue.nowPlaying = null;
        return;
      }

      queue.nowPlaying = next;

      const stream = await play.stream(next.url, { quality: 2 });
      const resource = createAudioResource(stream.stream, { inputType: stream.type });
      queue.player.play(resource);
    } finally {
      queue.isAdvancing = false;
    }
  }

  skip(guildId) {
    const queue = this.getQueue(guildId);
    queue.player.stop(true);
  }

  pause(guildId) {
    const queue = this.getQueue(guildId);
    queue.player.pause();
  }

  resume(guildId) {
    const queue = this.getQueue(guildId);
    queue.player.unpause();
  }

  stop(guildId) {
    const queue = this.getQueue(guildId);
    queue.tracks = [];
    queue.player.stop(true);
    queue.nowPlaying = null;
  }

  disconnect(guildId) {
    const queue = this.getQueue(guildId);
    queue.tracks = [];
    queue.nowPlaying = null;
    queue.player.stop(true);

    if (queue.connection) {
      queue.connection.destroy();
      queue.connection = null;
    }
  }

  isConnected(guildId) {
    const queue = this.getQueue(guildId);
    return Boolean(queue.connection);
  }

  currentVoiceChannelId(guildId) {
    const queue = this.getQueue(guildId);
    return queue.connection?.joinConfig?.channelId || null;
  }

  snapshot(guildId) {
    const queue = this.getQueue(guildId);
    return {
      nowPlaying: queue.nowPlaying,
      queued: queue.tracks.slice(0, 10)
    };
  }
}

module.exports = new MusicManager();
