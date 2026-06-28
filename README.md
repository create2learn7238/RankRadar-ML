# 🎯 RankRadar — ML Student Performance Intelligence Platform

> Built by **Dixit Patel · LJ United Network**  
> Powered by **Artificial Intelligence, Machine Learning & Data Analytics**

---

## 🗂 Project Structure

```
RankRadar/
├── backend/                  # FastAPI + Python ML backend
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── crud.py           # Database operations
│   │   ├── auth.py           # JWT authentication
│   │   ├── database.py       # DB connection
│   │   ├── ml/
│   │   │   ├── model.py      # ML model training (Random Forest / Gradient Boosting)
│   │   │   ├── predictor.py  # Prediction logic
│   │   │   └── marks_predictor.pkl  # Trained model
│   │   └── routers/
│   │       ├── student.py    # Student endpoints
│   │       ├── analytics.py  # Analytics endpoints
│   │       └── auth.py       # Auth endpoints
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                 # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── index.css         # Claymorphism design system
│   │   ├── api.js            # API layer
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── render.yaml               # Render deployment config
```

---

## 🚀 Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your PostgreSQL URL and secret key

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set backend URL (optional — defaults to localhost:8000)
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run dev server
npm run dev
```

---

## ☁️ Deploying on Render (Free Tier)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — RankRadar"
git remote add origin https://github.com/YOUR_USERNAME/rankradar.git
git push -u origin main
```

### Step 2 — Create a PostgreSQL database on Render

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Name it `rankradar-db`
3. Select **Free** plan → **Create Database**
4. Copy the **Internal Database URL** (you'll need it)

### Step 3 — Deploy the Backend

1. **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `rankradar-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Internal DB URL from Step 2 |
   | `SECRET_KEY` | Any long random string |
   | `DEBUG` | `false` |
5. **Create Web Service**

### Step 4 — Deploy the Frontend

1. **New** → **Static Site**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `rankradar-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variables:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | URL of your backend (e.g. `https://rankradar-backend.onrender.com`) |
5. Add a **Rewrite Rule**: `/* → /index.html` (for React Router)
6. **Create Static Site**

### Step 5 — (Optional) Use render.yaml for one-click deploy

If you use the included `render.yaml`, you can deploy everything at once:

1. Go to Render Dashboard → **New** → **Blueprint**
2. Connect your repo
3. Render will auto-detect `render.yaml` and deploy backend + frontend + database together

---

## 🔑 Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=super-secret-key-change-this
DEBUG=False
```

### Frontend `.env.local`

```env
VITE_API_URL=https://rankradar-backend.onrender.com
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Framer Motion, Recharts |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, PyJWT, bcrypt |
| ML | Scikit-Learn (Random Forest, Gradient Boosting), NumPy, Joblib |
| Design | Claymorphism · Violet/Cyan/Emerald palette |
| Deploy | Render (free tier) |

---

## 📝 Notes

- The ML model (`marks_predictor.pkl`) was trained on historical marks data using **Random Forest Regressor** and **Gradient Boosting**
- Predictions are for **T4 marks** based on T1, T2, T3 performance
- Free Render tier: backend sleeps after 15 min of inactivity; first request may take ~30s to wake up

---

*© 2026 LJ United Network · Dixit Patel*
