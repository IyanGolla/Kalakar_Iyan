/**
 * Simple Webhook Test (No Signature Verification)
 * 
 * This test sends a webhook event without signature verification.
 * Useful for initial testing before setting up PayPal webhook.
 * 
 * Usage: node test-webhook-simple.js
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/paypal';

// Sample webhook event
const testEvent = {
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
    supplementary_data: {
      related_ids: {
        order_id: 'TEST-ORDER-' + Date.now()
      }
    },
    create_time: new Date().toISOString(),
    update_time: new Date().toISOString()
  }
};

async function testWebhook() {
  console.log('🧪 Testing PayPal Webhook (Simple Test)\n');
  console.log(`URL: ${WEBHOOK_URL}\n`);
  console.log('📤 Sending test event...\n');
  console.log(`Event Type: ${testEvent.event_type}`);
  console.log(`Transaction ID: ${testEvent.resource.id}`);
  console.log(`Order ID: ${testEvent.resource.supplementary_data.related_ids.order_id}\n`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEvent),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    console.log('📥 Response:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Body:`, JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Webhook endpoint is working!');
      console.log('   The endpoint received and processed the event.');
    } else {
      console.log('\n⚠️  Webhook endpoint returned an error.');
      console.log('   This might be expected if signature verification is enabled.');
      console.log('   Check the response above for details.');
    }

    return response.ok;
  } catch (error) {
    console.error('\n❌ Error:');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Tip: Make sure the server is running:');
      console.error('   npm run dev\n');
    }
    
    return false;
  }
}

// Run test
if (require.main === module) {
  testWebhook().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testWebhook };

