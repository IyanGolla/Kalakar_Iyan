/**
 * PayPal Webhook Endpoint
 * 
 * Vercel serverless function that receives and verifies PayPal webhook events.
 * 
 * IMPORTANT: Configure this webhook URL in your PayPal Developer Dashboard:
 * - Go to: https://developer.paypal.com/dashboard/
 * - Navigate to: Webhooks
 * - Add webhook URL: https://your-domain.com/api/webhooks/paypal
 * - Subscribe to: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED
 * 
 * Environment Variables Required (set in Vercel Dashboard):
 * - PAYPAL_CLIENT_ID: Your PayPal Client ID
 * - PAYPAL_CLIENT_SECRET: Your PayPal Client Secret
 * - PAYPAL_WEBHOOK_ID: Your PayPal Webhook ID (for signature verification)
 * - PAYPAL_ENV: 'sandbox' or 'production' (defaults to sandbox)
 */

/**
 * Verify PayPal webhook signature using PayPal API
 */
async function verifyWebhookSignature(headers, body, webhookId, clientId, clientSecret) {
  try {
    // Get signature headers from PayPal
    const authAlgo = headers['paypal-auth-algo'];
    const certUrl = headers['paypal-cert-url'];
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];

    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      console.error('Missing PayPal webhook signature headers');
      return false;
    }

    // Determine PayPal API endpoint based on environment
    const isProduction = process.env.PAYPAL_ENV === 'production';
    const baseUrl = isProduction 
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get PayPal access token:', errorText);
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Parse the webhook event body
    const webhookEvent = typeof body === 'string' ? JSON.parse(body) : body;

    // Create verification payload
    const verificationPayload = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    };

    // Verify webhook signature with PayPal
    const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationPayload),
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('Webhook signature verification failed:', errorText);
      return false;
    }

    const verifyData = await verifyResponse.json();
    const isValid = verifyData.verification_status === 'SUCCESS';

    if (!isValid) {
      console.error('Webhook signature verification failed:', verifyData);
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Process webhook event based on event type
 */
async function processWebhookEvent(event) {
  const eventType = event.event_type;
  const resource = event.resource;

  console.log(`Processing webhook event: ${eventType}`, {
    eventId: event.id,
    createTime: event.create_time,
  });

  switch (eventType) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePaymentCaptureCompleted(resource, event);
      break;

    case 'PAYMENT.CAPTURE.DENIED':
      await handlePaymentCaptureDenied(resource, event);
      break;

    case 'PAYMENT.CAPTURE.REFUNDED':
      await handlePaymentRefunded(resource, event);
      break;

    case 'PAYMENT.CAPTURE.PENDING':
      await handlePaymentCapturePending(resource, event);
      break;

    case 'PAYMENT.CAPTURE.REVERSED':
      await handlePaymentCaptureReversed(resource, event);
      break;

    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }
}

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptureCompleted(resource, event) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  const amount = resource.amount?.value;
  const currency = resource.amount?.currency_code;
  const payer = resource.payer;
  const status = resource.status;
  const finalCapture = resource.final_capture;

  console.log('✅ Payment captured successfully:', {
    transactionId,
    orderId,
    amount,
    currency,
    status,
    finalCapture,
    eventId: event.id,
  });

  // TODO: Update database record to 'confirmed' status
  // Example implementation:
  // try {
  //   await updateBookingStatus(orderId, 'confirmed', {
  //     transactionId,
  //     amount,
  //     currency,
  //     payer,
  //     status,
  //     capturedAt: new Date(),
  //   });
  //   console.log('Database updated successfully');
  // } catch (error) {
  //   console.error('Failed to update database:', error);
  // }

  // TODO: Send confirmation email
  // Example implementation:
  // try {
  //   await sendConfirmationEmail({
  //     orderId,
  //     transactionId,
  //     amount,
  //     currency,
  //     payer: payer?.email_address || payer?.name,
  //   });
  //   console.log('Confirmation email sent successfully');
  // } catch (error) {
  //   console.error('Failed to send email:', error);
  // }

  // Log for now (replace with actual database/email integration)
  console.log('📧 Payment confirmed - ready for database and email integration');
}

/**
 * Handle denied payment capture
 */
async function handlePaymentCaptureDenied(resource, event) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  const reason = resource.reason_code;
  const status = resource.status;

  console.log('❌ Payment capture denied:', {
    transactionId,
    orderId,
    reason,
    status,
    eventId: event.id,
  });

  // TODO: Update database record to 'failed' status
  // await updateBookingStatus(orderId, 'failed', {
  //   transactionId,
  //   reason,
  //   failedAt: new Date(),
  // });
}

/**
 * Handle payment refund
 */
async function handlePaymentRefunded(resource, event) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  const amount = resource.amount?.value;
  const currency = resource.amount?.currency_code;

  console.log('↩️ Payment refunded:', {
    transactionId,
    orderId,
    amount,
    currency,
    eventId: event.id,
  });

  // TODO: Update database record to 'refunded' status
  // await updateBookingStatus(orderId, 'refunded', {
  //   transactionId,
  //   amount,
  //   refundedAt: new Date(),
  // });
}

/**
 * Handle pending payment capture
 */
async function handlePaymentCapturePending(resource, event) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;

  console.log('⏳ Payment capture pending:', {
    transactionId,
    orderId,
    eventId: event.id,
  });

  // TODO: Update database record to 'pending' status
  // await updateBookingStatus(orderId, 'pending', {
  //   transactionId,
  // });
}

/**
 * Handle reversed payment capture
 */
async function handlePaymentCaptureReversed(resource, event) {
  const transactionId = resource.id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;

  console.log('🔄 Payment capture reversed:', {
    transactionId,
    orderId,
    eventId: event.id,
  });

  // TODO: Update database record to 'reversed' status
  // await updateBookingStatus(orderId, 'reversed', {
  //   transactionId,
  //   reversedAt: new Date(),
  // });
}

/**
 * Main webhook handler for Vercel serverless function
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST'],
    });
  }

  try {
    // Get environment variables
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!clientId || !clientSecret) {
      console.error('Missing PayPal Client ID or Secret');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'PayPal credentials not configured',
      });
    }

    if (!webhookId) {
      console.warn('PAYPAL_WEBHOOK_ID not set - skipping signature verification');
      // In development, you might want to allow this
      // In production, always require webhook ID
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Server configuration error',
          message: 'Webhook ID not configured',
        });
      }
    }

    // Get webhook event
    const webhookEvent = req.body;

    if (!webhookEvent || !webhookEvent.event_type) {
      return res.status(400).json({ 
        error: 'Invalid webhook event',
        message: 'Missing event_type',
      });
    }

    // Verify webhook signature if webhook ID is configured
    if (webhookId) {
      const isValid = await verifyWebhookSignature(
        req.headers,
        webhookEvent,
        webhookId,
        clientId,
        clientSecret
      );

      if (!isValid) {
        console.error('Invalid webhook signature', {
          eventType: webhookEvent.event_type,
          eventId: webhookEvent.id,
        });
        return res.status(401).json({ 
          error: 'Invalid signature',
          message: 'Webhook signature verification failed',
        });
      }

      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ Webhook signature verification skipped (webhook ID not configured)');
    }

    // Process webhook event
    await processWebhookEvent(webhookEvent);

    // Return 200 OK to acknowledge receipt
    return res.status(200).json({ 
      received: true,
      eventId: webhookEvent.id,
      eventType: webhookEvent.event_type,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
    });
  }
}

