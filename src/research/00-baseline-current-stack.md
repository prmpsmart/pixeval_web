# 00 · Baseline: what piXeval is built on today

_Measured from the `pixeval` repository (7.6.2) on this machine. Numbers are line counts of `.py` files, not a quality judgement._

## Stack at a glance

| Area                          | What is used                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Language / runtime            | Python 3.12 (dev), wheels pinned for 3.13 in `requirements.txt`                                                                  |
| UI                            | **PySide6 6.9.0 – Qt Widgets** (also `QtGui`, `QtCore`, `QtPrintSupport`, `QtPdf`, `QtPdfWidgets`). No `QtWebEngine` usage found |
| Styling                       | Hand-written QSS (`kitchen/style-v7.6.0.qss`, ~1,100 lines), ~1,750 SVG icons, Lottie animations (`rlottie-python`, `qt-lottie`) |
| Data                          | SQLite via a custom thread-local wrapper (`src/db/databases.py`); `psycopg2` is also present                                     |
| OMR / vision                  | OpenCV, NumPy, scikit-image, pyzbar, pytesseract                                                                                 |
| Documents                     | reportlab, xhtml2pdf, pypdf, python-docx, openpyxl, XlsxWriter, pandas                                                           |
| Networking / mail             | requests, google-api-client, zeep, `deep-translator`, `google-cloud-translate`                                                   |
| **Web stack already present** | **FastAPI 0.115 + Uvicorn 0.34 + Starlette** (used by `kitchen/remote_pixeval/server`, the remote CAT service)                   |
| Packaging                     | PyInstaller 6.13 (`compile/*.spec`) + Inno Setup (`compile/piXeval.iss`) → Windows installer                                     |
| Threading                     | Almost none (`threading.Thread` once). Long jobs report progress through Qt `SignalInstance` objects passed into logic code      |

The repo holds several apps, not one: **piXeval**, **pixEBAP02**, **CAT3 Audit**, an unfinished **Modern UI** (`src/modern_ui`), and a **Remote CAT** FastAPI service.

## Size of each layer

| Layer                                             | Python files |          Lines | Imports Qt                                                       |
| ------------------------------------------------- | -----------: | -------------: | ---------------------------------------------------------------- |
| `src/ui` (current PySide6 UI)                     |          194 |     **71,077** | all of it                                                        |
| `src/modern_ui` (PySide6 redesign, in progress)   |           28 |          2,301 | all of it                                                        |
| `src/db`                                          |            7 |          3,648 | 1 file (`databases.py`, a `QApplication` import)                 |
| `src/omr` (+ identical-size copy `src/omr_audit`) |     16 (+16) | 6,704 (+6,704) | **0 files**                                                      |
| `src/cat_lib`                                     |           13 |          4,832 | 3 files (`SignalInstance`, `QDesktopServices`, `QPixmap/QImage`) |
| `src/dataReports`                                 |            9 |            830 | 1 file (`QImage`)                                                |
| `src/utils`                                       |           28 |          5,242 | 2 files (`SignalInstance` for progress reporting)                |

## What this means

1. **The engine is mostly UI-independent.** OMR, DB, reports and CAT logic total roughly 21,000 lines, and only about **7 files** touch Qt (mostly for progress signals or image types). That is why "Python stays, only the UI changes" is realistic.
2. **The UI is ~3.4× larger than the engine.** Any real redesign is a rewrite of a very large UI, _whatever the technology_. `src/modern_ui` (2.3k lines so far) is already that rewrite, in PySide6, and is about 3% done by line count. The honest question is therefore _"which stack makes the redesign cheapest and best?"_, not _"web vs. no rewrite"_.
3. **UI and logic are interleaved.** 103 of the 194 UI files import from the data layer. Example: `src/ui/pixeval/grades/__init__.py` reads participants, formulas and error sheets directly from `PixevalDataManager`. Business rules living in widget classes must be moved into a service layer before _any_ new front end (web or Qt) can reuse them. This step is needed by every option below.
4. **Progress reporting is Qt-specific.** `SignalInstance` parameters (backup, CAT3, HR re-correction) must become a neutral callback / event stream. Easy and local, but it touches the core.
5. **A FastAPI service already ships in the repo.** The technology that options 03 and 04 depend on is already used in the code base.
6. **Native file dialogs are used sparingly** (9 call sites in 5 files: folder pickers for scans, backups and exports). A browser cannot hand a real folder path to Python, which matters for the pure-browser option (see 03).

## What was _not_ measured (verify before quoting)

- Actual installer / install size, since `dist/` is not in the repo. OpenCV, SciPy and Qt probably dominate it.
- Real-world UI performance on large tables (the grades screen holds 100s–1000s of rows).
- Behaviour on both Windows 10 and Windows 11 (WebView2 is available on all client machines).
- Which team members can write TypeScript/React.

## Reading order

[Research index](README.md) (summary and recommendation) → options [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md), [04](04-pywebview-native-window.md) → [comparison and roadmap](05-comparison-and-roadmap.md) → [final technical report](06-final-technical-report.md).
