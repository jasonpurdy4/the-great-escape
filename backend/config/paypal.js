// PayPal Configuration
const paypal = require('@paypal/paypal-server-sdk');

// Support both PAYMENT_ENVIRONMENT and PAYPAL_MODE for backward compatibility
// PAYMENT_ENVIRONMENT takes precedence
const rawEnvironment = process.env.PAYMENT_ENVIRONMENT || process.env.PAYPAL_MODE || 'sandbox';

// Normalize to 'production' or 'sandbox' (support 'live' as alias for 'production')
const environment = (rawEnvironment === 'live' || rawEnvironment === 'production') ? 'production' : 'sandbox';

// Get credentials based on environment
const clientId = environment === 'production'
  ? process.env.PAYPAL_PRODUCTION_CLIENT_ID
  : process.env.PAYPAL_SANDBOX_CLIENT_ID;

const clientSecret = environment === 'production'
  ? process.env.PAYPAL_PRODUCTION_CLIENT_SECRET
  : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('❌ PayPal credentials not found in environment variables');
  throw new Error('PayPal credentials missing');
}

// Configure PayPal client
const client = new paypal.Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret,
  },
  environment: environment === 'production'
    ? paypal.Environment.Production
    : paypal.Environment.Sandbox,
  logging: {
    logLevel: paypal.LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

console.log(`✅ PayPal configured for ${environment} environment`);

module.exports = {
  client,
  environment
};
