# ArinSoul Voice Agent — Deployment Guide

## What You Have
- `server.js` — The backend brain (handles STT → LLM → TTS)
- `package.json` — Lists all required packages
- `widget.html` — The voice button to paste into your website

---

## STEP 1 — Get Your Sarvam AI API Key

1. Go to: https://dashboard.sarvam.ai
2. Sign up for a free account
3. Click **"API Keys"** → **"Create New Key"**
4. Copy the key (looks like: `sk-xxxxxxxxxxxxxxxx`)

---

## STEP 2 — Deploy Backend on Railway (Free, No Coding Needed)

Railway is the easiest way to host your backend for free.

### 2a. Install Git (if not already installed)
- Download from: https://git-scm.com/download/win
- Install with default settings

### 2b. Create a GitHub Account
- Go to: https://github.com and sign up (free)

### 2c. Upload Your Code to GitHub
1. Go to https://github.com/new
2. Repository name: `arinsoul-voice-agent`
3. Click **"Create repository"**
4. Follow the instructions to upload your files (drag & drop in browser)

### 2d. Deploy on Railway
1. Go to: https://railway.app
2. Sign in with your GitHub account
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select `arinsoul-voice-agent`
5. Railway will auto-detect Node.js and deploy it

### 2e. Add Your API Key as Environment Variable
1. In Railway, click your project → **"Variables"** tab
2. Click **"Add Variable"**
3. Name: `SARVAM_API_KEY`
4. Value: paste your Sarvam API key
5. Click **"Save"** — Railway will auto-restart

### 2f. Get Your Backend URL
1. Click **"Settings"** tab in Railway
2. Under **"Domains"**, click **"Generate Domain"**
3. You'll get a URL like: `https://arinsoul-voice-agent.up.railway.app`
4. **Copy this URL** — you need it for Step 3

---

## STEP 3 — Add Widget to Your Website

### 3a. Update the Backend URL in widget.html
Open `widget.html` and find this line:
```
const AS_BACKEND = 'https://YOUR_BACKEND_URL.railway.app';
```
Replace it with your actual Railway URL:
```
const AS_BACKEND = 'https://arinsoul-voice-agent.up.railway.app';
```

### 3b. Paste Widget into Your Website
1. Open your website's HTML editor (WordPress, Wix, Squarespace, etc.)
2. Copy everything from `widget.html`
3. Paste it just before the closing `</body>` tag of your page
4. Save and publish

---

## STEP 4 — Test It!

1. Open your website
2. You'll see a purple 🎙️ button in the bottom-right corner
3. Click it → Allow microphone access
4. Speak in Hindi, English, or Hinglish
5. The agent will respond in Hinglish voice!

---

## Costs

| Service | Free Tier |
|---------|-----------|
| Railway | 500 hours/month free |
| Sarvam AI | Free credits on signup |
| GitHub | Always free |

---

## Troubleshooting

**Mic not working?**
→ Make sure your website uses HTTPS (not HTTP)
→ Allow microphone in browser settings

**"Network error" in widget?**
→ Check if Railway backend is running (visit your Railway URL in browser — should show a status message)
→ Make sure `SARVAM_API_KEY` is set in Railway Variables

**No audio playing back?**
→ Check browser console for errors (press F12)
→ Try clicking somewhere on the page first (browsers require user interaction before playing audio)

---

## Support
For Sarvam AI API issues: https://docs.sarvam.ai
For Railway issues: https://docs.railway.app
