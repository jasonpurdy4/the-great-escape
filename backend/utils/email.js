// Email Utility - Magic Link Sending
const crypto = require('crypto');

/**
 * Send magic link email
 * For now, just logs to console. In production, integrate with SendGrid/Resend
 */
async function sendMagicLinkEmail(email, magicLink) {
  // TODO: Replace with actual email service (SendGrid, Resend, etc.)

  console.log('\n========================================');
  console.log('🔐 MAGIC LINK EMAIL');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Link: ${magicLink}`);
  console.log('========================================\n');

  // For development, we'll just log it
  // In production, use a real email service:

  /*
  // Example with SendGrid:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM || 'noreply@thegreatescape.app',
    subject: 'Login to The Great Escape',
    text: `Click this link to login: ${magicLink}\n\nThis link expires in 15 minutes.`,
    html: `
      <h2>Login to The Great Escape</h2>
      <p>Click the button below to login to your account:</p>
      <p><a href="${magicLink}" style="background: #C8102E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Login Now</a></p>
      <p>Or copy and paste this link: ${magicLink}</p>
      <p><small>This link expires in 15 minutes and can only be used once.</small></p>
    `
  };

  await sgMail.send(msg);
  */

  return true;
}

/**
 * Generate a secure random token for magic links
 */
function generateMagicToken() {
  return crypto.randomBytes(32).toString('base64url'); // URL-safe base64
}

module.exports = {
  sendMagicLinkEmail,
  generateMagicToken
};
