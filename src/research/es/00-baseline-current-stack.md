# 00 · Base de partida: sobre qué está construido piXeval hoy

_Medido a partir del repositorio `pixeval` (7.6.2) en esta máquina. Las cifras son recuentos de líneas de archivos `.py`, no un juicio de calidad._

## La pila de un vistazo

| Área                     | Qué se usa                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Lenguaje / entorno       | Python 3.12 (desarrollo), ruedas fijadas para 3.13 en `requirements.txt`                                                                   |
| Interfaz                 | **PySide6 6.9.0 – Qt Widgets** (también `QtGui`, `QtCore`, `QtPrintSupport`, `QtPdf`, `QtPdfWidgets`). No se encontró uso de `QtWebEngine` |
| Estilos                  | QSS escrito a mano (`kitchen/style-v7.6.0.qss`, ~1.100 líneas), ~1.750 iconos SVG, animaciones Lottie (`rlottie-python`, `qt-lottie`)      |
| Datos                    | SQLite mediante un envoltorio propio por hilo (`src/db/databases.py`); también está presente `psycopg2`                                    |
| OMR / visión             | OpenCV, NumPy, scikit-image, pyzbar, pytesseract                                                                                           |
| Documentos               | reportlab, xhtml2pdf, pypdf, python-docx, openpyxl, XlsxWriter, pandas                                                                     |
| Red / correo             | requests, google-api-client, zeep, `deep-translator`, `google-cloud-translate`                                                             |
| **Pila web ya presente** | **FastAPI 0.115 + Uvicorn 0.34 + Starlette** (usada por `kitchen/remote_pixeval/server`, el servicio CAT remoto)                           |
| Empaquetado              | PyInstaller 6.13 (`compile/*.spec`) + Inno Setup (`compile/piXeval.iss`) → instalador de Windows                                           |
| Concurrencia             | Casi ninguna (`threading.Thread` una vez). Las tareas largas informan del progreso con objetos `SignalInstance` de Qt pasados a la lógica  |

El repositorio contiene varias aplicaciones, no una: **piXeval**, **pixEBAP02**, **CAT3 Audit**, una **Modern UI** sin terminar (`src/modern_ui`) y un servicio FastAPI **Remote CAT**.

## Tamaño de cada capa

| Capa                                                 | Archivos Python |         Líneas | Importa Qt                                                          |
| ---------------------------------------------------- | --------------: | -------------: | ------------------------------------------------------------------- |
| `src/ui` (interfaz PySide6 actual)                   |             194 |     **71.077** | toda                                                                |
| `src/modern_ui` (rediseño en PySide6, en curso)      |              28 |          2.301 | toda                                                                |
| `src/db`                                             |               7 |          3.648 | 1 archivo (`databases.py`, una importación de `QApplication`)       |
| `src/omr` (+ copia del mismo tamaño `src/omr_audit`) |        16 (+16) | 6.704 (+6.704) | **0 archivos**                                                      |
| `src/cat_lib`                                        |              13 |          4.832 | 3 archivos (`SignalInstance`, `QDesktopServices`, `QPixmap/QImage`) |
| `src/dataReports`                                    |               9 |            830 | 1 archivo (`QImage`)                                                |
| `src/utils`                                          |              28 |          5.242 | 2 archivos (`SignalInstance` para informar del progreso)            |

## Qué significa esto

1. **El motor es casi independiente de la interfaz.** OMR, BD, informes y lógica CAT suman unas 21.000 líneas, y solo unos **7 archivos** tocan Qt (sobre todo por señales de progreso o tipos de imagen). Por eso «Python se queda, solo cambia la interfaz» es realista.
2. **La interfaz es ~3,4 veces mayor que el motor.** Cualquier rediseño real es una reescritura de una interfaz muy grande, _sea cual sea la tecnología_. `src/modern_ui` (2,3 mil líneas por ahora) ya es esa reescritura, en PySide6, y lleva un 3 % por recuento de líneas. La pregunta honesta es, por tanto, _«¿qué pila hace el rediseño más barato y mejor?»_, no _«web o no reescribir»_.
3. **Interfaz y lógica están entremezcladas.** 103 de los 194 archivos de interfaz importan de la capa de datos. Ejemplo: `src/ui/pixeval/grades/__init__.py` lee participantes, fórmulas y hojas con error directamente de `PixevalDataManager`. Las reglas de negocio que viven en clases de widgets deben pasar a una capa de servicios antes de que _cualquier_ interfaz nueva (web o Qt) pueda reutilizarlas. Este paso lo necesita cada opción de abajo.
4. **El informe de progreso es específico de Qt.** Los parámetros `SignalInstance` (copia de seguridad, CAT3, recorrección HR) deben convertirse en una devolución de llamada / flujo de eventos neutral. Es fácil y local, pero toca el núcleo.
5. **Ya hay un servicio FastAPI en el repositorio.** La tecnología de la que dependen las opciones 03 y 04 ya se usa en la base de código.
6. **Los diálogos nativos de archivos se usan poco** (9 puntos de llamada en 5 archivos: selectores de carpeta para escaneos, copias de seguridad y exportaciones). Un navegador no puede entregar a Python una ruta de carpeta real, lo que importa para la opción de solo navegador (véase 03).

## Qué _no_ se midió (verifica antes de citar)

- El tamaño real del instalador / instalación, ya que `dist/` no está en el repositorio. Probablemente dominan OpenCV, SciPy y Qt.
- El rendimiento real de la interfaz con tablas grandes (la pantalla de notas contiene cientos o miles de filas).
- El comportamiento en Windows 10 y Windows 11 (WebView2 está disponible en todos los equipos cliente).

## Orden de lectura

[Índice de la investigación](README.md) (resumen y recomendación) → opciones [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md), [04](04-pywebview-native-window.md) → [comparación y hoja de ruta](05-comparison-and-roadmap.md) → [informe técnico final](06-final-technical-report.md).
