# Cal.com Webhook Setup Guide

## Overview

This guide shows you how to set up Cal.com webhooks to automatically sync bookings to your BarkBook database.

## What Gets Synced

✅ **Booking Created** - New appointments automatically saved  
✅ **Booking Rescheduled** - Time changes synced immediately  
✅ **Booking Cancelled** - Cancellations reflected in your DB  
✅ **Meeting Ended** - Completed appointments marked automatically

## Benefits

- 📊 **Visit History** - Automatic pet visit records
- 📱 **SMS Reminders** - Send reminders from your database
- ⚡ **Fast Dashboard** - No API calls needed
- 🔒 **Data Backup** - Local copy of all bookings
- 📈 **Analytics** - Query booking data easily

## Setup Steps

### 1. Get Your Webhook URL

Your webhook URL is:

```
https://your-domain.com/api/webhooks/calcom
```

For local development:

```
https://your-ngrok-url.ngrok.io/api/webhooks/calcom
```

### 2. Configure Webhook in Cal.com

1. Go to https://cal.com/settings/developer/webhooks
2. Click **"New Webhook"**
3. Configure:
   - **Subscriber URL**: Your webhook URL
   - **Event Triggers**: Select all:
     - ✅ Booking created
     - ✅ Booking rescheduled
     - ✅ Booking cancelled
     - ✅ Meeting ended
   - **Payload Template**: Use default
4. Click **"Create Webhook"**

### 3. Test the Webhook

#### Option A: Use Cal.com Test Feature

1. In Cal.com webhook settings, click **"Test"**
2. Check your server logs for:
   ```
   📥 Received Cal.com webhook: BOOKING_CREATED for booking abc123
   ✅ Webhook processed successfully in 45ms: created (event: uuid)
   ```

#### Option B: Create a Real Booking

1. Go to your BarkBook calendar page
2. Select a pet and create a booking
3. Check the `calendar_events` table:
   ```sql
   SELECT * FROM calendar_events ORDER BY created_at DESC LIMIT 1;
   ```

### 4. Verify Sync is Working

Check the webhook logs:

```sql
SELECT
  webhook_type,
  status,
  cal_com_event_id,
  created_at,
  error_message
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

Successful webhooks show:

- `status`: `success`
- `error_message`: `null`

## Webhook Payload Examples

### Booking Created

```json
{
  "triggerEvent": "BOOKING_CREATED",
  "createdAt": "2025-01-26T12:00:00Z",
  "payload": {
    "uid": "abc123",
    "title": "Appointment",
    "startTime": "2025-01-27T14:00:00Z",
    "endTime": "2025-01-27T15:00:00Z",
    "attendees": [
      {
        "email": "[email protected]",
        "name": "Jan Kowalski"
      }
    ],
    "metadata": {
      "barkbookClientId": "client-uuid",
      "barkbookPetId": "pet-uuid",
      "source": "barkbook"
    }
  }
}
```

### Booking Rescheduled

```json
{
  "triggerEvent": "BOOKING_RESCHEDULED",
  "payload": {
    "uid": "abc123",
    "startTime": "2025-01-27T15:00:00Z",
    "endTime": "2025-01-27T16:00:00Z"
  }
}
```

### Booking Cancelled

```json
{
  "triggerEvent": "BOOKING_CANCELLED",
  "payload": {
    "uid": "abc123",
    "status": "CANCELLED"
  }
}
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  User creates booking in BarkBook                           │
│  (Pet + Client data prefilled)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Cal.com receives booking                                   │
│  Stores: uid, time, metadata (barkbookClientId, petId)     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼ (webhook triggered)
┌─────────────────────────────────────────────────────────────┐
│  BarkBook receives webhook                                  │
│  POST /api/webhooks/calcom                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  CalComWebhookProcessor processes event                     │
│  - Extracts metadata (client_id, pet_id)                   │
│  - Gets salon_id from client/pet                           │
│  - Saves to calendar_events table                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  calendar_events table updated                              │
│  - Linked to client & pet                                  │
│  - Available for dashboard, history, SMS                   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### calendar_events Table

```sql
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY,
  cal_com_event_id varchar UNIQUE NOT NULL,
  salon_id uuid REFERENCES salons(id),
  client_id uuid REFERENCES clients(id),
  pet_id uuid REFERENCES pets(id),

  title varchar NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_minutes integer,

  status varchar DEFAULT 'scheduled',
  -- Status: scheduled, confirmed, completed, cancelled

  attendee_email varchar,
  attendee_phone varchar,
  location varchar,
  meeting_url varchar,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now()
);
```

### webhook_logs Table

```sql
CREATE TABLE webhook_logs (
  id uuid PRIMARY KEY,
  webhook_type varchar NOT NULL,
  payload jsonb NOT NULL,
  status varchar NOT NULL,
  -- Status: processing, success, error

  error_message text,
  cal_com_event_id varchar,

  created_at timestamptz DEFAULT now()
);
```

## Troubleshooting

### Webhook Not Firing

1. **Check Cal.com webhook status**

   - Go to Cal.com → Webhooks
   - Look for failed attempts
   - Check if URL is accessible

2. **Verify URL is public**

   - For local dev, use ngrok
   - Test with curl:
     ```bash
     curl -X POST https://your-url.com/api/webhooks/calcom \
       -H "Content-Type: application/json" \
       -d '{"triggerEvent":"BOOKING_CREATED","payload":{"uid":"test"}}'
     ```

3. **Check server logs**
   ```bash
   npm run dev
   # Look for webhook log messages
   ```

### Webhook Failing

1. **Check webhook_logs table**

   ```sql
   SELECT * FROM webhook_logs WHERE status = 'error';
   ```

2. **Common errors:**
   - `Invalid payload` - Check Cal.com payload format
   - `Failed to find salon` - Ensure client/pet has salon_id
   - `Failed to create event` - Check database permissions

### Events Not Linking to Pet/Client

**Problem**: Bookings created but `client_id` and `pet_id` are null

**Solution**: Ensure metadata is being sent from BarkBook:

- Check `CalComEmbedWithPrefill` component
- Verify metadata in Cal.com booking:
  ```javascript
  {
    "metadata[barkbookClientId]": "uuid",
    "metadata[barkbookPetId]": "uuid"
  }
  ```

### Duplicate Events

**Problem**: Same booking appears multiple times

**Solution**: The processor checks for existing `cal_com_event_id`:

```typescript
// This prevents duplicates
const existing = await supabase
  .from('calendar_events')
  .select('id')
  .eq('cal_com_event_id', booking.uid)
  .maybeSingle();
```

## Using Synced Data

### Dashboard - Today's Appointments

```typescript
import { CalendarService } from '@/features/calendar/services/calendar-service';

const appointments =
  await CalendarService.getTodaysAppointmentsForCurrentUser();

appointments.forEach((appt) => {
  console.log(`${appt.start_time}: ${appt.pet?.name} - ${appt.client?.name}`);
});
```

### Pet Visit History

```typescript
const history = await CalendarService.getPastAppointmentsForPet(petId);
```

### Send SMS Reminders

```typescript
// Get tomorrow's appointments
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

const appointments = await CalendarService.getAppointmentsInRange(
  salonId,
  tomorrow,
  new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
);

// Send SMS to each
appointments.forEach(async (appt) => {
  if (appt.attendee_phone) {
    await sendSMS(
      appt.attendee_phone,
      `Przypomnienie: wizyta jutro o ${appt.start_time}`
    );
  }
});
```

## Security

### Webhook Validation

Currently, the webhook accepts all requests. For production, implement signature validation:

```typescript
// In CalComWebhookProcessor
static validateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}
```

Then in route:

```typescript
const signature = request.headers.get('x-cal-signature');
const isValid = CalComWebhookProcessor.validateSignature(
  rawBody,
  signature,
  process.env.CALCOM_WEBHOOK_SECRET
);
```

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Use vercel/rate-limit or similar
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

await limiter.check(request, 10, 'WEBHOOK'); // 10 requests per minute
```

## Monitoring

### Key Metrics

1. **Webhook Success Rate**

   ```sql
   SELECT
     status,
     COUNT(*) as count,
     ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
   FROM webhook_logs
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY status;
   ```

2. **Processing Time**

   - Check logs for duration
   - Target: < 1 second

3. **Sync Lag**
   ```sql
   SELECT
     cal_com_event_id,
     created_at,
     synced_at,
     EXTRACT(EPOCH FROM (synced_at - created_at)) as lag_seconds
   FROM calendar_events
   ORDER BY created_at DESC
   LIMIT 10;
   ```

## Next Steps

After webhooks are working:

1. ✅ Set up SMS reminders using synced data
2. ✅ Display today's appointments on dashboard
3. ✅ Show pet visit history
4. ✅ Build analytics/reports
5. ✅ Export booking data

---

**Need Help?**

- Check webhook_logs table for errors
- Review server logs during webhook testing
- Verify Cal.com webhook is active and configured correctly
