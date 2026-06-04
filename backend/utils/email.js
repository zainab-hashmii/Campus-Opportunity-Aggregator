const nodemailer = require('nodemailer');
const dns = require('dns').promises;

function createTransporter() {
    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

const FROM = process.env.SMTP_FROM || `Campus Opportunity Aggregator <${process.env.SMTP_USER}>`;

/** Verifies that the email domain has valid MX records. */
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

/** Sends a verification email with a one-click confirm link. */
async function sendVerificationEmail(to, userName, token) {
    const transporter = createTransporter();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f4f0; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper  { max-width: 600px; margin: 36px auto; padding: 0 16px 40px; }
  .card     { background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 28px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; }
  .header   { background: linear-gradient(135deg, #0f0e2b 0%, #1e1b4b 55%, #312e81 100%); padding: 38px 42px 30px; }
  .logo-box { width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #a78bfa); border-radius: 13px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .app-name { color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: -0.01em; }
  .tagline  { color: rgba(255,255,255,0.45); font-size: 12px; letter-spacing: 0.06em; margin-top: 4px; }
  .body     { padding: 38px 42px; }
  .greeting { font-size: 22px; font-weight: 700; color: #1a1f36; margin-bottom: 10px; }
  .text     { font-size: 14px; color: #6b7280; line-height: 1.72; margin-bottom: 22px; }
  .cta-wrap { text-align: center; margin: 28px 0; }
  .cta      { display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff !important; text-decoration: none; padding: 15px 38px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.01em; box-shadow: 0 4px 18px rgba(109,40,217,0.35); }
  .token-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; font-size: 13px; color: #5b21b6; word-break: break-all; line-height: 1.5; }
  .warning  { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 13px 16px; font-size: 13px; color: #92400e; line-height: 1.6; margin-bottom: 22px; }
  .divider  { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
  .note     { font-size: 13px; color: #9ca3af; line-height: 1.6; }
  .footer   { padding: 20px 42px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">

    <div class="header">
      <div class="logo-box">🎓</div>
      <div class="app-name" style="color:#ffffff !important;">Campus Opportunity Aggregator</div>
      <div class="tagline" style="color:rgba(255,255,255,0.55) !important;">NUST &nbsp;·&nbsp; DISCOVER &nbsp;·&nbsp; APPLY &nbsp;·&nbsp; GROW</div>
    </div>

    <div class="body">
      <p class="greeting">Hi ${userName}, verify your email</p>
      <p class="text">
        Thanks for signing up! To activate your account and start browsing
        hundreds of opportunities, please confirm your email address by clicking
        the button below.
      </p>

      <div class="cta-wrap">
        <a href="${verifyUrl}" class="cta">Verify my email address &rarr;</a>
      </div>

      <div class="warning">
        ⏱️ &nbsp;This link expires in <strong>24 hours</strong>.
        If it expires, simply register again with the same email.
      </div>

      <p class="text" style="font-size:13px;color:#9ca3af;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <div class="token-box">${verifyUrl}</div>

      <hr class="divider"/>
      <p class="note">
        If you didn't create an account on Campus Opportunity Aggregator, you can
        safely ignore this email.
      </p>
    </div>

    <div class="footer">
      <p>This email was sent to <strong>${to}</strong> because you registered on Campus Opportunity Aggregator.</p>
      <p style="margin-top:6px;">© 2025 Campus Opportunity Aggregator &nbsp;·&nbsp; NUST</p>
    </div>

  </div>
</div>
</body>
</html>`;

    await transporter.sendMail({
        from:    FROM,
        to,
        subject: `Verify your email — Campus Opportunity Aggregator`,
        html,
    });
}

/** Sends a plain welcome email after successful verification. */
async function sendWelcomeEmail(to, userName) {
    const transporter = createTransporter();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f4f0; font-family: Arial, Helvetica, sans-serif; }
  .wrapper { max-width: 600px; margin: 36px auto; padding: 0 16px 40px; }
  .card    { background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 28px rgba(0,0,0,0.07); border: 1px solid #e5e7eb; }
  .header  { background: linear-gradient(135deg, #0f0e2b 0%, #1e1b4b 55%, #312e81 100%); padding: 38px 42px 30px; }
  .logo-box { width: 48px; height: 48px; background: linear-gradient(135deg, #7c3aed, #a78bfa); border-radius: 13px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .app-name { color: #fff; font-size: 19px; font-weight: 700; }
  .tagline  { color: rgba(255,255,255,0.45); font-size: 12px; letter-spacing: 0.06em; margin-top: 4px; }
  .body    { padding: 38px 42px; }
  .greeting { font-size: 20px; font-weight: 700; color: #1a1f36; margin-bottom: 10px; }
  .text    { font-size: 14px; color: #6b7280; line-height: 1.72; margin-bottom: 22px; }
  .highlight { background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 0 9px 9px 0; padding: 14px 18px; margin-bottom: 26px; font-size: 14px; color: #065f46; }
  .cta-wrap { margin-bottom: 10px; }
  .cta     { display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff !important; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-weight: 700; font-size: 14px; }
  .footer  { padding: 20px 42px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
</style>
</head>
<body>
<div class="wrapper"><div class="card">
  <div class="header">
    <div class="logo-box">🎓</div>
    <div class="app-name" style="color:#fff !important;">Campus Opportunity Aggregator</div>
    <div class="tagline" style="color:rgba(255,255,255,0.55) !important;">NUST &nbsp;·&nbsp; DISCOVER &nbsp;·&nbsp; APPLY &nbsp;·&nbsp; GROW</div>
  </div>
  <div class="body">
    <p class="greeting">Welcome aboard, ${userName}! 🎉</p>
    <p class="text">
      Your email has been verified and your account is now fully active on the
      <strong>Campus Opportunity Aggregator</strong> — NUST's centralised platform for
      internships, scholarships, hackathons, research, exchange programs, and more.
    </p>
    <div class="highlight">
      ✅ &nbsp;Account verified and <strong>active</strong>. Start exploring!
    </div>
    <div class="cta-wrap">
      <a href="${appUrl}/opportunities" class="cta">Browse Opportunities &rarr;</a>
    </div>
  </div>
  <div class="footer">
    <p>Sent to <strong>${to}</strong> after email verification.</p>
    <p style="margin-top:6px;">© 2025 Campus Opportunity Aggregator &nbsp;·&nbsp; NUST</p>
  </div>
</div></div>
</body></html>`;

    await transporter.sendMail({ from: FROM, to, subject: `You're in! Welcome to Campus Opportunity Aggregator`, html });
}

module.exports = { validateEmailDomain, sendVerificationEmail, sendWelcomeEmail };
