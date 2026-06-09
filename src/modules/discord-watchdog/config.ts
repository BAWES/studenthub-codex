/**
 * Configuration for Discord bot permission watchdog.
 *
 * Required environment variables:
 *   DISCORD_BOT_TOKEN        — Bot token from Discord Developer Portal
 *   DISCORD_ALERTS_WEBHOOK   — Webhook URL for the #alerts channel
 *   DISCORD_APPLICATION_ID   — Bot application ID (optional, for self-referencing)
 *
 * Optional:
 *   DISCORD_WATCHDOG_INTERVAL — How often to run (just informational, cron drives it)
 */

import { DISCORD_PERMISSIONS, type PermissionKey, type RequiredPermission } from './types';

/** The bot's Discord Application ID — useful for API self-referencing. */
export const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID ?? '';

/** Discord bot token used for all REST API calls. */
export const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';

/** Webhook URL for the #alerts channel where notifications are posted. */
export const ALERTS_WEBHOOK_URL = process.env.DISCORD_ALERTS_WEBHOOK ?? '';

/** Guild ID to monitor. If empty, monitors all guilds the bot is in. */
export const TARGET_GUILD_ID = process.env.DISCORD_GUILD_ID ?? '';

/**
 * The set of permissions the bot requires to function.
 *
 * Add or remove entries based on what the bot actually does:
 * - View Channels + Send Messages: basic communication
 * - Read Message History: needed to respond to slash commands context
 * - Manage Roles: needed to assign student/candidate/staff roles
 * - Manage Messages: needed to clean up bot responses
 * - Embed Links / Attach Files: rich responses
 * - Use Application Commands: slash command handling
 */
export const REQUIRED_PERMISSIONS: RequiredPermission[] = [
  { key: 'VIEW_CHANNEL', bit: DISCORD_PERMISSIONS.VIEW_CHANNEL, rationale: 'Read messages in channels' },
  { key: 'SEND_MESSAGES', bit: DISCORD_PERMISSIONS.SEND_MESSAGES, rationale: 'Send responses and alerts' },
  { key: 'READ_MESSAGE_HISTORY', bit: DISCORD_PERMISSIONS.READ_MESSAGE_HISTORY, rationale: 'Read slash command context' },
  { key: 'MANAGE_ROLES', bit: DISCORD_PERMISSIONS.MANAGE_ROLES, rationale: 'Assign student/candidate roles' },
  { key: 'MANAGE_MESSAGES', bit: DISCORD_PERMISSIONS.MANAGE_MESSAGES, rationale: 'Clean up bot messages' },
  { key: 'EMBED_LINKS', bit: DISCORD_PERMISSIONS.EMBED_LINKS, rationale: 'Rich embed responses' },
  { key: 'ATTACH_FILES', bit: DISCORD_PERMISSIONS.ATTACH_FILES, rationale: 'Upload reports and exports' },
  { key: 'USE_APPLICATION_COMMANDS', bit: DISCORD_PERMISSIONS.USE_APPLICATION_COMMANDS, rationale: 'Slash command handling' },
  { key: 'MENTION_EVERYONE', bit: DISCORD_PERMISSIONS.MENTION_EVERYONE, rationale: 'Broadcast important alerts' },
  { key: 'ADD_REACTIONS', bit: DISCORD_PERMISSIONS.ADD_REACTIONS, rationale: 'Reaction role assignment' },
];

/** Human-readable names for permissions (for logging/alerting). */
export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  CREATE_INSTANT_INVITE: 'Create Invite',
  KICK_MEMBERS: 'Kick Members',
  BAN_MEMBERS: 'Ban Members',
  ADMINISTRATOR: 'Administrator',
  MANAGE_CHANNELS: 'Manage Channels',
  MANAGE_GUILD: 'Manage Server',
  ADD_REACTIONS: 'Add Reactions',
  VIEW_AUDIT_LOG: 'View Audit Log',
  PRIORITY_SPEAKER: 'Priority Speaker',
  STREAM: 'Video',
  VIEW_CHANNEL: 'View Channels',
  SEND_MESSAGES: 'Send Messages',
  SEND_TTS_MESSAGES: 'Send TTS Messages',
  MANAGE_MESSAGES: 'Manage Messages',
  EMBED_LINKS: 'Embed Links',
  ATTACH_FILES: 'Attach Files',
  READ_MESSAGE_HISTORY: 'Read Message History',
  MENTION_EVERYONE: 'Mention @everyone',
  USE_EXTERNAL_EMOJIS: 'Use External Emoji',
  VIEW_GUILD_INSIGHTS: 'View Insights',
  CONNECT: 'Connect',
  SPEAK: 'Speak',
  MUTE_MEMBERS: 'Mute Members',
  DEAFEN_MEMBERS: 'Deafen Members',
  MOVE_MEMBERS: 'Move Members',
  USE_VAD: 'Use Voice Activity',
  CHANGE_NICKNAME: 'Change Nickname',
  MANAGE_NICKNAMES: 'Manage Nicknames',
  MANAGE_ROLES: 'Manage Roles',
  MANAGE_WEBHOOKS: 'Manage Webhooks',
  MANAGE_GUILD_EXPRESSIONS: 'Manage Expressions',
  USE_APPLICATION_COMMANDS: 'Use Slash Commands',
  REQUEST_TO_SPEAK: 'Request to Speak',
  MANAGE_EVENTS: 'Manage Events',
  MANAGE_THREADS: 'Manage Threads',
  CREATE_PUBLIC_THREADS: 'Create Public Threads',
  CREATE_PRIVATE_THREADS: 'Create Private Threads',
  USE_EXTERNAL_STICKERS: 'Use External Stickers',
  SEND_MESSAGES_IN_THREADS: 'Send Messages in Threads',
  USE_EMBEDDED_ACTIVITIES: 'Use Activities',
  MODERATE_MEMBERS: 'Moderate Members',
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 'View Monetization',
  USE_SOUNDBOARD: 'Use Soundboard',
  USE_EXTERNAL_SOUNDS: 'Use External Sounds',
  SEND_VOICE_MESSAGES: 'Send Voice Messages',
};

/**
 * Compute the required permissions bitfield.
 */
export function requiredPermissionsBitfield(): bigint {
  return REQUIRED_PERMISSIONS.reduce((acc, p) => acc | p.bit, 0n);
}

/**
 * Validate that required env vars are set.
 */
export function validateConfig(): string[] {
  const errors: string[] = [];
  if (!BOT_TOKEN) errors.push('DISCORD_BOT_TOKEN is required');
  if (!ALERTS_WEBHOOK_URL) errors.push('DISCORD_ALERTS_WEBHOOK is required');
  return errors;
}
