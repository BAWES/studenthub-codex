/**
 * Discord bot permission recovery watchdog — orchestrator.
 *
 * Workflow:
 *   1. Fetch all guilds the bot is a member of (or a specific target guild)
 *   2. For each guild, check current permissions vs required permissions
 *   3. If permissions are missing:
 *      a. Attempt auto-recovery (edit bot role permissions)
 *      b. Send structured alert to #alerts channel
 *   4. Return a structured result
 *
 * Designed to be run as a cron job (e.g. every 30m).
 */

import { fetchBotGuilds, checkGuildPermissions } from './permissions';
import { sendWatchdogReport, sendAllClearReport } from './alerts';
import { validateConfig, TARGET_GUILD_ID } from './config';
import type { WatchdogResult, GuildPermissionStatus } from './types';

/**
 * Run a full watchdog sweep.
 *
 * @param sendAllClear — if true, send an all-clear report even when no issues found (default false)
 * @returns Structured result of the run
 */
export async function runWatchdog(sendAllClear = false): Promise<WatchdogResult> {
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    throw new Error(`Configuration errors:\n${configErrors.map((e) => `  - ${e}`).join('\n')}`);
  }

  const timestamp = new Date().toISOString();
  const guilds = await fetchBotGuilds();

  const targetGuilds = TARGET_GUILD_ID
    ? guilds.filter((g) => g.id === TARGET_GUILD_ID)
    : guilds;

  if (targetGuilds.length === 0) {
    const msg = TARGET_GUILD_ID
      ? `Bot is not a member of target guild ${TARGET_GUILD_ID}`
      : 'Bot is not a member of any guilds';
    throw new Error(msg);
  }

  const guildResults: GuildPermissionStatus[] = [];
  let anyRecoveryAttempted = false;
  let anyRecoverySucceeded = false;

  for (const guild of targetGuilds) {
    const status = await checkGuildPermissions(guild);
    guildResults.push(status);

    if (status.recoveryAction) {
      anyRecoveryAttempted = true;
      if (status.recoveryAction.success) {
        anyRecoverySucceeded = true;
      }
    }
  }

  const anyPermissionLoss = guildResults.some((g) => g.missingPermissions.length > 0);

  const result: WatchdogResult = {
    timestamp,
    checkedGuilds: guildResults,
    anyPermissionLoss,
    anyRecoveryAttempted,
    anyRecoverySucceeded,
    alertsSent: 0,
  };

  // Send alerts for any issues found
  let alertsBefore = 0;
  if (anyPermissionLoss) {
    await sendWatchdogReport(result);
  } else if (sendAllClear) {
    await sendAllClearReport(guildResults);
    alertsBefore = 1;
  }

  // Count alerts sent by tracking webhook calls (rough)
  // Webhook sends are best-effort; we can't perfectly count from here
  result.alertsSent = anyPermissionLoss ? guildResults.filter((g) => g.missingPermissions.length > 0).length : alertsBefore;

  return result;
}
