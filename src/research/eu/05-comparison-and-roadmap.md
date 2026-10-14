# 05 · Konparazioa, puntuazioa eta ibilbide-orria

## Murrizketei buruzko oharra

- **Ardatz nagusia azken erabiltzailea da, ez garatzailea.** Puntuazio nagusiak piXeval egunero erabiltzen duten pertsonek bizi dutena neurtzen du: produktuaren itxura eta sentsazioa, eraginkortasuna, eta haien ordenagailuetan nola instalatzen, abiarazten eta portatzen den. Garatzailearen erosotasuna bereizita puntuatzen da eta pisu txikiagoa du.
- **Windows soilik:** piXeval Windows-eko instalatzaile gisa banatzen da. Beste sistema eragileak ez dira kontuan hartzen; «koherentzia» erabiltzaileen Windows PCen arteko koherentzia da.
- **WebView2 bezero-ekipo guztietan eskuragarri dago** (azterlan honen hipotesia), beraz, bertan dagoela hartzen da, ez aurrebaldintza edo arrisku gisa.
- Taldearen tamaina, trebetasunak eta lengoaiekiko ezagutza **ez dira murrizketak**; aukerak merezimendu teknikoaren arabera epaitzen dira.
- **Ez dago migrazio inkrementalik:** interfaze berriak zaharra ordezkatzen du bertsio nagusi bakar batean.
- **Puntuazioak:** **A puntuazioa** = azken erabiltzailearen esperientzia (nagusia, %80ko pisua). **B puntuazioa** = Python exekuzio-ingurunearekin ezartzeko erraztasuna (bigarren mailakoa, %20ko pisua). Beste haztapen batzuk ere erakusten dira, aukeraren eragina ikus dadin.

## Erabakiaren egitura

Aukeraketa bi urratsetan egiten da, aukerak ez baitira lau berdin:

1. **1. erabakia: Qt Widgets ala web (React, etab.)?** 01 aukera web interfazearen aurrean. Erabaki handia da: UI/UX-aren sabaia eta tresna-katea zehazten ditu.
2. **2. erabakia (web bada): zein oskolek aurkezten du?** React frontend bera hiru modutan erakuts daiteke:
   - **02** Qt aplikazioaren barruan (**aplikazio barneko nabigatzailea, Qt WebEngine**),
   - **04** **pywebview** leiho batean, **kanpoko nabigatzailea ordezko** gisa web-ikuspegirik ez dagoenean,
   - **03** **Python backend gisa eta kanpoko nabigatzailea zuzenean erabiliz**.

3. eta 6. ataletan bi erabakiak daude; 1–4 ataletan oinarri diren frogak eta puntuazioak daude, eta 7. atalak konbinatu egiten ditu.

## 1. Python irudian: aukera bakoitza nola exekutatzen den

| #   | Aukera                                  | Non exekutatzen den Python                                          | Interfazeak nola hitz egiten dion                                                     | Erabiltzaileak zer abiarazten duen              |
| --- | --------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 01  | PySide6 Widgets, modernizatua           | interfazearen prozesu berean                                        | funtzio-dei zuzenak eta Qt seinaleak                                                  | exekutagarri bat                                |
| 02  | Qt WebEngine hibridoa                   | interfazearen prozesu berean                                        | QtWebChannel (JS↔Python zubi asinkronoa)                                              | Chromium duen exekutagarri bat                  |
| 03  | Web-aplikazio lokala, nabigatzailea     | abiarazle batek hasitako FastAPI prozesu bereizia                   | HTTP + WebSocket/SSE 127.0.0.1-en                                                     | abiarazlea, gero erabiltzailearen nabigatzailea |
| 04  | Web-aplikazio lokala + pywebview leihoa | FastAPI zerbitzaria exekutagarri beraren atzeko planoko hari batean | HTTP + WebSocket/SSE, gehi JS↔Python zubi txiki bat elkarrizketa-koadro natiboetarako | bere leihoa duen exekutagarri bat               |

## 2. Konpilatutako programaren tamaina

Konpilatutako emaitza PyInstaller-ek instalatzailean jartzen duena da. **Qt-ren bitarrak emaitzaren parte dira Qt tartean dagoen bakoitzean**; web-aukerek megabyte gutxi batzuekin ordezkatzen dituzte. Ondoko zifrak **PyPI-ko Windows wheel-etatik neurtuta daude** (fitxategi-zerrendak zuzenean irakurrita), ez benetako konpilazio batetik; benetako emaitza PyInstaller-ek biltzen duenaren araberakoa da.

**Aukera guztientzat komuna: Python motorraren pila** (`requirements.txt`-en finkatutako Windows wheel-en tamaina deskonprimituta):

| Osagaia                     | Deskonprimituta | Wheel (konprimituta) |
| --------------------------- | --------------: | -------------------: |
| OpenCV 4.12                 |          110 MB |                39 MB |
| SciPy 1.16                  |          116 MB |                39 MB |
| NumPy                       |           43 MB |                13 MB |
| pandas                      |           39 MB |                11 MB |
| scikit-image                |           25 MB |                13 MB |
| matplotlib                  |           20 MB |                 8 MB |
| Pillow, reportlab           |           11 MB |                 5 MB |
| **Motor-pilaren guztizkoa** |    **≈ 364 MB** |         **≈ 127 MB** |

**Aukeraren arabera aldatzen da: interfaze-geruza**

| Interfaze-geruza         | Zer txertatzen den                                                                                                                                                                                               |                 Deskonprimituta | Konprimituta (wheel) |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------: | -------------------: |
| 01 Qt Widgets            | Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7, PrintSupport 0,4 MB; PySide6 moduluak ≈ 12 MB; plugin-ak ≈ 5 MB; aukeran software bidezko OpenGL 20,6 MB eta itzulpenak ≈ 12 MB                                     |   **≈ 55–90 MB** (zenbatespena) |           ≈ 20–33 MB |
| 02 Qt WebEngine hibridoa | 01eko guztia, **gehi** QtWebEngine (`Qt6WebEngineCore.dll` 199,5 MB, itzulpenak ≈ 40 MB, baliabide-paketeak ≈ 13 MB: 255,7 MB guztira, neurtuta) **gehi** Quick/Qml/Network/OpenGL/Positioning ≈ 26 MB           | **≈ 340–370 MB** (zenbatespena) |         ≈ 135–150 MB |
| 03 Nabigatzailea         | FastAPI, Uvicorn, Starlette, Pydantic ≈ 8,9 MB; web frontend-a 0,34 MB (prototipoaren konpilazioa: 322 KB JS + 22 KB CSS); **Qt-rik gabe, nabigatzaile-motorrik gabe**                                           |                      **≈ 9 MB** |               ≈ 3 MB |
| 04 pywebview leihoa      | 03ko guztia, **gehi** pywebview 1,6 MB (WebView2 kargatzailea eta interoperabilitate-DLLak ≈ 1 MB) eta pythonnet 0,7 MB; **WebView2 motorra bera ez da txertatzen** (Windows-en parte da, Edge-rekin partekatua) |                     **≈ 11 MB** |               ≈ 4 MB |

**Guztizkoak (osagai ezagunak)**

|                  | Deskonprimituta | Konprimituta (wheel; deskargaren hurbilketa) |                  04rekin alderatuta |
| ---------------- | --------------: | -------------------------------------------: | ----------------------------------: |
| 01 Qt Widgets    |    ≈ 420–455 MB |                                 ≈ 147–160 MB |               **%12 – %21 gehiago** |
| 02 Qt WebEngine  |    ≈ 705–735 MB |                                 ≈ 263–276 MB | **%88 – %96 gehiago** (ia bikoitza) |
| 03 Nabigatzailea |        ≈ 373 MB |                                     ≈ 130 MB |                         %1 gutxiago |
| 04 pywebview     |        ≈ 375 MB |                                     ≈ 131 MB |                       erreferentzia |

Oharrak:

1. **pywebview-ek 2–3 MB inguruko bitarrak gehitzen ditu; Qt-k 55–90 MB inguru (Widgets) edo 340–370 MB inguru (WebEngine-rekin).** Qt saihesten duten web-oskolak dira aukerarik txikienak, eta **04 gaur egungo Qt Widgets konpilazioa baino 45–80 MB inguru txikiagoa da** (%12–%21) PySide6 paketetik kendu ondoren.
2. **Aurrezki horrek Qt konpilatutako programatik kentzea eskatzen du.** Interfazekoak ez diren zazpi fitxategi inguruk Qt inportatzen dute oraindik (txostenaren F1 aurkikuntza); zerbitzu-geruzaren urratsak kendu egiten ditu. Urrats hori gabe, PySide6 paketean geratzen da.
3. **Interfaze-geruza emaitzaren zati handi bat da.** Motor-pilak 364 MB inguru ditu (OpenCV eta SciPy buru); Qt Widgets-ek %12–%21 inguru gehitzen dio, eta Qt WebEngine-k programa ia bikoizten du.
4. **Deskarga- eta eguneratze-denbora:** 02ren interfaze-geruzak 135–150 MB inguru konprimituta ditu, 04k 4 MB inguruen aldean; 10 Mbit/s-ra instalazio eta eguneraketa bakoitzean 2 minutu inguruko gehigarria.
5. Neurtu gabe: Python exekuzio-ingurunea, beste mendekotasunak (Google bezeroak, etab.), PyInstaller-en gainkostua, Inno Setup-en konpresioa. Benetako konpilazio bat da lehen balidazio-zeregina.

## 3. A puntuazioa: azken erabiltzailearen esperientzia (nagusia)

| Irizpidea (A barruko pisua)                         | Azken erabiltzaileak sentitzen duena                                                                                                                                                    |     01 |     02 |     03 |     04 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Estetika eta itxura modernoa (25)                   | tipografia, tartekatzea, itzalak, lausotzea, modu iluna, akabera                                                                                                                        |      2 |      5 |      5 |      5 |
| Elkarrekintza atsegina (15)                         | trantsizioak, gainetik pasatzean/fokua hartzean erantzuna, bizkortasuna                                                                                                                 |      2 |      5 |      5 |      5 |
| Eraginkortasuna (20)                                | taula trinkoak, bilaketa/iragazkia, komando-paleta, teklatuaren erabilera, erantzun argia, grafikoak, irisgarritasuna                                                                   |      3 |      5 |      5 |      5 |
| Erabiltzaileen Windows PCen arteko koherentzia (10) | itxura eta portaera bera edozein Windows ekipotan                                                                                                                                       |      5 |      5 |      3 |      4 |
| Instalazioa eta abiaraztea (10)                     | abiarazte-denbora, aurrebaldintzarik gabe, aplikazio-sentsazioa                                                                                                                         |      5 |      3 |      3 |      4 |
| Mahaigaineko portaera natiboa (10)                  | fitxategi/karpeta hautatzaile errealak, inprimaketa, arrastatu eta jaregin, konexiorik gabe funtzionatzea                                                                               |      5 |      5 |      2 |      4 |
| **Konpilatutako programaren tamaina (10)**          | instalatzailearen eta instalazioaren tamaina, deskarga- eta eguneratze-denbora (2. atala); 5 = txikiena, 4 = hartatik %10 gehiagora arte, 3 = %10–25, 2 = %25–60, 1 = %60 baino gehiago |      3 |      1 |      5 |      5 |
| **A puntuazioa (0–100)**                            |                                                                                                                                                                                         | **64** | **88** | **86** | **94** |

Azken erabiltzaile batek nabarituko lukeena:

- **01** azkar abiarazten da eta mahaigaineko edozein programa bezala portatzen da, baina pantailak zaharkituak dirudite eta interfazea soila izaten jarraitzen du. Programak 55–90 MB Qt darama.
- **02**k interfaze landuena eta koherenteena eskaintzen du, baina programa 04 baino ia bi aldiz handiagoa da, instalazio eta eguneraketa bakoitza 135–150 MB inguru (konprimituta) astunagoa da, eta abiarazte motelagoa da barruan nabigatzaile-motor oso bat daramalako.
- **03** 02 bezain ondo ikusten da eta txikiena da, baina nabigatzaile-fitxa bat da: zerbitzari bat eta nabigatzaile bat abiarazten ditu, ezin du karpeta-hautatzaile egokirik eskaini, eta erabiltzaileak duen nabigatzailearen mende dago (Edge eta Chrome-k motorra partekatzen dute; Firefox-ek ez).
- **04** 02 bezain ondo ikusten da, bere leihoan irekitzen da programa normal batek bezala, fitxategi eta karpeta hautatzaile natiboak erabiltzen ditu eta gaurko programa baino txikiagoa da. Edge-ren WebView2 motorra erabiltzen du, bezero-ekipo guztietan dagoena; inoiz falta balitz, programak nabigatzailera jotzen du (03ren portaera).

## 4. B puntuazioa: Python exekuzio-ingurunearekin ezartzeko erraztasuna (bigarren mailakoa)

| Irizpidea (B barruko pisua)                | Zer eskatzen duen                                                               |     01 |     02 |     03 |     04 |
| ------------------------------------------ | ------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Motorraren integrazioa (30)                | Python kodea deitzea, eskaneatze/segurtasun-kopien aurrerapen-gertaerak, hariak |      5 |      4 |      4 |      4 |
| Konpilazio- eta paketatze-ahalegina (30)   | PyInstaller, txertatu beharreko exekuzio-inguruneak, sinadura, argitalpen-katea |      5 |      2 |      4 |      3 |
| Probatu beharreko pieza mugikorrak (20)    | tresna-kateak, prozesu-mugak, zubi/API kontratuak                               |      5 |      2 |      3 |      3 |
| Lehendik dagoen lanaren berrerabilera (20) | FastAPI pilan jada, lehendik dagoen prototipoa, zerbitzu-geruza                 |      2 |      4 |      5 |      5 |
| **B puntuazioa (0–100)**                   |                                                                                 | **88** | **60** | **80** | **74** |

Garatzaileentzako erosotasunak soilik (bero-birkarga, diseinu-trukea, ekosistema handiak) **ez dira** puntuatzen; posible egiten duten azken erabiltzailearen emaitzaren bidez soilik axola dute.

## 5. 1. erabakia: Qt Widgets ala web?

|                                                       |                              01 Qt Widgets |                             Web interfazea (02, 03, 04) |
| ----------------------------------------------------- | -----------------------------------------: | ------------------------------------------------------: |
| Estetika, elkarrekintza, eraginkortasuna              |                                    2, 2, 3 |                                                 5, 5, 5 |
| Erabiltzaileen Windows PCen arteko koherentzia        |                                          5 |                                                     3–5 |
| Instalazioa eta abiaraztea                            |                                          5 |                                                     3–4 |
| Mahaigaineko portaera natiboa                         |                                          5 |                              2–5 (oskolaren araberakoa) |
| Konpilatutako programaren tamaina                     | 3 (≈ 420–455 MB, 04 baino %12–%21 gehiago) | 1–5 (≈ 373–375 MB 03/04rentzat; ≈ 705–735 MB 02rentzat) |
| **A puntuazioa: azken erabiltzailearen esperientzia** |                                     **64** |                                               **86–94** |
| **B puntuazioa: Python-ekiko erraztasuna**            |                                     **88** |                                               **60–80** |

**Epaia: weba.** Web-aukerek azken erabiltzaileei interfaze nabarmen hobea ematen diete (5, 2–3ren aurrean itxuran, elkarrekintzan eta eraginkortasunean), eta web-oskol onenak **Qt konpilazioa baino txikiagoak dira**, Qt-ren bitarrak alde batera uzten dituztelako. Qt Widgets-en desabantailak azken erabiltzailearentzat **egiturazkoak** dira: QSS-k ez du diseinu-motorrik, benetako itzalik, lausotzerik edo trantsiziorik, eta osagai modernoak eskuz marrazten dira. Webaren desabantailak **zeregin identifikagarriak** dira (elkarrizketa-koadro natiboak, Qt motorretik kentzea, paketatze-kate bat).

Qt Widgets-ek web-oskol onena (04) gainditzen du soilik azken erabiltzailearen esperientziak **%32 inguru baino gutxiago** pisatzen badu (03ren aurrean: %27; 02ren aurrean: %54). Hemen erabilitako %80arekin, web-aukerek 14–21 puntu konbinatuz irabazten dute.

## 6. 2. erabakia: zein web-oskol?

Hiruek React frontend bera erakusten dute, beraz itxura eta elkarrekintza berdinak dira. Azken erabiltzailearentzat aldatzen dena errendatzearen koherentzia, tamaina, instalazioa eta abiaraztea, eta portaera natiboa dira.

| Alderdia                             | **02 Barneko nabigatzailea (Qt WebEngine)**      | **04 pywebview leihoa, kanpoko nabigatzaile-ordezkoarekin**                                                      | **03 Python backend-a + kanpoko nabigatzailea**                                     |
| ------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Itxura eta elkarrekintza             | berdinak                                         | berdinak                                                                                                         | berdinak                                                                            |
| Errendatzearen koherentzia           | berdina PC guztietan (Chromium txertatua)        | oso hurbila: Edge WebView2 Chromium-en oinarritzen da, bezero-ekipo guztietan dago eta Windows-ek eguneratzen du | nabigatzailearen araberakoa (Edge/Chrome-k motorra partekatzen dute; Firefox-ek ez) |
| Erabiltzaileak ikusten duena         | Qt aplikazioaren leihoa                          | leiho natibo txiki bat, nabigatzaile-markorik gabe                                                               | nabigatzaile-fitxa edo -leiho bat                                                   |
| **Konpilatutako programa (guztira)** | **≈ 705–735 MB** (interfaze-geruza ≈ 340–370 MB) | **≈ 375 MB** (interfaze-geruza ≈ 11 MB; pywebview ≈ 2–3 MB bitar, Qt-rik gabe)                                   | **≈ 373 MB** (interfaze-geruza ≈ 9 MB)                                              |
| Deskarga / eguneraketa               | ≈ 263–276 MB                                     | ≈ 131 MB                                                                                                         | ≈ 130 MB                                                                            |
| Abiaraztea                           | motelagoa (Chromium motorra)                     | azkarra                                                                                                          | zerbitzaria abiarazi, gero nabigatzailea irekitzen da                               |
| Aurrebaldintzak                      | bat ere ez                                       | bat ere ez (WebView2 bezero guztietan dago)                                                                      | nabigatzaile modernoa                                                               |
| Fitxategi/karpeta hautatzaileak      | natiboak (Qt)                                    | natiboak (pywebview); ordezko moduan, zerbitzariaren bidez                                                       | nabigatzaile batetik ez daude eskuragarri; idatzita edo zerbitzariak irekita        |
| Inprimaketa / PDFa                   | Qt inprimaketa eta PDFa                          | web-ikuspegia edo zerbitzari-aldeko PDFa                                                                         | nabigatzailea edo zerbitzari-aldeko PDFa                                            |
| Konexiorik gabe funtzionatzen du     | bai                                              | bai                                                                                                              | bai                                                                                 |
| Ordezkoa                             | ez dagokio                                       | abiarazleak kanpoko nabigatzailea irekitzen du leihoa abiarazi ezin bada                                         | ez dagokio                                                                          |
| Motorraren segurtasun-eguneraketak   | piXeval-en bertsio berri bat behar dute          | WebView2 bere kabuz eguneratzen da Windows-en bidez                                                              | erabiltzailearen nabigatzailea jarraitzen dute                                      |
| A / B puntuazioa                     | 88 / 60                                          | **94 / 74**                                                                                                      | 86 / 80                                                                             |

Oharrak:

- **04k 02 gainditzen du azken erabiltzailearentzat (94 vs. 88):** 02 apur bat koherenteagoa da, baina ia bi aldiz handiagoa, abiarazten motelagoa eta eguneratzen motelagoa. 04 ezartzeko errazagoa ere bada (74 vs. 60).
- **Ordezkoa abiarazlearen funtzio bat da, ez pywebview-ek berez egiten duen zerbait,** eta bezero guztietan WebView2 dagoenez, segurtasun-sare bat baino ez da. Ordezko moduan esperientzia 03rena bezala geratzen da.
- **03 bakarrik** da txikiena eta banatzeko errazena, baina web-aukera ahulena azken erabiltzaileentzat (86): hautatzaile natiborik ez eta nabigatzailearen araberako itxura.

**Epaia: 04**, kanpoko nabigatzailea segurtasun-ordezko gisa. 02 hobetsiko litzateke bakarrik errendatze-motor berdin bermatuak ia bi aldiz handiagoa den programa bat baino gehiago axola badu, edo zerbitzari lokal bat onartezina bada.

## 7. Emaitza konbinatua eta sentikortasuna

| Aukera                                  | A puntuazioa: azken erabiltzailearen esperientzia | B puntuazioa: Python-ekiko erraztasuna | **Konbinatua (A 80 / B 20)** |
| --------------------------------------- | ------------------------------------------------: | -------------------------------------: | ---------------------------: |
| 01 PySide6 Widgets, modernizatua        |                                                64 |                                 **88** |                         68,8 |
| 02 Qt WebEngine hibridoa                |                                                88 |                                     60 |                         82,4 |
| 03 Web-aplikazio lokala, nabigatzailea  |                                                86 |                                     80 |                         84,8 |
| **04 Web-aplikazio lokala + pywebview** |                                            **94** |                                     74 |                     **90,0** |

Bi ardatzeko ikuspegia (azken erabiltzailearen esperientzia gora, ezartzeko erraztasuna eskuinera):

```
 azken       94 |                   04
 erabiltzaile 88 |        02
 esperientzia 86 |                   03
                |
             64 |                              01
                +-----------------------------------
                  60        74  80       88   Python-ekiko erraztasuna
```

Azken erabiltzailearen esperientziaren (A) pisuarekiko sentikortasuna:

| A-ren pisua                              |       01 |   02 |       03 |       04 |
| ---------------------------------------- | -------: | ---: | -------: | -------: |
| %100 (azken erabiltzailea bakarrik)      |     64,0 | 88,0 |     86,0 | **94,0** |
| %90                                      |     66,4 | 85,2 |     85,4 | **92,0** |
| %80 (erabilitakoa)                       |     68,8 | 82,4 |     84,8 | **90,0** |
| %70                                      |     71,2 | 79,6 |     84,2 | **88,0** |
| %60                                      |     73,6 | 76,8 |     83,6 | **86,0** |
| %50                                      |     76,0 | 74,0 |     83,0 | **84,0** |
| %40                                      |     78,4 | 71,2 | **82,4** |     82,0 |
| %30                                      | **80,8** | 68,4 |     81,8 |     80,0 |
| %0 (garatzailearen erosotasuna bakarrik) | **88,0** | 60,0 |     80,0 |     74,0 |

Tamaina-irizpidearen pisuarekiko sentikortasuna A barruan (gainerakoak proportzioz eskalatuta; puntuazio konbinatua A 80 / B 20-rekin):

| Tamainaren pisua A barruan |   01 |   02 |   03 |       04 |
| -------------------------- | ---: | ---: | ---: | -------: |
| %0 (tamaina ezikusia)      | 69,1 | 88,5 | 83,5 | **89,4** |
| %10 (erabilitakoa)         | 68,8 | 82,4 | 84,8 | **90,0** |
| %20                        | 68,5 | 76,3 | 86,1 | **90,6** |
| %30                        | 68,1 | 70,3 | 87,3 | **91,0** |

Ondorioak:

1. **Azken erabiltzaileentzat web-aukerek argi irabazten dute:** 86–94, Qt Widgets-en 64ren aurrean. Qt Widgets-ek garatzailearen erosotasunak azken erabiltzailearen esperientziak baino pisu handiagoa duenean soilik egiten du aurrera (azken erabiltzailearen pisua %32 inguru baino txikiagoa).
2. **04 lehen geratzen da azken erabiltzailearen edozein pisurekin, %100etik %43 ingurura arte**; hortik behera 03 nagusitzen da, garatzailearen erosotasuna nagusitu arte.
3. **Tamaina da 02 atzean uzten duena.** Tamaina ezikusten bada, 02 88,5era igotzen da, 04rengandik (89,4) puntu bat baino gutxiagora; erabilitako pisuarekin (%10) 82,4ra jaisten da (hirugarrena); pisu handiagoekin gehiago jaisten da.
4. **Web-oskolen tamaina-abantaila Qt konpilatutako programatik kentzearen mende dago.** Hori gabe, PySide6 (≈ 55–90 MB) paketean geratzen da eta 04ren tamaina 01en antzekoa izango litzateke.

## 8. Aurrebaldintza zeharkakoak (edozein aukerarako beharrezkoak)

1. **Zerbitzu-geruza bat erauzi** datu-geruzari zuzenean deitzen dioten 103 interfaze-fitxategietatik; erabilera-kasuen funtzioak definitu (adib. `grades.list(exam_id)`, `correction.run(folder)`).
2. **Logika-kodeko Qt seinaleak ordezkatu** (`SignalInstance` `cat_lib` eta `utils`-en) callback/gertaeraz; interfazekoak ez diren moduluetako 7 Qt inportazioak kendu.
3. **Idazle bakar bat definitu** SQLite-rentzat (aldi berean irekitako bi interfazek ez dute datu-basea hondatu edo blokeatu behar).
4. **Karakterizazio-probak** kalifikazio-formuletan, OMR irteeretan eta txostenen sorkuntzan, berrantolatu aurretik.

## 9. Ibilbide-orri iradokia (bertsio nagusi bat)

| Fasea | Lana                                                                                                                                                                                 | Emaitza                                                                | Irteera-irizpidea                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 0     | Txosten hau berrikusi; balidazio-froga exekutatu (paketearen benetako tamainak Qt-rekin eta gabe, elkarrizketa-koadro natiboak, taulen errendimendua)                                | erabaki-erregistroa                                                    | onespena                                                                        |
| 1     | Zerbitzu-geruza + aurrerapen-gertaerak + karakterizazio-probak (interfaze-aldaketarik gabe)                                                                                          | `pixeval_core` Python paketea, lehendik dagoen Qt aplikazioak erabilia | lehendik dagoen aplikazioa aldatu gabe eta berdean                              |
| 2     | FastAPI API erabilera-kasu bakoitzerako; web interfazea pantaila bakoitzeko eraikita haren gainean, lehendik dagoen prototipoa abiapuntu gisa                                        | interfaze berri osoa garapen-adar batean                               | parekotasun-zerrenda: gaurko pantaila, elkarrizketa-koadro eta txosten bakoitza |
| 3     | Elkarrizketa-koadro natiboak pywebview bidez; OMR/zuzenketa fluxuak gertaera-jariorekin; paketatzea (PyInstaller + Inno); lehendik dauden datu-baseak automatikoki ireki eta migratu | instalagarria den bertsio hautagaia                                    | benetako datu-baseekin muturretik muturrerako probak gainditzen ditu            |
| 4     | Beta itxia benetako erabiltzaile eta datu-baseekin; akatsak konpondu; aurreko instalatzailea eskuragarri mantendu atzera egiteko                                                     | betaren onespena                                                       | adostutako epean akats blokeatzailerik ez                                       |
| 5     | Hurrengo bertsio nagusi gisa argitaratu                                                                                                                                              | argitalpena                                                            | erabiltzaileak bertsio berrian; aurreko instalatzailea bertsio batez mantenduta |

## 10. Iturriak

- Qt dokumentazioa, _User Interfaces_ (Widgets vs. Qt-ren pila deklaratiboa; animazioari eta mahaigaineko aplikazio konplexuei buruzko oharrak): <https://doc.qt.io/qt-6.9/topics-ui.html>
- Qt for Python, _QtWebChannel_: <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
- Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_: <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
- PyPI-ko bertsio-metadatuak eta fitxategi-zerrendak PySide6 6.9.0 (Essentials, Addons), OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview eta pythonnet-en Windows wheel-entzat (2. ataleko tamaina-zifrak): <https://pypi.org>
- pywebview 6.x paketearen zerrenda: <https://www.archlinux.org/packages/extra/any/python-pywebview>
