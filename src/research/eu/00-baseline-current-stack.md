# 00 · Abiapuntua: piXeval gaur egun zeren gainean eraikita dagoen

_`pixeval` biltegitik (7.6.2) neurtua, makina honetan. Zifrak `.py` fitxategien lerro-zenbaketak dira, ez kalitate-iritzia._

## Pila begirada batean

| Eremua                        | Zer erabiltzen den                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Lengoaia / exekuzioa          | Python 3.12 (garapena), 3.13rako wheel finkatuak `requirements.txt`-en                                                                   |
| Interfazea                    | **PySide6 6.9.0 – Qt Widgets** (baita `QtGui`, `QtCore`, `QtPrintSupport`, `QtPdf`, `QtPdfWidgets` ere). Ez da `QtWebEngine`-ren erabilerarik aurkitu |
| Estiloak                      | Eskuz idatzitako QSS (`kitchen/style-v7.6.0.qss`, ~1.100 lerro), ~1.750 SVG ikono, Lottie animazioak (`rlottie-python`, `qt-lottie`)     |
| Datuak                        | SQLite hari bakoitzeko bilgarri propio baten bidez (`src/db/databases.py`); `psycopg2` ere badago                                        |
| OMR / ikusmena                | OpenCV, NumPy, scikit-image, pyzbar, pytesseract                                                                                         |
| Dokumentuak                   | reportlab, xhtml2pdf, pypdf, python-docx, openpyxl, XlsxWriter, pandas                                                                   |
| Sarea / posta                 | requests, google-api-client, zeep, `deep-translator`, `google-cloud-translate`                                                           |
| **Dagoeneko dagoen web-pila** | **FastAPI 0.115 + Uvicorn 0.34 + Starlette** (`kitchen/remote_pixeval/server`-ek erabilia, urruneko CAT zerbitzua)                       |
| Paketatzea                    | PyInstaller 6.13 (`compile/*.spec`) + Inno Setup (`compile/piXeval.iss`) → Windows instalatzailea                                        |
| Konkurrentzia                 | Ia ezer ez (`threading.Thread` behin). Zeregin luzeek aurrerapena Qt `SignalInstance` objektuen bidez jakinarazten dute, logikara pasatuta |

Biltegiak hainbat aplikazio ditu, ez bakarra: **piXeval**, **pixEBAP02**, **CAT3 Audit**, amaitu gabeko **Modern UI** bat (`src/modern_ui`) eta **Remote CAT** FastAPI zerbitzu bat.

## Geruza bakoitzaren tamaina

| Geruza                                            | Python fitxategiak |          Lerroak | Qt inportatzen du                                                      |
| ------------------------------------------------- | -----------------: | ---------------: | ---------------------------------------------------------------------- |
| `src/ui` (PySide6 interfaze egungoa)              |                194 |       **71.077** | guztia                                                                 |
| `src/modern_ui` (PySide6 birdiseinua, abian)      |                 28 |            2.301 | guztia                                                                 |
| `src/db`                                          |                  7 |            3.648 | fitxategi 1 (`databases.py`, `QApplication` inportazio bat)            |
| `src/omr` (+ tamaina bereko kopia `src/omr_audit`) |           16 (+16) | 6.704 (+6.704)   | **0 fitxategi**                                                        |
| `src/cat_lib`                                     |                 13 |            4.832 | 3 fitxategi (`SignalInstance`, `QDesktopServices`, `QPixmap/QImage`)   |
| `src/dataReports`                                 |                  9 |              830 | fitxategi 1 (`QImage`)                                                 |
| `src/utils`                                       |                 28 |            5.242 | 2 fitxategi (`SignalInstance`, aurrerapena jakinarazteko)              |

## Honek zer esan nahi duen

1. **Motorea ia guztiz independentea da interfazetik.** OMR, DB, txostenak eta CAT logika 21.000 lerro inguru dira, eta **7 fitxategik** inguruk bakarrik ukitzen dute Qt (batez ere aurrerapen-seinaleengatik edo irudi-motengatik). Horregatik da errealista «Python gelditzen da, interfazea bakarrik aldatzen da».
2. **Interfazea motorea baino ~3,4 aldiz handiagoa da.** Birdiseinu erreal orok interfaze oso handi baten berridazketa dakar, _teknologia edozein dela ere_. `src/modern_ui` (oraingoz 2,3 mila lerro) dagoeneko berridazketa hori da, PySide6-n, eta lerro-zenbaketaren arabera % 3 inguru eginda dago. Galdera zintzoa, beraz, hau da: _«zein pilak egiten du birdiseinua merkeago eta hobeto?»_, ez _«web ala berridatzi gabe»_.
3. **Interfazea eta logika nahasita daude.** 194 interfaze-fitxategietatik 103k datu-geruzatik inportatzen dute. Adibidea: `src/ui/pixeval/grades/__init__.py`-k parte-hartzaileak, formulak eta errore-orriak zuzenean `PixevalDataManager`-etik irakurtzen ditu. Widget-klaseetan bizi diren negozio-arauak zerbitzu-geruza batera eraman behar dira _edozein_ interfaze berrik (web edo Qt) berrerabili ahal izan aurretik. Urrats hau beheko aukera guztiek behar dute.
4. **Aurrerapenaren berri ematea Qt-ren berezkoa da.** `SignalInstance` parametroak (segurtasun-kopia, CAT3, HR berrikuspena) deialdi / gertaera-jario neutro bihurtu behar dira. Erraza eta lokala da, baina nukleoa ukitzen du.
5. **FastAPI zerbitzu bat dagoeneko biltegian dago.** 03 eta 04 aukerek behar duten teknologia kode-oinarrian erabiltzen da jada.
6. **Fitxategi-elkarrizketa natiboak gutxi erabiltzen dira** (9 dei-puntu 5 fitxategitan: eskaneatzeetarako, segurtasun-kopietarako eta esportazioetarako karpeta-hautatzaileak). Nabigatzaile batek ezin dio Pythonri benetako karpeta-bide bat eman, eta hori garrantzitsua da nabigatzaile hutseko aukeran (ikus 03).

## Zer _ez_ den neurtu (egiaztatu aipatu aurretik)

- Instalatzailearen / instalazioaren benetako tamaina, `dist/` ez baitago biltegian. Ziurrenik OpenCV, SciPy eta Qt nagusi dira.
- Interfazearen errendimendu erreala taula handietan (notak pantailak ehunka edo milaka lerro ditu).
- Portaera Windows 10 eta Windows 11n (WebView2 bezero-ekipo guztietan dago eskuragarri).

## Irakurketa-ordena

[Ikerketaren aurkibidea](README.md) (laburpena eta gomendioa) → aukerak [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md), [04](04-pywebview-native-window.md) → [konparaketa eta ibilbide-orria](05-comparison-and-roadmap.md) → [azken txosten teknikoa](06-final-technical-report.md).
