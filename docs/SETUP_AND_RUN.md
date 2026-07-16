# Setup and Run

## Prerequisites

- Node.js 18+ recommended
- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- npm available in terminal

## Backend Setup

From project root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/case_simulator
REDIS_URL=redis://localhost:6379/0
APP_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Start the backend server:

```powershell
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

From project root:

```powershell
cd frontend
npm install
```

## Start Development Server

```powershell
cd frontend
npm run dev
```

The Next.js dev server will start on `http://localhost:3000` by default.

If the port is in use, Next.js will automatically try the next available port (`3001`, `3002`, etc.).

## Build for Production

```powershell
cd frontend
npm run build
```

## Start Production Server

```powershell
cd frontend
npm start
```
