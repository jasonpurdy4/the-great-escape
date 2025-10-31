// Privacy Policy Page
import React from 'react';
import './Legal.css';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: October 31, 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to The Great Escape ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our website and services at www.thegreatescape.app (the "Service").
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide</h3>
          <p>When you create an account or use our Service, we collect:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, date of birth, location (state/country)</li>
            <li><strong>Payment Information:</strong> Processed through PayPal - we do not store your credit card or banking details</li>
            <li><strong>Profile Information:</strong> Username, referral code, account preferences</li>
            <li><strong>Game Activity:</strong> Team selections, pool entries, match results, win/loss records</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on the Service</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
            <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to enhance your experience</li>
          </ul>

          <h3>2.3 PayPal Information</h3>
          <p>When you authenticate via PayPal, we receive:</p>
          <ul>
            <li>PayPal Payer ID (unique identifier)</li>
            <li>Name and email associated with your PayPal account</li>
            <li>Payment transaction details</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, operate, and maintain our Service</li>
            <li>Process payments and manage your account balance</li>
            <li>Track your pool entries and game progress</li>
            <li>Calculate winners and distribute prizes</li>
            <li>Send you important updates about your account and the Service</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Process referrals and award referral bonuses</li>
            <li>Detect and prevent fraud, abuse, and illegal activity</li>
            <li>Comply with legal obligations and enforce our Terms of Service</li>
            <li>Improve and optimize our Service based on usage patterns</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>

          <h3>4.1 We Do Not Sell Your Personal Data</h3>
          <p>We will never sell, rent, or trade your personal information to third parties for their marketing purposes.</p>

          <h3>4.2 Service Providers</h3>
          <p>We share information with trusted third-party service providers who help us operate our Service:</p>
          <ul>
            <li><strong>PayPal:</strong> Payment processing and authentication</li>
            <li><strong>Railway:</strong> Cloud hosting infrastructure</li>
            <li><strong>Football Data API:</strong> Live match data and Premier League information</li>
          </ul>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, subpoenas, or government requests).</p>

          <h3>4.4 Business Transfers</h3>
          <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul>
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure password hashing (bcrypt)</li>
            <li>PayPal ID-based account linking to prevent duplicate accounts</li>
            <li>Regular security audits and monitoring</li>
            <li>Limited employee access to personal data</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal data, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>6. Your Data Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Objection:</strong> Object to certain processing activities</li>
            <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing where applicable</li>
          </ul>
          <p>
            To exercise these rights, please contact us through our website. We will respond to your request within 30 days.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to comply with legal obligations, resolve disputes, prevent fraud, and enforce our agreements.
          </p>
          <p>
            If you delete your account, we will delete or anonymize your personal data within 90 days, except where we are required to retain it for legal or regulatory purposes.
          </p>
        </section>

        <section>
          <h2>8. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to:</p>
          <ul>
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences</li>
            <li>Analyze how you use our Service</li>
            <li>Prevent fraud and improve security</li>
          </ul>
          <p>
            You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Service.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our Service is not intended for users under the age of 18. We do not knowingly collect personal data from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately, and we will delete such information.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our Service, you consent to the transfer of your information to the United States and other countries where we operate.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us through our website at www.thegreatescape.app.</p>
        </section>

        <section>
          <h2>13. State-Specific Privacy Rights</h2>

          <h3>California Residents (CCPA)</h3>
          <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:</p>
          <ul>
            <li>Right to know what personal information we collect, use, and share</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we do not sell your data)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </ul>
          <p>To exercise these rights, contact us through our website.</p>

          <h3>European Residents (GDPR)</h3>
          <p>If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, object to processing, and data portability.</p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
