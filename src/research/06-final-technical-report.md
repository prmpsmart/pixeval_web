# Technical Report: Options for Modernising the piXeval User Interface

**Subject:** piXeval 7.6.2 (OMR examination management system)
**Prepared by:** Miracle Apata, BEng
**Status:** draft for review — supporting notes are in this folder
**Companion artefact:** interactive prototype, <https://prmpsmart.github.io/pixeval_web/>

---

## Abstract

piXeval is a Python desktop application for Windows whose user interface is built with PySide6 (Qt Widgets). The interface comprises about 71,000 lines of code and is the main constraint on usability and visual quality for the people who use it every day, whereas the processing engine (OMR, database, reports) is about 21,000 lines and is largely independent of Qt. This report evaluates ways of improving the interface while keeping the Python engine and incurring no licence or hosting cost, as two decisions. **Decision 1:** modernise Qt Widgets (01) or move to a web front end (React etc.). **Decision 2**, if web: present it as an in-app browser inside Qt (Qt WebEngine, 02), in a pywebview window with the external browser as a safety-net fallback (04), or with Python as a backend and the external browser used directly (03). The migration will happen once, as a single major release. The **main focus is the end user**: the primary score (80%) measures what users experience (aesthetics and modern look, pleasing interaction, effectiveness, consistency, install and launch, native behaviour, and **the size of the compiled program**); a secondary score (20%) measures ease of implementation with the Python runtime. Measured from the Windows wheels, Qt adds about 55–90 MB to the compiled output (Widgets) or about 340–370 MB (with WebEngine), whereas pywebview adds about 2–3 MB of binaries and the whole web UI layer about 11 MB (the Edge WebView2 engine is part of Windows and is available on all client machines). The web options score 86–94 out of 100 for end-user experience against 64 for Qt Widgets, which is easier to implement (88 against 60–80). Qt Widgets wins only if end-user experience carries less than about a third of the weight. Among web shells, the pywebview window ranks first (94) ahead of the in-app Qt browser (88), which is held back by its size (almost twice the compiled program) and start-up. The recommended direction is **a Python (FastAPI) engine with a web user interface presented in a native pywebview window, with "open in browser" as a fallback**, preceded by a service-layer refactoring that is necessary under every option. Several quantities (real installer size, start-up time, large-table performance) were not measured on a real build and are listed as validation tasks.

---

## 1. Introduction

### 1.1 Background

piXeval supports the full lifecycle of a paper-based multiple-choice examination: question banks, exam composition, answer-sheet generation, scanning and optical mark recognition (OMR), identity assignment, correction, grades and reports. It is distributed as a Windows installer built with PyInstaller and Inno Setup.

### 1.2 Problem statement

Users interact with the product through a Widgets-based interface styled with Qt Style Sheets. Producing a contemporary look and interaction quality (animated transitions, dense but legible tables, command search, responsive layouts, consistent design tokens) is slow and costly in this stack. The question is whether a different UI technology offers a better user experience at acceptable cost and risk.

### 1.3 Objectives and constraints

1. **Primary: the end user.** Improve what users see and experience every day: a pleasing, effective, aesthetic and modern interface that also installs, starts and behaves well on their computers. Developer convenience is secondary.
2. **Secondary:** make that experience straightforward to implement and ship with the Python engine in the picture (the engine itself is kept).
3. Introduce **no new recurring cost** (licences, hosting, subscriptions).
4. Preserve the installed-application experience on **Windows** (the only target platform): launch, work offline, access local files and scanner output.
5. Migrate **once**: the new interface replaces the old one in a single major release pushed to all users. There is no incremental or side-by-side migration, so release reliability and feature parity matter more.
6. Team size, skills and language familiarity are **not** treated as constraints. Options are judged on technical merit; a new language is not counted as a cost in itself, whereas extra runtimes, build pipelines and process boundaries are.

### 1.4 Scope

Only the presentation layer and its integration with the engine are considered. OMR algorithms, grading rules and the database schema are unchanged.

---

## 2. Analysis of the current system

Measured from the repository (details in [00-baseline-current-stack.md](00-baseline-current-stack.md)):

| Layer                                                 |    Files |          Lines | Qt dependency |
| ----------------------------------------------------- | -------: | -------------: | ------------- |
| UI (`src/ui`)                                         |      194 |         71,077 | complete      |
| Redesign in progress (`src/modern_ui`)                |       28 |          2,301 | complete      |
| Database (`src/db`)                                   |        7 |          3,648 | 1 file        |
| OMR (`src/omr`, plus equal-size copy `src/omr_audit`) | 16 (+16) | 6,704 (+6,704) | none          |
| CAT engine wrapper (`src/cat_lib`)                    |       13 |          4,832 | 3 files       |
| Reports (`src/dataReports`)                           |        9 |            830 | 1 file        |
| Utilities (`src/utils`)                               |       28 |          5,242 | 2 files       |

Findings that drive the analysis:

- **F1 — The engine is separable.** About 21,000 lines of logic use Qt in only about seven files, mostly for progress signals and image types.
- **F2 — The UI is the larger body of work.** It is roughly 3.4 times the size of the engine. Whatever technology is chosen, a redesign means re-implementing the screens; the existing `modern_ui` effort is itself such a rewrite and is about 3% complete by line count.
- **F3 — Presentation and logic are interleaved.** 103 of 194 UI files import the data layer, and screens such as grades read and mutate domain objects directly. A service layer is therefore a prerequisite for any new front end.
- **F4 — A web stack is already present.** FastAPI 0.115, Uvicorn and Starlette are in the requirements and used by the remote CAT service.
- **F5 — Packaging is established.** PyInstaller + Inno Setup deliver a Windows installer; any option should reuse it where possible.
- **F6 — Native file dialogs are used** (nine call sites in five files for scan, backup and export folders). Folder paths are an operational requirement, which affects browser-only solutions.

---

## 3. Evaluation method

### 3.1 Two scores

**Score A: end-user experience (primary, 80% of the combined score).**

| Criterion                             | Weight within A | What the end user feels                                                                           |
| ------------------------------------- | --------------: | ------------------------------------------------------------------------------------------------- |
| Aesthetics and modern look            |              25 | typography, spacing, shadows, blur, dark mode, polish                                             |
| Pleasing interaction                  |              15 | transitions, hover/focus feedback, responsiveness                                                 |
| Effectiveness                         |              20 | dense tables, search/filter, command palette, keyboard use, clear feedback, charts, accessibility |
| Consistency across users' Windows PCs |              10 | looks and behaves the same on every Windows machine (versions, browsers, runtimes)                |
| Install and launch                    |              10 | start-up time, prerequisites, feels like an application                                           |
| Native desktop behaviour              |              10 | real file/folder pickers, printing, drag-and-drop, works offline (finding F6)                     |
| **Size of the compiled program**      |              10 | installer and installed size, download and update time (measured from Windows wheels, §5.1)       |

**Score B: ease of implementing it with the Python runtime (secondary, 20%).**

| Criterion                  | Weight within B | Question                                                          |
| -------------------------- | --------------: | ----------------------------------------------------------------- |
| Engine integration         |              30 | calling Python code, progress events for scans/backups, threading |
| Build and packaging effort |              30 | PyInstaller, runtimes to bundle, signing, release pipeline        |
| Moving parts to test       |              20 | toolchains, process boundaries, bridge/API contracts              |
| Reuse of existing work     |              20 | FastAPI already in the stack, existing prototype, service layer   |

Developer-only conveniences (hot reload, design handoff, large ecosystems) are deliberately **not** scored; they matter only through the end-user result they make possible.

### 3.2 Method and limitations

Each option is scored 1–5 per criterion from documentation, published guides and the code metrics above. **Scores are expert judgement and not measurements.** The three web options score the same on look, interaction and effectiveness by construction (same web platform); they are separated by consistency, install/launch and native behaviour, and by Score B. No benchmark of any option inside piXeval, and no usability test with real users, has yet been performed.

---

## 4. Candidate solutions

Full write-ups with pros, cons and comparisons are in [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md) and [04](04-pywebview-native-window.md); the scoring is in [05](05-comparison-and-roadmap.md).

**01 — Modernise PySide6 Widgets.** Lowest technical risk and best native integration; offline, single process, no new tools. But QSS is a CSS subset (no layout engines, effects or transitions), every modern component is custom-built, iteration is slow, and the ecosystem of ready-made components is small. It does not avoid the ~70k-line UI rewrite; it only keeps the toolkit. _Reason to choose:_ an extra process boundary or runtime is unacceptable. _Reason not to:_ lowest UI ceiling.

**02 — Qt WebEngine hybrid.** Embed web screens (Chromium) in the existing Qt application and bridge with QtWebChannel. It keeps the existing Qt shell (window, menus, printing, native dialogs) and needs no local server. The costs are the size of the compiled program (QtWebEngine adds about 256 MB of files on top of Qt Widgets' 55–90 MB), the packaging complexity of Chromium, and an asynchronous bridge. With a one-shot release, its main strength (screen-by-screen migration) is not needed. _Reason to choose:_ the Qt shell must be kept as-is and no local server is acceptable. _Reason not to:_ by far the heaviest of the four (about 340–370 MB of Qt in the compiled program, almost doubling it).

**03 — Local web application in the browser.** FastAPI serves a React interface; a launcher opens the default browser. Maximum design freedom and ecosystem, minimal installer growth, and it reuses FastAPI. Browsers cannot return real file paths, a localhost server needs lifecycle and security hardening (loopback binding, tokens, origin checks), and the product feels like a website. _Reason to choose:_ fastest, lightest path. _Reason not to:_ file-path handling and desktop feel.

**04 — Local web application in a pywebview window.** 03 plus a native window that uses the operating system's web view and native file dialogs. It resolves 03's main functional gap, adds no Chromium bundle (the WebView2 engine is part of Windows and present on all client machines), adds only about 2–3 MB of binaries to the compiled program, and keeps the PyInstaller pipeline. Costs: dependence on pywebview's pythonnet-based Windows backend, a small maintainer base, and limited desktop extras (no built-in auto-update or tray). _Reason to choose:_ desktop feel with the smallest shipped footprint. _Reason not to:_ depends on a correct PyInstaller bundle of pywebview and pythonnet, to be proven in the validation spike.

---

## 5. Comparative analysis

### 5.1 Size of the compiled program

Qt binaries are part of the compiled output whenever Qt is involved. The figures are **measured from the Windows wheels on PyPI** (file lists of PySide6 6.9.0 Essentials and Addons, OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview, pythonnet), not from a real build. Full tables are in [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

| UI layer        | What is bundled                                                                                                                                            | Added unpacked | Added compressed |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------: | ---------------: |
| 01 Qt Widgets   | Qt6 Core/Gui/Widgets/Pdf/PrintSupport, PySide6 modules, plugins (optionally software OpenGL, translations)                                                 |     ≈ 55–90 MB |       ≈ 20–33 MB |
| 02 Qt WebEngine | the above **plus** `Qt6WebEngineCore.dll` (199.5 MB), translations, resource packs (255.7 MB of WebEngine files in total) and Quick/Qml/Network ≈ 26 MB    |   ≈ 340–370 MB |     ≈ 135–150 MB |
| 03 Browser      | FastAPI/Uvicorn/Starlette/Pydantic ≈ 9 MB, web front end 0.34 MB; no Qt, no browser engine                                                                 |         ≈ 9 MB |           ≈ 3 MB |
| 04 pywebview    | the above **plus** pywebview 1.6 MB (WebView2 loader and interop DLLs ≈ 1 MB) and pythonnet 0.7 MB; the WebView2 engine is part of Windows and not bundled |        ≈ 11 MB |           ≈ 4 MB |

| Whole compiled program |     Unpacked | Compressed (proxy) | Compared with 04 |
| ---------------------- | -----------: | -----------------: | ---------------: |
| 01 Qt Widgets          | ≈ 420–455 MB |       ≈ 147–160 MB |     +12 to +21 % |
| 02 Qt WebEngine        | ≈ 705–735 MB |       ≈ 263–276 MB |     +88 to +96 % |
| 03 Browser             |     ≈ 373 MB |           ≈ 130 MB |             −1 % |
| 04 pywebview           |     ≈ 375 MB |           ≈ 131 MB |        reference |

- **pywebview does not have Qt-like binaries:** it adds about 2–3 MB, against about 55–90 MB for Qt Widgets and 340–370 MB with WebEngine.
- **The shared engine stack is about 364 MB unpacked (≈ 127 MB compressed),** led by OpenCV (110 MB) and SciPy (116 MB). The UI layer is therefore a large share of the output: Qt Widgets adds 12–21 %, and Qt WebEngine nearly doubles the program.
- **The web shells are smaller than today's Qt build only if Qt is removed from the compiled program,** which requires removing the ~7 non-UI files that import Qt (finding F1).
- Not measured: Python runtime, other dependencies, PyInstaller overhead, installer compression. A real build is the first validation task.

### 5.2 Decision 1: Qt Widgets or web?

|                                                        |                     01 Qt Widgets |                               Web UI (02, 03, 04) |
| ------------------------------------------------------ | --------------------------------: | ------------------------------------------------: |
| Aesthetics, interaction, effectiveness (looks and use) |                           2, 2, 3 |                                           5, 5, 5 |
| Consistency, install and launch, native behaviour      |                           5, 5, 5 |              3–5, 3–4, 2–5 (depends on the shell) |
| Size of the compiled program                           | 3 (≈ 420–455 MB, 12–21 % over 04) | 1–5 (≈ 373–375 MB for 03/04; ≈ 705–735 MB for 02) |
| **Score A: end-user experience**                       |                            **64** |                                         **86–94** |
| **Score B: ease with Python**                          |                            **88** |                                         **60–80** |

The web options give end users a clearly better interface, and the best web shells are **smaller than the Qt build** because they drop Qt's binaries. The limits of Qt Widgets are structural (QSS has no layout engines, real shadows, blur or transitions; modern components are painted by hand); the web's costs are identifiable tasks. Qt Widgets overtakes the best web shell only if end-user experience carries less than about 32% of the weight (against 03: 27%; against 02: 54%).

### 5.3 Decision 2: which web shell?

| Aspect                       | **02 In-app browser (Qt WebEngine)**     | **04 pywebview window + browser fallback**                                             | **03 Python backend + external browser** |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| Look and interaction         | identical                                | identical                                                                              | identical                                |
| Rendering consistency        | identical on every PC                    | very close (Edge WebView2, Chromium-based, present on all clients, updated by Windows) | depends on the browser                   |
| What the user sees           | the Qt application window                | a small native window                                                                  | a browser tab or window                  |
| **Compiled program (total)** | **≈ 705–735 MB** (UI layer ≈ 340–370 MB) | **≈ 375 MB** (UI layer ≈ 11 MB)                                                        | **≈ 373 MB** (UI layer ≈ 9 MB)           |
| Download / update            | ≈ 263–276 MB                             | ≈ 131 MB                                                                               | ≈ 130 MB                                 |
| Start-up                     | slower                                   | fast                                                                                   | server, then the browser                 |
| Prerequisites                | none                                     | none (WebView2 present on all clients)                                                 | a modern browser                         |
| File/folder pickers          | native (Qt)                              | native (pywebview); via the server in fallback mode                                    | not from a browser                       |
| Score A / B                  | 88 / 60                                  | **94 / 74**                                                                            | 86 / 80                                  |

The fallback is a launcher feature, not behaviour built into pywebview: the launcher tries the window and opens the default browser at the same address if that fails. With WebView2 on every client it is a safety net only. 04 and 03 are one code base with two presentation modes.

### 5.4 Combined scores

| Option                    | Score A: end-user experience | Score B: ease with Python | **Combined (A 80 / B 20)** |
| ------------------------- | ---------------------------: | ------------------------: | -------------------------: |
| 01 Qt Widgets, modernised |                           64 |                    **88** |                       68.8 |
| 02 Qt WebEngine hybrid    |                           88 |                        60 |                       82.4 |
| 03 Browser                |                           86 |                        80 |                       84.8 |
| **04 pywebview window**   |                       **94** |                        74 |                   **90.0** |

Per-criterion scores, reasons and the two-axis view are in [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

### 5.5 Sensitivity

| Weight on A               |       01 |   02 |       03 |       04 |
| ------------------------- | -------: | ---: | -------: | -------: |
| 100 % (end user only)     |     64.0 | 88.0 |     86.0 | **94.0** |
| 80 % (used)               |     68.8 | 82.4 |     84.8 | **90.0** |
| 60 %                      |     73.6 | 76.8 |     83.6 | **86.0** |
| 50 %                      |     76.0 | 74.0 |     83.0 | **84.0** |
| 40 %                      |     78.4 | 71.2 | **82.4** |     82.0 |
| 30 %                      | **80.8** | 68.4 |     81.8 |     80.0 |
| 0 % (developer ease only) | **88.0** | 60.0 |     80.0 |     74.0 |

| Weight of the size criterion within A |   01 |   02 |   03 |       04 |
| ------------------------------------- | ---: | ---: | ---: | -------: |
| 0 % (size ignored)                    | 69.1 | 88.5 | 83.5 | **89.4** |
| 10 % (used)                           | 68.8 | 82.4 | 84.8 | **90.0** |
| 30 %                                  | 68.1 | 70.3 | 87.3 | **91.0** |

Interpretation:

1. **For end users the web options win clearly** (86–94 against 64). Qt Widgets leads only when developer ease outweighs end-user experience (end-user weight below about 32%).
2. **04 ranks first at every weight from 100% down to about 43%.**
3. **Size is what holds 02 back.** If size is ignored, 02 is within one point of 04 (88.5 against 89.4); at the weight used it falls to 82.4 (third), and further as size matters more.

### 5.6 Experience from the end user's side

- **01:** starts fast and feels like a normal desktop program, but the screens look dated; the program carries 55–90 MB of Qt.
- **02:** the most polished and consistent interface, but the program is almost twice the size of 04, every install and update is about 135–150 MB (compressed) bigger, and the start is slower.
- **03:** looks as good as the others and is the smallest, but lives in a browser tab: no proper folder pickers, a look that depends on the user's browser.
- **04:** looks as good as 02, opens in its own window, uses native pickers, starts fast and is smaller than today's installer; it uses the Edge WebView2 engine already on every client.

---

## 6. Recommendation

### 6.1 Proposed architecture

```
 piXeval launcher (PyInstaller)
   ├─ Python engine: db / omr / cat_lib / dataReports   (existing code, behind a service layer)
   ├─ FastAPI + Uvicorn on 127.0.0.1 (per-launch token)  ← already in the stack
   ├─ React + TypeScript UI (static build served by FastAPI)
   └─ shell: pywebview native window  ── fallback: system browser
```

### 6.2 Justification (Decision 1: web; Decision 2: pywebview)

1. **It meets the stated constraints:** the engine remains Python; React, FastAPI, pywebview and the supporting libraries are open source with permissive licences (to be confirmed per component before release), so no licence or hosting cost arises.
2. **It gives end users the best experience (94 of 100, ahead of 02's 88) at a better implementation score (74 against 60):** the web platform offers the largest set of mature, accessible components (tables, dialogs, charts, command search, keyboard handling) and modern visual design. The prototype demonstrates the result: 30 page and dialog source files and roughly 3,400 lines of TypeScript and CSS reproduce the screens and dialogs of the main piXeval workflow (subjects to grades, utilities and configuration) in a modern design, with working create/edit/delete behaviour on sample data. The auxiliary applications in the repository (EBAP, CAT3 Audit) are not covered.
3. **It closes the main functional gap of the browser option** (real file paths) through native dialogs exposed by pywebview, and it avoids shipping Chromium: the UI layer adds about 11 MB to the compiled output, against about 340–370 MB for the in-app Qt browser, and about 45–80 MB less than today's Qt build once Qt is removed (12–21 % smaller).
4. **Regressions are caught before users see them:** typed code (TypeScript) and automated browser tests (Playwright) check every screen against real sample databases before release, which matters for a one-shot major update.
5. **It keeps the compiled program and its updates small:** one Python executable plus the Windows WebView2 engine already on every client, reusing the existing PyInstaller and Inno Setup pipeline.
6. **It keeps future options open:** the same API can later support a LAN or remote deployment, which the Qt-only option cannot.
7. **It is partly reversible:** if the OS web view proves unsuitable, the identical web build runs in the browser (03) or inside Qt WebEngine (02) without rewriting the UI, which limits the damage of a wrong shell choice before the single release.

### 6.3 Why the other three were not selected

- **01:** the easiest to implement (88) and the safest release, but end users get the weakest experience (64): custom painting for every modern component, no real effects or transitions, a dated look. It would leave the primary objective largely unmet.
- **02:** end-user experience close to 04 (88 against 94) with the most consistent rendering, but its UI layer adds about 340–370 MB to the compiled program (about 135–150 MB more to download, on every install and update), starts slower and is harder to implement (60 against 74): Chromium in the installer, QtWebEngine packaging and an asynchronous bridge. It is the choice if a guaranteed identical rendering engine matters more than size, or if a local server is unacceptable.
- **03:** the same front end with the user's browser as the window: simplest to ship (80) and the smallest, but the weakest web option for end users (86): no native file pickers and a look that varies by browser. It is kept as the **fallback mode of 04**.

---

## 7. Risks and mitigations

| Risk                                                                                           | Likelihood / impact | Mitigation                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business logic embedded in widgets is mis-extracted                                            | high / high         | characterisation tests on grading, OMR and report outputs before refactoring (F3)                                                                                                        |
| Defects introduced during the UI rewrite (including AI-generated code) in grading or OMR flows | medium / high       | keep the engine unchanged; strict TypeScript; unit tests on the service layer; end-to-end tests (Playwright) against real sample databases; human review of every change touching grades |
| Differences between Windows versions or between WebView2 runtime versions                      | low / medium        | test on Windows 10 and 11; avoid cutting-edge CSS/JS; the browser fallback remains a safety net                                                                                          |
| pywebview's Windows backend depends on pythonnet and may bundle badly with PyInstaller         | medium / high       | prove the bundle in the validation spike; keep the browser fallback                                                                                                                      |
| Local server exposed to other local processes                                                  | medium / high       | bind to loopback, random port, per-launch token, strict origin checks                                                                                                                    |
| Regression or missing feature reaches all users at once (no incremental rollout)               | high / high         | written parity checklist of every screen, dialog and report; end-to-end tests on real databases; closed beta before release                                                              |
| Existing user databases fail to open or migrate                                                | medium / high       | the new version opens current databases without schema changes; automatic backup before first open; keep the previous installer for rollback                                             |
| Two versions installed side by side write to one SQLite file                                   | low / high          | single-writer service; installer detects and warns about a legacy install                                                                                                                |
| Large tables or image-heavy screens are slow                                                   | medium / medium     | virtualised tables; benchmark with 5,000+ rows; thumbnails for scans                                                                                                                     |
| Single-maintainer dependency (pywebview)                                                       | medium / medium     | thin abstraction over the shell; fallback to browser or Qt WebEngine                                                                                                                     |
| The size saving is lost because Qt stays in the compiled program                               | medium / medium     | remove the ~7 non-UI Qt imports in the service-layer step; check the bundle contents in the validation spike                                                                             |
| Scope creep from several apps in the repo (EBAP, CAT3 Audit)                                   | medium / medium     | migrate piXeval first; reuse the design system afterwards                                                                                                                                |

---

## 8. Implementation plan (one major release)

| Phase | Work                                                                                                                  | Exit criterion                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 0     | Review report; run the validation spike (§9)                                                                          | decision record                                                     |
| 1     | Service layer; replace Qt signals by callbacks/events; characterisation tests                                         | existing Qt app unchanged and passing                               |
| 2     | FastAPI API for every use case; build the complete web UI against it, starting from the prototype                     | parity checklist: every current screen, dialog and report           |
| 3     | Native dialogs via pywebview; OMR and correction flows with progress events; installer; opening of existing databases | release candidate passes end-to-end tests on real databases         |
| 4     | Closed beta with real users and real databases; fix defects; previous installer kept available for rollback           | beta sign-off                                                       |
| 5     | Publish as the next major version                                                                                     | users on the new version; legacy installer retained for one release |

---

## 9. Validation tasks before commitment (not yet performed)

1. Build a PyInstaller bundle of FastAPI + pywebview (including its pythonnet dependency) **without Qt**, and **measure installer size, installed size and cold start** against the current installer; repeat the bundle with Qt WebEngine for comparison.
2. Check the **Windows 10 and 11** behaviour of the pywebview window (WebView2 is available on all client machines).
3. Prototype the **native folder dialog bridge** and a long-running scan with an event stream.
4. Benchmark the **grades table with 5,000+ rows** and a scan-image review screen.
5. Run a **usability comparison** (task time and errors) between one current Qt screen and its web equivalent with a few real users.
6. Review **licences** of every dependency in the bundle (including LGPL components if Qt remains in the build).

---

## 10. Cost considerations

All components of the recommended stack (Python, FastAPI, React, TypeScript, pywebview, Vite) are open source; the only cost is development time. The Qt-based options also have no fee provided LGPL terms are respected. Development effort is dominated by the UI re-implementation (F2), which every option shares; review and testing remain necessary however the code is written.

---

## 11. Limitations of this study

- Scores are judgements; the sensitivity analysis shows how they change but does not remove subjectivity.
- Installer size, performance and target-machine data were not measured (§9).
- External technology facts (Qt, pywebview) come from public documentation and articles listed below; version numbers and project status change quickly and should be rechecked at decision time.
- Line counts measure size, not complexity; they indicate relative effort but not exact effort.
- The prototype uses sample data and does not run the real engine.

---

## 12. Conclusion

The processing engine of piXeval is largely independent of its user interface, so replacing the interface technology is technically feasible without leaving Python. Every option requires the same first step, a service layer. The web platform gives end users a clearly better experience (86–94 of 100 against 64 for Qt Widgets). A Python engine with that interface in a native window reaches the top end-user score (94, against 88 for the in-app Qt WebEngine browser) at a better implementation score (74 against 60), and with a much smaller compiled program (about 11 MB for the UI layer against about 340–370 MB with Qt WebEngine, which would almost double the program; 12–21 % smaller than today's Qt Widgets build), with the external browser as a safety-net fallback. Qt Widgets would be preferred only if developer ease counted for more than about two thirds of the decision. Because the migration is a single release, the dominant risk is release quality rather than migration path, which is why a parity checklist, a closed beta and a rollback path are part of the plan. The next step is the validation work in §9, which can be completed in a short, low-risk spike before any large investment.

---

## References

1. Qt Documentation, _User Interfaces_ (Widgets, animation and complex desktop applications), <https://doc.qt.io/qt-6.9/topics-ui.html>
2. Qt for Python, _QtWebChannel_, <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
3. Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_, <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
4. pywebview 6.x package listing, <https://www.archlinux.org/packages/extra/any/python-pywebview>
5. piXeval repository metrics: [00-baseline-current-stack.md](00-baseline-current-stack.md)
