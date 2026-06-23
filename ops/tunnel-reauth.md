# bot-sh-testing Tunnel Re-Authentication

## When to use this

The cloudflared tunnel for `bot-sh-testing.studenthub.co` uses a short-lived
certificate token. When it expires:

- The `tunnel-healthcheck` cron (every 2min) detects the tunnel is down and
  attempts automatic restart via LaunchDaemon and direct start.
- Both will **fail** if the token is expired. The cron logs:
  `FAILED: tunnel token invalid or network unreachable`
- The tunnel watchdog in the Fleet Guard doesn't handle auth — Cloudflare
  requires interactive browser login.

## Steps

### 1. Authenticate with Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser. Complete the OAuth flow. It replaces the cert file at:
`~/.cloudflared/cert.pem`

### 2. Get a new tunnel token

```bash
cloudflared tunnel token bot-sh-testing
```

This prints a long `eyJ...` token. Copy it.

### 3. Update the watchdog script

Edit `~/.hermes/scripts/tunnel-healthcheck.sh` and replace the token in the
direct-start fallback (line with `--token 'eyJhIj...aiJ9'`):

```bash
nano ~/.hermes/scripts/tunnel-healthcheck.sh
```

Find the line:
```
nohup "$CLOUDFLARED_BIN" tunnel run --token 'OLD_TOKEN' \
```

Replace `OLD_TOKEN` with the new token from step 2.

### 4. Restart the tunnel

```bash
sudo launchctl kickstart -k system/com.cloudflare.cloudflared
```

### 5. Verify

```bash
curl -s -o /dev/null -w "%{http_code}" https://bot-sh-testing.studenthub.co
# Expect: 200
```

## Automatic restart (no auth needed)

If the tunnel process crashes but the cert is still valid, the
`tunnel-healthcheck` cron (every 2min) restarts it automatically. No manual
intervention needed.

## Permanent fix

Future: migrate to a DNS CNAME + Cloudflare API token so the tunnel runs
without an expiring browser-based cert.
