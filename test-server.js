/**
 * Simple Test Server for Webhook Testing
 * 
 * This creates a simple HTTP server to test the webhook endpoint locally
 * without needing Vercel dev server.
 */

const http = require('http');
const url = require('url');

// Import the webhook handler
// Note: We need to adapt it for Node.js HTTP server
async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const webhookEvent = JSON.parse(body);
      
      console.log('📥 Received webhook event:');
      console.log(`   Event Type: ${webhookEvent.event_type}`);
      console.log(`   Transaction ID: ${webhookEvent.resource?.id || 'N/A'}`);
      console.log(`   Order ID: ${webhookEvent.resource?.supplementary_data?.related_ids?.order_id || 'N/A'}`);
      
      // Process the event (simplified version)
      if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        console.log('✅ Processing PAYMENT.CAPTURE.COMPLETED event');
        console.log('   Payment captured successfully!');
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        received: true,
        eventId: webhookEvent.id,
        eventType: webhookEvent.event_type,
      }));
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (parsedUrl.pathname === '/api/webhooks/paypal') {
    handleWebhook(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhooks/paypal`);
  console.log(`\n💡 Run in another terminal: node test-webhook-simple.js\n`);
});

