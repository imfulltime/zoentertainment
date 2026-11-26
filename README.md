# Zentra One Entertainment — zoentertainment.com.au

Static site + Vercel serverless contact form. No build step.
Part of Zentra One Pty Ltd · ABN 94 698 855 784 · Gloucester, NSW.

Repo: https://github.com/imfulltime/zoentertainment — hosted on Vercel; every push
to `main` redeploys the live site (~30 seconds).

## Structure

    index / about / talent / productions / contact .html
    css/, js/render.js          design + content renderer
    data/content.json           all editable content (texts, talents, productions)
    images/                     logo and site images
    api/inquiry.js              contact form → emails info@zentraone.com.au via Resend

## Editing content

All texts, talents and productions live in `data/content.json`. `js/render.js`
loads it on every page and fills any element marked `data-cms="<key>"` with
`texts.<key>`, and builds the talent and production grids. The text written in
the HTML is the fallback shown if the JSON fails to load.

Edit the JSON, commit, push to `main` — Vercel redeploys.

## Local preview

The pages fetch `data/content.json`, so serve the folder rather than opening the
files directly:

    python3 -m http.server 8080

The contact form needs Vercel's `/api` and won't send locally (it falls back to
opening an email).

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value |
|---|---|
| `RESEND_API_KEY` | from resend.com (API Keys) |
| `INQUIRY_TO` | info@zentraone.com.au |
| `INQUIRY_FROM` | optional, e.g. `ZOE Website <noreply@zentraone.com.au>` once the domain is verified in Resend |

Without `INQUIRY_FROM` the form sends from Resend's `onboarding@resend.dev` test
address, which Resend only delivers to the Resend account's own email.

Contact form submissions email `INQUIRY_TO` with reply-to set to the sender.

## Domain

`zoentertainment.com.au` points at Vercel (A record 216.198.79.1 at GoDaddy);
`www` redirects to the bare domain.
