// Decap CMS — GitHub OAuth step 1: send the admin to GitHub's consent screen.
// Env var required on Vercel: GITHUB_CLIENT_ID
module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).send('GITHUB_CLIENT_ID not configured');
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=repo,user`;
  res.statusCode = 302;
  res.setHeader('Location', url);
  res.end();
};
