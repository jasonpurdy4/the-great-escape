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

// OAuth 2.0 Identity API endpoints
const identityBaseUrl = environment === 'production'
  ? 'https://www.paypal.com'
  : 'https://www.sandbox.paypal.com';

const apiBaseUrl = environment === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const identityConfig = {
  // OAuth authorization URL (user redirects here to login)
  authorizationUrl: `${identityBaseUrl}/connect`,

  // Token exchange endpoint
  tokenUrl: `${apiBaseUrl}/v1/oauth2/token`,

  // User info endpoint
  userInfoUrl: `${apiBaseUrl}/v1/oauth2/token/userinfo?schema=openid`,

  // Client credentials for OAuth
  clientId,
  clientSecret,

  // Required scopes for basic user info (email, name, PayPal ID)
  // Note: Must enable "Personal Information" and "Address Information" in PayPal app settings
  defaultScopes: 'openid profile email https://uri.paypal.com/services/paypalattributes'
};

module.exports = {
  client,
  environment,
  identityConfig
};
