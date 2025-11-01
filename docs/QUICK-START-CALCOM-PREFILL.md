# Quick Start: Cal.com Booking with Client Prefill

## ✅ What You Get

- **Select client** from your BarkBook database
- **Select pet** automatically filtered by client
- **Cal.com form auto-fills** with all client & pet information
- **Book appointments** with 15-minute slot intervals
- **Custom durations** (30min, 1hr, 90min, 2hr, 3hr, etc.)

## 🚀 Setup (5 minutes)

### Step 1: Run Database Migration

```bash
# Apply the migration to add cal_com_username field
cd /Users/maciejgrzybek/Projects/barkbook
supabase db push
```

Or manually run:

```sql
ALTER TABLE salons ADD COLUMN IF NOT EXISTS cal_com_username varchar;
```

### Step 2: Add Your Cal.com Username

**Option A: Via SQL**

```sql
UPDATE salons
SET cal_com_username = 'your-calcom-username'
WHERE user_id = auth.uid();
```

**Option B: Via Environment Variable**
Add to `.env.local`:

```env
NEXT_PUBLIC_CALCOM_USERNAME=your-calcom-username
```

> **How to find your username?**  
> Your Cal.com booking URL looks like: `https://cal.com/YOUR-USERNAME`  
> Example: If your URL is `https://cal.com/grooming-salon`, your username is `grooming-salon`

### Step 3: Configure Cal.com Event Types

1. Go to https://cal.com
2. Navigate to **Event Types**
3. Create or edit an event type:
   - Set **Duration** (e.g., 60 minutes)
   - Go to **Limits** tab
   - Set **Time Slot Interval** to **15 minutes**
   - Set **Location** to **In Person**
4. Note the **slug** (e.g., "standard-grooming")

### Step 4: Test It!

1. Start your dev server: `npm run dev`
2. Navigate to `/calendar`
3. Click **"Zarezerwuj wizytę"** tab
4. Select a client from dropdown
5. Select their pet
6. Watch the Cal.com form auto-fill! 🎉

## 📋 What Gets Prefilled

| Field     | Data               | Example                                             |
| --------- | ------------------ | --------------------------------------------------- |
| **Name**  | Client's full name | "Jan Kowalski"                                      |
| **Email** | Client's email     | "[email protected]"                                 |
| **Phone** | Client's phone     | "+48 123 456 789"                                   |
| **Notes** | Pet details        | "Zwierzak: Burek, Rasa: Labrador, Alergie: Kurczak" |

## 🎯 Usage

### Default Booking (any event type)

```tsx
<BookingWithPrefill />
```

### Specific Event Type

```tsx
<BookingWithPrefill
  calComUsername="grooming-salon"
  eventTypeSlug="standard-grooming"
/>
```

## 🔧 Event Type Slugs Examples

Match these with your Cal.com event types:

- `quick-trim` → Quick 30-minute trim
- `standard-grooming` → Standard 1-hour grooming
- `full-spa` → Full 90-minute spa treatment
- `large-breed` → 2-hour large breed grooming
- `extended-session` → 3-hour extended session

## ⚙️ Cal.com Settings for Best Results

### Required Settings

- ✅ **Event Duration**: Set to your desired length (30, 60, 90, 120, 180 minutes)
- ✅ **Slot Interval**: Set to **15 minutes** (in Limits tab)
- ✅ **Location**: Set to **In Person**

### Optional Settings

- **Buffer Time**: Add 15-min before/after for prep/cleanup
- **Minimum Notice**: Set to 1 hour to prevent same-day bookings
- **Booking Window**: Limit how far in advance clients can book

### Custom Booking Questions (Optional)

Add these in Cal.com for better tracking:

1. **Pet Name** (identifier: `petName`) - will be auto-filled
2. **Pet Breed** (identifier: `petBreed`) - will be auto-filled
3. **Special Requirements** (identifier: `specialRequirements`)

## 🎨 UI Features

### Two Tabs

1. **"Zarezerwuj wizytę"** - Create new booking with prefill
2. **"Zobacz kalendarz"** - View your full calendar

### Client Selection

- Searchable dropdown
- Shows: Name + Phone Number
- Sorted alphabetically

### Pet Selection

- Filtered by selected client
- Shows: Pet name + Breed
- Only clients' pets visible

### Preview Card

Shows selected booking details:

- Client name, phone, email
- Pet name, breed, age
- ⚠️ Highlights allergies & health issues

## ❓ Troubleshooting

### "Konfiguracja wymagana" Message

**Problem**: Cal.com username not set  
**Solution**: Run Step 2 above

### Client has no pets

**Problem**: Selected client has no pets in database  
**Solution**: Go to `/clients/{id}` and add a pet first

### Embed not loading

**Problem**: Username or event type slug incorrect  
**Solution**:

- Check your Cal.com URL
- Verify event type slug matches exactly
- Make sure event type is published (not hidden)

### Form fields not prefilled

**Problem**: Cal.com embed not receiving config  
**Solution**:

- Hard refresh (Cmd+Shift+R)
- Check browser console for errors
- Verify Cal.com username is correct

## 📱 Mobile Support

✅ Fully responsive design:

- **Desktop**: Side-by-side layout
- **Tablet**: Stacked with optimized spacing
- **Mobile**: Full-width components

## 🔐 Privacy & Security

- ✅ Client data never leaves your control
- ✅ Supabase RLS policies protect data access
- ✅ Only authenticated groomers can access
- ✅ Cal.com handles booking data securely

## 📈 Next Steps

After setup, you can:

1. ✅ Book appointments for clients
2. 🔔 Set up SMS reminders (integrate Twilio)
3. 🔗 Set up Cal.com webhooks to sync bookings back
4. 📊 View booking analytics in Cal.com dashboard

## 📚 Full Documentation

For detailed information, see:

- [Complete Implementation Guide](./calcom-booking-prefill-guide.md)
- [Cal.com Integration Plan](./cal-com-integration-implementation-plan.md)
- [Product Requirements](./prd.md)

## 🆘 Need Help?

1. Check [Cal.com Documentation](https://cal.com/docs)
2. Review browser console for errors
3. Verify database connection
4. Check Supabase logs

## ✨ Pro Tips

1. **Add emails to clients** - Prevents generated emails like `123456789@temp.barkbook.app`
2. **Use consistent event type slugs** - Makes it easier to manage
3. **Set default pet duration** - Add `default_visit_duration_minutes` to pets table
4. **Enable booking confirmations** - In Cal.com settings for automatic emails
5. **Use buffer times** - Give yourself prep/cleanup time between appointments

---

**That's it!** You're ready to use Cal.com booking with automatic client prefill. 🎉
