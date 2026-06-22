export function report(message: string) {
  console.log(message);
}

export function validateConfig(): string[] {
  const errors: string[] = [];
  if (!process.env.DISCORD_BOT_TOKEN) {
    errors.push('Missing DISCORD_BOT_TOKEN');
  }
  if (!process.env.DISCORD_ALERTS_WEBHOOK) {
    errors.push('Missing DISCORD_ALERTS_WEBHOOK');
  }
  return errors;
}

export interface DiscordWatchdogResult {
  checkedGuilds: Array<{
    guildId: string;
    guildName: string;
    missingPermissions: Array<{ key: string; rationale: string }>;
    recoveryAction?: { success: boolean; description: string };
  }>;
  anyPermissionLoss: boolean;
  anyRecoveryAttempted: boolean;
  anyRecoverySucceeded: boolean;
  alertsSent: number;
}

export async function runWatchdog(_sendAllClear?: boolean): Promise<DiscordWatchdogResult> {
  return {
    checkedGuilds: [],
    anyPermissionLoss: false,
    anyRecoveryAttempted: false,
    anyRecoverySucceeded: false,
    alertsSent: 0,
  };
}
