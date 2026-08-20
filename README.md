# 🎯 RankRadar — The Ultimate AI Marks Oracle & Academic Roast Engine 🚀
## https://rankradar-ml.onrender.com
> **"Why stress over T4 results when Machine Learning can read your academic future out of 50 before your professor even finishes grading?"**  
>  
> Built with 💻 & ☕ by **Dixit Patel** · **LJ United Network**  
> Powered by **FastAPI, React 19, Vite 8, and Scikit-Learn ML Engines**

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-emerald?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![ML Engine](https://img.shields.io/badge/ML%20Engine-Random%20Forest%20%26%20GBDT-orange?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![Vibe Scale](https://img.shields.io/badge/UI%20Vibe-Cyber%20Glassmorphism%20100%25-purple?style=for-the-badge)](#-the-cyber-glassmorphic-design-system)

---

## 🔮 What is RankRadar?

**RankRadar** is a state-of-the-art, hyper-aesthetic AI intelligence platform that transforms raw academic chaos into sleek, actionable intelligence. It analyzes historical **Test 1, Test 2, and Test 3** performances and deploys machine learning regression algorithms to predict your **Test 4 (T4) final marks out of 50**!

Whether you are aiming for CGPA glory or just trying to survive semester exams without backlogs, RankRadar has your back! 🛡️✨

---

## ⚡ Mind-Blowing Features

### 🧠 1. The ML Prediction Machine (`/predict`)
- Stares into your past test scores ($T_1, T_2, T_3 \text{ out of } 25$) and uses **Random Forest & Gradient Boosting Regressors** to predict your $T_4$ final score **out of 50**.
- **Special FCSP-II Engine**: For *Foundation of Computer Science & Programming-II*, instead of crashing over missing DB rows, RankRadar dynamically calculates $T_4$ as the weighted average of $T_1, T_2, T_3$ scaled straight out of 50!
- **Math Scaling Magic**: Stored DB raw marks out of 25 are automatically doubled ($\text{marks} \times 2$) to display crisp $/ 50$ scores (e.g., $18/25 \rightarrow 36/50$) because $50$ looks twice as glorious!

### 💎 2. Cyber Glassmorphic Visual System
- Crafted in **Deep Midnight Obsidian** (`#0A0D14`), **Cyber Indigo** (`#6366F1`), **Cyber Cyan** (`#00F0FF`), and **Hyper Violet** (`#A855F7`).
- Smooth $20\text{px}$ backdrop blurs, 3D clay cards, floating grid graph overlays, and glowing neon borders that make default browser UIs look like they belong in 1998.

### 🛡️ 3. F5 Refresh Survival Shield
- Reloading on `/dashboard`, `/prediction`, or `/profile`? 
- Frame 1 skeleton loaders rehydrate your session dynamically without kicking you back to the home search page!

### 📊 4. Executive Grid Layouts
- **5-Column Subject Row**: `COA`, `DM`, `FCSP-II`, `FSD-II`, `TOC` cards lay out side-by-side in one seamless row.
- **8-Column Performance Dashboard**: Overall Average, Academic Score, Strongest Subject, Weakest Subject, Consistency, Growth, Batch Rank, and Class Average — all visible at a single glance.

---

## 🧪 Try It Out! (Demo Enrollments)

Stuck on the login screen? Drop any of these sample enrollment numbers into the search bar and watch the magic unfold:

| Demo Chip | Enrollment Number | Student Vibe |
| :--- | :--- | :--- |
| **Demo 1** | `24002171410039` | SEVAK KUSH (The Academic Demon 😈) |
| **Demo 2** | `24002171510025` | DIXIT PATEL (System Admin / Creator Mode 👑) |
| **Demo 3** | `24002170210107` | Top Tier Performer (Chill & Cruising ☕) |

---

## 🏗 Project Architecture

```text
RankRadar/
├── 🐍 backend/                   # FastAPI Python ML Server
│   ├── app/
│   │   ├── main.py            # FastAPI Entry Point & Middleware
│   │   ├── database.py        # Neon PostgreSQL Engine Connection
│   │   ├── crud.py            # Cohort Dynamic Analytics & Ranking Engine
│   │   ├── schemas.py         # Pydantic Schemas (Out of 50 target bounds)
│   │   ├── ml/
│   │   │   ├── model.py       # Random Forest & GBDT Regressor Trainers
│   │   │   ├── predictor.py   # Out-of-50 Score Inference Engine
│   │   │   └── marks_predictor.pkl # Trained Machine Learning Artifact
│   │   └── routers/
│   │       ├── student.py     # Student Profile Endpoints
│   │       └── analytics.py   # Prediction & Analytics Endpoints
│   └── requirements.txt
│
├── ⚛️ frontend/                  # React 19 + Vite 8 Cyber Glass UI
│   ├── src/
│   │   ├── App.jsx            # Dynamic Router, Clay Cards & Counter Animations
│   │   ├── index.css          # Cyber Obsidian Glass Tokens & Micro-Animations
│   │   └── api.js             # Resilient Auto-fallback API Client
│   └── package.json
│
└── ☁️ render.yaml                # One-Click Blueprint Cloud Deployment
```

---

## 🚀 How to Fire Up the Engines

### 1️⃣ Launch Backend (FastAPI)

```powershell
cd backend

# Install dependencies & start server
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- 📜 **Swagger Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 💚 **API Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2️⃣ Launch Frontend (Vite + React 19)

```powershell
cd frontend

# Install Node modules & launch dev server
npm install
npm run dev
```
- 🌐 **Web App Portal**: [http://localhost:5173/](http://localhost:5173/)

---

## 🎨 The Cyber Glassmorphic Design Palette

| Element | Color Code | Visual Vibe |
| :--- | :--- | :--- |
| **Obsidian Midnight** | `#0A0D14` | Void Black Foundation |
| **Cyber Indigo** | `#6366F1` | Electric Neon Accent |
| **Cyber Cyan** | `#00F0FF` | Glowing Metric Highlights |
| **Hyper Violet** | `#A855F7` | ML Intelligence Engine Badge |
| **Emerald Glass** | `#10B981` | Pass / Top Rank / Strong Status |
| **Rose Glass** | `#F43F5E` | Critical Warning / Exit Button |

---

## 🤝 Social & Connect

Created with passion by **Dixit Patel**:

- 📷 **Instagram**: [@dixit.patel_since_2005](https://www.instagram.com/dixit.patel_since_2005/?hl=en)
- 🐙 **GitHub**: [@create2learn7238](https://github.com/create2learn7238)
- 💼 **LinkedIn**: [Dixit Patel](https://www.linkedin.com/in/dixit-patel-7718993a1/)
- 💬 **WhatsApp**: [+91 9316227238](https://wa.me/919316227238)

---

> *"Work hard in silence, let your ML predictions make the noise."* 🚀  
> **© 2026 LJ United Network · All Rights Reserved.**
