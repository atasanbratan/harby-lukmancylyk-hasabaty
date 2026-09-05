# Aýratyn gözegçilikde saklamak

Special-monitoring registry for soldiers flagged under one or more oversight
categories (discipline, health, family situation, etc.) — personal/unit info,
medical event history, search/filter/sort/group, a printable dossier view,
and a dashboard. Frontend is Vite + React; backend is Express with a SQLite
database (via `sql.js`, a WebAssembly build of SQLite with no native add-ons).
The app sits behind a login screen (see **Login** below).

## Prerequisites

- **Node.js 22.12+ and npm** for development and builds. This project was
  built locally with Node 24.19.0 and npm 11.17.0. The minimum version comes
  from the Vite build tools, not the database.
  Check what you have installed:

  ```bash
  node --version
  ```

  If you don't have Node installed, get it from [nodejs.org](https://nodejs.org/)
  (choose the LTS version) or via a package manager, e.g. on Windows:

  ```bash
  winget install -e --id OpenJS.NodeJS.LTS
  ```

Build the Windows installer on a modern Windows 10/11 computer. The
Windows 7/8/8.1 computer only runs the packaged installer and application;
it does not need Node.js, npm, Git, or development tools installed.

## Project structure

```
harby-lukmancylyk-hasabaty/
├── client/                  Vite + React frontend
├── server/                  Express + SQLite backend (API on port 3001)
│   └── data/                registry.sqlite lives here (auto-created, auto-seeded)
├── desktop/                 Electron 22 wrapper and Windows x86 NSIS installer
│   ├── main.cjs             CommonJS desktop entry point (loads the ESM server)
│   └── release/             locally built installers and unpacked app (ignored by git)
├── .github/workflows/       CI: installs, builds, and smoke-tests the web
│                             app (client+server) on pushes to main and PRs
└── package.json              root scripts to run client + server together
```

## Install

From the project root, install dependencies for the root, client, server,
and desktop app:

```bash
npm install
npm run install:all
```

The first command installs root tools such as `concurrently`. The second
installs dependencies in `server/`, `client/`, and `desktop/`. Keep both
steps when setting up a fresh clone. Downloads include the Electron runtime
and may take several minutes on a slow connection.

For web-only development, the desktop dependencies are optional:

```bash
npm ci
npm ci --prefix server
npm ci --prefix client
```

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

From the repository root, build the frontend and start the server:

```bash
npm run build --prefix client
npm start --prefix server
```

This outputs to `client/dist/`. The Express server auto-detects that folder
and, if present, serves the built SPA itself alongside the API on the same
origin. The commands above run the whole app at **http://127.0.0.1:3001**
without a separate static host or proxy.

## Desktop app (Windows 7/8/8.1 32-bit installer)

The `desktop/` folder wraps the same client + server in Electron so it can
be installed and run like a normal Windows program — a Start Menu / Desktop
shortcut, no terminal, no separately-installed Node required.

```bash
npm run desktop     # build the client, then launch the app in a window (for testing)
npm run dist:win     # build the client, then produce a Windows installer .exe
```

For version 1.0.0 the generated installer is:

```text
desktop/release/Aytratyn Gozegcilik Setup 1.0.0 Win7-8 x86.exe
```

Copy this `.exe` to the target computer and run it to choose the installation
folder and create Start Menu/Desktop shortcuts. It includes the frontend,
backend, SQLite WebAssembly module, and Electron runtime. User databases are
excluded from the installer; a new installation seeds 10 sample records.

The installer targets **32-bit Windows 7, 8, and 8.1** (`ia32`, also called
x86). It pins **Electron 22.3.27**, which bundles Node 16.17.1 and Chromium
108. The CommonJS desktop bootstrap and `sql.js` database layer allow the
application to run with that older runtime without a native SQLite binary.

Electron 22 is the [last Electron line supporting Windows 7/8/8.1](https://www.electronjs.org/blog/windows-7-to-8-1-deprecation-notice).
It is [end-of-life](https://releases.electronjs.org/release/v22.3.27), so its
Chromium engine no longer receives security fixes.

### Validation and limits

The legacy installer was built on Windows 11. Both installer and application
executables were verified as x86 binaries. The packaged application served
the UI, created its database, authenticated successfully, and returned 10
seeded records under Electron 22/Node 16. The database adapter also passed
create, update, and delete checks against temporary data.

**The installer has not been tested on an actual Windows 7, 8, or 8.1
machine.** Those are compatibility targets based on the bundled Electron
version, not verified operating-system test results.

The app's SQLite database lives in the per-user app-data folder (Electron's
`userData`, e.g. `%APPDATA%\aytratyn-gozegcilikde-saklamak-desktop\data\`),
not inside the install directory — so it survives reinstalls/updates and
doesn't need admin rights to write to.

The installer is unsigned, so Windows may display an "unknown publisher"
warning. `signAndEditExecutable` is disabled in the build configuration;
the application currently uses Electron's default icon and executable metadata.

**Build the installer locally.** Previous Windows CI builds stalled during
NSIS packaging; the current workflow validates only the web app. The first
local build downloads Electron and NSIS tools; later builds reuse their cache.
Generated installers are ignored by Git and are not uploaded by the CI workflow.

## CI

`.github/workflows/ci.yml` runs on pushes to `main`, pull requests, and manual
dispatch. On Ubuntu with Node 22, it installs `client/` and `server/`, builds
the frontend, boots the server,
and exercises the real API (`POST /api/login`, then an authenticated
`GET /api/soldiers`) to confirm the seeded data actually comes back —
not just that `npm install`/`npm run build` exit cleanly. It does not build
the desktop installer or test legacy Windows.

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
- The web server defaults to `server/data/registry.sqlite`; set `DATA_DIR`
  to use another folder. The desktop app uses its per-user app-data directory
  described above. Both use the SQLite file format.
- `sql.js` keeps the database in memory and saves snapshots after writes.
  Run only one app/server process per database directory. Close the app or
  stop the server before backing up or restoring `registry.sqlite`.
- Database files are not tracked by Git. To reset to sample data, stop the
  owning app/server and move the database to a backup location; a fresh file
  is created and seeded on next launch.
