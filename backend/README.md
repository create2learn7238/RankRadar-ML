# ⚡ RankRadar AI Backend — Fast, Scalable & ML-Powered 🐍

> **FastAPI backend driving RankRadar's ML Prediction & Cohort Intelligence System.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?logo=python)](https://www.sqlalchemy.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.6+-F7931E?logo=scikit-learn)](https://scikit-learn.org/)

---

## 🚀 Overview

The RankRadar backend reads directly from the normalized **Neon PostgreSQL** database. It runs machine learning inference, dynamic student cohort ranking, performance analytics, and custom dynamic fallback calculations.

### Key Capabilities:
- 🔮 **Scikit-Learn ML Inference Engine**: Runs Random Forest & Gradient Boosting regression models to predict $T_4$ exam scores **out of 50**.
- ⚙️ **FCSP-II Dynamic Rule Engine**: For *Foundation of Computer Science & Programming-II*, computes $T_4$ dynamically from $T_1, T_2, T_3$ averages scaled out of 50.
- ⚡ **Dynamic Cohort Ranking & TTL Cache**: Calculates percentiles, ranks, and badges across thousands of student rows with a 60-second in-memory TTL score cache.

---

## 🛠️ Quick Commands

```powershell
# Navigate to backend
cd backend

# Run with python uvicorn
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- 📖 **Interactive OpenAPI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- 🏥 **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 📡 Essential Endpoints

- `GET /students/` — List all registered students
- `GET /students/search?q=...` — Search by name or enrollment number
- `GET /students/{enrollment_no}` — Full student profile, subject breakdown & analytics
- `GET /analytics/{enrollment_no}/predictions` — Retrieve $T_4$ ML predictions **out of 50**
- `POST /predict` — Run real-time $T_4$ prediction for custom $T_1, T_2, T_3$ inputs out of 50

---

*© 2026 LJ United Network · Dixit Patel*
