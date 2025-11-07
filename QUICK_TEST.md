# Quick Webhook Test Guide

## Option 1: Test Without PayPal Credentials (Simplest)

This tests if the webhook endpoint is working without needing PayPal credentials.

### Step 1: Start Local Server

```bash
npm run dev
```

Wait for: "Ready! Available at http://localhost:3000"

### Step 2: Test the Webhook

In a new terminal:

```bash
node test-webhook-simple.js
```

**Expected Output:**
```
✅ Webhook endpoint is working!
   The endpoint received and processed the event.
```

**If you see connection error:**
- Make sure `npm run dev` is running
- Check the URL is `http://localhost:3000`

## Option 2: Test With PayPal Credentials

### Step 1: Get PayPal Credentials

1. Go to: https://developer.paypal.com/dashboard/
2. Make sure you're in **Sandbox** mode
3. Go to **Apps & Credentials**
4. Find your app (or create one)
5. Copy **Client ID** and **Secret**

### Step 2: Update .env.local

Edit `.env.local` and add your credentials:

```bash
PAYPAL_CLIENT_ID=your_actual_client_id
PAYPAL_CLIENT_SECRET=your_actual_secret
PAYPAL_ENV=sandbox
```

(You can leave `PAYPAL_WEBHOOK_ID` empty for now)

### Step 3: Restart Dev Server

Stop the dev server (Ctrl+C) and restart:

```bash
npm run dev
```

### Step 4: Test Again

```bash
node test-webhook-simple.js
```

You should see the same success message, but now with PayPal credentials configured.

## Option 3: Test With Full Signature Verification

### Step 1: Create Webhook in PayPal

1. Go to: https://developer.paypal.com/dashboard/
2. Go to **Webhooks**
3. Click **Add Webhook**
4. Enter URL: `https://your-domain.vercel.app/api/webhooks/paypal`
   (Or use ngrok for local: `https://your-ngrok-url.ngrok.io/api/webhooks/paypal`)
5. Select events: `PAYMENT.CAPTURE.COMPLETED`
6. Click **Save**
7. **Copy the Webhook ID**

### Step 2: Update .env.local

```bash
PAYPAL_WEBHOOK_ID=your_webhook_id_here
```

### Step 3: Test with PayPal Simulator

1. In PayPal Dashboard → Webhooks
2. Click on your webhook
3. Click **Send Test Event**
4. Select `PAYMENT.CAPTURE.COMPLETED`
5. Click **Send**
6. Check Vercel function logs

## Troubleshooting

### "Connection refused"
- ✅ Make sure `npm run dev` is running
- ✅ Check port 3000 is not in use

### "Server configuration error"
- ✅ Check `.env.local` has `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- ✅ Make sure values are correct (no extra spaces)

### "Invalid signature"
- ✅ This is expected if testing without webhook ID
- ✅ For real testing, set up webhook in PayPal dashboard

### Webhook not processing
- ✅ Check Vercel dev server console for errors
- ✅ Look for "Processing webhook event" message
- ✅ Check event structure matches PayPal format

## Next Steps

Once basic test works:

1. ✅ Deploy to Vercel
2. ✅ Set up webhook in PayPal dashboard
3. ✅ Test with real PayPal transactions
4. ✅ Implement database integration
5. ✅ Implement email sending

