# Ikerketa: piXevalen erabiltzaile-interfazea modernizatzea

Galdera: zer aukera daude piXevalen interfazea eta erabilera-esperientzia hobetzeko, PySide6-ren uneko konfigurazioa oinarri hartuta, Python motorea mantenduz eta gastu berririk gehitu gabe?

**Aukerak nola epaitzen diren:** ardatz nagusia **azken erabiltzailea** da. A puntuazioa (% 80) azken erabiltzailearen esperientzia da (estetika eta itxura modernoa, elkarrekintza, eraginkortasuna, koherentzia, instalazioa eta abioa, portaera natiboa); B puntuazioa (% 20) Pythonen exekuzio-ingurunearekin ezartzeko erraztasuna da. Bi erabaki: Qt Widgets ala weba; eta, ondoren, zein web-estalki erabili (Qt WebEngine nabigatzaile integratua, pywebview nabigatzaile-ordezkoarekin, edo Python backend-a + kanpoko nabigatzailea).

**Murrizketak:** Python motorea mantentzea; migrazioa behin bakarrik egiten da, bertsio nagusi bakar gisa; ez da gastu errepikakor berririk; taldearen tamaina, trebetasunak eta lengoaiekiko ezagutza **ez** dira murrizketak (aukerak merezimendu teknikoaren arabera epaitzen dira).

**Hasi [azken txosten teknikoarekin](06-final-technical-report.md).** Gainerako fitxategiak euskarri-oharrak dira, bakoitza abantailekin, desabantailekin eta beste aukerekiko konparaketekin.

| Dokumentua                                                                    | Edukia                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [Azken txosten teknikoa](06-final-technical-report.md)                        | Arazoa, metodoa, azterketa, gomendioa, arriskuak, plana                                                                                     |
| [00 · Abiapuntua: uneko pila](00-baseline-current-stack.md)                   | Uneko kode-oinarriaren neurtutako datuak                                                                                                    |
| [01 · Qt Widgets modernizatzea](01-pyside6-widgets-modernised.md)             | Qt Widgets-en jarraitu eta modernizatzea                                                                                                    |
| [02 · Qt WebEngine hibridoa](02-qt-webengine-hybrid.md)                       | Web-interfazea Qt aplikazioaren barruan (nabigatzaile integratua)                                                                           |
| [03 · Web-aplikazio lokala nabigatzailean](03-local-web-app-fastapi-react.md) | Python backend-a (FastAPI) kanpoko nabigatzailearekin                                                                                       |
| [04 · Web-aplikazio lokala pywebview leihoan](04-pywebview-native-window.md)  | Berdina, leiho natibo batean (gomendatua)                                                                                                   |
| [05 · Konparaketa eta ibilbide-orria](05-comparison-and-roadmap.md)           | Azken erabiltzailearen puntuazioa vs. Pythonekiko erraztasuna, bi erabakiak, sailkapen konbinatua, sentikortasuna, ibilbide-orria, iturriak |

Oharrak: puntuazioak irizpide-balorazioak dira; instalatzailearen tamaina, errendimendua eta helburuko ekipoen datuak ez dira neurtu (ikus txostenaren 9. atala).
