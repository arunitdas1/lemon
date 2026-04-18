const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool(config.mysql);

const defaultGuildSettings = Object.freeze({
  embedColor: '#5865F2',
  footerText: 'Powered by Lemon Music',
  uiStyle: 'default',
  stayInVoice: false
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id VARCHAR(32) PRIMARY KEY,
      embed_color VARCHAR(7) NOT NULL DEFAULT '#5865F2',
      footer_text VARCHAR(120) NOT NULL DEFAULT 'Powered by Lemon Music',
      ui_style ENUM('default', 'minimal') NOT NULL DEFAULT 'default',
      stay_in_voice BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function getGuildSettings(guildId) {
  const [rows] = await pool.query('SELECT * FROM guild_settings WHERE guild_id = ?', [guildId]);

  if (rows.length === 0) {
    return { ...defaultGuildSettings };
  }

  const row = rows[0];
  return {
    embedColor: row.embed_color,
    footerText: row.footer_text,
    uiStyle: row.ui_style,
    stayInVoice: Boolean(row.stay_in_voice)
  };
}

async function upsertGuildSettings(guildId, updates) {
  const current = await getGuildSettings(guildId);
  const next = { ...current, ...updates };

  await pool.query(
    `
    INSERT INTO guild_settings (guild_id, embed_color, footer_text, ui_style, stay_in_voice)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      embed_color = VALUES(embed_color),
      footer_text = VALUES(footer_text),
      ui_style = VALUES(ui_style),
      stay_in_voice = VALUES(stay_in_voice)
    `,
    [guildId, next.embedColor, next.footerText, next.uiStyle, next.stayInVoice]
  );

  return next;
}

module.exports = {
  pool,
  initializeDatabase,
  getGuildSettings,
  upsertGuildSettings,
  defaultGuildSettings
};
