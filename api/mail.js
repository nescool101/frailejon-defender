import nodemailer from 'nodemailer';

const FROM = 'nescool10001@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const { name, email, message } = req.body || {};
  if (!name || !email || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: 'invalid form' });
    return;
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    res.status(500).json({ error: 'smtp not configured' });
    return;
  }
  if (user !== FROM) {
    res.status(500).json({ error: 'wrong smtp account' });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
    const safe = (s) => String(s).replace(/[\r\n]+/g, ' ').slice(0, 500);
    await transporter.sendMail({
      from: `"Frailejón Defender" <${FROM}>`,
      replyTo: email,
      to: FROM,
      subject: `Frailejón Defender · ${safe(name)}`,
      text: `De: ${safe(name)} <${email}>\n\n${safe(message)}`,
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'send failed' });
  }
}
