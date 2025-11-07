# PayPal Webhook Setup Guide

This guide explains how to set up and configure PayPal webhooks for your ticket purchase system.

## Overview

The webhook endpoint receives real-time notifications from PayPal when payment events occur (payment completed, denied, refunded, etc.). This allows your backend to:
- Update booking status in your database
- Send confirmation emails
- Handle payment failures
- Process refunds

## Webhook Endpoint

**URL:** `https://your-domain.com/api/webhooks/paypal`

**Method:** POST

**Location:** `api/webhooks/paypal.js` (Vercel serverless function)

## Setup Steps

### 1. Configure Environment Variables

Add these environment variables in your Vercel Dashboard (Settings → Environment Variables):

```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_ENV=sandbox  # or 'production' for live
```

**For Sandbox:**
- Get credentials from: https://developer.paypal.com/dashboard/
- Make sure you're in the "Sandbox" environment

**For Production:**
- Switch to "Live" environment in PayPal Developer Dashboard
- Use your live Client ID and Secret

### 2. Create Webhook in PayPal Dashboard

1. Go to https://developer.paypal.com/dashboard/
2. Select your app (or create one)
3. Navigate to **Webhooks** section
4. Click **Add Webhook**
5. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/paypal
   ```
6. Select event types to subscribe to:
   - ✅ `PAYMENT.CAPTURE.COMPLETED` - Payment successful
   - ✅ `PAYMENT.CAPTURE.DENIED` - Payment denied
   - ✅ `PAYMENT.CAPTURE.REFUNDED` - Payment refunded
   - ✅ `PAYMENT.CAPTURE.PENDING` - Payment pending
   - ✅ `PAYMENT.CAPTURE.REVERSED` - Payment reversed
7. Click **Save**
8. **Copy the Webhook ID** - you'll need this for `PAYPAL_WEBHOOK_ID`

### 3. Test Webhook Locally (Optional)

If you want to test locally before deploying:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run local dev server:
   ```bash
   npm run dev
   ```

3. Use a tool like ngrok to expose your local server:
   ```bash
   ngrok http 3000
   ```

4. Use the ngrok URL in PayPal webhook configuration for testing

### 4. Verify Webhook is Working

After deployment, PayPal will send a verification request. Check your Vercel function logs:

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on `api/webhooks/paypal`
3. Check the logs for:
   - ✅ "Webhook signature verified"
   - ✅ "Processing webhook event: PAYMENT.CAPTURE.COMPLETED"

## Webhook Event Types

### PAYMENT.CAPTURE.COMPLETED

Triggered when a payment is successfully captured.

**Event Data:**
```json
{
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "resource": {
    "id": "transaction_id",
    "status": "COMPLETED",
    "amount": {
      "value": "0.05",
      "currency_code": "USD"
    },
    "supplementary_data": {
      "related_ids": {
        "order_id": "order_id"
      }
    },
    "payer": {
      "email_address": "buyer@example.com",
      "name": {
        "given_name": "John",
        "surname": "Doe"
      }
    }
  }
}
```

**What to do:**
- Update booking status to 'confirmed'
- Send confirmation email
- Update inventory

### PAYMENT.CAPTURE.DENIED

Triggered when a payment is denied.

**What to do:**
- Update booking status to 'failed'
- Log the reason for denial
- Optionally notify the user

### PAYMENT.CAPTURE.REFUNDED

Triggered when a payment is refunded.

**What to do:**
- Update booking status to 'refunded'
- Send refund confirmation email
- Restore inventory

### PAYMENT.CAPTURE.PENDING

Triggered when a payment is pending.

**What to do:**
- Update booking status to 'pending'
- Wait for completion event

## Security

### Signature Verification

The webhook endpoint automatically verifies PayPal webhook signatures to ensure:
- The request came from PayPal
- The data hasn't been tampered with
- The event is authentic

**Important:** Never disable signature verification in production!

### Rate Limiting

PayPal may send multiple webhook events for the same transaction. Your endpoint should:
- Handle duplicate events gracefully
- Use idempotency keys if needed
- Log all events for audit purposes

## Testing

### Test with PayPal Webhook Simulator

1. Go to PayPal Developer Dashboard → Webhooks
2. Click on your webhook
3. Click **Send Test Event**
4. Select event type (e.g., `PAYMENT.CAPTURE.COMPLETED`)
5. Click **Send**
6. Check your Vercel function logs to verify it was received

### Test with Real Transaction

1. Make a test purchase using PayPal sandbox
2. Complete the payment
3. Check Vercel function logs for webhook event
4. Verify the event was processed correctly

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL is correct:**
   - Must be HTTPS (not HTTP)
   - Must be publicly accessible
   - Must match exactly what's in PayPal dashboard

2. **Check environment variables:**
   - `PAYPAL_CLIENT_ID` is set
   - `PAYPAL_CLIENT_SECRET` is set
   - `PAYPAL_WEBHOOK_ID` is set

3. **Check Vercel function logs:**
   - Look for errors
   - Verify function is deployed

### Signature Verification Failing

1. **Check webhook ID:**
   - Must match the Webhook ID from PayPal dashboard
   - Copy it exactly (no extra spaces)

2. **Check environment:**
   - Sandbox webhooks use sandbox API
   - Production webhooks use production API
   - Set `PAYPAL_ENV` correctly

3. **Check headers:**
   - PayPal sends signature headers
   - Vercel should pass them through correctly

### Events Not Processing

1. **Check event type:**
   - Make sure you subscribed to the event type
   - Check if event type is handled in code

2. **Check logs:**
   - Look for error messages
   - Verify database/email integration (when implemented)

## Next Steps

After webhook is set up:

1. ✅ **Database Integration** - Update booking status in database
2. ✅ **Email Integration** - Send confirmation emails
3. ✅ **Error Handling** - Handle failed webhook processing
4. ✅ **Monitoring** - Set up alerts for webhook failures
5. ✅ **Logging** - Log all webhook events for audit

## Example Webhook Payload

```json
{
  "id": "WH-2W42680G89370950-67976317HG053273C",
  "event_version": "1.0",
  "create_time": "2024-01-15T10:00:00.000Z",
  "resource_type": "capture",
  "resource_version": "2.0",
  "event_type": "PAYMENT.CAPTURE.COMPLETED",
  "summary": "Payment completed for $ 0.05 USD",
  "resource": {
    "id": "5O190127TN364715T",
    "status": "COMPLETED",
    "amount": {
      "currency_code": "USD",
      "value": "0.05"
    },
    "final_capture": true,
    "seller_protection": {
      "status": "ELIGIBLE",
      "dispute_categories": ["ITEM_NOT_RECEIVED", "UNAUTHORIZED_TRANSACTION"]
    },
    "supplementary_data": {
      "related_ids": {
        "order_id": "8X12345678901234"
      }
    },
    "create_time": "2024-01-15T10:00:00.000Z",
    "update_time": "2024-01-15T10:00:00.000Z"
  },
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-2W42680G89370950-67976317HG053273C",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-2W42680G89370950-67976317HG053273C/resend",
      "rel": "resend",
      "method": "POST"
    }
  ]
}
```

## Support

- PayPal Developer Documentation: https://developer.paypal.com/docs/api-basics/notifications/webhooks/
- PayPal Support: https://www.paypal.com/support

