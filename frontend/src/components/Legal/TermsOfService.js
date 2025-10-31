// Terms of Service Page
import React from 'react';
import './Legal.css';

function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: October 31, 2025</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            Welcome to The Great Escape. By accessing or using our website at www.thegreatescape.app (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you and The Great Escape ("we," "us," or "our"). We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Service after any changes indicates your acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>To use our Service, you must:</p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Be legally permitted to participate in paid fantasy sports contests in your jurisdiction</li>
            <li>Not reside in a prohibited state or jurisdiction (see Section 3)</li>
            <li>Provide accurate and truthful information when creating your account</li>
            <li>Comply with all applicable local, state, national, and international laws</li>
          </ul>
          <p>
            By creating an account, you represent and warrant that you meet all eligibility requirements.
          </p>
        </section>

        <section>
          <h2>3. Prohibited Jurisdictions</h2>
          <p>
            Participation in The Great Escape is currently prohibited for residents of the following U.S. states:
          </p>
          <ul>
            <li>Washington (WA)</li>
            <li>Montana (MT)</li>
            <li>Louisiana (LA)</li>
            <li>Arizona (AZ)</li>
            <li>Iowa (IA)</li>
            <li>Nevada (NV)</li>
          </ul>
          <p>
            We reserve the right to modify this list based on changes in applicable laws and regulations. Users found to be participating from prohibited jurisdictions will have their accounts suspended and entry fees forfeited.
          </p>
        </section>

        <section>
          <h2>4. Account Registration and Security</h2>

          <h3>4.1 Account Creation</h3>
          <p>
            You may create an account by providing your name, email address, date of birth, location, and payment information through PayPal. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h3>4.2 Account Security</h3>
          <ul>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must immediately notify us of any unauthorized use of your account</li>
            <li>We are not liable for any loss or damage arising from unauthorized account access</li>
            <li>Each PayPal account may only be linked to one user account</li>
            <li>Creating multiple accounts is strictly prohibited and may result in account termination</li>
          </ul>

          <h3>4.3 Account Information</h3>
          <p>
            You agree to provide accurate, current, and complete information and to update your information as necessary to maintain its accuracy.
          </p>
        </section>

        <section>
          <h2>5. Game Rules and Structure</h2>

          <h3>5.1 How The Great Escape Works</h3>
          <p>The Great Escape is a Premier League survival pool game where:</p>
          <ul>
            <li>Each pool begins on a specific matchday of the Premier League season</li>
            <li>Entry fee is $10.00 per entry</li>
            <li>Players select one team to win their match each matchday</li>
            <li>If your selected team wins, you advance to the next matchday</li>
            <li>If your selected team draws or loses, you are eliminated</li>
            <li>You cannot select the same team more than once throughout the competition</li>
            <li>The last player(s) remaining wins the prize pool</li>
          </ul>

          <h3>5.2 Pick Deadlines</h3>
          <ul>
            <li>Picks must be submitted before the scheduled kickoff time of your selected match</li>
            <li>Late picks will not be accepted</li>
            <li>Failure to submit a pick by the deadline results in automatic elimination</li>
            <li>Match times are based on UTC and displayed in your local timezone</li>
          </ul>

          <h3>5.3 Match Results</h3>
          <ul>
            <li>Results are determined based on full-time scores (90 minutes + injury time)</li>
            <li>Extra time and penalty shootouts do NOT count</li>
            <li>Postponed or abandoned matches will be handled on a case-by-case basis</li>
            <li>Official Premier League results are final and binding</li>
          </ul>

          <h3>5.4 Prize Distribution</h3>
          <ul>
            <li>The prize pool consists of 90% of all entry fees collected for that specific pool</li>
            <li>10% is retained as a platform fee</li>
            <li>If multiple players remain at the end of the season, the prize is split equally</li>
            <li>If all remaining players are eliminated in the same matchday, the prize is split equally among them</li>
            <li>Prizes are paid via PayPal to the account used for entry payment</li>
            <li>Winners are responsible for any applicable taxes on their winnings</li>
          </ul>
        </section>

        <section>
          <h2>6. Payments and Refunds</h2>

          <h3>6.1 Payment Processing</h3>
          <p>
            All payments are processed through PayPal. By making a payment, you agree to PayPal's Terms of Service. We do not store your credit card or banking information.
          </p>

          <h3>6.2 Entry Fees</h3>
          <ul>
            <li>Entry fees are non-refundable once a pool has started</li>
            <li>If a pool is cancelled before it begins, full refunds will be issued</li>
            <li>Entry fees are final and cannot be transferred between pools or users</li>
          </ul>

          <h3>6.3 Account Balance</h3>
          <p>Your account maintains two separate balances:</p>
          <ul>
            <li><strong>Balance:</strong> Withdrawable funds from deposits and winnings</li>
            <li><strong>Credits:</strong> Non-withdrawable funds from referral bonuses (can only be used for entries)</li>
          </ul>

          <h3>6.4 Withdrawals</h3>
          <ul>
            <li>Withdrawals are processed via PayPal to your linked account</li>
            <li>Minimum withdrawal amount is $10.00</li>
            <li>Withdrawals may take 3-5 business days to process</li>
            <li>We reserve the right to request identity verification before processing withdrawals</li>
          </ul>
        </section>

        <section>
          <h2>7. Referral Program</h2>

          <h3>7.1 How Referrals Work</h3>
          <ul>
            <li>Each user receives a unique referral code upon account creation</li>
            <li>When a new user signs up using your referral code and completes their first payment, both parties receive $10 in credits</li>
            <li>Referral credits are added to your credit balance (non-withdrawable)</li>
            <li>Credits can be used for pool entry fees but cannot be withdrawn</li>
            <li>There is no limit to the number of referrals you can make</li>
          </ul>

          <h3>7.2 Referral Restrictions</h3>
          <ul>
            <li>You cannot refer yourself or create multiple accounts</li>
            <li>Each user can only be referred once (by the first code they use)</li>
            <li>Referral fraud, including coordinated fake accounts, will result in account termination and forfeiture of all funds</li>
            <li>We reserve the right to void fraudulent referrals and reclaim credits</li>
          </ul>
        </section>

        <section>
          <h2>8. Prohibited Conduct</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service if you are under 18 years of age</li>
            <li>Create multiple accounts or share accounts with others</li>
            <li>Use automated systems (bots, scripts) to interact with the Service</li>
            <li>Manipulate, exploit, or abuse any features or vulnerabilities</li>
            <li>Collude with other users to gain unfair advantages</li>
            <li>Engage in fraudulent activity, including referral fraud or payment fraud</li>
            <li>Harass, threaten, or abuse other users or our staff</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
          </ul>
        </section>

        <section>
          <h2>9. Intellectual Property</h2>
          <p>
            The Service, including all content, features, functionality, logos, trademarks, and design elements, is owned by The Great Escape and is protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or create derivative works from any part of the Service without our express written permission.
          </p>
          <p>
            Premier League team names, logos, and match data are the property of their respective owners and are used under license from third-party data providers.
          </p>
        </section>

        <section>
          <h2>10. Disclaimers and Limitation of Liability</h2>

          <h3>10.1 Service Availability</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
          </p>

          <h3>10.2 No Warranty</h3>
          <p>
            WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We make no guarantees regarding the accuracy, reliability, or completeness of match data, results, or prize calculations.
          </p>

          <h3>10.3 Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE GREAT ESCAPE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
          </p>
          <p>
            OUR TOTAL LIABILITY FOR ANY CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE SIX (6) MONTHS PRIOR TO THE CLAIM, OR $100, WHICHEVER IS GREATER.
          </p>
        </section>

        <section>
          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless The Great Escape, its officers, directors, employees, agents, and affiliates from any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to:
          </p>
          <ul>
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your violation of any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2>12. Dispute Resolution and Arbitration</h2>

          <h3>12.1 Informal Resolution</h3>
          <p>
            If you have a dispute with us, you agree to first contact us through our website and attempt to resolve the dispute informally for at least 30 days before initiating any formal proceedings.
          </p>

          <h3>12.2 Binding Arbitration</h3>
          <p>
            Any dispute arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the Commercial Arbitration Rules of the American Arbitration Association (AAA). The arbitration shall take place in [Your State/Location], and judgment on the arbitration award may be entered in any court having jurisdiction.
          </p>

          <h3>12.3 Class Action Waiver</h3>
          <p>
            YOU AGREE THAT ANY ARBITRATION OR PROCEEDING SHALL BE LIMITED TO THE DISPUTE BETWEEN YOU AND US INDIVIDUALLY. YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
          </p>
        </section>

        <section>
          <h2>13. Account Suspension and Termination</h2>

          <h3>13.1 Our Right to Suspend or Terminate</h3>
          <p>We reserve the right to suspend or terminate your account at any time, with or without notice, if:</p>
          <ul>
            <li>You violate these Terms</li>
            <li>We suspect fraudulent or illegal activity</li>
            <li>Your account has been inactive for more than 2 years</li>
            <li>We discontinue the Service</li>
          </ul>

          <h3>13.2 Effect of Termination</h3>
          <ul>
            <li>Upon termination, your right to use the Service immediately ceases</li>
            <li>If terminated for cause (violation of Terms), we may forfeit your account balance</li>
            <li>If you voluntarily close your account, we will return your withdrawable balance minus any outstanding fees</li>
            <li>Active pool entries will be honored regardless of account status</li>
          </ul>

          <h3>13.3 Your Right to Terminate</h3>
          <p>
            You may close your account at any time by contacting us through our website. Any remaining withdrawable balance will be returned to you after verification.
          </p>
        </section>

        <section>
          <h2>14. Force Majeure</h2>
          <p>
            We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, war, terrorism, strikes, government actions, internet outages, or failures of third-party services (including PayPal or football data providers).
          </p>
          <p>
            If Premier League matches are cancelled, postponed, or suspended due to force majeure events, we will handle affected pools on a case-by-case basis, which may include refunds, extensions, or alternative resolutions.
          </p>
        </section>

        <section>
          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
          </p>
        </section>

        <section>
          <h2>16. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and The Great Escape regarding the use of the Service and supersede all prior agreements and understandings.
          </p>
        </section>

        <section>
          <h2>17. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your State], United States, without regard to its conflict of law principles.
          </p>
        </section>

        <section>
          <h2>18. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us through our website at www.thegreatescape.app.
          </p>
        </section>

        <section>
          <h2>19. Responsible Gaming</h2>
          <p>
            The Great Escape is committed to promoting responsible gaming. If you or someone you know has a gambling problem, please seek help:
          </p>
          <ul>
            <li><strong>National Council on Problem Gambling:</strong> 1-800-522-4700</li>
            <li><strong>Website:</strong> www.ncpgambling.org</li>
          </ul>
          <p>
            We encourage users to set personal limits on their participation and to play responsibly. If you wish to self-exclude from the Service, please contact us through our website.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
