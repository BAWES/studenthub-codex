/**
 * Types for Discord bot permission watchdog.
 *
 * Discord API permission flags (bitfield constants).
 * https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
 */

export const DISCORD_PERMISSIONS = {
  CREATE_INSTANT_INVITE: 1n << 0n,
  KICK_MEMBERS: 1n << 1n,
  BAN_MEMBERS: 1n << 2n,
  ADMINISTRATOR: 1n << 3n,
  MANAGE_CHANNELS: 1n << 4n,
  MANAGE_GUILD: 1n << 5n,
  ADD_REACTIONS: 1n << 6n,
  VIEW_AUDIT_LOG: 1n << 7n,
  PRIORITY_SPEAKER: 1n << 8n,
  STREAM: 1n << 9n,
  VIEW_CHANNEL: 1n << 10n,
  SEND_MESSAGES: 1n << 11n,
  SEND_TTS_MESSAGES: 1n << 12n,
  MANAGE_MESSAGES: 1n << 13n,
  EMBED_LINKS: 1n << 14n,
  ATTACH_FILES: 1n << 15n,
  READ_MESSAGE_HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n,
  USE_EXTERNAL_EMOJIS: 1n << 18n,
  VIEW_GUILD_INSIGHTS: 1n << 19n,
  CONNECT: 1n << 20n,
  SPEAK: 1n << 21n,
  MUTE_MEMBERS: 1n << 22n,
  DEAFEN_MEMBERS: 1n << 23n,
  MOVE_MEMBERS: 1n << 24n,
  USE_VAD: 1n << 25n,
  CHANGE_NICKNAME: 1n << 26n,
  MANAGE_NICKNAMES: 1n << 27n,
  MANAGE_ROLES: 1n << 28n,
  MANAGE_WEBHOOKS: 1n << 29n,
  MANAGE_GUILD_EXPRESSIONS: 1n << 30n,
  USE_APPLICATION_COMMANDS: 1n << 31n,
  REQUEST_TO_SPEAK: 1n << 32n,
  MANAGE_EVENTS: 1n << 33n,
  MANAGE_THREADS: 1n << 34n,
  CREATE_PUBLIC_THREADS: 1n << 35n,
  CREATE_PRIVATE_THREADS: 1n << 36n,
  USE_EXTERNAL_STICKERS: 1n << 37n,
  SEND_MESSAGES_IN_THREADS: 1n << 38n,
  USE_EMBEDDED_ACTIVITIES: 1n << 39n,
  MODERATE_MEMBERS: 1n << 40n,
  VIEW_CREATOR_MONETIZATION_ANALYTICS: 1n << 41n,
  USE_SOUNDBOARD: 1n << 42n,
  USE_EXTERNAL_SOUNDS: 1n << 43n,
  SEND_VOICE_MESSAGES: 1n << 46n,
} as const;

export type PermissionKey = keyof typeof DISCORD_PERMISSIONS;

/** A required permission with a human-readable rationale. */
export interface RequiredPermission {
  key: PermissionKey;
  bit: bigint;
  rationale: string;
}

/** Result of checking a single guild. */
export interface GuildPermissionStatus {
  guildId: string;
  guildName: string;
  missingPermissions: RequiredPermission[];
  currentPermissionBitfield: string;
  canAutoRecover: boolean;
  recoveryAction?: RecoveryAction;
}

/** Action taken (or attempted) during recovery. */
export interface RecoveryAction {
  type: 'self_role_edit' | 'requires_manual' | 'administrator_override';
  description: string;
  success: boolean;
  error?: string;
}

/** Overall watchdog run result. */
export interface WatchdogResult {
  timestamp: string;
  checkedGuilds: GuildPermissionStatus[];
  anyPermissionLoss: boolean;
  anyRecoveryAttempted: boolean;
  anyRecoverySucceeded: boolean;
  alertsSent: number;
}

/** Discord API error response shape. */
export interface DiscordApiError {
  code: number;
  message: string;
  errors?: Record<string, unknown>;
}

/** Discord REST API query parameters interface */
export interface DiscordRestQuery {
  after?: string;
  limit?: number;
}
