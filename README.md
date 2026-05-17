# 🇻🇳 VietCarbon AI — Vietnam Smart Sustainability Platform

**AI-powered smart city platform monitoring Vietnam's environmental sustainability with real-time analytics, 3D mapping, HydroGrid Intelligence, and FRIDAY AI voice assistant.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/anshulkhandar/vietcarbon-ai.git
cd vietcarbon-ai

# 2. Install all dependencies (frontend + backend)
npm run install:all

# 3. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys (see SETUP.md for details)

# 4. Seed the database (creates default users)
npm run seed

# 5. Start backend (Terminal 1)
npm run dev:backend

# 6. Start frontend (Terminal 2)
npm run dev:frontend

# 7. Open in browser
# → http://localhost:3000
```

> **📖 For detailed setup instructions, see [SETUP.md](SETUP.md)**

---

## 🔐 Default Logins

| Role | Username | Password |
|------|----------|----------|
| Admin / Manager | `manager` | `manager123` |
| Employee | `emp001` – `emp004` | `emp123` |
| Citizen | Register via OTP on login page | — |

---

## 📊 Features

### Core Platform
- ✅ **Admin Dashboard** — 11+ analytics panels with full sustainability monitoring
- ✅ **Interactive Vietnam Map** — MapLibre GL JS 3D map with heatmaps, city markers, and overlay layers
- ✅ **5-Year Historical Data** (2021–2025) + 2026 Live simulation layer
- ✅ **FRIDAY AI Voice Assistant** — Orbital HUD, voice commands, expandable chat panel
- ✅ **HydroGrid AI** — Hydrogen energy grid intelligence module
- ✅ **Traffic Intelligence** — Real-time traffic monitoring and CO₂ corridor analysis
- ✅ **Citizen Dashboard** — Carbon footprint calculator and environmental alerts

### AI & Intelligence
- ✅ **Groq AI Engine** — Llama 3.3 70B for intelligent analysis and reports
- ✅ **Google Gemini** — Alternative AI backend support
- ✅ **ElevenLabs Voice** — Premium FRIDAY TTS voice (optional)
- ✅ **AI Report Generator** — City-specific sustainability reports with download
- ✅ **Smart Offline Fallbacks** — 15+ pattern-matched responses without API keys

### Environmental Monitoring
- ✅ CO₂ Emissions Tracking & Heatmaps
- ✅ Renewable Energy Monitoring (Solar, Wind, Hydro, Tidal)
- ✅ Climate Disaster Risk Assessment
- ✅ Air Quality Index (AQI) with Open-Meteo live data
- ✅ Soil Health & Agriculture Analytics
- ✅ Industrial Emission Tracking
- ✅ Real-time Alert System with citizen notifications

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **3D Map** | MapLibre GL JS + Leaflet.js |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express |
| **Database** | MongoDB Atlas + Mongoose |
| **AI** | Groq SDK (Llama 3.3 70B) + Google Gemini |
| **Voice** | ElevenLabs TTS + Web Speech API |
| **Email** | Nodemailer (Gmail SMTP) |
| **Auth** | JWT + bcrypt |
| **Weather** | Open-Meteo API (free, no key required) |

---

## 🤖 FRIDAY AI Voice Commands

```
"Friday, show Hanoi data"
"Friday, what's the highest CO₂ city?"
"Friday, generate sustainability report"
"Friday, open renewable energy panel"
"Friday, compare Ho Chi Minh and Hanoi"
"Friday, open HydroGrid"
"Friday, hydrogen production"
"Friday, show climate disaster data"
```

---

## 📁 Project Structure

```
vietcarbon-ai/
├── package.json                          # Root monorepo scripts
├── SETUP.md                              # Full setup guide
├── README.md                             # This file
├── .gitignore                            # Git ignore rules
│
├── backend/                              # Express API Server
│   ├── .env.example                      # Environment template
│   ├── package.json                      # Backend dependencies
│   ├── package-lock.json                 # Dependency lock file
│   ├── server.js                         # Express app entry point
│   ├── seed.js                           # Database seeder (users)
│   ├── middleware/
│   │   └── auth.js                       # JWT authentication middleware
│   ├── models/
│   │   └── index.js                      # Mongoose schemas (User, Task, Notification, EmissionLog, CitizenData, OtpSession)
│   ├── routes/
│   │   ├── ai.js                         # FRIDAY AI chat, speak, report, API status
│   │   ├── auth.js                       # Login, register, OTP, password reset
│   │   ├── citizen.js                    # Citizen data, notifications, emission logs
│   │   ├── employees.js                  # Employee CRUD
│   │   ├── tasks.js                      # Task management
│   │   └── traffic.js                    # Traffic intelligence endpoints
│   ├── utils/
│   │   ├── email.js                      # Nodemailer SMTP helper
│   │   ├── groq.js                       # Groq AI SDK wrapper
│   │   └── vietnamData.js               # Vietnam city baseline data
│   └── node_modules/                     # Backend dependencies (gitignored)
│
├── frontend/                             # React + Vite SPA
│   ├── .env.example                      # Frontend env template
│   ├── .env.local                        # Local development env (safe to commit)
│   ├── package.json                      # Frontend dependencies
│   ├── package-lock.json                 # Dependency lock file
│   ├── index.html                        # HTML entry point
│   ├── vite.config.js                    # Vite config (proxy, MapLibre chunk split)
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   ├── postcss.config.js                 # PostCSS plugins
│   ├── scripts/
│   │   └── dev-edge.js                   # Edge browser dev launcher
│   ├── public/
│   │   └── images/
│   │       ├── renewable_*.png           # 11 renewable energy site images
│   │       ├── 17780*.png                # 10 map/dashboard images
│   │       └── facility/
│   │           ├── f1–f16.*              # 16 factory/industrial facility images
│   │           ├── r1–r13.*              # 13 renewable energy images
│   │           └── t1–t10.*              # 10 traffic hotspot images
│   ├── src/
│   │   ├── main.jsx                      # React entry point
│   │   ├── App.jsx                       # Router & auth wrapper
│   │   ├── index.css                     # Global styles
│   │   ├── components/
│   │   │   ├── FridayAI.jsx              # FRIDAY AI voice orb + chat panel
│   │   │   ├── VietnamMap.jsx            # MapLibre GL JS 3D Vietnam map
│   │   │   └── shared.jsx               # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Authentication context provider
│   │   ├── data/
│   │   │   ├── cityRoadNetwork.json      # City road network data
│   │   │   ├── hotspotCandidates.json    # CO₂ hotspot candidate locations
│   │   │   ├── publicTransport.json      # Public transport routes
│   │   │   └── trafficCorridors.json     # Traffic corridor definitions
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx        # Full admin dashboard (11 panels)
│   │   │   ├── ManagerDashboard.jsx      # Manager oversight dashboard
│   │   │   ├── EmployeeDashboard.jsx     # Employee task dashboard
│   │   │   ├── CitizenDashboard.jsx      # Citizen environmental dashboard
│   │   │   ├── HydroGridAI.jsx           # HydroGrid hydrogen intelligence
│   │   │   ├── TrafficIntelligence.jsx   # Traffic monitoring module
│   │   │   └── LoginPage.jsx             # Authentication page
│   │   ├── services/
│   │   │   ├── cityConfig.js             # City configuration data
│   │   │   ├── osmService.js             # OpenStreetMap service
│   │   │   ├── routeService.js           # Route calculation service
│   │   │   ├── trafficService.js         # Traffic data service
│   │   │   └── weatherService.js         # Open-Meteo weather service
│   │   └── utils/
│   │       ├── api.js                    # Axios API client
│   │       └── vietnamData.js            # Vietnam city/province data
│   └── node_modules/                     # Frontend dependencies (gitignored)
```

---

## 📊 Vietnam Data (2021–2025)

| Year | CO₂ (Mt) | Renewable% | EV Vehicles | AQI |
|------|-----------|------------|-------------|-----|
| 2021 | 162.5 | 19% | 120K | 61 |
| 2022 | 168.7 | 21% | 210K | 63 |
| 2023 | 173.4 | 24% | 390K | 65 |
| 2024 | 176.8 | 26% | 640K | 67 |
| 2025 | 179.6 | 28.7% | 910K | 68 |
| **2026** | **Live** | **Live** | **Live** | **Live** |

---

## 🏙 Monitored Cities

| City | CO₂ (Mt) | AQI | Risk Level |
|------|----------|-----|------------|
| Ho Chi Minh City | 18.4 | 76 | Critical |
| Hanoi | 15.2 | 82 | Critical |
| Hai Phong | 9.6 | 74 | High |
| Da Nang | 4.8 | 58 | Medium |
| Can Tho | 3.2 | 53 | High |
| Nha Trang | 1.8 | 46 | Medium |
| Hue | 1.4 | 50 | Medium |
| Vung Tau | 3.8 | 62 | Medium |

---

## 🌊 HydroGrid AI Module

An integrated hydrogen energy intelligence system featuring:

| Page | Description |
|------|-------------|
| Overview Dashboard | Live KPIs, energy flow animation, Vietnam region suitability map |
| Renewable Monitor | Solar/Wind/Tidal live metrics with weather simulation modes |
| Weather AI | 7-day forecast with AI recommendations for energy planning |
| H₂ Production | Electrolysis control panel, hydrogen tank animation, safety alerts |
| Low-Carbon Mobility | Hydrogen bus/truck/train/taxi fleet analytics |
| AI Optimization | FRIDAY AI decision log, routing status, optimization score |
| Analytics | Monthly charts, CO₂ trend analysis |
| Settings | System toggles, energy threshold sliders |

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Anshul Khandar** — [GitHub](https://github.com/anshulkhandar)
