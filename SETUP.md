# 📖 VietCarbon AI — Setup Guide

Complete setup instructions for running VietCarbon AI locally.

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Node.js** | ≥ 18.x | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **Git** | Any | `git --version` |
| **MongoDB Atlas** | Free tier | [cloud.mongodb.com](https://cloud.mongodb.com) |

---

## Step 1 — Clone & Install

```bash
# Clone the repository
git clone https://github.com/anshulkhandar/vietcarbon-ai.git
cd vietcarbon-ai

# Install all dependencies (both frontend and backend)
npm run install:all
```

This runs `npm install` inside both `frontend/` and `backend/` directories.

---

## Step 2 — MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (free M0 tier works fine)
3. Go to **Database → Connect → Drivers** → Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Under **Network Access**, add your IP (or `0.0.0.0/0` for development)

Your connection string will look like:
```
mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/vietcarbon_ai?retryWrites=true&w=majority
```

---

## Step 3 — Backend Environment Configuration

```bash
# Copy the example env file
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in the required values:

### Required Keys

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `MONGODB_URI` | MongoDB Atlas connection string | [cloud.mongodb.com](https://cloud.mongodb.com) |
| `JWT_SECRET` | Random secret for authentication tokens | Generate any strong random string |
| `GROQ_API_KEY` | AI engine API key (free) | [console.groq.com](https://console.groq.com) |

### Optional Keys

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GOOGLE_API_KEY` | Google Gemini AI (alternative AI) | [aistudio.google.com](https://aistudio.google.com) |
| `ELEVENLABS_API_KEY` | Premium FRIDAY voice (TTS) | [elevenlabs.io](https://elevenlabs.io) |
| `ELEVENLABS_VOICE_ID` | Voice ID for FRIDAY | ElevenLabs dashboard → Voices |
| `GMAIL_USER` | Gmail address for email automation | Your Gmail account |
| `GMAIL_APP_PASSWORD` | Gmail app-specific password | Google Account → Security → 2-Step Verification → App Passwords |
| `SMTP_USER` | SMTP email for citizen OTP | Same as Gmail or a separate SMTP provider |
| `SMTP_PASS` | SMTP password | Same as `GMAIL_APP_PASSWORD` if using Gmail |

### Minimal `.env` (works for demo)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/vietcarbon_ai
JWT_SECRET=my_super_secret_key_change_in_production
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

> **Note:** The platform has offline demo fallbacks. Even without some optional keys, core features work using simulated data and browser-based TTS.

---

## Step 4 — Frontend Environment (Optional)

The frontend ships with a `.env.local` pre-configured for local development:

```env
VITE_API_URL=http://localhost:5000/api
```

If your backend runs on a different port or URL, create/edit `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
# Edit the VITE_API_URL if needed
```

---

## Step 5 — Seed the Database

Seeding creates default user accounts for testing:

```bash
npm run seed
```

This creates:

| Role | Username | Password |
|------|----------|----------|
| Manager / Admin | `manager` | `manager123` |
| Employee | `emp001` | `emp123` |
| Employee | `emp002` | `emp123` |
| Employee | `emp003` | `emp123` |
| Employee | `emp004` | `emp123` |

> Seeding is idempotent — running it again will skip if users already exist.

---

## Step 6 — Start the Servers

You need **two terminal windows**:

### Terminal 1 — Backend

```bash
npm run dev:backend
```

Backend starts on `http://localhost:5000`. You should see:
```
✓ MongoDB connected
🌿 GreenAgentOS Backend running on port 5000
📡 Health check: http://localhost:5000/api/health
```

### Terminal 2 — Frontend

```bash
npm run dev:frontend
```

Frontend starts on `http://localhost:3000`. Open in your browser.

---

## Step 7 — Verify Installation

1. Open `http://localhost:3000` in your browser
2. Login with `manager` / `manager123`
3. You should see the Admin Dashboard with the Vietnam Map

### Health Check

Visit `http://localhost:5000/api/health` to verify all services:

```json
{
  "status": "online",
  "system": "VietCarbon AI",
  "mongodb": "connected",
  "ai": "configured",
  "email": "SMTP configured",
  "elevenLabs": "configured"
}
```

---

## API Key Setup Details

### Groq AI (Required for FRIDAY)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Navigate to **API Keys** → **Create API Key**
4. Copy the key and paste into `backend/.env`:

```env
GROQ_API_KEY=gsk_your_key_here
```

### ElevenLabs Voice (Optional)

For premium FRIDAY AI voice instead of browser TTS:

1. Go to [elevenlabs.io](https://elevenlabs.io) and create an account
2. Navigate to your **API Keys** and create one with these permissions:
   - Text to Speech → Access
   - Voices → Read
   - Models → Access
3. Pick a voice from the **Voices** library and copy its Voice ID
4. Add to `backend/.env`:

```env
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

> **Voice Priority:** ElevenLabs → Browser Web Speech API fallback

### Gmail App Password (Optional — for email features)

1. Go to your [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords** → Create one for "Mail"
4. Add to `backend/.env`:

```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_digit_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM=your_gmail@gmail.com
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install dependencies for both frontend and backend |
| `npm run dev:frontend` | Start Vite dev server (port 3000) |
| `npm run dev:backend` | Start Express server with nodemon (port 5000) |
| `npm run seed` | Seed database with default users |
| `npm run build` | Build frontend for production |

---

## Troubleshooting

### MongoDB Connection Failed
- Verify your `MONGODB_URI` is correct in `backend/.env`
- Check that your IP is whitelisted in MongoDB Atlas → Network Access
- The backend will still start in offline mode — frontend uses demo fallback data

### FRIDAY AI Not Responding
- Check that `GROQ_API_KEY` is set in `backend/.env`
- Verify at `http://localhost:5000/api/health` — the `ai` field should say `configured`
- FRIDAY has built-in offline fallbacks for common queries even without the API key

### Frontend Can't Connect to Backend
- Ensure backend is running on port 5000
- Check that `VITE_API_URL` in `frontend/.env.local` points to `http://localhost:5000/api`
- The Vite proxy in `vite.config.js` forwards `/api` requests to the backend automatically

### ElevenLabs Voice Not Working
- Verify both `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` are set
- Check the health endpoint — `elevenLabs` should say `configured`
- The system falls back to browser Web Speech API automatically

---

## Production Deployment

### Frontend (Vercel / Netlify)
```bash
npm run build    # Outputs to frontend/dist/
```

### Backend (Render / Railway / DigitalOcean)
```bash
cd backend
npm start        # Runs node server.js
```

Set all environment variables from `backend/.env.example` in your hosting platform's dashboard.
