# Fix: `getaddrinfo ENOTFOUND rgljnrypdolbwagrvlbc.supabase.co`

```
[TypeError: fetch failed] {
  [cause]: Error: getaddrinfo ENOTFOUND rgljnrypdolbwagrvlbc.supabase.co
      ...
    errno: -3008,
    code: 'ENOTFOUND',
    syscall: 'getaddrinfo',
    hostname: 'rgljnrypdolbwagrvlbc.supabase.co'
  }
}
```

## What it actually means

`ENOTFOUND` is a **DNS** error — Node could not resolve the hostname into an IP address. It is **not** a Supabase outage and **not** a code bug. The Supabase project at `rgljnrypdolbwagrvlbc.supabase.co` is up — `curl -I https://rgljnrypdolbwagrvlbc.supabase.co/` returns a normal HTTP response from Cloudflare. So the failure is local to the machine running `next dev`.

There are five common causes, ordered from most → least likely.

---

## 1. Supabase project paused (free tier auto-pause after 7 days idle)

Even though DNS is fine for me, the most common reason a previously-working URL starts erroring is that Supabase paused the project. When that happens the hostname can stop resolving for a few hours.

**Fix:** open <https://supabase.com/dashboard/project/rgljnrypdolbwagrvlbc> → click **Restore project**. Wait ~2 minutes for it to come back.

## 2. macOS DNS cache is stale

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

Then restart `next dev`.

## 3. You're on a network that blocks Cloudflare or `*.supabase.co`

Some university / corporate networks (UCLL Wi-Fi has done this in the past) block Cloudflare-fronted hostnames. Quick checks:

```bash
# Should print two IPs (172.64.x.x and 104.18.x.x)
host rgljnrypdolbwagrvlbc.supabase.co

# Should return HTTP/2 404 (a normal Supabase response on the root path)
curl -sS -I https://rgljnrypdolbwagrvlbc.supabase.co/ | head -1
```

If `host` fails or `curl` hangs:

- Switch off VPN if running.
- Try a phone hotspot.
- Or change your Mac's DNS to `1.1.1.1` and `8.8.8.8`
  (System Settings → Network → Wi-Fi → Details → DNS).

## 4. Wrong / typo'd `NEXT_PUBLIC_SUPABASE_URL`

Double-check `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://rgljnrypdolbwagrvlbc.supabase.co
```

The reference (`rgljnrypdolbwagrvlbc`) is the only thing the lookup uses. If you've started a new Supabase project (e.g. recreated it after the old one was deleted), you'll have a new ref — copy the new URL from Settings → API.

After changing `.env.local` you **must** kill and restart `next dev` — env vars are not hot-reloaded.

## 5. Project deleted

If `https://supabase.com/dashboard/project/rgljnrypdolbwagrvlbc` shows a "Project not found" page, the project has been removed. Create a new one, copy the new URL + anon key into `.env.local`, and re-run the migrations in `supabase/migrations/` (in order — including the new `013_milestone_posts.sql`).

---

## Quick triage script

```bash
# 1. Resolve?
host rgljnrypdolbwagrvlbc.supabase.co

# 2. Reachable?
curl -sS -o /dev/null -w "HTTP %{http_code}\n" \
  https://rgljnrypdolbwagrvlbc.supabase.co/auth/v1/health
```

| host result | curl result | meaning |
| --- | --- | --- |
| ✅ resolves | `HTTP 401` | DNS is fine and Supabase is up — flush mac DNS cache, restart dev server |
| ❌ NXDOMAIN | — | project is paused / deleted, or your DNS resolver is bad |
| ✅ resolves | hangs / 5xx | Supabase up but your ISP/VPN is blocking — try hotspot |

---

## Hardening (optional)

Add a top-of-app sanity check so the next time the URL is misconfigured the error is obvious instead of a generic `fetch failed`:

```ts
// src/lib/supabase/assert-env.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)) {
  throw new Error(
    `NEXT_PUBLIC_SUPABASE_URL is missing or malformed: ${url ?? '(unset)'}`,
  )
}
if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.')
```

Import this once in `src/lib/supabase/server.ts`. It will fail fast at startup with a readable message rather than blow up mid-request.
