# 07 · Feasibility: the engine behind an HTTP service

_Question: can the core piXeval engine (the service layer) run behind a FastAPI (HTTP) server? Scope: everything runs locally on the end user's PC; there is no remote server. Method: reading the `pixeval` repository (7.6.2): `src/db`, `src/cat_lib`, `src/omr`, `src/utils`, `src/dataReports`, `commons.py`, `constants.py`, `paths.py`. Nothing was run or changed; counts are from reading and `grep`._

## Verdict

**Feasible, with moderate risk.** No architectural blocker was found. The cost is removing hidden coupling (globals, Qt) and designing how long jobs behave over HTTP, not rewriting the engine.

## 1. What already helps

- **The OMR core is clean.** `src/omr` has no Qt imports and already uses `ThreadPoolExecutor` (`batchExecute`, 4 workers).
- **Persistence is already a layer.** Models call `getDB().updateX(self)` / `deleteX(self)`. About 20 model classes in `pixeval_models.py` map naturally to resource groups.
- **Progress reporting is narrow.** Only 6 files take a Qt `SignalInstance` parameter: `cat3`, `assignIdentities`, `calculateGrades`, `obtainMarkings`, `backup`, `redoHRcorrection`. Each only calls `.emit(...)` with a plain dataclass (`ProgressData`).
- **The web stack is already a dependency.** `fastapi 0.115.12`, `uvicorn 0.34`, `starlette` and `pydantic 2.11` are already pinned in `requirements.txt`.

## 2. What makes it harder

| #   | Finding (evidence)                                                                                                                                                                                                         | Effect on an HTTP port                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **The data layer is a global in-memory graph.** `Global.DB`, `Global.COURSES`, `Global.CONFIG` and a `Singleton` metaclass. `PixevalDataManager` holds class-level managers that cache the whole database.                 | The API is stateful: "open workspace" becomes a call, with one workspace per server process. This matches a desktop app with one user and one database. Handlers need a single-writer lock. |
| 2   | **`lastInsertId` lives on the shared DB instance.** Connections are thread-local, but the last-insert id is not.                                                                                                           | A race under FastAPI's threadpool. A small fix, but a real bug in that setup.                                                                                                               |
| 3   | **Qt leaks into the engine in three ways.** `translate()` calls `QApplication.translate` (222 call sites); `QApplication.instance()` is used for DB-load events, config and app detection; Qt image types in four modules. | Headless operation needs three shims: a pluggable translate function, optional app hooks, Qt-free image handling. The 222 call sites are mechanical.                                        |
| 4   | **A job can ask the user a question mid-run.** `cat3.askRotationAction` emits a `RotationQuestion` and blocks on a `threading.Event`.                                                                                      | Maps to a job resource with an event stream plus `POST /jobs/{id}/answer`. Solvable; the decoupling is already there.                                                                       |
| 5   | **Mutable class-level OMR configuration.** `Common.central_lower_threshold` is set on every `processSheetsWithCat3` call.                                                                                                  | Two simultaneous corrections with different settings would interfere. Running one job at a time avoids it, which matches desktop use.                                                       |
| 6   | **Native crashes are expected.** `paths.py` enables `faulthandler` into a crash log at import.                                                                                                                             | A crash inside OpenCV or pyzbar would take down the whole server. Process isolation contains it, but the singletons would have to be rebuilt in the child. Threads are simpler.             |
| 7   | **The engine assumes it runs on the user's machine.** Scan folders are passed as paths, state lives in a per-user folder.                                                                                                  | Matches the deployment: server and files are on the same PC, so paths work as they are.                                                                                                     |
| 8   | **Import-time side effects.** `paths.py` creates folders and enables `faulthandler`; `commons.py` derives its base directory from `sys.argv[0]`.                                                                           | Tests and a server entry point need controlled startup.                                                                                                                                     |
| 9   | **Language of engine strings.** Errors, reports and some constants use Qt's translator.                                                                                                                                    | Decide whether the server returns translated text or codes that the front end translates.                                                                                                   |

A developer-only flag also makes the DB layer skip saving; its meaning in production should be checked.

## 3. Feasibility by area

| Area                                       | Rating      | Why                                                                                                                                                                                                                                               |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRUD over models                           | High        | Mechanical; one pydantic model per model class.                                                                                                                                                                                                   |
| Reports and exports (PDF, Excel, HTML)     | High        | They already write files; the API returns a download or a saved path.                                                                                                                                                                             |
| Correction, identity and grading jobs      | Medium-high | 4 entry points plus backup, with a known event shape. The user-question step and cancel support are the design work.                                                                                                                              |
| Removing Qt coupling                       | Medium      | Scope is clear (6 files, one translate function, three hooks) but it touches the core.                                                                                                                                                            |
| Concurrency and global state               | Medium      | Manageable if the service is explicitly single-workspace, single-writer, one job at a time.                                                                                                                                                       |
| Screens with logic inside the widget class | Unknown     | Strictly, 25 UI files (62 call sites) use `PixevalDataManager` or `getDB`; the broader "103 of 194" in the [baseline](00-baseline-current-stack.md) counts any import. The grades screen orchestrates exports and e-mail directly. Not yet sized. |

## 4. Gaps in this study

- No automated test directory was seen at the repository root, so a port has no regression safety net.
- Licensing logic and the `pixEBAP02` / CAT3 Audit variants were not examined. `src/omr_audit` is a duplicate of `src/omr`.
- No performance numbers (scan throughput, serialising a large grades table).

## 5. Proposed read-only checks

1. Import `cat_lib`, `db` and `omr` with no `QApplication` to see what breaks.
2. Map each UI file's data and engine calls into a list of required operations (the real API surface).
3. Review the job lifecycle: where cancel exists and what state each job leaves behind.

Back to the [research index](README.md).
