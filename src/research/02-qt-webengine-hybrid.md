# 02 · Hybrid: PySide6 shell + web UI inside Qt WebEngine

**One line:** keep the PySide6 application (window, menus, dialogs, printing, licensing) and render screens as web pages in an embedded Chromium (`QWebEngineView`), talking to Python through `QWebChannel`.

## What it is

Qt WebEngine embeds Chromium as a widget. `QtWebChannel` gives peer-to-peer communication between Python objects and JavaScript in the page (supported out of the box by WebEngine). The web screens can be built with React/Vite, as in the interactive preview.

## How it fits piXeval

- The current Qt application stays the host: each screen is a web page opened in a `QWebEngineView`.
- Python services are exposed as channel objects (or the same logic is also exposed over a localhost API).
- Native file/folder dialogs, printing and PDF remain Qt calls.
- Packaging stays PyInstaller + Inno Setup, with QtWebEngine resources added.

## Pros

- **Keeps the existing Qt shell.** Window, menus, printing, licence handling and native dialogs stay exactly as they are; only the screen contents are replaced by web pages.
- **Full web UI ecosystem** (React, component libraries, charts, hot reload, Figma handoff) _and_ full native Qt capabilities (dialogs, printing, drag-drop).
- **No localhost server needed** (the channel is in-process), so no firewall prompts and no port/token security design.
- Same Python runtime and same installer technology as today.
- Frontend can be developed and tested in a normal browser (mock the channel) at full speed.

## Cons

- **Size and memory, measured:** the Windows PySide6 wheels show QtWebEngine at **255.7 MB unpacked (105 MB compressed)**: `Qt6WebEngineCore.dll` alone is 199.5 MB, plus ≈ 40 MB of translations and ≈ 13 MB of resource packs. With the Quick/Qml/Network libraries it needs, the Qt part of the compiled program grows from ≈ 55–90 MB (Widgets only) to **≈ 340–370 MB**, about 135–150 MB more to download on every install and update. More RAM than Widgets is also expected (not measured).
- **PyInstaller + QtWebEngine is fiddly** (`QtWebEngineProcess`, resources, locales, sandbox flags); budget time for build debugging on Windows.
- **Two UI technologies in one process** during the transition; styling and navigation have to be consistent between the Widgets shell and the web content.
- **The bridge is asynchronous** and needs a typed contract. Third-party tools exist (e.g. `pywebchannel` generates TypeScript typings) but they are small projects; plan on owning a thin bridge layer.
- Chromium is pinned to the Qt version, so web-platform updates and security fixes follow Qt releases.
- Licensing: PySide6 and Qt WebEngine are available under LGPL/GPL; confirm distribution obligations before shipping (dynamic linking, notices).
- No path to "just open it in a browser" unless the same frontend is also served over HTTP (possible, but then you are building option 03 as well).

## Advantages over the other options

- vs 01: web ecosystem and speed of UI iteration, without abandoning the Qt app.
- vs 03/04: **offline, no server lifecycle, no localhost port to secure, native Qt dialogs and printing unchanged.**

## Disadvantages versus the other options

- vs 03/04: much heavier (Chromium) and keeps the whole Qt dependency chain; no browser access; harder CI for packaging.
- vs 01: bigger, more moving parts.

## When to choose it

- The existing Qt shell (menus, printing, native dialogs, licence handling) must be kept as-is, no local server is acceptable, and installer size is not a hard constraint.

## Effort and risks

- Effort: moderate-high; the bridge + packaging are the unknowns. Risk: WebEngine packaging on Windows, performance of very large tables inside the web view, double maintenance during the transition.
