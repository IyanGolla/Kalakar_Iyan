# Quick Webhook Test Setup

## Step 1: Create .env.local file

Create a `.env.local` file in the root directory with:

```bash
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id
PAYPAL_ENV=sandbox
WEBHOOK_URL=http://localhost:3000/api/webhooks/paypal
```

**Get your credentials:**
- Go to: https://developer.paypal.com/dashboard/
- Make sure you're in "Sandbox" mode
- Go to "Apps & Credentials" → Copy Client ID and Secret
- Go to "Webhooks" → Create webhook → Copy Webhook ID

## Step 2: Start Local Server

```bash
npm run dev
```

This will start Vercel dev server on `http://localhost:3000`

## Step 3: Test the Webhook

In a new terminal, run:

```bash
npm run test:webhook
```

Or use the shell script:

```bash
./test-webhook-local.sh
```

## Step 4: Check Logs

Look at the Vercel dev server console for webhook processing logs.

You should see:
- ✅ "Processing webhook event: PAYMENT.CAPTURE.COMPLETED"
- ✅ "Payment captured successfully"
- ✅ Response: { received: true, ... }

## Alternative: Test Without Signature Verification

If you don't have a webhook ID yet, you can test without signature verification by temporarily modifying the webhook handler to skip verification in development mode.

