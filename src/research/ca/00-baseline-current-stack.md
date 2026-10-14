# 00 · Base de partida: sobre què està construït piXeval avui

_Mesurat a partir del repositori `pixeval` (7.6.2) en aquesta màquina. Les xifres són recomptes de línies d'arxius `.py`, no un judici de qualitat._

## La pila d'un cop d'ull

| Àrea                    | Què s'utilitza                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Llenguatge / entorn     | Python 3.12 (desenvolupament), rodes fixades per a 3.13 a `requirements.txt`                                                                   |
| Interfície              | **PySide6 6.9.0 – Qt Widgets** (també `QtGui`, `QtCore`, `QtPrintSupport`, `QtPdf`, `QtPdfWidgets`). No s'ha trobat ús de `QtWebEngine`        |
| Estils                  | QSS escrit a mà (`kitchen/style-v7.6.0.qss`, ~1.100 línies), ~1.750 icones SVG, animacions Lottie (`rlottie-python`, `qt-lottie`)              |
| Dades                   | SQLite mitjançant un embolcall propi per fil (`src/db/databases.py`); també hi és present `psycopg2`                                           |
| OMR / visió             | OpenCV, NumPy, scikit-image, pyzbar, pytesseract                                                                                               |
| Documents               | reportlab, xhtml2pdf, pypdf, python-docx, openpyxl, XlsxWriter, pandas                                                                         |
| Xarxa / correu          | requests, google-api-client, zeep, `deep-translator`, `google-cloud-translate`                                                                 |
| **Pila web ja present** | **FastAPI 0.115 + Uvicorn 0.34 + Starlette** (usada per `kitchen/remote_pixeval/server`, el servei CAT remot)                                  |
| Empaquetat              | PyInstaller 6.13 (`compile/*.spec`) + Inno Setup (`compile/piXeval.iss`) → instal·lador de Windows                                             |
| Concurrència            | Gairebé cap (`threading.Thread` una vegada). Les tasques llargues informen del progrés amb objectes `SignalInstance` de Qt passats a la lògica |

El repositori conté diverses aplicacions, no una: **piXeval**, **pixEBAP02**, **CAT3 Audit**, una **Modern UI** sense acabar (`src/modern_ui`) i un servei FastAPI **Remote CAT**.

## Mida de cada capa

| Capa                                                   | Arxius Python |         Línies | Importa Qt                                                        |
| ------------------------------------------------------ | ------------: | -------------: | ----------------------------------------------------------------- |
| `src/ui` (interfície PySide6 actual)                   |           194 |     **71.077** | tota                                                              |
| `src/modern_ui` (redisseny en PySide6, en curs)        |            28 |          2.301 | tota                                                              |
| `src/db`                                               |             7 |          3.648 | 1 arxiu (`databases.py`, una importació de `QApplication`)        |
| `src/omr` (+ còpia de la mateixa mida `src/omr_audit`) |      16 (+16) | 6.704 (+6.704) | **0 arxius**                                                      |
| `src/cat_lib`                                          |            13 |          4.832 | 3 arxius (`SignalInstance`, `QDesktopServices`, `QPixmap/QImage`) |
| `src/dataReports`                                      |             9 |            830 | 1 arxiu (`QImage`)                                                |
| `src/utils`                                            |            28 |          5.242 | 2 arxius (`SignalInstance` per informar del progrés)              |

## Què significa això

1. **El motor és gairebé independent de la interfície.** OMR, BD, informes i lògica CAT sumen unes 21.000 línies, i només uns **7 arxius** toquen Qt (sobretot per senyals de progrés o tipus d'imatge). Per això «Python es queda, només canvia la interfície» és realista.
2. **La interfície és ~3,4 vegades més gran que el motor.** Qualsevol redisseny real és una reescriptura d'una interfície molt gran, _sigui quina sigui la tecnologia_. `src/modern_ui` (2,3 mil línies de moment) ja és aquesta reescriptura, en PySide6, i en porta un 3 % pel recompte de línies. La pregunta honesta és, doncs, _«quina pila fa el redisseny més barat i millor?»_, no _«web o no reescriure»_.
3. **Interfície i lògica estan entremaliades.** 103 dels 194 arxius d'interfície importen de la capa de dades. Exemple: `src/ui/pixeval/grades/__init__.py` llegeix participants, fórmules i fulls amb error directament de `PixevalDataManager`. Les regles de negoci que viuen en classes de widgets s'han de moure a una capa de serveis abans que _qualsevol_ interfície nova (web o Qt) les pugui reutilitzar. Aquest pas el necessita cada opció d'aquí sota.
4. **L'informe de progrés és específic de Qt.** Els paràmetres `SignalInstance` (còpia de seguretat, CAT3, recorrecció HR) han de convertir-se en una crida de retorn / flux d'esdeveniments neutral. És fàcil i local, però toca el nucli.
5. **Ja hi ha un servei FastAPI al repositori.** La tecnologia de la qual depenen les opcions 03 i 04 ja s'utilitza a la base de codi.
6. **Els diàlegs natius d'arxius s'usen poc** (9 punts de crida en 5 arxius: selectors de carpeta per a escanejos, còpies de seguretat i exportacions). Un navegador no pot lliurar a Python una ruta de carpeta real, cosa que importa per a l'opció de només navegador (vegeu 03).

## Què _no_ s'ha mesurat (verifiqueu abans de citar)

- La mida real de l'instal·lador / instal·lació, ja que `dist/` no és al repositori. Probablement dominen OpenCV, SciPy i Qt.
- El rendiment real de la interfície amb taules grans (la pantalla de notes conté centenars o milers de files).
- El comportament a Windows 10 i Windows 11 (WebView2 és disponible a tots els equips client).

## Ordre de lectura

[Índex de la recerca](README.md) (resum i recomanació) → opcions [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md), [04](04-pywebview-native-window.md) → [comparació i full de ruta](05-comparison-and-roadmap.md) → [informe tècnic final](06-final-technical-report.md).
