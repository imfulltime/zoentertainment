// Decap CMS — GitHub OAuth step 2: exchange the code for a token and hand it
// back to the CMS popup. Env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
module.exports = async (req, res) => {
  const code = req.query && req.query.code;
  if (!code) return res.status(400).send('Missing code');

  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const data = await r.json();
  if (!data.access_token) {
    console.error('OAuth exchange failed:', data);
    return res.status(502).send('OAuth exchange failed');
  }

  const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!DOCTYPE html><html><body><script>
    (function () {
      function receive(e) {
        window.opener.postMessage('authorization:github:success:${payload}', e.origin);
        window.removeEventListener('message', receive, false);
      }
      window.addEventListener('message', receive, false);
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script>Authorized — you can close this window.</body></html>`);
};
