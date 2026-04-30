# Setup and Run

## Prerequisites

- Node.js 18+ recommended
- npm available in terminal

## Install Dependencies

From project root:

```powershell
cd frontend
npm install
```

## Start Development Server

Use this command on local machine (works even if `npm run dev` has path issues):

```powershell
cd frontend
node .\node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
```

Use this command on the GitHub codespace:
```powershell
cd frontend
npx vite --host 0.0.0.0 --port 5173
```

If the port is in use, Vite automatically picks another port (`5174`, `5175`, etc.).

Use this command for Github codespace
```powershell
cd frontend
npx vite --host 0.0.0.0 --port 5173
```

## Build for Production

```powershell
cd frontend
node .\node_modules\vite\bin\vite.js build
```

## Preview Production Build

```powershell
cd frontend
node .\node_modules\vite\bin\vite.js preview
```
