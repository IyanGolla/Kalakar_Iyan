/**
 * Webhook Test Script
 * 
 * This script helps test the PayPal webhook endpoint locally or remotely.
 * 
 * Usage:
 *   node test-webhook.js local    # Test local webhook endpoint
 *   node test-webhook.js remote   # Test remote webhook endpoint
 */

require('dotenv').config({ path: '.env.local' });

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/paypal';
const TEST_MODE = process.argv[2] || 'local';

// Sample PayPal webhook event (PAYMENT.CAPTURE.COMPLETED)
const sampleWebhookEvent = {
  id: 'WH-TEST-' + Date.now(),
  event_version: '1.0',
  create_time: new Date().toISOString(),
  resource_type: 'capture',
  resource_version: '2.0',
  event_type: 'PAYMENT.CAPTURE.COMPLETED',
  summary: 'Payment completed for $ 0.05 USD',
  resource: {
    id: 'TEST-TRANSACTION-' + Date.now(),
    status: 'COMPLETED',
    amount: {
      currency_code: 'USD',
      value: '0.05'
    },
    final_capture: true,
    seller_protection: {
      status: 'ELIGIBLE',
      dispute_categories: ['ITEM_NOT_RECEIVED', 'UNAUTHORIZED_TRANSACTION']
    },
    supplementary_data: {
      related_ids: {
        order_id: 'TEST-ORDER-' + Date.now()
      }
    },
    create_time: new Date().toISOString(),
    update_time: new Date().toISOString()
  },
  links: [
    {
      href: 'https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-TEST',
      rel: 'self',
      method: 'GET'
    }
  ]
};

/**
 * Test webhook endpoint
 */
async function testWebhook() {
  console.log('🧪 Testing PayPal Webhook Endpoint\n');
  console.log(`Mode: ${TEST_MODE}`);
  console.log(`URL: ${WEBHOOK_URL}\n`);

  try {
    // Make POST request to webhook endpoint
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: For real PayPal webhooks, these headers are required for signature verification
        // For testing without signature verification, we'll skip them
        // 'paypal-auth-algo': 'SHA256withRSA',
        // 'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a376-5c5e4bd7',
        // 'paypal-transmission-id': 'test-transmission-id',
        // 'paypal-transmission-sig': 'test-signature',
        // 'paypal-transmission-time': new Date().toISOString(),
      },
      body: JSON.stringify(sampleWebhookEvent),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    console.log('📤 Request sent:');
    console.log(`   Event Type: ${sampleWebhookEvent.event_type}`);
    console.log(`   Transaction ID: ${sampleWebhookEvent.resource.id}`);
    console.log(`   Order ID: ${sampleWebhookEvent.resource.supplementary_data.related_ids.order_id}\n`);

    console.log('📥 Response received:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response:`, responseData);

    if (response.ok) {
      console.log('\n✅ Webhook test successful!');
      console.log('   The webhook endpoint received and processed the event.');
    } else {
      console.log('\n❌ Webhook test failed!');
      console.log('   Check the error message above.');
    }

    return response.ok;
  } catch (error) {
    console.error('\n❌ Error testing webhook:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure the webhook server is running.');
      console.error('   For local testing: npm run dev');
      console.error('   Or set WEBHOOK_URL to your deployed Vercel URL.');
    }
    
    return false;
  }
}

/**
 * Test with different event types
 */
async function testMultipleEvents() {
  const eventTypes = [
    'PAYMENT.CAPTURE.COMPLETED',
    'PAYMENT.CAPTURE.DENIED',
    'PAYMENT.CAPTURE.PENDING',
  ];

  console.log('🧪 Testing multiple event types\n');

  for (const eventType of eventTypes) {
    const event = {
      ...sampleWebhookEvent,
      id: 'WH-TEST-' + Date.now() + '-' + eventType,
      event_type: eventType,
      summary: `Test ${eventType} event`,
    };

    if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      event.resource.status = 'DENIED';
      event.resource.reason_code = 'INSTRUMENT_DECLINED';
    } else if (eventType === 'PAYMENT.CAPTURE.PENDING') {
      event.resource.status = 'PENDING';
    }

    console.log(`\n📤 Testing: ${eventType}`);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const responseData = await response.json();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, responseData);
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run tests
if (require.main === module) {
  if (process.argv[3] === 'multiple') {
    testMultipleEvents();
  } else {
    testWebhook();
  }
}

module.exports = { testWebhook, testMultipleEvents };

