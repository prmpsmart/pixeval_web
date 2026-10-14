# 00 · Base de partida: sobre que está construído piXeval hoxe

_Medido a partir do repositorio `pixeval` (7.6.2) nesta máquina. As cifras son contas de liñas de ficheiros `.py`, non un xuízo de calidade._

## A pila dun vistazo

| Área                     | Que se usa                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Linguaxe / contorno      | Python 3.12 (desenvolvemento), rodas fixadas para 3.13 en `requirements.txt`                                                             |
| Interface                | **PySide6 6.9.0 – Qt Widgets** (tamén `QtGui`, `QtCore`, `QtPrintSupport`, `QtPdf`, `QtPdfWidgets`). Non se atopou uso de `QtWebEngine`  |
| Estilos                  | QSS escrito a man (`kitchen/style-v7.6.0.qss`, ~1.100 liñas), ~1.750 iconas SVG, animacións Lottie (`rlottie-python`, `qt-lottie`)       |
| Datos                    | SQLite mediante un envoltorio propio por fío (`src/db/databases.py`); tamén está presente `psycopg2`                                     |
| OMR / visión             | OpenCV, NumPy, scikit-image, pyzbar, pytesseract                                                                                         |
| Documentos               | reportlab, xhtml2pdf, pypdf, python-docx, openpyxl, XlsxWriter, pandas                                                                   |
| Rede / correo            | requests, google-api-client, zeep, `deep-translator`, `google-cloud-translate`                                                           |
| **Pila web xa presente** | **FastAPI 0.115 + Uvicorn 0.34 + Starlette** (usada por `kitchen/remote_pixeval/server`, o servizo CAT remoto)                           |
| Empaquetado              | PyInstaller 6.13 (`compile/*.spec`) + Inno Setup (`compile/piXeval.iss`) → instalador de Windows                                         |
| Concorrencia             | Case ningunha (`threading.Thread` unha vez). As tarefas longas informan do progreso con obxectos `SignalInstance` de Qt pasados á lóxica |

O repositorio contén varias aplicacións, non unha: **piXeval**, **pixEBAP02**, **CAT3 Audit**, unha **Modern UI** sen rematar (`src/modern_ui`) e un servizo FastAPI **Remote CAT**.

## Tamaño de cada capa

| Capa                                                | Ficheiros Python |          Liñas | Importa Qt                                                           |
| --------------------------------------------------- | ---------------: | -------------: | -------------------------------------------------------------------- |
| `src/ui` (interface PySide6 actual)                 |              194 |     **71.077** | toda                                                                 |
| `src/modern_ui` (redeseño en PySide6, en curso)     |               28 |          2.301 | toda                                                                 |
| `src/db`                                            |                7 |          3.648 | 1 ficheiro (`databases.py`, unha importación de `QApplication`)      |
| `src/omr` (+ copia do mesmo tamaño `src/omr_audit`) |         16 (+16) | 6.704 (+6.704) | **0 ficheiros**                                                      |
| `src/cat_lib`                                       |               13 |          4.832 | 3 ficheiros (`SignalInstance`, `QDesktopServices`, `QPixmap/QImage`) |
| `src/dataReports`                                   |                9 |            830 | 1 ficheiro (`QImage`)                                                |
| `src/utils`                                         |               28 |          5.242 | 2 ficheiros (`SignalInstance` para informar do progreso)             |

## Que significa isto

1. **O motor é case independente da interface.** OMR, BD, informes e lóxica CAT suman unhas 21.000 liñas, e só uns **7 ficheiros** tocan Qt (sobre todo por sinais de progreso ou tipos de imaxe). Por iso «Python queda, só cambia a interface» é realista.
2. **A interface é ~3,4 veces maior que o motor.** Calquera redeseño real é unha reescritura dunha interface moi grande, _sexa cal for a tecnoloxía_. `src/modern_ui` (2,3 mil liñas por agora) xa é esa reescritura, en PySide6, e leva un 3 % por conta de liñas. A pregunta honesta é, polo tanto, _«que pila fai o redeseño máis barato e mellor?»_, non _«web ou non reescribir»_.
3. **Interface e lóxica están entremezcladas.** 103 dos 194 ficheiros de interface importan da capa de datos. Exemplo: `src/ui/pixeval/grades/__init__.py` le participantes, fórmulas e follas con erro directamente de `PixevalDataManager`. As regras de negocio que viven en clases de widgets deben pasar a unha capa de servizos antes de que _calquera_ interface nova (web ou Qt) poida reutilizalas. Este paso necésitao cada opción de abaixo.
4. **O informe de progreso é específico de Qt.** Os parámetros `SignalInstance` (copia de seguranza, CAT3, recorrección HR) deben converterse nunha devolución de chamada / fluxo de eventos neutral. É doado e local, pero toca o núcleo.
5. **Xa hai un servizo FastAPI no repositorio.** A tecnoloxía da que dependen as opcións 03 e 04 xa se usa na base de código.
6. **Os diálogos nativos de ficheiros úsanse pouco** (9 puntos de chamada en 5 ficheiros: selectores de cartafol para escaneos, copias de seguranza e exportacións). Un navegador non pode entregar a Python unha ruta de cartafol real, o que importa para a opción de só navegador (véxase 03).

## Que _non_ se mediu (verifica antes de citar)

- O tamaño real do instalador / instalación, xa que `dist/` non está no repositorio. Probablemente dominan OpenCV, SciPy e Qt.
- O rendemento real da interface con táboas grandes (a pantalla de notas contén centos ou miles de filas).
- O comportamento en Windows 10 e Windows 11 (WebView2 está dispoñible en todos os equipos cliente).

## Orde de lectura

[Índice da investigación](README.md) (resumo e recomendación) → opcións [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md), [04](04-pywebview-native-window.md) → [comparación e folla de ruta](05-comparison-and-roadmap.md) → [informe técnico final](06-final-technical-report.md).
