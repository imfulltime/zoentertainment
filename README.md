# Zentra One Entertainment — zoentertainment.com.au

Static site + Decap CMS admin + Vercel serverless contact form.
Part of Zentra One Pty Ltd · ABN 94 698 855 784 · Gloucester, NSW.

## Structure

    index / about / talent / productions / contact .html
    css/, js/render.js          design + content renderer
    data/content.json           all editable content (texts, talents, productions)
    images/uploads/             CMS photo uploads
    admin/                      Decap CMS (web admin at /admin)
    api/inquiry.js              contact form → emails info@zentraone.com.au via Resend
    api/auth.js + callback.js   GitHub login for the CMS

## One-time setup

### 1. Push to GitHub

    cd ~/Downloads/Websites/zoentertainment
    git remote add origin https://github.com/imfulltime/zoentertainment.git
    git push -u origin main

(Create the empty repo named `zoentertainment` at github.com/new first — no README.)

### 2. Import to Vercel

vercel.com → Add New → Project → import `imfulltime/zoentertainment`.
Framework preset: **Other**. No build command. Deploy.

### 3. Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value |
|---|---|
| `RESEND_API_KEY` | from resend.com (free account → API Keys) |
| `INQUIRY_TO` | info@zentraone.com.au |
| `GITHUB_CLIENT_ID` | from the OAuth app below |
| `GITHUB_CLIENT_SECRET` | from the OAuth app below |

GitHub OAuth app: github.com → Settings → Developer settings → OAuth Apps → New.
Homepage URL: `https://zoentertainment.com.au` — Callback URL: `https://zoentertainment.com.au/api/callback`.

Optional: verify the zentraone.com.au domain in Resend and set `INQUIRY_FROM`
to e.g. `ZOE Website <noreply@zentraone.com.au>` so emails come from your domain.

### 4. Point the domain

Vercel → Project → Settings → Domains → add `zoentertainment.com.au`, then update
DNS at GoDaddy as Vercel instructs (A record 216.198.79.1 or CNAME for www).
Until DNS flips, the GoDaddy site keeps serving.

### 5. Check `admin/config.yml`

`base_url` must be the live site URL (already set to https://zoentertainment.com.au).

## Day-to-day

Open **zoentertainment.com.au/admin** → log in with GitHub → edit texts, talents,
productions, upload photos → Publish. Each publish commits to GitHub and Vercel
redeploys automatically (~30 seconds).

Contact form submissions email info@zentraone.com.au with reply-to set to the sender.
