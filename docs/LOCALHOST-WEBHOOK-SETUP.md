# Localhost Webhook Setup Guide

## Why You Need This

Cal.com webhooks need a **publicly accessible URL**. Since `localhost:9002` is only accessible on your computer, you need a tunnel to expose it to the internet.

## Option 1: ngrok (Recommended)

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Start ngrok

```bash
# In a separate terminal, run:
ngrok http 9002
```

You'll see output like:

```
Session Status                online
Forwarding                    https://abc123.ngrok.io -> http://localhost:9002
```

### Step 3: Copy Your Public URL

Your webhook URL is:

```
https://abc123.ngrok.io/api/webhooks/calcom
```

### Step 4: Configure Cal.com

1. Go to https://cal.com/settings/developer/webhooks
2. Click "New Webhook"
3. Subscriber URL: `https://abc123.ngrok.io/api/webhooks/calcom`
4. Select events: ✅ All
5. Save

### Step 5: Test It!

Create a booking in BarkBook and watch your terminal:

```
📥 Received Cal.com webhook: BOOKING_CREATED for booking abc123
✅ Webhook processed successfully in 45ms: created
```

## Option 2: Cloudflare Tunnel (Free, Stable)

### Step 1: Install

```bash
brew install cloudflare/cloudflare/cloudflared
```

### Step 2: Start Tunnel

```bash
cloudflared tunnel --url http://localhost:9002
```

You'll get a URL like:

```
https://xyz.trycloudflare.com
```

### Step 3: Use in Cal.com

Webhook URL: `https://xyz.trycloudflare.com/api/webhooks/calcom`

## Option 3: localtunnel (No Install)

```bash
npx localtunnel --port 9002
```

URL: `https://random-words.loca.lt/api/webhooks/calcom`

## Important Notes

### ⚠️ URL Changes Each Time

With free ngrok/cloudflared, the URL changes every time you restart. You'll need to:

1. Update Cal.com webhook settings each time
2. OR use ngrok paid plan for stable URLs
3. OR only test webhooks when needed

### 💡 Pro Tip: Environment Variable

Add to `.env.local`:

```bash
WEBHOOK_URL=https://abc123.ngrok.io/api/webhooks/calcom
```

Then you can reference it in your docs/setup.

### 🔐 Security

For localhost testing:

- ✅ Safe: webhook payload validation
- ✅ Safe: webhook logs for debugging
- ⚠️ Note: Anyone with ngrok URL can send webhooks (add validation in production)

## Troubleshooting

### ngrok not working?

Check if port 9002 is accessible:

```bash
curl http://localhost:9002/api/webhooks/calcom
```

### Webhook not received?

1. Check ngrok is running: `ps aux | grep ngrok`
2. Check your app is running: `curl http://localhost:9002/`
3. Test webhook manually:
   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/webhooks/calcom \
     -H "Content-Type: application/json" \
     -d '{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"test"}}'
   ```

### ngrok timeout?

Free tier times out after 2 hours. Just restart:

```bash
ngrok http 9002
# Update Cal.com with new URL
```

## Production Deployment

Once deployed to production (Vercel, etc.), use your real domain:

```
https://barkbook.app/api/webhooks/calcom
```

No tunneling needed! 🎉
