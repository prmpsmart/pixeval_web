# 09 · Comparison, scoring and roadmap

## Constraint note

- **The main focus is the end user, not the developer.** The primary score measures what the people who use piXeval every day experience: how the product looks and feels, how effective it is, and how it installs, starts and behaves on their computers. Developer convenience is scored separately and weighs less.
- **Windows only:** piXeval is delivered as a Windows installer. Other operating systems are not considered; "consistency" means consistency across users' Windows PCs.
- **WebView2 is available on all client machines** (confirmed by the author), so it is treated as present and not as a prerequisite or a risk.
- Team size, skills and language familiarity are **not constraints**; options are judged on technical merit.
- There is **no incremental migration**: the new UI replaces the old one in one major release.
- **Scores:** **Score A** = end-user experience (primary, weight 80%). **Score B** = ease of implementing it with the Python runtime (secondary, weight 20%). Other weightings are shown so the effect of the choice is visible.

## Decision structure

The choice is made in two steps, because the options are not four equals:

1. **Decision 1: Qt Widgets or web (React etc.)?** Option 01 against the web UI. This is the big decision: it determines the UI/UX ceiling and the toolchain.
2. **Decision 2 (if web): which shell presents it?** The same React front end can be shown three ways:
   - **02** inside the Qt application (**in-app browser, Qt WebEngine**),
   - **04** in a **pywebview** window, with the **external browser as a fallback** when no web view is available,
   - **03** with **Python as a backend and the external browser used directly**.

Sections 5 and 6 give the two decisions; sections 1–4 hold the evidence and scores they rest on, and section 7 combines them.

## 1. Python in the picture: how each option runs

| #   | Option                           | Where Python runs                                            | How the UI talks to it                                                 | What the user launches             |
| --- | -------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------- |
| 01  | PySide6 Widgets, modernised      | same process as the UI                                       | direct function calls and Qt signals                                   | one executable                     |
| 02  | Qt WebEngine hybrid              | same process as the UI                                       | QtWebChannel (asynchronous JS↔Python bridge)                           | one executable containing Chromium |
| 03  | Local web app, browser           | separate FastAPI process started by a launcher               | HTTP + WebSocket/SSE on 127.0.0.1                                      | launcher, then the user's browser  |
| 04  | Local web app + pywebview window | FastAPI server in a background thread of the same executable | HTTP + WebSocket/SSE, plus a small JS↔Python bridge for native dialogs | one executable with its own window |

## 2. Size of the compiled program

The compiled output is what PyInstaller puts in the installer. **Qt binaries are part of it whenever Qt is involved**; the web options replace them with a few megabytes. The figures below are **measured from the Windows wheels on PyPI** (file lists read directly), not from a real build; actual output depends on what PyInstaller collects.

**Shared by every option: the Python engine stack** (unpacked size of the Windows wheels pinned in `requirements.txt`):

| Component              |     Unpacked | Wheel (compressed) |
| ---------------------- | -----------: | -----------------: |
| OpenCV 4.12            |       110 MB |              39 MB |
| SciPy 1.16             |       116 MB |              39 MB |
| NumPy                  |        43 MB |              13 MB |
| pandas                 |        39 MB |              11 MB |
| scikit-image           |        25 MB |              13 MB |
| matplotlib             |        20 MB |               8 MB |
| Pillow, reportlab      |        11 MB |               5 MB |
| **Engine stack total** | **≈ 364 MB** |       **≈ 127 MB** |

**Differs by option: the UI layer**

| UI layer               | What is bundled                                                                                                                                                                                           |                    Unpacked | Wheel-compressed |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------: | ---------------: |
| 01 Qt Widgets          | Qt6 Core 9.9, Gui 9.4, Widgets 6.5, Pdf 5.7, PrintSupport 0.4 MB; PySide6 modules ≈ 12 MB; plugins ≈ 5 MB; optionally software OpenGL 20.6 MB and translations ≈ 12 MB                                    |   **≈ 55–90 MB** (estimate) |       ≈ 20–33 MB |
| 02 Qt WebEngine hybrid | everything in 01, **plus** QtWebEngine (`Qt6WebEngineCore.dll` 199.5 MB, translations ≈ 40 MB, resource packs ≈ 13 MB: 255.7 MB in total, measured) **plus** Quick/Qml/Network/OpenGL/Positioning ≈ 26 MB | **≈ 340–370 MB** (estimate) |     ≈ 135–150 MB |
| 03 Browser             | FastAPI, Uvicorn, Starlette, Pydantic ≈ 8.9 MB; web front end 0.34 MB (the prototype's build: 322 KB JS + 22 KB CSS); **no Qt, no browser engine**                                                        |                  **≈ 9 MB** |           ≈ 3 MB |
| 04 pywebview window    | everything in 03, **plus** pywebview 1.6 MB (WebView2 loader and interop DLLs ≈ 1 MB) and pythonnet 0.7 MB; **the WebView2 engine itself is not bundled** (it is part of Windows, shared with Edge)       |                 **≈ 11 MB** |           ≈ 4 MB |

**Totals (known components)**

|                 |     Unpacked | Wheel-compressed (download proxy) |                 Compared with 04 |
| --------------- | -----------: | --------------------------------: | -------------------------------: |
| 01 Qt Widgets   | ≈ 420–455 MB |                      ≈ 147–160 MB |                 **+12 to +21 %** |
| 02 Qt WebEngine | ≈ 705–735 MB |                      ≈ 263–276 MB | **+88 to +96 %** (almost double) |
| 03 Browser      |     ≈ 373 MB |                          ≈ 130 MB |                             −1 % |
| 04 pywebview    |     ≈ 375 MB |                          ≈ 131 MB |                        reference |

Observations:

1. **pywebview adds about 2–3 MB of binaries; Qt adds about 55–90 MB (Widgets) or about 340–370 MB (with WebEngine).** The web shells that avoid Qt are the smallest options, and **04 is smaller than today's Qt Widgets build by roughly 45–80 MB** (12–21 %) once PySide6 is removed from the bundle.
2. **That saving requires removing Qt from the compiled program.** About seven non-UI files still import Qt (finding F1 of the report); the service-layer step removes them. Without that step PySide6 stays in the bundle.
3. **The UI layer is a large share of the output.** The engine stack is about 364 MB (led by OpenCV and SciPy); Qt Widgets adds about 12–21 % to it, and Qt WebEngine nearly doubles the program.
4. **Download and update time:** 02's UI layer is about 135–150 MB compressed against about 4 MB for 04, roughly 2 minutes extra at 10 Mbit/s on every install and every update.
5. Not measured: Python runtime, other dependencies (Google clients etc.), PyInstaller overhead, Inno Setup compression. A real build is the first validation task.

## 3. Score A: end-user experience (primary)

| Criterion (weight within A)                | What the end user feels                                                                                                                                    |     01 |     02 |     03 |     04 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Aesthetics and modern look (25)            | typography, spacing, shadows, blur, dark mode, polish                                                                                                      |      2 |      5 |      5 |      5 |
| Pleasing interaction (15)                  | transitions, hover/focus feedback, responsiveness                                                                                                          |      2 |      5 |      5 |      5 |
| Effectiveness (20)                         | dense tables, search/filter, command palette, keyboard use, clear feedback, charts, accessibility                                                          |      3 |      5 |      5 |      5 |
| Consistency across users' Windows PCs (10) | looks and behaves the same on every Windows machine                                                                                                        |      5 |      5 |      3 |      4 |
| Install and launch (10)                    | start-up time, no prerequisites, feels like an application                                                                                                 |      5 |      3 |      3 |      4 |
| Native desktop behaviour (10)              | real file/folder pickers, printing, drag-and-drop, works offline                                                                                           |      5 |      5 |      2 |      4 |
| **Size of the compiled program (10)**      | installer and installed size, download and update time (section 2); 5 = smallest, 4 = up to +10 % over it, 3 = +10–25 %, 2 = +25–60 %, 1 = more than +60 % |      3 |      1 |      5 |      5 |
| **Score A (0–100)**                        |                                                                                                                                                            | **64** | **88** | **86** | **94** |

What an end user would notice:

- **01** is fast to start and behaves like any desktop program, but screens look dated and the interface stays plain. The program carries 55–90 MB of Qt.
- **02** gives the most polished, most consistent interface, but the program is almost twice the size of 04, every install and update is about 135–150 MB (compressed) bigger, and start-up is slower because a full browser engine is inside it.
- **03** looks as good as 02, is the smallest, but is a browser tab: it launches a server and a browser, cannot offer proper folder pickers, and depends on which browser the user has (Edge and Chrome share an engine; Firefox does not).
- **04** looks as good as 02, opens in its own window like a normal program, uses native file and folder pickers, and is smaller than today's program. It uses the Edge WebView2 engine, which is present on all client machines; if it were ever missing, the program falls back to the browser (03 behaviour).

## 4. Score B: ease of implementing it with the Python runtime (secondary)

| Criterion (weight within B)     | What it asks                                                      |     01 |     02 |     03 |     04 |
| ------------------------------- | ----------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Engine integration (30)         | calling Python code, progress events for scans/backups, threading |      5 |      4 |      4 |      4 |
| Build and packaging effort (30) | PyInstaller, runtimes to bundle, signing, release pipeline        |      5 |      2 |      4 |      3 |
| Moving parts to test (20)       | toolchains, process boundaries, bridge/API contracts              |      5 |      2 |      3 |      3 |
| Reuse of existing work (20)     | FastAPI already in the stack, existing prototype, service layer   |      2 |      4 |      5 |      5 |
| **Score B (0–100)**             |                                                                   | **88** | **60** | **80** | **74** |

Developer-only conveniences (hot reload, design handoff, large ecosystems) are **not** scored; they matter only through the end-user result they make possible.

## 5. Decision 1: Qt Widgets or web?

|                                        |                     01 Qt Widgets |                               Web UI (02, 03, 04) |
| -------------------------------------- | --------------------------------: | ------------------------------------------------: |
| Aesthetics, interaction, effectiveness |                           2, 2, 3 |                                           5, 5, 5 |
| Consistency across users' Windows PCs  |                                 5 |                                               3–5 |
| Install and launch                     |                                 5 |                                               3–4 |
| Native desktop behaviour               |                                 5 |                        2–5 (depends on the shell) |
| Size of the compiled program           | 3 (≈ 420–455 MB, 12–21 % over 04) | 1–5 (≈ 373–375 MB for 03/04; ≈ 705–735 MB for 02) |
| **Score A: end-user experience**       |                            **64** |                                         **86–94** |
| **Score B: ease with Python**          |                            **88** |                                         **60–80** |

**Verdict: web.** The web options give end users a clearly better interface (5 against 2–3 on looks, interaction and effectiveness), and the best web shells are **smaller than the Qt build**, because they drop Qt's binaries. Qt Widgets' end-user disadvantages are **structural**: QSS has no layout engines, real shadows, blur or transitions, and every modern component is painted by hand. The web's disadvantages are **identifiable tasks** (native dialogs, removing Qt from the engine, one packaging pipeline).

Qt Widgets overtakes the best web shell (04) only if end-user experience carries **less than about 32% of the weight** (against 03: 27%; against 02: 54%). At the 80% used here the web options win by 14–21 combined points.

## 6. Decision 2: which web shell?

All three show the same React front end, so the look and interaction are identical. What differs for the end user is rendering consistency, size, install and launch, and native behaviour.

| Aspect                       | **02 In-app browser (Qt WebEngine)**     | **04 pywebview window, external-browser fallback**                                                 | **03 Python backend + external browser**                               |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Look and interaction         | identical                                | identical                                                                                          | identical                                                              |
| Rendering consistency        | identical on every PC (bundled Chromium) | very close: Edge WebView2 is Chromium-based, present on all client machines and updated by Windows | depends on the browser (Edge/Chrome share an engine; Firefox does not) |
| What the user sees           | the Qt application window                | a small native window, no browser chrome                                                           | a browser tab or window                                                |
| **Compiled program (total)** | **≈ 705–735 MB** (UI layer ≈ 340–370 MB) | **≈ 375 MB** (UI layer ≈ 11 MB; pywebview ≈ 2–3 MB of binaries, no Qt)                             | **≈ 373 MB** (UI layer ≈ 9 MB)                                         |
| Download / update            | ≈ 263–276 MB                             | ≈ 131 MB                                                                                           | ≈ 130 MB                                                               |
| Start-up                     | slower (Chromium engine)                 | fast                                                                                               | server start, then the browser opens                                   |
| Prerequisites                | none                                     | none (WebView2 present on all clients)                                                             | a modern browser                                                       |
| File/folder pickers          | native (Qt)                              | native (pywebview); in fallback mode via the server                                                | not available from a browser; typed or server-opened                   |
| Printing / PDF               | Qt print and PDF                         | web view or server-side PDF                                                                        | browser or server-side PDF                                             |
| Works offline                | yes                                      | yes                                                                                                | yes                                                                    |
| Fallback                     | not applicable                           | launcher opens the external browser if the window cannot start                                     | not applicable                                                         |
| Engine security updates      | need a new piXeval release               | WebView2 updates itself through Windows                                                            | follow the user's browser                                              |
| Score A / B                  | 88 / 60                                  | **94 / 74**                                                                                        | 86 / 80                                                                |

Notes:

- **04 leads 02 for the end user (94 against 88):** 02 is slightly more consistent, but almost twice as large, slower to start, and slower to update. 04 is also easier to implement (74 against 60).
- **The fallback is a launcher feature, not something pywebview does by itself,** and with WebView2 on every client it is only a safety net. In fallback mode the experience drops to 03's.
- **03 alone** is the smallest and simplest to ship, but is the weakest web option for end users (86): no native pickers and a look that depends on the browser.

**Verdict: 04**, with the external browser as a safety-net fallback. 02 is preferred only if a guaranteed identical rendering engine matters more than a program almost twice the size, or if a local server is unacceptable.

## 7. Combined result and sensitivity

| Option                           | Score A: end-user experience | Score B: ease with Python | **Combined (A 80 / B 20)** |
| -------------------------------- | ---------------------------: | ------------------------: | -------------------------: |
| 01 PySide6 Widgets, modernised   |                           64 |                    **88** |                       68.8 |
| 02 Qt WebEngine hybrid           |                           88 |                        60 |                       82.4 |
| 03 Local web app, browser        |                           86 |                        80 |                       84.8 |
| **04 Local web app + pywebview** |                       **94** |                        74 |                   **90.0** |

Two-axis view (end-user experience up, ease of implementation right):

```
 end-user  94 |                   04
 experience  88 |        02
          86 |                   03
             |
          64 |                              01
             +-----------------------------------
               60        74  80       88   ease with Python
```

Sensitivity to the weight on end-user experience (A):

| Weight on A               |       01 |   02 |       03 |       04 |
| ------------------------- | -------: | ---: | -------: | -------: |
| 100 % (end user only)     |     64.0 | 88.0 |     86.0 | **94.0** |
| 90 %                      |     66.4 | 85.2 |     85.4 | **92.0** |
| 80 % (used)               |     68.8 | 82.4 |     84.8 | **90.0** |
| 70 %                      |     71.2 | 79.6 |     84.2 | **88.0** |
| 60 %                      |     73.6 | 76.8 |     83.6 | **86.0** |
| 50 %                      |     76.0 | 74.0 |     83.0 | **84.0** |
| 40 %                      |     78.4 | 71.2 | **82.4** |     82.0 |
| 30 %                      | **80.8** | 68.4 |     81.8 |     80.0 |
| 0 % (developer ease only) | **88.0** | 60.0 |     80.0 |     74.0 |

Sensitivity to the weight of the size criterion within A (others scaled pro-rata; combined score at A 80 / B 20):

| Size weight within A |   01 |   02 |   03 |       04 |
| -------------------- | ---: | ---: | ---: | -------: |
| 0 % (size ignored)   | 69.1 | 88.5 | 83.5 | **89.4** |
| 10 % (used)          | 68.8 | 82.4 | 84.8 | **90.0** |
| 20 %                 | 68.5 | 76.3 | 86.1 | **90.6** |
| 30 %                 | 68.1 | 70.3 | 87.3 | **91.0** |

Conclusions:

1. **For end users the web options win clearly:** 86–94 against 64 for Qt Widgets. Qt Widgets leads only when developer ease outweighs end-user experience (end-user weight below about 32%).
2. **04 ranks first at every end-user weight from 100% down to about 43%**, below which 03 leads until developer ease dominates.
3. **Size is what holds 02 back.** If size is ignored, 02 rises to 88.5, within one point of 04 (89.4); at the weight used (10 %) it falls to 82.4 (third); at higher weights it falls further.
4. **The size advantage of the web shells depends on removing Qt from the compiled program.** Without that, PySide6 (≈ 55–90 MB) stays in the bundle and 04 would be about the size of 01.

## 8. Cross-cutting prerequisites (needed by every option)

1. **Extract a service layer** from the 103 UI files that call the data layer directly; define use-case functions (e.g. `grades.list(exam_id)`, `correction.run(folder)`).
2. **Replace Qt signals in logic code** (`SignalInstance` in `cat_lib`, `utils`) with callbacks/events; remove the 7 Qt imports from non-UI modules.
3. **Define a single writer** for SQLite (two UIs open at once must not corrupt/lock the DB).
4. **Characterisation tests** on grading formulas, OMR outputs and report generation before refactoring.

## 9. Suggested roadmap (one major release)

| Phase | Work                                                                                                                                                        | Output                                                    | Exit criterion                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| 0     | Review this report; run the validation spike (real bundle sizes with and without Qt, native dialogs, table performance)                                     | decision record                                           | sign-off                                                            |
| 1     | Service layer + progress events + characterisation tests (no UI change)                                                                                     | Python package `pixeval_core` used by the existing Qt app | existing app unchanged and green                                    |
| 2     | FastAPI API for every use case; web UI built screen by screen against it, with the existing prototype as the starting point                                 | complete new UI in a development branch                   | parity checklist: every current screen, dialog and report           |
| 3     | Native dialogs via pywebview; OMR/correction flows with event stream; packaging (PyInstaller + Inno); automatic opening and migration of existing databases | installable release candidate                             | passes end-to-end tests on real databases                           |
| 4     | Closed beta with real users and real databases; fix defects; keep the previous installer available for rollback                                             | beta sign-off                                             | no blocking defects for an agreed period                            |
| 5     | Publish as the next major version                                                                                                                           | release                                                   | users on the new version; legacy installer retained for one release |

## 10. Sources

- Qt documentation, _User Interfaces_ (Widgets vs Qt's declarative stack; notes on animation and complex desktop apps): <https://doc.qt.io/qt-6.9/topics-ui.html>
- Qt for Python, _QtWebChannel_: <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
- Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_: <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
- PyPI release metadata and wheel file lists for the Windows wheels of PySide6 6.9.0 (Essentials, Addons), OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview and pythonnet (size figures in section 2): <https://pypi.org>
- pywebview 6.x package listing: <https://www.archlinux.org/packages/extra/any/python-pywebview>
