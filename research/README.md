# Research: modernising the piXeval user interface

Question: what are the options for a better UI/UX for piXeval, using the current PySide6 setup as the baseline, while keeping the Python engine and adding no new expenses?

**How options are judged:** the main focus is the **end user**. Score A (80%) is the end-user experience (aesthetics and modern look, interaction, effectiveness, consistency, install and launch, native behaviour); Score B (20%) is ease of implementation with the Python runtime. Two decisions: Qt Widgets vs web; then which web shell (in-app Qt WebEngine, pywebview with browser fallback, or Python backend + external browser).

**Constraints:** keep the Python engine; migration happens once, as a single major release; no new recurring costs; team size, skills and language familiarity are **not** constraints (options are judged on technical merit).

**Start with `06-final-technical-report.md`** (formal report). The other files are the supporting notes, each with pros, cons, advantages and disadvantages versus the other options.

| File                                | Content                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `06-final-technical-report.md`      | Technical report: problem, method, analysis, recommendation, risks, plan                                     |
| `00-baseline-current-stack.md`      | Measured facts about the current codebase                                                                    |
| `01-pyside6-widgets-modernised.md`  | Stay on Qt Widgets and modernise it                                                                          |
| `02-qt-webengine-hybrid.md`         | Web UI inside the Qt app (QWebEngine)                                                                        |
| `03-local-web-app-fastapi-react.md` | Local FastAPI + React app opened in the browser                                                              |
| `04-pywebview-native-window.md`     | Same, in a native window (recommended)                                                                       |
| `05-comparison-and-roadmap.md`      | End-user score vs ease-with-Python score, the two decisions, combined ranking, sensitivity, roadmap, sources |

Caveats: scores are judgement-based; installer size, performance and target-machine facts were not measured (see section 9 of the report).
