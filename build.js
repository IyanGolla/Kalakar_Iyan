// Build script to inject PayPal Client ID from environment variable
const fs = require('fs');
const path = require('path');

// Get PayPal Client ID from environment variable (Vercel will provide this)
const paypalClientId = process.env.PAYPAL_CLIENT_ID || 'sb';

console.log('Building with PayPal Client ID:', paypalClientId ? paypalClientId.substring(0, 10) + '...' : 'not set (using default)');

// Read the HTML file
const htmlPath = path.join(__dirname, 'tickets.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace the placeholder %%PAYPAL_CLIENT_ID%% with actual value
html = html.replace(/%%PAYPAL_CLIENT_ID%%/g, paypalClientId);

// Write the updated HTML
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('Build complete. PayPal Client ID injected into tickets.html.');

