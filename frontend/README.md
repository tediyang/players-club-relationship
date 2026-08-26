# Players Club Relationship Frontend

This is the React frontend for the Players Club Relationship app. It provides the web interface for exploring football player connections, shared club history, and squad insights by querying the backend API.

## Stack

- React 19
- Vite 8
- React Router DOM
- Tailwind CSS 3
- ESLint with React hooks and refresh rules
- Fetch-based API layer for backend communication

The frontend is configured to run on port 5173 and proxies requests from /api to the backend running on http://localhost:5000.

## Project structure

```bash
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── public/
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── ExplorerPage.jsx
    │   └── ResultsPanel.jsx
    └── services/
        └── api.js
```

## What the app does

The UI includes:

- a landing page that summarizes the project and checks backend health
- an explorer page with three main queries:
  - shortest player-to-player connection path
  - indirect teammate search based on a club exclusion
  - top clubs by connected-player count
- a reusable results panel for rendering API responses

## Prerequisites

Before running the frontend, make sure you have:

- Node.js 20+ recommended
- npm installed
- the backend service already running locally on port 5000

## Setup

From the project root:

```bash
cd frontend
npm install
```

Create a .env file from the .example.env. For a live deploy backend service, input the url and change the environment from development to production. If not, leave the .env file with the default values.

## Run in development mode

```bash
npm run dev
```

This starts the Vite dev server and usually serves the app at:

```text
http://localhost:5173
```

## Production build

To create a production-ready build:

```bash
npm run build
```

This generates a dist folder with the optimized static files.

To preview the production build locally:

```bash
npm run preview
```

## Linting

```bash
npm run lint
```

## Backend connection

The frontend talks to the backend through the API layer in src/services/api.js.

```js
export const API_BASE = "/api";
```

The Vite config proxies all /api requests to the Flask backend:

```js
server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true,
    },
  },
},
```

This means frontend requests like:

```text
/api/health
/api/path?player1=...&player2=...
```

are forwarded to the backend automatically.

## Notes

- If the backend is offline, the app will show a disconnected state and interactive queries will not work.
- The app is designed as a thin client that consumes the backend’s graph queries and presents them clearly in the UI.
- Styling is handled by Tailwind, with utility classes defined directly in the React components.

## Typical local workflow

1. Start the backend API.
2. Open the frontend folder.
3. Install dependencies with npm install.
4. Run npm run dev.
5. Visit http://localhost:5173 in the browser.
6. Use the explorer page to query player relationships.
