const nodemailer = require('nodemailer');
const dns = require('dns').promises;

function createTransporter() {
    return nodemailer.createTransport({
        host:   'smtp.resend.com',
        port:   465,
        secure: true,
        auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
        },
    });
}

/**
 * Verifies that the email domain has valid MX records.
 * This confirms the domain can actually receive emails.
 */
async function validateEmailDomain(email) {
    const domain = email.split('@')[1];
    if (!domain) return false;
    try {
        const records = await dns.resolveMx(domain);
        return Array.isArray(records) && records.length > 0;
    } catch {
        return false;
    }
}

/**
 * Sends a branded welcome email to a newly registered user.
 */
async function sendWelcomeEmail(to, userName) {
    const transporter = createTransporter();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  *  { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f4f0; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper  { max-width: 600px; margin: 36px auto; padding: 0 16px 40px; }
  .card     { background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 28px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; }
  .header   { background: linear-gradient(135deg, #1a2540 0%, #2d3d6e 100%); padding: 38px 42px 30px; }
  .logo-box { width: 46px; height: 46px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .app-name { color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: -0.01em; }
  .tagline  { color: rgba(255,255,255,0.45); font-size: 12px; letter-spacing: 0.06em; margin-top: 4px; }
  .body     { padding: 38px 42px; }
  .greeting { font-size: 18px; font-weight: 700; color: #1a1f36; margin-bottom: 10px; }
  .text     { font-size: 14px; color: #6b7280; line-height: 1.72; margin-bottom: 22px; }
  .highlight { background: #eef2ff; border-left: 3px solid #4f46e5; border-radius: 0 9px 9px 0; padding: 14px 18px; margin-bottom: 26px; font-size: 14px; color: #3730a3; line-height: 1.6; }
  .features-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.06em; }
  .grid     { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 30px; }
  .feat     { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 11px; padding: 16px 14px; }
  .feat-icon { font-size: 22px; display: block; margin-bottom: 8px; }
  .feat-title { font-size: 13px; font-weight: 700; color: #1a1f36; display: block; margin-bottom: 3px; }
  .feat-desc  { font-size: 12px; color: #9ca3af; display: block; }
  .cta-wrap { margin-bottom: 10px; }
  .cta      { display: inline-block; background: linear-gradient(135deg, #4f46e5, #4338ca); color: #ffffff !important; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: -0.01em; }
  .divider  { border: none; border-top: 1px solid #f3f4f6; margin: 28px 0; }
  .note     { font-size: 13px; color: #9ca3af; line-height: 1.6; }
  .footer   { padding: 20px 42px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  .footer a { color: #6b7280; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">

    <div class="header">
      <div class="logo-box">🎓</div>
      <div class="app-name" style="color:#ffffff !important; -webkit-text-fill-color:#ffffff;">Campus Opportunity Aggregator</div>
      <div class="tagline" style="color:rgba(255,255,255,0.55) !important;">NUST &nbsp;·&nbsp; DISCOVER &nbsp;·&nbsp; APPLY &nbsp;·&nbsp; GROW</div>
    </div>

    <div class="body">
      <p class="greeting">Welcome, ${userName}!</p>
      <p class="text">
        Your account has been successfully created on the <strong>Campus Opportunity Aggregator</strong> —
        NUST's centralized platform for discovering internships, scholarships, hackathons, research
        opportunities, exchange programs, and more.
      </p>

      <div class="highlight">
        ✅ &nbsp;Your account is now <strong>active</strong>. Start exploring hundreds of curated
        opportunities tailored specifically for NUST students.
      </div>

      <p class="features-title">What you can do on the platform</p>
      <div class="grid">
        <div class="feat">
          <span class="feat-icon">💼</span>
          <span class="feat-title">Browse Opportunities</span>
          <span class="feat-desc">Filter by category, department &amp; mode</span>
        </div>
        <div class="feat">
          <span class="feat-icon">🔖</span>
          <span class="feat-title">Save Favorites</span>
          <span class="feat-desc">Bookmark listings for quick access</span>
        </div>
        <div class="feat">
          <span class="feat-icon">🔔</span>
          <span class="feat-title">Get Notified</span>
          <span class="feat-desc">Deadline alerts before time runs out</span>
        </div>
        <div class="feat">
          <span class="feat-icon">📋</span>
          <span class="feat-title">Apply with Ease</span>
          <span class="feat-desc">Submit applications directly</span>
        </div>
      </div>

      <div class="cta-wrap">
        <a href="${appUrl}/opportunities" class="cta">Browse Opportunities &rarr;</a>
      </div>

      <hr class="divider"/>
      <p class="note">
        If you did not create this account, please ignore this email.
        No further action is required.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent to <strong>${to}</strong> upon registration.</p>
      <p style="margin-top:6px;">© 2025 Campus Opportunity Aggregator &nbsp;·&nbsp; NUST</p>
    </div>

  </div>
</div>
</body>
</html>`;

    await transporter.sendMail({
        from:    'Campus Opportunity Aggregator <onboarding@resend.dev>',
        to,
        subject: `Welcome to Campus Opportunity Aggregator, ${userName}!`,
        html,
    });
}

module.exports = { validateEmailDomain, sendWelcomeEmail };
