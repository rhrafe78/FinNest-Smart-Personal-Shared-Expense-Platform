import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Relay-Secret'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, text } = req.body || {};

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required parameters: to, subject' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'thefinnest22@gmail.com',
      pass: 'loywilvmcydoioln',
    },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
  });

  try {
    const info = await transporter.sendMail({
      from: 'FinNest Security <thefinnest22@gmail.com>',
      to,
      subject,
      text: text || '',
      html: html || '',
    });
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Vercel SMTP Relay Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
