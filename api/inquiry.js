// Receives the contact form and emails it via Resend.
// Env vars required on Vercel: RESEND_API_KEY (and optionally INQUIRY_TO, INQUIRY_FROM).
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const b = req.body || {};
  const f = (k) => String(b[k] || '').slice(0, 2000).trim();
  const name = f('name');
  const email = f('email');
  if (!name || !/.+@.+\..+/.test(email)) return res.status(422).json({ ok: false, error: 'name/email' });

  const text = [
    'New inquiry via zoentertainment.com.au',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${f('phone')}`,
    `Type: ${f('type')}`,
    `Location: ${f('location')}`,
    `Target date: ${f('date')}`,
    '',
    f('message'),
  ].join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM || 'ZOE Website <onboarding@resend.dev>',
      to: [process.env.INQUIRY_TO || 'info@zentraone.com.au'],
      reply_to: email,
      subject: `[ZOE] Inquiry from ${name}`,
      text,
    }),
  });

  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('Resend error:', r.status, detail);
    return res.status(502).json({ ok: false });
  }
  return res.status(200).json({ ok: true });
};
