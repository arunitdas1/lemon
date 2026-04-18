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

## Notes

- Music playback uses YouTube via `play-dl`.
- You must enable privileged intents in the Discord developer portal if your deployment requires them.
