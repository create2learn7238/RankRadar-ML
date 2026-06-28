# RankRadar Backend

FastAPI backend for the normalized `student_performance_db` schema.

The backend now reads the existing Neon PostgreSQL data directly. It does not seed mock data, auto-create tables, or scan/upload PDFs on startup.

## Run

```powershell
cd "X:\LJ IET\Sem-4\Student data marks\backend"

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Open:

```text
http://localhost:8000/docs
http://localhost:8000/health
```

## Required Environment

Create or update `backend\.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
SECRET_KEY=change-this-for-production
```

## Active Schema

The ORM expects these normalized tables:

- `students`
- `semesters`
- `subjects`
- `tests`
- `student_semester`
- `marks`
- `predictions`
- `users` for existing JWT login support

Analytics are calculated dynamically from raw marks. The old stored `analytics` table is not used.

## Main Endpoints

- `GET /students/`
- `GET /students/search?q=...`
- `GET /students/{enrollment_no}`
- `GET /students/{enrollment_no}/marks`
- `GET /dashboard/overview`
- `GET /analytics`
- `GET /analytics/{enrollment_no}`
- `GET /analytics/{enrollment_no}/predictions`
- `GET /analytics/subjects`
- `GET /analytics/batch`
- `GET /analytics/semester-comparison`
- `GET /analytics/compare/students?student1_enroll=...&student2_enroll=...`
- `GET /leaderboard`
- `GET /leaderboard/subject-toppers`
- `POST /predict`
- `POST /predict/retrain`
