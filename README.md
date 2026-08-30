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
├── client/                  Vite + React frontend
├── server/                  Express + SQLite backend (API on port 3001)
│   └── data/                registry.sqlite lives here (auto-created, auto-seeded)
├── desktop/                 Electron wrapper — packages client+server into a
│                             Windows 10/11 installable .exe
├── .github/workflows/       CI: builds (and, on a version tag, releases) the
│                             Windows installer — see Releases below
└── package.json              root scripts to run client + server together
```

## Install

From the project root, install dependencies for the root, client, server,
and desktop app:

```bash
npm run install:all
```

This is equivalent to running `npm install` in `client/`, `server/`,
`desktop/`, and the project root separately.

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

This outputs to `client/dist/`. The Express server auto-detects that folder
and, if present, serves the built SPA itself alongside the API on the same
origin — so `npm start` in `server/` (after the client build above) is
enough to get the whole app running at **http://localhost:3001**, no
separate static host or proxy needed:

```bash
cd server
npm start
```

## Desktop app (Windows installer)

The `desktop/` folder wraps the same client + server in Electron so it can
be installed and run like a normal Windows program — a Start Menu / Desktop
shortcut, no terminal, no separately-installed Node required.

```bash
npm run desktop     # build the client, then launch the app in a window (for testing)
npm run dist:win     # build the client, then produce a Windows installer .exe
                      # → desktop/release/<Product Name> Setup <version>.exe
```

The installer only targets **Windows 10 and 11**. `node:sqlite` (which the
backend uses) needs Node 22.5+, and Electron only bundles that on fairly
recent releases — genuine Windows 7/8 support would mean swapping the
database layer for something with no Node-version floor (e.g.
`better-sqlite3`, rebuilt per Electron version) *and* an old, unmaintained
Electron/Chromium build, since Chromium itself dropped Windows 7/8 support
in 2023. Not done here; flagged in case it's ever worth revisiting.

The app's SQLite database lives in the per-user app-data folder (Electron's
`userData`, e.g. `%APPDATA%\aytratyn-gozegcilikde-saklamak-desktop\data\`),
not inside the install directory — so it survives reinstalls/updates and
doesn't need admin rights to write to.

## Releases

`.github/workflows/release.yml` builds the Windows installer on GitHub's own
Windows runners:

- Any push to `main`, or a manual run from the Actions tab, **builds** the
  installer and attaches it as a downloadable workflow artifact (handy for
  testing a change without cutting a release).
- Pushing a tag like `v1.0.1` — matching the `version` in
  `desktop/package.json` — additionally **publishes** it as a GitHub
  Release with the `.exe` attached. Bump that version and tag together:

  ```bash
  git tag v1.0.1
  git push origin v1.0.1
  ```

The installer isn't code-signed, so Windows SmartScreen will likely show an
"unknown publisher" warning on first run — expected, not a broken build.

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
