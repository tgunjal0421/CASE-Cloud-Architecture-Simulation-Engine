# Setup and Run

## Prerequisites

- Node.js 18+ recommended
- npm available in terminal

## Install Dependencies

From project root:

```powershell
cd "E:\Airtel\CASE 2\frontend"
npm install
```

## Start Development Server

Use this command on this machine (works even if `npm run dev` has path issues):

```powershell
cd "E:\Airtel\CASE 2\frontend"
node .\node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
```

If the port is in use, Vite automatically picks another port (`5174`, `5175`, etc.).

## Build for Production

```powershell
cd "E:\Airtel\CASE 2\frontend"
node .\node_modules\vite\bin\vite.js build
```

## Preview Production Build

```powershell
cd "E:\Airtel\CASE 2\frontend"
node .\node_modules\vite\bin\vite.js preview
```
