#!/bin/bash

# Local Webhook Test Script
# This script helps test the webhook endpoint locally

echo "🧪 PayPal Webhook Local Test"
echo "============================"
echo ""

# Check if Vercel dev is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Local server not running on port 3000"
    echo ""
    echo "💡 Start the server with:"
    echo "   npm run dev"
    echo ""
    exit 1
fi

echo "✅ Local server is running"
echo ""

# Test webhook endpoint
echo "📤 Sending test webhook event..."
echo ""

curl -X POST http://localhost:3000/api/webhooks/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "id": "WH-TEST-'$(date +%s)'",
    "event_version": "1.0",
    "create_time": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "resource_type": "capture",
    "resource_version": "2.0",
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "summary": "Payment completed for $ 0.05 USD",
    "resource": {
      "id": "TEST-TRANSACTION-'$(date +%s)'",
      "status": "COMPLETED",
      "amount": {
        "currency_code": "USD",
        "value": "0.05"
      },
      "final_capture": true,
      "supplementary_data": {
        "related_ids": {
          "order_id": "TEST-ORDER-'$(date +%s)'"
        }
      },
      "create_time": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "update_time": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
    }
  }' \
  -w "\n\nStatus: %{http_code}\n" \
  -s

echo ""
echo "✅ Test complete!"
echo ""
echo "💡 Check the Vercel dev server logs for webhook processing details"

