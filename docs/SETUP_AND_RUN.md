# Setup and Run

## Prerequisites

- Node.js 18+ recommended
- npm available in terminal

## Install Dependencies

### Frontend
From project root:

```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

## Start Development Servers

### Frontend
Use this command on local machine:

```bash
cd frontend
node .\node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
```

Use this command on the GitHub codespace:
```bash
cd frontend
npx vite --host 0.0.0.0 --port 5173
```

If the port is in use, Vite automatically picks another port (`5174`, `5175`, etc.).

### Backend
```bash
cd backend
npm start
```

For development with auto-restart:
```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:3000` by default.

## Build for Production

### Frontend
```bash
cd frontend
node .\node_modules\vite\bin\vite.js build
```

### Backend
The backend is ready for production as-is, or can be containerized with Docker.
node .\node_modules\vite\bin\vite.js preview
```
