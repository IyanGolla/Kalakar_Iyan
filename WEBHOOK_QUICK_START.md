# PayPal Webhook Quick Start Guide

## Quick Setup (5 minutes)

### Step 1: Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy

### Step 2: Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=will_get_this_in_step_3
PAYPAL_ENV=sandbox
```

**Get your credentials:**
- Go to: https://developer.paypal.com/dashboard/
- Make sure you're in "Sandbox" mode
- Go to "Apps & Credentials"
- Find your app or create one
- Copy Client ID and Secret

### Step 3: Create Webhook in PayPal Dashboard

1. Go to: https://developer.paypal.com/dashboard/
2. Click on your app (or create one)
3. Go to "Webhooks" section
4. Click "Add Webhook"
5. Enter webhook URL:
   ```
   https://your-vercel-domain.vercel.app/api/webhooks/paypal
   ```
   (Replace with your actual Vercel domain)
6. Select event types:
   - ✅ PAYMENT.CAPTURE.COMPLETED
   - ✅ PAYMENT.CAPTURE.DENIED
   - ✅ PAYMENT.CAPTURE.REFUNDED
   - ✅ PAYMENT.CAPTURE.PENDING
7. Click "Save"
8. **Copy the Webhook ID** (you'll see it after saving)
9. Go back to Vercel and update `PAYPAL_WEBHOOK_ID` with the copied ID
10. Redeploy your Vercel project

### Step 4: Test the Webhook

1. Go to PayPal Dashboard → Webhooks
2. Click on your webhook
3. Click "Send Test Event"
4. Select "PAYMENT.CAPTURE.COMPLETED"
5. Click "Send"
6. Check Vercel function logs:
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `api/webhooks/paypal`
   - Check logs for "✅ Webhook signature verified"

### Step 5: Test with Real Transaction

1. Make a test purchase on your site
2. Complete payment with PayPal sandbox
3. Check Vercel function logs for webhook event
4. Verify event was processed

## Troubleshooting

### Webhook not receiving events?

1. ✅ Check webhook URL is correct (must be HTTPS)
2. ✅ Check environment variables are set in Vercel
3. ✅ Check Vercel function is deployed
4. ✅ Check PayPal webhook is active (green status)

### Signature verification failing?

1. ✅ Check `PAYPAL_WEBHOOK_ID` matches PayPal dashboard
2. ✅ Check `PAYPAL_ENV` is set correctly (sandbox/production)
3. ✅ Check Client ID and Secret are correct

### Events not processing?

1. ✅ Check you subscribed to the event type
2. ✅ Check Vercel function logs for errors
3. ✅ Verify database/email integration (when implemented)

## Next Steps

After webhook is working:

1. ✅ Implement database integration (update booking status)
2. ✅ Implement email sending (send confirmation emails)
3. ✅ Add error handling and logging
4. ✅ Set up monitoring and alerts

## Support

- Full documentation: See `WEBHOOK_SETUP.md`
- PayPal Developer Docs: https://developer.paypal.com/docs/api-basics/notifications/webhooks/

