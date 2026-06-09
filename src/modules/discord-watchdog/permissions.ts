/**
 * Discord bot permission checking and recovery logic.
 *
 * Workflow per guild:
 *   1. Fetch bot's guild member object + bot's role info
 *   2. Compute current permission bitfield vs required bitfield
 *   3. If missing permissions found:
 *      a. If bot has MANAGE_ROLES → edit its own role to add missing perms
 *      b. If bot cannot self-recover → flag for manual intervention
 *   4. Return structured result
 */

import { discordGet, discordPatch, DiscordApiClientError } from './discord-client';
import { REQUIRED_PERMISSIONS, requiredPermissionsBitfield, PERMISSION_LABELS, BOT_TOKEN, APPLICATION_ID } from './config';
import type { GuildPermissionStatus, RequiredPermission, RecoveryAction } from './types';

/** Basic guild info from the Discord API. */
interface DiscordGuild {
  id: string;
  name: string;
  owner_id?: string;
  permissions?: string;
}

/** Bot member object on a guild (includes computed permissions). */
interface GuildMember {
  user?: { id: string };
  roles: string[];
  permissions?: string;
}

/** Role object from Discord API. */
interface DiscordRole {
  id: string;
  name: string;
  permissions: string;
  managed: boolean;
  position: number;
}

/**
 * Fetch all guilds the bot is in.
 */
export async function fetchBotGuilds(): Promise<DiscordGuild[]> {
  try {
    // Get current bot user first to get its ID
    const botUser = await discordGet<{ id: string }>('/users/@me');
    const userId = botUser.id;

    // Fetch guilds the bot is a member of
    const guilds = await discordGet<DiscordGuild[]>('/users/@me/guilds');
    return guilds;
  } catch (err) {
    if (err instanceof DiscordApiClientError) {
      throw new Error(`Failed to fetch bot guilds: [${err.status}] ${err.message}`);
    }
    throw err;
  }
}

/**
 * Get the bot's member object for a specific guild, including computed permissions.
 */
export async function getBotGuildMember(guildId: string): Promise<GuildMember> {
  try {
    const botUser = await discordGet<{ id: string }>('/users/@me');
    return await discordGet<GuildMember>(`/guilds/${guildId}/members/${botUser.id}`);
  } catch (err) {
    if (err instanceof DiscordApiClientError) {
      throw new Error(`Failed to get bot member in guild ${guildId}: [${err.status}] ${err.message}`);
    }
    throw err;
  }
}

/**
 * Get roles for a guild.
 */
export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  try {
    return await discordGet<DiscordRole[]>(`/guilds/${guildId}/roles`);
  } catch (err) {
    if (err instanceof DiscordApiClientError) {
      throw new Error(`Failed to get roles for guild ${guildId}: [${err.status}] ${err.message}`);
    }
    throw err;
  }
}

/**
 * Parse a permission bitfield string (BigInt) and return which required permissions are missing.
 */
export function findMissingPermissions(currentPermissionBitfield: string): RequiredPermission[] {
  const currentBits = BigInt(currentPermissionBitfield);

  // If the bot has ADMINISTRATOR, no permissions are missing
  if (currentBits & (1n << 3n)) {
    return [];
  }

  return REQUIRED_PERMISSIONS.filter((req) => !(currentBits & req.bit));
}

/**
 * Check the bot's permissions on a single guild.
 */
export async function checkGuildPermissions(guild: DiscordGuild): Promise<GuildPermissionStatus> {
  const result: GuildPermissionStatus = {
    guildId: guild.id,
    guildName: guild.name,
    missingPermissions: [],
    currentPermissionBitfield: '0',
    canAutoRecover: false,
  };

  try {
    const member = await getBotGuildMember(guild.id);
    const perms = member.permissions ?? '0';
    result.currentPermissionBitfield = perms;

    const missing = findMissingPermissions(perms);
    result.missingPermissions = missing;

    if (missing.length === 0) {
      return result; // All good
    }

    // Check if bot can auto-recover (has MANAGE_ROLES)
    const hasManageRoles = BigInt(perms) & (1n << 28n);
    if (hasManageRoles) {
      result.canAutoRecover = true;
      result.recoveryAction = await attemptSelfRecovery(guild.id, missing, perms);
    } else {
      result.recoveryAction = {
        type: 'requires_manual',
        description: `Bot lacks MANAGE_ROLES — cannot auto-recover. An admin must update the bot role.`,
        success: false,
      };
    }
  } catch (err) {
    // If we get a 403 or missing access error, the bot might not be in the guild
    if (err instanceof DiscordApiClientError && err.status === 403) {
      result.missingPermissions = REQUIRED_PERMISSIONS; // All permissions missing = kicked/removed
      result.recoveryAction = {
        type: 'requires_manual',
        description: `Bot was rejected or has no access to guild "${guild.name}" (HTTP 403). Manual re-invite required.`,
        success: false,
      };
    } else {
      throw err;
    }
  }

  return result;
}

/**
 * Attempt to recover missing permissions by editing the bot's top manageable role.
 *
 * Strategy: Find the highest-position role that the bot can edit (managed=false, position < bot's
 * top role), add the missing permission bits to it. If the bot's own role can't be found, report failure.
 */
async function attemptSelfRecovery(
  guildId: string,
  missingPerms: RequiredPermission[],
  currentPerms: string,
): Promise<RecoveryAction> {
  try {
    const roles = await getGuildRoles(guildId);
    const member = await getBotGuildMember(guildId);
    const botUser = await discordGet<{ id: string }>('/users/@me');

    // Find roles the bot has — these are the role IDs in the member's roles array
    const botRoleIds = new Set(member.roles);
    const botRoles = roles.filter((r) => botRoleIds.has(r.id));

    // Find a role that is:
    // 1. The bot's own role (managed=true — Discord-created bot role)
    // OR the lowest non-managed role the bot has that can be edited
    const targetRole = botRoles.find((r) => r.managed === true) ?? botRoles[botRoles.length - 1];

    if (!targetRole) {
      return {
        type: 'requires_manual',
        description: 'No manageable bot role found to edit.',
        success: false,
      };
    }

    // Calculate new permissions: keep existing + add missing
    const currentBits = BigInt(currentPerms);
    const missingBits = missingPerms.reduce((acc, p) => acc | p.bit, 0n);
    const newPerms = (currentBits | missingBits).toString();

    const missingLabels = missingPerms.map((p) => PERMISSION_LABELS[p.key]).join(', ');

    // Update the role's permissions
    await discordPatch<unknown>(`/guilds/${guildId}/roles/${targetRole.id}`, {
      permissions: newPerms,
    });

    return {
      type: 'self_role_edit',
      description: `Added missing permissions to role "${targetRole.name}": ${missingLabels}`,
      success: true,
    };
  } catch (err) {
    const errorMsg = err instanceof DiscordApiClientError
      ? `Discord API [${err.status}]: ${err.message}`
      : String(err);

    return {
      type: 'self_role_edit',
      description: `Failed to edit bot role permissions: ${errorMsg}`,
      success: false,
      error: errorMsg,
    };
  }
}
