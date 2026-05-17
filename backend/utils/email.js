const nodemailer = require('nodemailer');

function smtpUser() {
  return process.env.SMTP_USER || process.env.GMAIL_USER;
}
function smtpPass() {
  return process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
}
function smtpFrom() {
  return process.env.SMTP_FROM || smtpUser() || 'no-reply@greenagent.local';
}

function getTransporter() {
  const user = smtpUser();
  const pass = smtpPass();
  if (!user || !pass || user === 'your_gmail@gmail.com') return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_PORT || '587') === '465',
    auth: { user, pass },
  });
}

async function sendPlainEmail({ to, subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}\n${text || html || ''}`);
    return { success: true, mock: true };
  }
  await transporter.sendMail({ from: `"GreenAgentOS 🌿" <${smtpFrom()}>`, to, subject, text, html: html || (text || '').replace(/\n/g, '<br>') });
  return { success: true };
}

async function sendOtpEmail({ to, otp, purpose = 'Citizen Login' }) {
  return sendPlainEmail({
    to,
    subject: `GreenAgentOS OTP for ${purpose}`,
    text: `Your GreenAgentOS OTP is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
    html: `<div style="font-family:Arial;background:#030d07;color:#e8f5e9;padding:24px;border-radius:14px;border:1px solid #00ff8844;max-width:520px"><h2 style="color:#00ff88">GreenAgentOS Citizen Verification</h2><p>Your OTP is:</p><div style="font-size:30px;letter-spacing:8px;color:#00ff88;font-weight:bold">${otp}</div><p style="color:#81c784">Valid for 10 minutes. Do not share this code.</p></div>`
  });
}

async function sendReportEmail({ to, subject, report }) {
  return sendPlainEmail({
    to,
    subject: subject || 'VietCarbon AI Climate Report',
    text: report,
    html: `<div style="font-family:Arial;background:#030d07;color:#e8f5e9;padding:24px;border-radius:14px;border:1px solid #00ff8844;max-width:780px"><h2 style="color:#00ff88">VietCarbon AI Climate Report</h2><pre style="white-space:pre-wrap;background:#061209;padding:16px;border-radius:12px;border:1px solid #00ff8822;color:#c8f7d0">${String(report || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</pre></div>`
  });
}

async function sendWelcomeEmail({ to, name, username, password }) {
  return sendPlainEmail({
    to,
    subject: '🌿 Welcome to GreenAgentOS — Your Sustainability Journey Begins',
    text: `Welcome ${name}! Username: ${username}. Password: ${password}. Login at ${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
  });
}

async function sendTaskEmail({ to, name, taskTitle, taskDescription, passkey, deadline, co2Target, city }) {
  return sendPlainEmail({
    to,
    subject: `⚡ New Sustainability Task Assigned: ${taskTitle}`,
    text: `Hello ${name},\nTask: ${taskTitle}\n${taskDescription || ''}\nCity: ${city || 'N/A'}\nDeadline: ${deadline || 'N/A'}\nCO₂ Target: ${co2Target || 'N/A'}\nPasskey: ${passkey}`,
  });
}

async function sendBulkEmail({ recipients, subject, body }) {
  const results = await Promise.allSettled((recipients || []).map(to => sendPlainEmail({ to, subject, text: body })));
  return { success: true, sent: results.filter(r => r.status === 'fulfilled').length, failed: results.filter(r => r.status === 'rejected').length };
}

module.exports = { sendWelcomeEmail, sendTaskEmail, sendBulkEmail, sendOtpEmail, sendReportEmail, sendPlainEmail, getTransporter };
