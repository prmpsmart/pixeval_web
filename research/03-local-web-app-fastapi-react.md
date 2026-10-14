# 03 · Local web app: Python (FastAPI) + React, opened in the browser

**One line:** double-click pixeval → the Python engine starts a local web server → the UI opens in the user's browser. Python stays the product; the UI becomes a web front end.

This is the architecture that the preview in this repository is built for (`https://prmpsmart.github.io/pixeval_web/`). Option 04 is the same architecture with a native window instead of a browser tab.

## How it works

```
 pixeval launcher (PyInstaller exe)
   ├─ starts Uvicorn on 127.0.0.1:<free port>   ← FastAPI app (already in requirements.txt)
   │     ├─ /api/*   thin routes → service layer → db / omr / cat_lib / dataReports (existing code)
   │     ├─ /events  progress for scans, backups, corrections (SSE or WebSocket)
   │     └─ /*       the built React app (static files from `npm run build`)
   └─ opens the default browser (or Chrome/Edge in `--app=` mode for a window without browser chrome)
```

- Console/terminal window can be hidden (windowed exe, tray icon) or kept as a log view.
- Local data stays in SQLite exactly as today.

## Pros

- **Best UI/UX ecosystem available** for the same effort: components, charts, tables, accessibility, i18n, animation, dark mode, responsive layouts, Figma-to-CSS handoff, hot reload, browser dev-tools.
- **No Qt, no Chromium bundled.** The user's browser is the renderer: the UI layer is about 9 MB (FastAPI/Uvicorn/Starlette/Pydantic ≈ 8.9 MB, the front end 0.34 MB), smaller than the Qt binaries it replaces (≈ 55–90 MB).
- **Reuses the Python engine and FastAPI**, already present in the repo.
- **Designs and prototypes are directly reusable** (the React preview already contains every screen and dialog).
- **Testable:** `pytest` on the API, Playwright on the UI; CI is straightforward.
- **Opens future doors without extra spend:** the same API can later serve a LAN/server install or remote scoring stations.
- Long jobs become cleaner: background tasks + event stream instead of passing Qt signals into logic.
- Separation of concerns forces the service layer the codebase needs anyway.

## Cons

- **Browsers cannot give Python real file paths.** piXeval relies on folder paths (scan folders, backups, exports). Options: ask the _server_ to show a native dialog (Tk/pywebview), type/paste paths, or upload files. This is the single biggest functional gap versus Qt (fixed in 04).
- **Server lifecycle to manage:** pick a free port, shut down when the last tab closes, handle a second launch, show something useful if the user closes the terminal.
- **Security design is required** even on localhost: bind to 127.0.0.1 only, per-launch access token, strict CORS/Origin checks (other local processes and web pages can call localhost).
- **Antivirus/firewall prompts** can appear for a program that opens a socket (usually none for loopback, but corporate endpoint tools differ).
- **Browser variance and user error:** different browsers/versions, tabs closed by mistake, multiple tabs editing the same SQLite file.
- **Printing and PDF** are driven by the browser or by server-side generation (reportlab/xhtml2pdf already exist), not by `QtPrint`.
- **A second language and toolchain for the UI** (TypeScript; Node is needed only to _build_, end users need neither).
- Looks like "a website", not a desktop program, to some users.

## Advantages over the other options

- vs 01: far better components and design velocity; no Qt styling limits.
- vs 02: no Chromium in the installer; simpler packaging; no bridge.
- vs 04: simplest and smallest; nothing extra to ship.

## Disadvantages versus the other options

- vs 04: no native window, no native file dialogs, depends on the user's browser.
- vs 01: needs a service/API layer and a front-end build chain.

## When to choose it

- Fastest route to a modern UI with minimal install weight, and the team accepts a "runs in the browser" product.
- You want the door open to LAN/remote/multi-user later.

## Effort and risks

- Effort: service-layer extraction + API (shared with every option) + UI port. Risks: file-path handling, lifecycle/security hardening, SQLite concurrency if two UIs are open.
- Mitigations: pick option 04 for the window and native dialogs; keep the API single-writer.
