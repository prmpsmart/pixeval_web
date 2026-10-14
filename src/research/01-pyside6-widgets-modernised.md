# 01 · Stay on PySide6 Widgets and modernise it

**One line:** keep the Qt Widgets desktop app, finish the redesign already started in `src/modern_ui`, and invest in a proper theme and component library.

## What it is

Same technology as today (PySide6 6.9, Qt Widgets, QSS), but with a deliberate design system: tokens for colours/spacing, reusable cards, tables, dialogs, toasts, a sidebar shell, and a clean split between UI and services. `src/modern_ui` already contains the start: `theme.py`, `buttons.py`, `inputs.py`, `table.py`, `surfaces.py`, a shell with sidebar/topbar, and QRC asset generation.

## How it fits piXeval

- No change to packaging (PyInstaller + Inno Setup), runtime, or the single-process model.
- Python code calls Python code; no API, no bridge, no second language.
- Progress signals (`SignalInstance`) keep working as they are.

## Pros

- **Lowest technical risk.** Nothing new to learn, ship, sign, or debug.
- **Single process, single language, fully offline.** Nothing listens on a port, so no firewall/antivirus prompts.
- **Native integration is free:** `QFileDialog`, printing (`QtPrintSupport`), PDF (`QtPdf`), drag-and-drop, clipboard, tray, system dialogs.
- **Existing assets and Qt know-how are reused** (QSS, SVG icons, Lottie, Qt Designer habits).
- Fast startup and low memory compared with a bundled browser engine. The Qt binaries in the compiled program are about 55–90 MB (Qt6 Core 9.9, Gui 9.4, Widgets 6.5, Pdf 5.7 MB, PySide6 modules ≈ 12 MB, plugins, optionally software OpenGL 20.6 MB), measured from the Windows wheels.
- Large data tables stay fast with `QAbstractItemModel` and `QTableView`.

## Cons

- **Design ceiling is lower and the cost per component is higher.** QSS is a subset of CSS: no flexbox/grid, no real shadows (`QGraphicsDropShadowEffect` is slow and clips), no backdrop blur, no CSS variables or transitions. Qt's own docs note that Widgets "do not scale well for animations" (see the sources in [05](05-comparison-and-roadmap.md)).
- **Every modern component is built by hand.** The web preview (command palette, toasts, filterable tables, tabbed dialogs, charts, empty states) uses off-the-shelf patterns; in Widgets each is a custom class to design, paint and test.
- **Slow design iteration.** A visual change means restart/run; there is no hot reload or browser dev-tools inspector for QSS.
- **The redesign is still a ~70k-line rewrite.** `src/modern_ui` is 2.3k lines against 71k for the current UI. Choosing this option does not avoid the rewrite; it only keeps the language.
- **Tooling:** designs cannot be handed off directly (Figma → CSS is direct; Figma → QSS is manual), and the public component and example ecosystem for Qt Widgets styling is much smaller than for web UI.
- **Testing UI is harder** (`pytest-qt` works but is far less common than Playwright/Cypress-style tests).
- Hi-DPI, fonts and dark-mode quirks differ per OS and need manual care.

## Advantages over the other options

- vs the web options (03, 04): no localhost server, no WebView/Chromium dependency, no JS toolchain, no bridge to maintain, no security surface from a local HTTP service.
- vs the hybrid (02): smaller binary, simpler packaging, one rendering stack.

## Disadvantages versus the other options

- Slowest route to a _visibly modern_ UI; every polish item is bespoke.
- No path to a LAN / remote / browser-accessible version later without a separate rewrite.
- Smaller component ecosystem than the web.

## When to choose it

- The goal is "better looking, same product", and a second runtime or process boundary is unacceptable (for example locked-down offline machines that block local servers).

## Effort and risks

- Effort: high but predictable; the work is the same screens either way. Risk concentrates in custom-painted components and keeping the old and new UI consistent while both exist.
- Do first: extract services from widgets (see finding 3 in [00](00-baseline-current-stack.md)). This pays off in every option.
