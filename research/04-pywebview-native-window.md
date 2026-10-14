# 04 · Local web app in a native window with pywebview

**One line:** same FastAPI + React app as option 03, but shown in a small native window (no browser chrome) created by **pywebview**, which uses the Windows WebView2 engine.

## What it is

pywebview is a Python library that opens a window containing a web view: WebView2 (the Chromium-based Edge engine) on Windows. It can load a URL (the local FastAPI server) or local files, offers a JS↔Python bridge (`js_api`), and provides **native file/folder dialogs** from Python. A recent pywebview release (6.x) is packaged in major distributions.

## How it fits piXeval

```
 pixeval.exe (PyInstaller)
   ├─ FastAPI + Uvicorn in a background thread  (same API as option 03)
   ├─ webview.create_window("piXeval", "http://127.0.0.1:<port>/?token=…")
   └─ js_api: pickFolder(), pickFile(), saveFile()  → returns real paths to the UI
```

- Installer stays PyInstaller + Inno Setup. The WebView2 engine is part of Windows and available on all client machines, so nothing extra is installed.
- The same React build also runs in a normal browser for development and as a fallback ("open in browser" button).

## Pros

- **Everything good about 03, plus a real desktop window** with title bar, icon, single-instance behaviour, and no browser tabs to close by accident.
- **Solves the file-path problem:** folder/file/save dialogs are native and return real paths.
- **Tiny footprint, measured:** pywebview 1.6 MB unpacked (WebView2 Core 0.65 MB, loader DLLs ≈ 0.45 MB, interop ≈ 0.02 MB) plus pythonnet 0.7 MB, so **about 2–3 MB of binaries**, against about 55–90 MB for Qt Widgets and about 340–370 MB with Qt WebEngine. The WebView2 engine itself is part of Windows and is not bundled. With FastAPI, Uvicorn, Pydantic and the front end (0.34 MB for the prototype) the whole UI layer is about 11 MB, smaller than the Qt binaries it replaces.
- **Pure Python entry point**, so no Rust/Node in the shipped app.
- Natural fallback: if the web view is unavailable, open the system browser instead.
- Smaller attack surface than a browser tab (no extensions, controlled navigation).

## Cons

- **pywebview's Windows backend relies on pythonnet** (.NET bridge), which must be bundled correctly by PyInstaller. Prove this early (to be verified).
- **A small project with a small maintainer base**; fewer examples for production packaging than Qt.
- **Limited desktop features out of the box** (tray, notifications and auto-update are minimal, so they would be built separately if needed).
- **Printing/PDF from the web view varies by OS;** server-side PDF generation (already in the codebase) is the safe route.
- **Debugging is harder** than a normal browser (use the browser for development, enable the debug flag when needed).
- Same server lifecycle/security duties as 03 (token, loopback only).

## Advantages over the other options

- vs 03: native window and dialogs, nicer product feel, controlled environment.
- vs 02: **tens to hundreds of MB lighter**; no QtWebEngine packaging; no Qt dependency in the new UI.
- vs 01: web ecosystem, hot reload, design velocity.

## Disadvantages versus the other options

- vs 02: native Qt features (print preview, Qt PDF viewing) need replacing with web or server-side equivalents.
- vs 01: needs a service/API layer and a front-end build chain.

## When to choose it

- You want a desktop-feeling app, small installer, native dialogs, and the best web UI, **without adding a new language to the shipped product.** This is the closest match to "Python runs in the background and the UI opens in an app window or the browser".

## Effort and risks

- Effort: same as 03 plus small glue (window, dialog bridge, WebView2 check). Risks: pythonnet bundling, single-maintainer dependency (mitigated because the fallback is "open in browser", i.e. option 03).
