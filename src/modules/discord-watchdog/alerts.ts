/**
 * Discord webhook alerting for the permission watchdog.
 *
 * Sends structured alerts to the #alerts channel when:
 *   - Permission loss is detected
 *   - Auto-recovery is attempted (success or failure)
 *   - Manual intervention is required
 */

import { ALERTS_WEBHOOK_URL } from './config';
import type { GuildPermissionStatus, WatchdogResult } from './types';
import { PERMISSION_LABELS } from './config';

/** Embed colors for different severity levels. */
const COLORS = {
  OK: 0x57F287,        // Green — everything fine
  RECOVERED: 0xFEE75C, // Yellow — recovered automatically
  WARNING: 0xFEE75C,   // Yellow — permissions missing but recoverable
  CRITICAL: 0xED4245,  // Red — manual intervention needed
};

/** Discord webhook embed object. */
interface WebhookEmbed {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
}

/** Discord webhook payload. */
interface WebhookPayload {
  content?: string;
  embeds?: WebhookEmbed[];
  username?: string;
}

/**
 * Send an alert to the configured #alerts webhook.
 * Returns true if sent successfully.
 */
export async function sendAlert(payload: WebhookPayload): Promise<boolean> {
  if (!ALERTS_WEBHOOK_URL) {
    console.warn('[discord-watchdog] No ALERTS_WEBHOOK_URL configured — alert not sent');
    return false;
  }

  try {
    const res = await fetch(ALERTS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Permission Watchdog',
        ...payload,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[discord-watchdog] Webhook returned ${res.status}: ${body}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[discord-watchdog] Webhook send failed:`, err);
    return false;
  }
}

/**
 * Build and send a comprehensive watchdog run report.
 */
export async function sendWatchdogReport(result: WatchdogResult): Promise<void> {
  if (!result.anyPermissionLoss) {
    // Optional: send all-clear heartbeat (disabled by default — only report issues)
    return;
  }

  for (const guild of result.checkedGuilds) {
    if (guild.missingPermissions.length === 0) continue;

    const severity = guild.recoveryAction?.success
      ? 'warning'
      : guild.canAutoRecover
        ? 'warning'
        : 'critical';

    const permList = guild.missingPermissions.map(
      (p) => `• **${PERMISSION_LABELS[p.key]}** — ${p.rationale}`
    ).join('\n');

    const embed: WebhookEmbed = {
      title: `⚠️ Permission Loss: ${guild.guildName}`,
      description: `Detected **${guild.missingPermissions.length}** missing permissions on guild **${guild.guildName}** (${guild.guildId}).`,
      color: severity === 'critical' ? COLORS.CRITICAL : COLORS.WARNING,
      fields: [
        {
          name: 'Missing Permissions',
          value: permList,
          inline: false,
        },
        {
          name: 'Current Bitfield',
          value: `\`${guild.currentPermissionBitfield}\``,
          inline: true,
        },
      ],
      timestamp: result.timestamp,
    };

    if (guild.recoveryAction) {
      embed.fields!.push({
        name: 'Recovery Action',
        value: guild.recoveryAction.success
          ? `✅ ${guild.recoveryAction.description}`
          : `❌ ${guild.recoveryAction.description}`,
        inline: false,
      });
    }

    // Ping @here only for critical (manual intervention needed)
    const content = severity === 'critical' ? '@here Manual intervention required' : undefined;

    await sendAlert({
      content,
      embeds: [embed],
    });
  }
}

/**
 * Build and send a summary when the watchdog finds no issues (all clear).
 * Only sends if explicitly configured to do so.
 */
export async function sendAllClearReport(guilds: GuildPermissionStatus[]): Promise<void> {
  const fields = guilds.map((g) => ({
    name: g.guildName,
    value: `✅ All required permissions present (bitfield: \`${g.currentPermissionBitfield}\`)`,
    inline: false,
  }));

  await sendAlert({
    embeds: [{
      title: '✅ Permission Watchdog — All Clear',
      description: `Checked **${guilds.length}** guild(s), no permission issues found.`,
      color: COLORS.OK,
      fields,
      timestamp: new Date().toISOString(),
    }],
  });
}
