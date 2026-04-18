const play = require('./commands/play');
const help = require('./commands/help');
const settings = require('./commands/settings');
const queue = require('./commands/queue');
const playback = require('./commands/playback');

const commands = [play, help, settings, queue, ...playback];

module.exports = {
  commands,
  commandMap: new Map(commands.map((cmd) => [cmd.data.name, cmd]))
};
