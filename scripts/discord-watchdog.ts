/**
 * Discord Bot Permission Watchdog — cronnable runner.
 *
 * Usage:
 *   npx tsx scripts/discord-watchdog.ts          # Report issues only
 *   npx tsx scripts/discord-watchdog.ts --all-clear  # Also send all-clear summary
 *
 * Exit codes:
 *   0 — No issues or auto-recovered
 *   1 — Critical issue (manual intervention needed)
 *   2 — Configuration error
 */

import { runWatchdog, validateConfig } from '../src/modules/discord-watchdog';

const sendAllClear = process.argv.includes('--all-clear');

async function main() {
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    console.error('[discord-watchdog] Configuration errors:');
    for (const err of configErrors) {
      console.error(`  ✗ ${err}`);
    }
    if (configErrors.some((e) => e.includes('DISCORD_BOT_TOKEN') || e.includes('DISCORD_ALERTS_WEBHOOK'))) {
      console.error('');
      console.error('Set the required environment variables in .env:');
      console.error('  DISCORD_BOT_TOKEN      — Bot token from Discord Developer Portal');
      console.error('  DISCORD_ALERTS_WEBHOOK — Webhook URL for the #alerts channel');
    }
    process.exit(2);
  }

  console.log(`[discord-watchdog] Starting watchdog sweep at ${new Date().toISOString()}`);
  console.log(`[discord-watchdog] All-clear report: ${sendAllClear ? 'enabled' : 'disabled (issues only)'}`);

  try {
    const result = await runWatchdog(sendAllClear);

    console.log('');
    console.log('── Watchdog Result ──────────────────────────────');
    console.log(`  Guilds checked:         ${result.checkedGuilds.length}`);
    console.log(`  Permission loss:       ${result.anyPermissionLoss ? 'YES ⚠️' : 'No ✅'}`);
    console.log(`  Recovery attempted:    ${result.anyRecoveryAttempted ? 'Yes' : 'No'}`);
    console.log(`  Recovery succeeded:    ${result.anyRecoverySucceeded ? 'Yes' : 'No'}`);
    console.log(`  Alerts sent:           ${result.alertsSent}`);
    console.log('');

    for (const guild of result.checkedGuilds) {
      const status = guild.missingPermissions.length === 0
        ? '✅ OK'
        : guild.recoveryAction?.success
          ? '⚠️ Recovered'
          : '❌ Missing';
      console.log(`  ${status} ${guild.guildName} (${guild.guildId})`);

      if (guild.missingPermissions.length > 0) {
        for (const perm of guild.missingPermissions) {
          console.log(`       ${perm.key} — ${perm.rationale}`);
        }
        if (guild.recoveryAction) {
          console.log(`       → ${guild.recoveryAction.success ? '✅' : '❌'} ${guild.recoveryAction.description}`);
        }
      }
    }

    console.log('');
    console.log(`[discord-watchdog] Sweep complete at ${new Date().toISOString()}`);

    // Exit with code 1 if there's a critical issue requiring manual intervention
    const hasCritical = result.checkedGuilds.some(
      (g) => g.missingPermissions.length > 0 && !g.recoveryAction?.success
    );
    process.exit(hasCritical ? 1 : 0);
  } catch (err) {
    console.error(`[discord-watchdog] Fatal error:`, err);
    process.exit(1);
  }
}

main();
