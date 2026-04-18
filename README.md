# Lemon Discord Music Bot

Discord music bot built with **discord.js v14**, button-based playback controls, embed-first responses, and **guild-specific settings** persisted in **MySQL**.

## Features

- Slash commands for playback: `/play`, `/queue`, `/skip`, `/pause`, `/resume`, `/stop`
- Button UI on music messages: Pause, Resume, Skip, Stop, Queue
- Configurable embed UI per guild (`/settings`):
  - `embed_color`
  - `footer_text`
  - `ui_style` (`default` / `minimal`)
  - `stay_in_voice` (`true` / `false`)
- `/help` command for guided command overview
- MySQL persistence for server-specific settings

## Security & Safety Guards

- `/settings set` requires **Manage Server** permission.
- Playback control commands/buttons require the user to be in voice and in the same voice channel as the bot.
- Queue progression and playback errors are handled to avoid unhandled promise crashes.
- Parameterized MySQL queries are used for persistence.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill values:

```bash
cp .env.example .env
```

3. Register commands:

```bash
npm run register
```

4. Start bot:

```bash
npm start
```

## Validation / Checks

```bash
npm run lint
```

## Notes

- Music playback uses YouTube via `play-dl`.
- You must enable privileged intents in the Discord developer portal if your deployment requires them.
