# Aýratyn gözegçilikde saklamak

Special-monitoring registry for soldiers flagged under one or more oversight
categories (discipline, health, family situation, etc.) — personal/unit info,
medical event history, search/filter/sort/group, a printable dossier view,
and a dashboard. Frontend is Vite + React; backend is Express with a SQLite
database (via Node's built-in `node:sqlite`, no native build tools required).
The app sits behind a login screen (see **Login** below).

## Prerequisites

- **Node.js 22.5+** (uses the built-in `node:sqlite` module). This project was
  built and tested on Node 24 LTS.
  Check what you have installed:

  ```bash
  node --version
  ```

  If you don't have Node installed, get it from [nodejs.org](https://nodejs.org/)
  (choose the LTS version) or via a package manager, e.g. on Windows:

  ```bash
  winget install -e --id OpenJS.NodeJS.LTS
  ```

## Project structure

```
harby-lukmancylyk-hasabaty/
├── client/          Vite + React frontend
├── server/          Express + SQLite backend (API on port 3001)
│   └── data/        registry.sqlite lives here (auto-created, auto-seeded)
└── package.json      root scripts to run client + server together
```

## Install

From the project root, install dependencies for the root, client, and server:

```bash
npm run install:all
```

This is equivalent to running `npm install` in `client/`, `server/`, and the
project root separately.

## Run (development)

From the project root:

```bash
npm run dev
```

This starts both:

- **API server** — http://localhost:3001 (Express, auto-restarts on changes
  under `server/src` via `node --watch-path`; a restart clears logged-in
  sessions, see **Login** below)
- **Frontend** — http://localhost:5173 (Vite dev server, proxies `/api/*`
  requests to the backend, hot-reloads on save)

Open **http://localhost:5173** in your browser.

On first run, the SQLite database is created automatically at
`server/data/registry.sqlite` and seeded with 10 sample soldier records.

## Login

The app requires signing in before showing any data. There is currently a
single hardcoded account:

| Username     | Password |
|--------------|----------|
| `B.Hocjyyev` | `1111`   |

Sessions are just an in-memory token on the server — restarting the API
(e.g. a `--watch` reload while editing server code) invalidates existing
sessions and everyone has to log in again.

### Run client/server individually

```bash
npm run dev:server   # just the API, port 3001
npm run dev:client   # just the frontend, port 5173 (expects the API running separately)
```

## Building for production

Build the frontend static assets:

```bash
cd client
npm run build
```

This outputs to `client/dist/`. Serve those files with any static host, and
run the API separately:

```bash
cd server
npm start
```

Point the frontend at the API's URL (update the `/api` proxy target in
`client/vite.config.js` for dev, or serve the built frontend behind the same
origin/reverse proxy as the API in production).

## API

`POST /api/login` (`{ username, password }`) returns a `{ token }`; send it
as `Authorization: Bearer <token>` on every request below. `POST /api/logout`
invalidates the current token.

All soldier endpoints are under `/api/soldiers` and require that header:

| Method | Path                  | Description                          |
|--------|-----------------------|---------------------------------------|
| GET    | `/api/soldiers`       | List all soldiers (with medical events) |
| GET    | `/api/soldiers/:id`   | Get one soldier                       |
| POST   | `/api/soldiers`       | Create a soldier                      |
| PUT    | `/api/soldiers/:id`   | Update a soldier                      |
| DELETE | `/api/soldiers/:id`   | Delete a soldier                      |

## Notes

- Fonts (IBM Plex Mono / Sans / Sans Condensed) load from Google Fonts at
  runtime — an internet connection is needed the first time a page loads them
  (subsequently cached by the browser). For a fully offline setup, download
  the font files and reference them locally instead of the Google Fonts
  `<link>` tags in `client/index.html`.
- Soldier photos are stored as base64 data URLs directly in the SQLite
  `soldiers.photo` column.
- The database file (`server/data/registry.sqlite`) is not tracked by git —
  delete it to reset to the seed data on next server start.
