// Build script to inject PayPal Client ID from environment variable
const fs = require('fs');
const path = require('path');

try {
    // Get PayPal Client ID from environment variable (Vercel will provide this)
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    
    if (!paypalClientId) {
        console.error('ERROR: PAYPAL_CLIENT_ID environment variable is not set!');
        console.error('Please set PAYPAL_CLIENT_ID in Vercel Dashboard -> Settings -> Environment Variables');
        process.exit(1);
    }

    console.log('Building with PayPal Client ID:', paypalClientId.substring(0, 10) + '...');

    // Create build directory if it doesn't exist
    const buildDir = path.join(__dirname, 'build');
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    // Read the source HTML file
    const htmlPath = path.join(__dirname, 'tickets.html');
    
    if (!fs.existsSync(htmlPath)) {
        console.error('Error: tickets.html not found!');
        process.exit(1);
    }
    
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Replace the placeholder %%PAYPAL_CLIENT_ID%% with actual value
    html = html.replace(/%%PAYPAL_CLIENT_ID%%/g, paypalClientId);

    // Write to build directory instead of modifying source
    const buildHtmlPath = path.join(buildDir, 'tickets.html');
    fs.writeFileSync(buildHtmlPath, html, 'utf8');

    // Copy thank-you.html to build directory
    const thankYouSource = path.join(__dirname, 'thank-you.html');
    const thankYouDest = path.join(buildDir, 'thank-you.html');
    if (fs.existsSync(thankYouSource)) {
        fs.copyFileSync(thankYouSource, thankYouDest);
    }

    console.log('Build complete. PayPal Client ID injected into tickets.html.');
    console.log('Build output written to build/ directory.');
    console.log('Build successful - files are ready for deployment.');
} catch (error) {
    console.error('Build error:', error);
    process.exit(1);
}

