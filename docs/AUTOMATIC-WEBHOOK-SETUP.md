# Automatic Webhook Setup for New Users

## Overview

When a new user connects their Cal.com account, BarkBook can **automatically create the webhook** for them using Cal.com's API. No manual setup required!

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. User clicks "Connect Cal.com" in BarkBook              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. OAuth Flow Completes                                    │
│     - User grants permissions                               │
│     - BarkBook receives access token                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. BarkBook Automatically Creates Webhook                  │
│     - Calls Cal.com API: POST /v1/webhooks                 │
│     - URL: https://groomio.app/api/webhooks/calcom        │
│     - Events: CREATED, RESCHEDULED, CANCELLED, ENDED       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Webhook Ready!                                          │
│     - User can start booking immediately                    │
│     - All bookings sync automatically                       │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Step 1: Update OAuth Callback

Add webhook setup to your OAuth callback handler:

```typescript
// src/app/api/auth/calcom/callback/route.ts

import { WebhookSetupService } from '@/features/calendar/services/webhook-setup-service';

export async function GET(request: NextRequest) {
  const code = searchParams.get('code');

  // ... existing OAuth code exchange ...

  const tokens = await oauthService.exchangeCodeForTokens(code);

  // ... store tokens in database ...

  // ✨ NEW: Automatically set up webhook
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin');

    await WebhookSetupService.ensureWebhookSetup(tokens.access_token, appUrl);

    console.log('✅ Webhook configured automatically for new user');
  } catch (error) {
    // Don't fail onboarding if webhook setup fails
    // User can set it up manually later
    console.error('Webhook auto-setup failed:', error);
  }

  return NextResponse.redirect('/dashboard');
}
```

### Step 2: Add Webhook Status Check

Show users if webhook is configured:

```typescript
// src/features/settings/components/WebhookStatus.tsx

'use client';

import { useEffect, useState } from 'react';
import { WebhookSetupService } from '@/features/calendar/services/webhook-setup-service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function WebhookStatus({ accessToken }: { accessToken: string }) {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function checkWebhook() {
    setIsLoading(true);
    try {
      const webhookUrl = `${window.location.origin}/api/webhooks/calcom`;
      const setup = await WebhookSetupService.isWebhookSetup(
        accessToken,
        webhookUrl
      );
      setIsSetup(setup);
    } catch (error) {
      console.error('Error checking webhook:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function setupWebhook() {
    setIsLoading(true);
    try {
      await WebhookSetupService.ensureWebhookSetup(
        accessToken,
        window.location.origin
      );
      setIsSetup(true);
    } catch (error) {
      console.error('Error setting up webhook:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkWebhook();
  }, [accessToken]);

  if (isSetup === null) {
    return <div>Sprawdzanie konfiguracji...</div>;
  }

  return (
    <div className="space-y-4">
      {isSetup ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Webhook skonfigurowany</strong>
            <p className="text-sm mt-1">
              Wszystkie wizyty są automatycznie synchronizowane.
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Webhook nie jest skonfigurowany</strong>
            <p className="text-sm mt-1">
              Kliknij poniżej, aby automatycznie skonfigurować synchronizację.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button onClick={checkWebhook} variant="outline" disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Sprawdź status
        </Button>

        {!isSetup && (
          <Button onClick={setupWebhook} disabled={isLoading}>
            Skonfiguruj automatycznie
          </Button>
        )}
      </div>
    </div>
  );
}
```

### Step 3: Add to Settings Page

```typescript
// src/features/settings/components/SettingsPage.tsx

import { WebhookStatus } from './WebhookStatus';

export function SettingsPage() {
  const [calComToken, setCalComToken] = useState<string>('');

  // ... fetch token from database ...

  return (
    <div>
      <h2>Synchronizacja kalendarza</h2>

      {calComToken && <WebhookStatus accessToken={calComToken} />}

      {/* ... rest of settings ... */}
    </div>
  );
}
```

## Cal.com API Reference

### Create Webhook

```bash
POST https://api.cal.com/v1/webhooks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "subscriberUrl": "https://groomio.app/api/webhooks/calcom",
  "eventTriggers": [
    "BOOKING_CREATED",
    "BOOKING_RESCHEDULED",
    "BOOKING_CANCELLED",
    "MEETING_ENDED"
  ],
  "active": true
}
```

### List Webhooks

```bash
GET https://api.cal.com/v1/webhooks
Authorization: Bearer {access_token}
```

### Delete Webhook

```bash
DELETE https://api.cal.com/v1/webhooks/{webhookId}
Authorization: Bearer {access_token}
```

## Environment Variables

Add to `.env.local`:

```bash
# Your production URL (used for webhook setup)
NEXT_PUBLIC_APP_URL=https://groomio.app

# For localhost testing with ngrok
# NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

## Benefits

### ✅ Zero Manual Setup

- Users don't need to configure anything
- Webhooks created automatically during onboarding
- One less step for users to complete

### ✅ Always Correct

- No typos in webhook URL
- All required events configured
- Active by default

### ✅ Easy to Manage

- Can check webhook status programmatically
- Can recreate if deleted
- Can update configuration

## Error Handling

### Webhook Creation Fails

Don't block onboarding:

```typescript
try {
  await WebhookSetupService.ensureWebhookSetup(token);
} catch (error) {
  // Log error but continue
  console.error('Webhook setup failed:', error);

  // Store flag to remind user later
  await supabase
    .from('salons')
    .update({ webhook_setup_pending: true })
    .eq('user_id', userId);
}
```

Show banner in dashboard:

```typescript
if (salon.webhook_setup_pending) {
  return (
    <Alert>
      <AlertCircle />
      <AlertTitle>Zakończ konfigurację</AlertTitle>
      <AlertDescription>
        Synchronizacja kalendarza wymaga dodatkowej konfiguracji.
        <Button onClick={setupWebhook}>Skonfiguruj teraz</Button>
      </AlertDescription>
    </Alert>
  );
}
```

## Testing

### Local Development

1. Start ngrok: `ngrok http 9002`
2. Copy URL (e.g., `https://abc123.ngrok.io`)
3. Set in environment:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```
4. Test automatic setup in your OAuth callback

### Production

1. Deploy to Vercel/production
2. Set environment variable:
   ```bash
   NEXT_PUBLIC_APP_URL=https://groomio.app
   ```
3. Test with new user signup

## Monitoring

Track webhook setup success:

```sql
-- Add column to salons table
ALTER TABLE salons ADD COLUMN webhook_configured_at timestamptz;
ALTER TABLE salons ADD COLUMN cal_com_webhook_id varchar;

-- Update after successful setup
UPDATE salons
SET
  webhook_configured_at = NOW(),
  cal_com_webhook_id = 'webhook-id'
WHERE user_id = auth.uid();

-- Monitor setup success rate
SELECT
  COUNT(*) as total_salons,
  COUNT(webhook_configured_at) as webhooks_configured,
  ROUND(COUNT(webhook_configured_at) * 100.0 / COUNT(*), 2) as success_rate
FROM salons;
```

## Troubleshooting

### API Returns 401

Check access token has required scopes:

```
cal.com scopes needed:
- webhook:write
- webhook:read
```

Update OAuth scopes in Cal.com app settings.

### Webhook Not Firing After Setup

1. Check webhook was created:

   ```typescript
   const webhooks = await WebhookSetupService.listWebhooks(token);
   console.log('Configured webhooks:', webhooks);
   ```

2. Verify URL is accessible:

   ```bash
   curl https://groomio.app/api/webhooks/calcom
   ```

3. Check webhook logs in Cal.com dashboard

## Best Practices

1. **Always use environment variable for URL**

   - Makes switching between dev/prod easy
   - Single source of truth

2. **Don't fail onboarding if webhook fails**

   - Log error and continue
   - Show setup reminder in dashboard

3. **Provide manual setup option**

   - Some users might want control
   - Fallback if auto-setup fails

4. **Store webhook ID in database**
   - Can update/delete later
   - Track which users have webhooks

## Summary

With automatic webhook setup:

- ✅ New users are ready to go instantly
- ✅ No manual configuration needed
- ✅ 100% correct webhook configuration
- ✅ Easy to manage and troubleshoot

Just add `WebhookSetupService.ensureWebhookSetup()` to your OAuth callback and you're done! 🎉
