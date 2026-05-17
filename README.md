# 🇻🇳 VietCarbon AI — Vietnam Smart Sustainability Platform

**AI-powered smart city platform monitoring Vietnam's environmental sustainability with real-time analytics, 3D mapping, Traffic Intelligence, HydroGrid Intelligence, and FRIDAY AI voice assistant.**

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

| Role            | Username                       | Password     |
| --------------- | ------------------------------ | ------------ |
| Admin / Manager | `manager`                      | `manager123` |
| Employee        | `emp001` – `emp004`            | `emp123`     |
| Citizen         | Register via OTP on login page | —            |

---

## 📊 Features

### Dashboards & Roles

- ✅ **Admin Dashboard** — 14-tab command center: CO₂ Control, Climate & Disaster, Renewable Energy, Soil & Agriculture, Traffic & Vehicles, Traffic Intelligence, AQI & Pollution, AI Report, Citizen Data, AI Data Center, Alert System, HydroGrid AI
- ✅ **Manager Dashboard** — Full manager oversight with identical analytics panels and team management
- ✅ **Employee Dashboard** — Task management with sustainability-focused assignments and eco-scores
- ✅ **Citizen Dashboard** — Personal carbon footprint calculator, OTP-based registration, environmental alerts inbox

### Maps & Visualization

- ✅ **MapLibre GL JS 3D Map** — 4 map styles (Dark Matter, Terrain, Satellite, Positron), 8 overlay layers (CO₂, Climate Risk, Traffic, Solar, Flood, Population, Industrial, Renewable), WebGL heatmaps, animated city markers, 3D pitch mode
- ✅ **Interactive City Selection** — Fly-to animation, orbit pulse markers, hover tooltips, city quick-select panel
- ✅ **Renewable Energy Markers** — Solar farms, wind turbines, floating solar, hydro dams, hydrogen ports, smart villages, agrivoltaics with real facility images
- ✅ **Industrial & Factory Hotspots** — Cat Lai Port, Dinh Vu IZ, Thang Long Industrial Park, Hoa Khanh IZ, Tra Noc IZ, Phu My IZ with popup images

### Traffic Intelligence (Live)

- ✅ **TomTom Live Traffic Flow** — Real-time speed, free-flow speed, efficiency %, severity classification (Free Flow → Critical) for CO₂ hotspot zones
- ✅ **TomTom Reverse Geocoding** — Actual road/corridor names from GPS coordinates
- ✅ **Google Gemini AI Reasoning** — AI-generated cause analysis and operational mitigation per hotspot zone, cached with 3-minute TTL and severity fingerprinting
- ✅ **Carbon Estimation Engine** — Deterministic CO₂ calculation from speed ratios and zone types (industrial, logistics, transit, commercial, etc.)
- ✅ **Public Transport Analytics** — Metro lines, bus routes, EV stations, ferry routes, transport coverage score per city
- ✅ **Multi-city Support** — Ho Chi Minh City, Hanoi, Da Nang, Hai Phong, Can Tho with city-specific context and authority references

### AI & Voice

- ✅ **FRIDAY AI Voice Assistant** — Orbital HUD orb with 4-state system (idle → listening → processing → speaking), expandable chat panel, quick command buttons, rich smart fallbacks
- ✅ **Groq AI Engine** — Llama 3.3 70B Versatile for FRIDAY chat, task analysis, and sustainability reports
- ✅ **Google Gemini** — Traffic intelligence AI reasoning engine
- ✅ **ElevenLabs TTS** — Premium FRIDAY voice with dual-response architecture (short responses spoken directly, long analytics compressed to executive briefings via Groq)
- ✅ **AI Report Generator** — City-specific sustainability reports with daily/monthly/yearly filters and download
- ✅ **AI Emergency Alert System** — Live data analysis against thresholds, AI-generated citizen broadcast messages

### Environmental Monitoring

- ✅ **CO₂ Emissions Tracking** — National + city-level carbon data with industrial hotspot mapping
- ✅ **Renewable Energy Monitoring** — Solar, Wind, Hydro, Tidal generation tracking with 2026 live simulation
- ✅ **Climate Disaster Predictor** — Flood, storm, heatwave, drought risk assessment per city
- ✅ **Air Quality (AQI)** — Live PM2.5, PM10, CO, NO₂, SO₂, Ozone from Open-Meteo API
- ✅ **Soil Health & Agriculture** — Soil fertility, moisture, nitrogen levels, crop productivity
- ✅ **Real-time Alert System** — AI-powered emergency analysis → citizen climate broadcast → notification delivery
- ✅ **Open-Meteo Live Weather** — Temperature, wind, precipitation, weather codes for all monitored cities (free, no key needed)

### HydroGrid AI Module

- ✅ **Overview Dashboard** — Live KPIs, animated energy flow diagram (Solar → AI Grid → Electrolysis → H₂ Tank → Mobility), Vietnam region suitability map
- ✅ **Renewable Monitor** — Solar/Wind/Tidal live metrics with sunny/cloudy/rainy simulation modes
- ✅ **Weather AI** — 7-day forecast with FRIDAY AI energy planning recommendations
- ✅ **H₂ Production** — Electrolysis control panel with animated hydrogen tank, safety alerts, AI auto-mode
- ✅ **Low-Carbon Mobility** — Hydrogen bus/truck/train/taxi fleet analytics with diesel vs H₂ emission comparison
- ✅ **AI Optimization** — FRIDAY AI decision log, routing status, optimization score
- ✅ **Analytics** — Monthly charts, CO₂ trend analysis, 24-month deployment data
- ✅ **Settings** — System toggles, energy threshold sliders

---

## 🛠 Tech Stack

| Layer        | Technology                               |
| ------------ | ---------------------------------------- |
| **Frontend** | React 18 + Vite + Tailwind CSS           |
| **3D Map**   | MapLibre GL JS + Leaflet.js              |
| **Charts**   | Recharts                                 |
| **Icons**    | Lucide React                             |
| **Backend**  | Node.js + Express                        |
| **Database** | MongoDB Atlas + Mongoose                 |
| **AI**       | Groq SDK (Llama 3.3 70B) + Google Gemini |
| **Voice**    | ElevenLabs TTS + Web Speech API          |
| **Traffic**  | TomTom Traffic Flow API + Geocoding      |
| **Email**    | Nodemailer (Gmail SMTP)                  |
| **Auth**     | JWT + bcrypt + OTP (citizen)             |
| **Weather**  | Open-Meteo API (free, no key required)   |

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
"Friday, open traffic intelligence"
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
│   ├── seed.js                           # Database seeder (manager + employees)
│   ├── middleware/
│   │   └── auth.js                       # JWT authentication middleware
│   ├── models/
│   │   └── index.js                      # Mongoose schemas (User, Task, Notification, EmissionLog, CitizenData, OtpSession)
│   ├── routes/
│   │   ├── ai.js                         # FRIDAY AI chat, TTS speak, report, climate email, API status
│   │   ├── auth.js                       # Login, register, OTP verification, password reset
│   │   ├── citizen.js                    # Citizen data submission, notifications, emission logs
│   │   ├── employees.js                  # Employee CRUD operations
│   │   ├── tasks.js                      # Task assignment & management
│   │   └── traffic.js                    # TomTom live traffic + Gemini AI reasoning engine
│   ├── utils/
│   │   ├── email.js                      # Nodemailer SMTP helper
│   │   ├── groq.js                       # Groq AI SDK wrapper (chat, analyzeTask, generateReport)
│   │   └── vietnamData.js               # Vietnam city baseline data + national stats
│   └── node_modules/                     # Backend dependencies (gitignored)
│
├── frontend/                             # React + Vite SPA
│   ├── .env.local                        # API URL config (safe to commit)
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
│   │   ├── App.jsx                       # Router & auth wrapper (admin, citizen, employee routes)
│   │   ├── index.css                     # Global styles (Orbitron + Space Mono + Inter)
│   │   ├── components/
│   │   │   ├── FridayAI.jsx              # FRIDAY AI voice orb + 4-state HUD + chat panel
│   │   │   ├── VietnamMap.jsx            # MapLibre GL JS 3D Vietnam map (8 overlay layers)
│   │   │   └── shared.jsx               # Reusable UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx           # Authentication context provider (JWT)
│   │   ├── data/
│   │   │   ├── cityRoadNetwork.json      # City road network data
│   │   │   ├── hotspotCandidates.json    # CO₂ hotspot candidate locations (used by Traffic Intelligence)
│   │   │   ├── publicTransport.json      # Public transport routes
│   │   │   └── trafficCorridors.json     # Traffic corridor definitions
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx        # Full admin dashboard (14 tabs, 2600+ lines)
│   │   │   ├── ManagerDashboard.jsx      # Manager oversight dashboard (mirrors admin)
│   │   │   ├── EmployeeDashboard.jsx     # Employee task management dashboard
│   │   │   ├── CitizenDashboard.jsx      # Citizen environmental dashboard + OTP registration
│   │   │   ├── HydroGridAI.jsx           # HydroGrid hydrogen energy intelligence (8 sub-pages)
│   │   │   ├── TrafficIntelligence.jsx   # Live TomTom traffic + AI analysis + public transport
│   │   │   └── LoginPage.jsx             # Authentication page (manager/employee/citizen)
│   │   ├── services/
│   │   │   ├── cityConfig.js             # City configuration (center coords, zoom, hotspot candidates)
│   │   │   ├── osmService.js             # OpenStreetMap tile service
│   │   │   ├── routeService.js           # Route calculation service
│   │   │   ├── trafficService.js         # Traffic data service (calls backend /api/traffic/analyze)
│   │   │   └── weatherService.js         # Open-Meteo weather service
│   │   └── utils/
│   │       ├── api.js                    # Axios API client (reads VITE_API_URL)
│   │       └── vietnamData.js            # Vietnam city/province data (2021–2025 + 2026 live layer)
│   └── node_modules/                     # Frontend dependencies (gitignored)
```

---

## 📊 Vietnam Data (2021–2025)

| Year     | CO₂ (Mt) | Renewable% | EV Vehicles | AQI      |
| -------- | -------- | ---------- | ----------- | -------- |
| 2021     | 162.5    | 19%        | 120K        | 61       |
| 2022     | 168.7    | 21%        | 210K        | 63       |
| 2023     | 173.4    | 24%        | 390K        | 65       |
| 2024     | 176.8    | 26%        | 640K        | 67       |
| 2025     | 179.6    | 28.7%      | 910K        | 68       |
| **2026** | **Live** | **Live**   | **Live**    | **Live** |

---

## 🏙 Monitored Cities

| City             | CO₂ (Mt) | AQI | Risk Level |
| ---------------- | -------- | --- | ---------- |
| Ho Chi Minh City | 18.4     | 76  | Critical   |
| Hanoi            | 15.2     | 82  | Critical   |
| Hai Phong        | 9.6      | 74  | High       |
| Da Nang          | 4.8      | 58  | Medium     |
| Can Tho          | 3.2      | 53  | High       |
| Nha Trang        | 1.8      | 46  | Medium     |
| Hue              | 1.4      | 50  | Medium     |
| Vung Tau         | 3.8      | 62  | Medium     |

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Anshul Khandar** — [GitHub](https://github.com/anshulkhandar)
