# Webhook Testing Guide

This guide explains how to test your PayPal webhook endpoint.

## Testing Methods

### Method 1: Test Locally with Vercel Dev

**Prerequisites:**
- Node.js installed
- Vercel CLI installed (`npm install -g vercel`)

**Steps:**

1. **Start local dev server:**
   ```bash
   npm run dev
   ```
   This will start Vercel dev server on `http://localhost:3000`

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```bash
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   PAYPAL_WEBHOOK_ID=your_webhook_id
   PAYPAL_ENV=sandbox
   ```

3. **Test with the test script:**
   ```bash
   node test-webhook.js local
   ```

   Or use the shell script:
   ```bash
   chmod +x test-webhook-local.sh
   ./test-webhook-local.sh
   ```

4. **Check the logs:**
   - Look at the Vercel dev server console
   - You should see webhook processing logs

### Method 2: Test with PayPal Webhook Simulator

**Steps:**

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add webhook endpoint"
   git push
   ```

2. **Get your webhook URL:**
   ```
   https://your-domain.vercel.app/api/webhooks/paypal
   ```

3. **Go to PayPal Developer Dashboard:**
   - https://developer.paypal.com/dashboard/
   - Navigate to "Webhooks"
   - Click on your webhook (or create one)
   - Click "Send Test Event"

4. **Select event type:**
   - Choose `PAYMENT.CAPTURE.COMPLETED`
   - Click "Send"

5. **Check Vercel logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `api/webhooks/paypal`
   - Check the logs for the webhook event

### Method 3: Test with Real Transaction

**Steps:**

1. **Make sure webhook is configured in PayPal:**
   - Webhook URL is set correctly
   - Event types are subscribed
   - Webhook is active (green status)

2. **Make a test purchase:**
   - Go to your site
   - Select tickets
   - Complete payment with PayPal sandbox

3. **Check webhook logs:**
   - PayPal will send webhook event automatically
   - Check Vercel function logs
   - Verify event was received and processed

### Method 4: Test with cURL

**Test locally:**
```bash
curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "id": "WH-TEST-123",
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "TEST-TRANSACTION-123",
      "status": "COMPLETED",
      "amount": {
        "currency_code": "USD",
        "value": "0.05"
      },
      "supplementary_data": {
        "related_ids": {
          "order_id": "TEST-ORDER-123"
        }
      }
    }
  }'
```

**Test remote (after deployment):**
```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "id": "WH-TEST-123",
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "TEST-TRANSACTION-123",
      "status": "COMPLETED",
      "amount": {
        "currency_code": "USD",
        "value": "0.05"
      },
      "supplementary_data": {
        "related_ids": {
          "order_id": "TEST-ORDER-123"
        }
      }
    }
  }'
```

## Expected Responses

### Success Response (200 OK)
```json
{
  "received": true,
  "eventId": "WH-TEST-123",
  "eventType": "PAYMENT.CAPTURE.COMPLETED"
}
```

### Error Responses

**Missing Configuration (500):**
```json
{
  "error": "Server configuration error",
  "message": "PayPal credentials not configured"
}
```

**Invalid Signature (401):**
```json
{
  "error": "Invalid signature",
  "message": "Webhook signature verification failed"
}
```

**Invalid Event (400):**
```json
{
  "error": "Invalid webhook event",
  "message": "Missing event_type"
}
```

## Testing Different Event Types

Test multiple event types:
```bash
node test-webhook.js local multiple
```

This will test:
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.PENDING`

## Debugging

### Check Webhook Logs

**Local:**
- Check Vercel dev server console
- Look for webhook processing messages

**Remote:**
- Vercel Dashboard → Your Project → Functions
- Click on `api/webhooks/paypal`
- View logs

### Common Issues

**1. Webhook not receiving events:**
- ✅ Check webhook URL is correct
- ✅ Check environment variables are set
- ✅ Check Vercel function is deployed
- ✅ Check PayPal webhook is active

**2. Signature verification failing:**
- ✅ Check `PAYPAL_WEBHOOK_ID` matches PayPal dashboard
- ✅ Check `PAYPAL_ENV` is set correctly
- ✅ Check Client ID and Secret are correct

**3. Events not processing:**
- ✅ Check you subscribed to the event type
- ✅ Check Vercel function logs for errors
- ✅ Verify event payload structure

## Next Steps

After webhook is working:

1. ✅ Test with real PayPal transactions
2. ✅ Implement database integration
3. ✅ Implement email sending
4. ✅ Set up monitoring and alerts

