# Txosten teknikoa: piXeval-en erabiltzaile-interfazea modernizatzeko aukerak

**Gaia:** piXeval 7.6.2 (OMR azterketen kudeaketa-sistema)
**Egilea:** Miracle Apata, BEng
**Egoera:** berrikuspenerako zirriborroa — euskarri-oharrak karpeta honetan daude
**Artefaktu osagarria:** prototipo interaktiboa, <https://prmpsmart.github.io/pixeval_web/>

---

## Laburpena

piXeval Windows-erako Python mahaigaineko aplikazio bat da, eta bere erabiltzaile-interfazea PySide6-rekin (Qt Widgets) eraikita dago. Interfazeak 71.000 kode-lerro inguru ditu eta egunero erabiltzen duten pertsonentzat erabilgarritasunaren eta kalitate bisualaren muga nagusia da; prozesamendu-motorrak (OMR, datu-basea, txostenak), berriz, 21.000 lerro inguru ditu eta Qt-tik neurri handi batean independentea da. Txosten honek interfazea hobetzeko bideak aztertzen ditu, Python motorra mantenduz eta lizentzia- edo ostatatze-kosturik sortu gabe, bi erabaki gisa. **1. erabakia:** Qt Widgets modernizatu (01) ala web frontend batera pasa (React, etab.). **2. erabakia**, web bada: Qt barruko nabigatzaile gisa aurkeztu (Qt WebEngine, 02), pywebview leiho batean kanpoko nabigatzailea segurtasun-ordezko gisa duela (04), edo Python backend gisa eta kanpoko nabigatzailea zuzenean erabiliz (03). Migrazioa behin bakarrik egingo da, bertsio nagusi bakar gisa. **Ardatz nagusia azken erabiltzailea da**: puntuazio nagusiak (%80) erabiltzaileek bizi dutena neurtzen du (estetika eta itxura modernoa, elkarrekintza atsegina, eraginkortasuna, koherentzia, instalazioa eta abiaraztea, portaera natiboa eta **konpilatutako programaren tamaina**); bigarren mailako puntuazio batek (%20) Python exekuzio-ingurunearekin ezartzeko erraztasuna neurtzen du. Windows wheel-etatik neurtuta, Qt-k 55–90 MB inguru gehitzen dizkio konpilatutako emaitzari (Widgets) edo 340–370 MB inguru (WebEngine-rekin), pywebview-ek, berriz, 2–3 MB inguruko bitarrak gehitzen ditu eta web interfaze-geruza osoak 11 MB inguru (Edge WebView2 motorra Windows-en parte da eta bezero-ekipo guztietan eskuragarri dago). Web-aukerek 100etik 86–94 lortzen dute azken erabiltzailearen esperientzian, Qt Widgets-en 64ren aurrean, hau ezartzeko errazagoa den arren (88, 60–80ren aurrean). Qt Widgets-ek irabazten du soilik azken erabiltzailearen esperientziak herena baino gutxiago pisatzen badu. Web-oskolen artean, pywebview leihoa lehen geratzen da (94), Qt barruko nabigatzailearen (88) aurretik, azken hau bere tamainak (konpilatutako programa ia bikoitza) eta abiarazteak atzean uzten dutelako. Gomendatutako norabidea **Python motor bat (FastAPI) da, web erabiltzaile-interfazea pywebview leiho natibo batean aurkeztuta, «ireki nabigatzailean» ordezko gisa**, edozein aukeratan beharrezkoa den zerbitzu-geruzaren berrantolaketa aurretik eginda. Hainbat magnitude (instalatzailearen benetako tamaina, abiarazte-denbora, taula handien errendimendua) ez ziren benetako konpilazio batean neurtu eta balidazio-zeregin gisa zerrendatzen dira.

---

## 1. Sarrera

### 1.1 Aurrekariak

piXeval-ek paperezko aukera anitzeko azterketa baten bizi-ziklo osoa onartzen du: galdera-bankuak, azterketen osaketa, erantzun-orrien sorkuntza, eskaneatzea eta marken ezagutza optikoa (OMR), identitateen esleipena, zuzenketa, notak eta txostenak. PyInstaller eta Inno Setup-ekin eraikitako Windows instalatzaile gisa banatzen da.

### 1.2 Arazoaren azalpena

Erabiltzaileek produktuarekin Qt Style Sheets-ekin estilatutako Widgets oinarritutako interfaze baten bidez elkarreragiten dute. Itxura eta elkarrekintza-kalitate garaikidea lortzea (trantsizio animatuak, taula trinkoak baina irakurgarriak, komando-bilaketa, diseinu moldagarriak, diseinu-token koherenteak) motela eta garestia da pila honekin. Galdera da interfaze-teknologia desberdin batek erabiltzaile-esperientzia hobea eskaintzen duen kostu eta arrisku onargarrian.

### 1.3 Helburuak eta murrizketak

1. **Nagusia: azken erabiltzailea.** Erabiltzaileek egunero ikusten eta bizi dutena hobetzea: interfaze atsegina, eraginkorra, estetikoa eta modernoa, eta, gainera, haien ordenagailuetan ondo instalatzen, abiarazten eta portatzen dena. Garatzailearen erosotasuna bigarren mailakoa da.
2. **Bigarren mailakoa:** esperientzia hori Python motorra irudian dagoela ezartzeko eta banatzeko erraza izatea (motorra bera mantentzen da).
3. **Ez sartu kostu errepikakor berririk** (lizentziak, ostatatzea, harpidetzak).
4. Aplikazio instalatuaren esperientzia **Windows**-en mantentzea (helburuko plataforma bakarra): abiaraztea, konexiorik gabe lan egitea, fitxategi lokaletarako eta eskanerraren irteerarako sarbidea.
5. **Behin bakarrik** migratzea: interfaze berriak zaharra ordezkatzen du bertsio nagusi bakar batean, erabiltzaile guztiei bidalita. Ez dago migrazio inkrementalik edo aldi bereko bertsio paralelorik, beraz bertsioaren fidagarritasunak eta funtzioen parekotasunak pisu handiagoa dute.
6. Taldearen tamaina, trebetasunak eta lengoaiekiko ezagutza **ez dira** murrizketatzat hartzen. Aukerak merezimendu teknikoaren arabera epaitzen dira; lengoaia berri bat ez da berez kostua, baina exekuzio-ingurune gehigarriak, konpilazio-kateak eta prozesu-mugak bai.

### 1.4 Irismena

Aurkezpen-geruza eta motorrarekiko integrazioa soilik hartzen dira kontuan. OMR algoritmoak, kalifikazio-arauak eta datu-basearen eskema ez dira aldatzen.

---

## 2. Uneko sistemaren azterketa

Biltegitik neurtuta (xehetasunak [00-baseline-current-stack.md](00-baseline-current-stack.md)-n):

| Geruza                                                     | Fitxategiak |        Lerroak | Qt mendekotasuna |
| ---------------------------------------------------------- | ----------: | -------------: | ---------------- |
| Interfazea (`src/ui`)                                      |         194 |         71.077 | osoa             |
| Berrdiseinua abian (`src/modern_ui`)                       |          28 |          2.301 | osoa             |
| Datu-basea (`src/db`)                                      |           7 |          3.648 | fitxategi 1      |
| OMR (`src/omr`, gehi tamaina bereko kopia `src/omr_audit`) |    16 (+16) | 6.704 (+6.704) | bat ere ez       |
| CAT motorraren bilgarria (`src/cat_lib`)                   |          13 |          4.832 | 3 fitxategi      |
| Txostenak (`src/dataReports`)                              |           9 |            830 | fitxategi 1      |
| Utilitateak (`src/utils`)                                  |          28 |          5.242 | 2 fitxategi      |

Azterketa gidatzen duten aurkikuntzak:

- **F1 — Motorra bereizgarria da.** 21.000 logika-lerro inguruk Qt zazpi fitxategi ingurutan soilik erabiltzen dute, batez ere aurrerapen-seinaleetarako eta irudi-motetarako.
- **F2 — Interfazea da lan-bolumen handiena.** Motorraren tamainaren 3,4 aldi ingurukoa da. Aukeratutako teknologia edozein dela ere, berrdiseinu batek pantailak berriz ezartzea dakar; `modern_ui` ahalegina bera ere horrelako berridazketa bat da eta lerro-kopuruaren arabera %3 inguru osatuta dago.
- **F3 — Aurkezpena eta logika nahasita daude.** 194 interfaze-fitxategietatik 103ek datu-geruza inportatzen dute, eta notak bezalako pantailek domeinu-objektuak zuzenean irakurri eta aldatzen dituzte. Zerbitzu-geruza, beraz, edozein frontend berriren aurrebaldintza da.
- **F4 — Web pila bat badago jada.** FastAPI 0.115, Uvicorn eta Starlette eskakizunetan daude eta urruneko CAT zerbitzuak erabiltzen ditu.
- **F5 — Paketatzea ezarrita dago.** PyInstaller + Inno Setup-ek Windows instalatzaile bat ematen dute; edozein aukerak berrerabili beharko luke ahal denean.
- **F6 — Fitxategi-elkarrizketa natiboak erabiltzen dira** (bederatzi dei-puntu bost fitxategitan eskaneatze, segurtasun-kopia eta esportazio karpetetarako). Karpeta-bideak eskakizun operatiboa dira, eta horrek nabigatzaile-soilik soluzioei eragiten die.

---

## 3. Ebaluazio-metodoa

### 3.1 Bi puntuazio

**A puntuazioa: azken erabiltzailearen esperientzia (nagusia, puntuazio konbinatuaren %80).**

| Irizpidea                                      | Pisua A barruan | Azken erabiltzaileak sentitzen duena                                                                                       |
| ---------------------------------------------- | --------------: | -------------------------------------------------------------------------------------------------------------------------- |
| Estetika eta itxura modernoa                   |              25 | tipografia, tartekatzea, itzalak, lausotzea, modu iluna, akabera                                                           |
| Elkarrekintza atsegina                         |              15 | trantsizioak, gainetik pasatzean/fokua hartzean erantzuna, bizkortasuna                                                    |
| Eraginkortasuna                                |              20 | taula trinkoak, bilaketa/iragazkia, komando-paleta, teklatuaren erabilera, erantzun argia, grafikoak, irisgarritasuna      |
| Erabiltzaileen Windows PCen arteko koherentzia |              10 | itxura eta portaera bera edozein Windows ekipotan (bertsioak, nabigatzaileak, exekuzio-inguruneak)                         |
| Instalazioa eta abiaraztea                     |              10 | abiarazte-denbora, aurrebaldintzak, aplikazio-sentsazioa                                                                   |
| Mahaigaineko portaera natiboa                  |              10 | fitxategi/karpeta hautatzaile errealak, inprimaketa, arrastatu eta jaregin, konexiorik gabe funtzionatzea (F6 aurkikuntza) |
| **Konpilatutako programaren tamaina**          |              10 | instalatzailearen eta instalazioaren tamaina, deskarga- eta eguneratze-denbora (Windows wheel-etatik neurtuta, §5.1)       |

**B puntuazioa: Python exekuzio-ingurunearekin ezartzeko erraztasuna (bigarren mailakoa, %20).**

| Irizpidea                             | Pisua B barruan | Galdera                                                                         |
| ------------------------------------- | --------------: | ------------------------------------------------------------------------------- |
| Motorraren integrazioa                |              30 | Python kodea deitzea, eskaneatze/segurtasun-kopien aurrerapen-gertaerak, hariak |
| Konpilazio- eta paketatze-ahalegina   |              30 | PyInstaller, txertatu beharreko exekuzio-inguruneak, sinadura, argitalpen-katea |
| Probatu beharreko pieza mugikorrak    |              20 | tresna-kateak, prozesu-mugak, zubi/API kontratuak                               |
| Lehendik dagoen lanaren berrerabilera |              20 | FastAPI pilan jada, lehendik dagoen prototipoa, zerbitzu-geruza                 |

Garatzaileentzako erosotasunak soilik (bero-birkarga, diseinu-trukea, ekosistema handiak) nahita **ez dira** puntuatzen; posible egiten duten azken erabiltzailearen emaitzaren bidez soilik axola dute.

### 3.2 Metodoa eta mugak

Aukera bakoitza 1etik 5era puntuatzen da irizpide bakoitzeko dokumentazioan, argitaratutako gidetan eta aurreko kode-neurrietan oinarrituta. **Puntuazioak aditu-iritzia dira, ez neurketak.** Hiru web-aukerek berdin puntuatzen dute itxuran, elkarrekintzan eta eraginkortasunean eraikuntzagatik (web plataforma bera); koherentziagatik, instalazioagatik/abiarazteagatik eta portaera natiboagatik, eta B puntuazioagatik bereizten dira. Oraindik ez da egin aukeraren bat piXeval barruan neurtzeko benchmark-ik, ezta benetako erabiltzaileekin erabilgarritasun-probarik ere.

---

## 4. Aukera hautagaiak

Abantaila, desabantaila eta konparazioekin idatzi osoak [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md) eta [04](04-pywebview-native-window.md)-n daude; puntuazioa [05](05-comparison-and-roadmap.md)-n dago.

**01 — PySide6 Widgets modernizatu.** Arrisku tekniko txikiena eta integrazio natibo onena; konexiorik gabe, prozesu bakarra, tresna berririk gabe. Baina QSS CSS-ren azpimultzo bat da (diseinu-motorrik, efekturik edo trantsiziorik ez), osagai modernoak neurrira eraiki behar dira, iterazioa motela da eta prest dauden osagaien ekosistema txikia da. Ez du saihesten 70.000 lerro inguruko interfazearen berridazketa; tresna-multzoa mantentzen du soilik. _Aukeratzeko arrazoia:_ prozesu-muga edo exekuzio-ingurune gehigarri bat onartezina da. _Ez aukeratzeko arrazoia:_ interfaze-sabai txikiena.

**02 — Qt WebEngine hibridoa.** Web pantailak (Chromium) lehendik dagoen Qt aplikazioan txertatu eta QtWebChannel-ekin lotu. Lehendik dagoen Qt oskola mantentzen du (leihoa, menuak, inprimaketa, elkarrizketa-koadro natiboak) eta ez du zerbitzari lokalik behar. Kostuak konpilatutako programaren tamaina dira (QtWebEngine-k 256 MB fitxategi inguru gehitzen ditu Qt Widgets-en 55–90 MB-etara), Chromium paketatzearen konplexutasuna eta zubi asinkrono bat. Bertsio bakar batekin, bere indargune nagusia (pantaila-pantaila migratzea) ez da beharrezkoa. _Aukeratzeko arrazoia:_ Qt oskola dagoen bezala mantendu behar da eta ez da zerbitzari lokalik onartzen. _Ez aukeratzeko arrazoia:_ lauretatik, alde handiz, astunena (340–370 MB inguru Qt konpilatutako programan, ia bikoiztuz).

**03 — Web-aplikazio lokala nabigatzailean.** FastAPI-k React interfaze bat zerbitzatzen du; abiarazle batek nabigatzaile lehenetsia irekitzen du. Diseinu-askatasun eta ekosistema maximoa, instalatzailearen hazkunde minimoa, eta FastAPI berrerabiltzen du. Nabigatzaileek ezin dituzte benetako fitxategi-bideak itzuli, localhost zerbitzariak bizi-zikloaren kudeaketa eta segurtasun-gogortzea behar ditu (loopback-era lotzea, tokenak, jatorri-egiaztapenak) eta produktuak webgune baten itxura du. _Aukeratzeko arrazoia:_ bide azkarrena eta arinena. _Ez aukeratzeko arrazoia:_ fitxategi-bideen kudeaketa eta mahaigaineko sentsazioa.

**04 — Web-aplikazio lokala pywebview leiho batean.** 03 gehi sistema eragilearen web-ikuspegia eta fitxategi-elkarrizketa natiboak erabiltzen dituen leiho natibo bat. 03ren hutsune funtzional nagusia konpontzen du, ez du Chromium paketerik gehitzen (WebView2 motorra Windows-en parte da eta bezero-ekipo guztietan dago), konpilatutako programari 2–3 MB inguruko bitarrak soilik gehitzen dizkio eta PyInstaller katea mantentzen du. Kostuak: pywebview-en pythonnet oinarritutako Windows backend-aren mendekotasuna, mantentzaile-oinarri txikia eta mahaigaineko osagarri mugatuak (eguneraketa automatikorik edo erretilurik ez integratuta). _Aukeratzeko arrazoia:_ mahaigaineko sentsazioa banatutako aztarna txikienarekin. _Ez aukeratzeko arrazoia:_ pywebview eta pythonnet-en PyInstaller pakete zuzen baten mende dago, balidazio-frogan frogatu beharrekoa.

---

## 5. Azterketa konparatiboa

### 5.1 Konpilatutako programaren tamaina

Qt-ren bitarrak konpilatutako emaitzaren parte dira Qt tartean dagoen bakoitzean. Zifrak **PyPI-ko Windows wheel-etatik neurtuta daude** (PySide6 6.9.0 Essentials eta Addons, OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview, pythonnet-en fitxategi-zerrendak), ez benetako konpilazio batetik. Taula osoak [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md)-n daude.

| Interfaze-geruza | Zer txertatzen den                                                                                                                                                             | Gehitutakoa deskonprimituta | Gehitutakoa konprimituta |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------: | -----------------------: |
| 01 Qt Widgets    | Qt6 Core/Gui/Widgets/Pdf/PrintSupport, PySide6 moduluak, plugin-ak (aukeran software bidezko OpenGL, itzulpenak)                                                               |                  ≈ 55–90 MB |               ≈ 20–33 MB |
| 02 Qt WebEngine  | aurrekoa **gehi** `Qt6WebEngineCore.dll` (199,5 MB), itzulpenak, baliabide-paketeak (255,7 MB WebEngine fitxategi guztira) eta Quick/Qml/Network ≈ 26 MB                       |                ≈ 340–370 MB |             ≈ 135–150 MB |
| 03 Nabigatzailea | FastAPI/Uvicorn/Starlette/Pydantic ≈ 9 MB, web frontend-a 0,34 MB; Qt-rik gabe, nabigatzaile-motorrik gabe                                                                     |                      ≈ 9 MB |                   ≈ 3 MB |
| 04 pywebview     | aurrekoa **gehi** pywebview 1,6 MB (WebView2 kargatzailea eta interoperabilitate-DLLak ≈ 1 MB) eta pythonnet 0,7 MB; WebView2 motorra Windows-en parte da eta ez da txertatzen |                     ≈ 11 MB |                   ≈ 4 MB |

| Konpilatutako programa osoa | Deskonprimituta | Konprimituta (hurbilketa) | 04rekin alderatuta |
| --------------------------- | --------------: | ------------------------: | -----------------: |
| 01 Qt Widgets               |    ≈ 420–455 MB |              ≈ 147–160 MB |  %12 – %21 gehiago |
| 02 Qt WebEngine             |    ≈ 705–735 MB |              ≈ 263–276 MB |  %88 – %96 gehiago |
| 03 Nabigatzailea            |        ≈ 373 MB |                  ≈ 130 MB |        %1 gutxiago |
| 04 pywebview                |        ≈ 375 MB |                  ≈ 131 MB |      erreferentzia |

- **pywebview-ek ez du Qt-ren tamainako bitarrik:** 2–3 MB inguru gehitzen ditu, Qt Widgets-en 55–90 MB inguruen eta WebEngine-rekin 340–370 MB inguruen aldean.
- **Motorraren pila partekatuak 364 MB inguru ditu deskonprimituta (≈ 127 MB konprimituta),** OpenCV (110 MB) eta SciPy (116 MB) buru. Interfaze-geruza, beraz, emaitzaren zati handi bat da: Qt Widgets-ek %12–%21 gehitzen du eta Qt WebEngine-k programa ia bikoizten du.
- **Web-oskolak gaur egungo Qt konpilazioa baino txikiagoak dira bakarrik Qt konpilatutako programatik kentzen bada,** eta horrek Qt inportatzen duten interfazekoak ez diren ~7 fitxategiak kentzea eskatzen du (F1 aurkikuntza).
- Neurtu gabe: Python exekuzio-ingurunea, beste mendekotasunak, PyInstaller-en gainkostua, instalatzailearen konpresioa. Benetako konpilazio bat da lehen balidazio-zeregina.

### 5.2 1. erabakia: Qt Widgets ala web?

|                                                                 |                              01 Qt Widgets |                             Web interfazea (02, 03, 04) |
| --------------------------------------------------------------- | -----------------------------------------: | ------------------------------------------------------: |
| Estetika, elkarrekintza, eraginkortasuna (itxura eta erabilera) |                                    2, 2, 3 |                                                 5, 5, 5 |
| Koherentzia, instalazioa eta abiaraztea, portaera natiboa       |                                    5, 5, 5 |                    3–5, 3–4, 2–5 (oskolaren araberakoa) |
| Konpilatutako programaren tamaina                               | 3 (≈ 420–455 MB, 04 baino %12–%21 gehiago) | 1–5 (≈ 373–375 MB 03/04rentzat; ≈ 705–735 MB 02rentzat) |
| **A puntuazioa: azken erabiltzailearen esperientzia**           |                                     **64** |                                               **86–94** |
| **B puntuazioa: Python-ekiko erraztasuna**                      |                                     **88** |                                               **60–80** |

Web-aukerek azken erabiltzaileei interfaze nabarmen hobea ematen diete, eta web-oskol onenak **Qt konpilazioa baino txikiagoak dira** Qt-ren bitarrak alde batera uzten dituztelako. Qt Widgets-en mugak egiturazkoak dira (QSS-k ez du diseinu-motorrik, benetako itzalik, lausotzerik edo trantsiziorik; osagai modernoak eskuz marrazten dira); webaren kostuak zeregin identifikagarriak dira. Qt Widgets-ek web-oskol onena gainditzen du soilik azken erabiltzailearen esperientziak %32 inguru baino gutxiago pisatzen badu (03ren aurrean: %27; 02ren aurrean: %54).

### 5.3 2. erabakia: zein web-oskol?

| Alderdia                             | **02 Barneko nabigatzailea (Qt WebEngine)**      | **04 pywebview leihoa + nabigatzaile-ordezkoa**                                                | **03 Python backend-a + kanpoko nabigatzailea** |
| ------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Itxura eta elkarrekintza             | berdinak                                         | berdinak                                                                                       | berdinak                                        |
| Errendatzearen koherentzia           | berdina PC guztietan                             | oso hurbila (Edge WebView2, Chromium oinarritua, bezero guztietan dago, Windows-ek eguneratua) | nabigatzailearen araberakoa                     |
| Erabiltzaileak ikusten duena         | Qt aplikazioaren leihoa                          | leiho natibo txiki bat                                                                         | nabigatzaile-fitxa edo -leiho bat               |
| **Konpilatutako programa (guztira)** | **≈ 705–735 MB** (interfaze-geruza ≈ 340–370 MB) | **≈ 375 MB** (interfaze-geruza ≈ 11 MB)                                                        | **≈ 373 MB** (interfaze-geruza ≈ 9 MB)          |
| Deskarga / eguneraketa               | ≈ 263–276 MB                                     | ≈ 131 MB                                                                                       | ≈ 130 MB                                        |
| Abiaraztea                           | motelagoa                                        | azkarra                                                                                        | zerbitzaria, gero nabigatzailea                 |
| Aurrebaldintzak                      | bat ere ez                                       | bat ere ez (WebView2 bezero guztietan dago)                                                    | nabigatzaile modernoa                           |
| Fitxategi/karpeta hautatzaileak      | natiboak (Qt)                                    | natiboak (pywebview); zerbitzariaren bidez ordezko moduan                                      | nabigatzaile batetik ez                         |
| A / B puntuazioa                     | 88 / 60                                          | **94 / 74**                                                                                    | 86 / 80                                         |

Ordezkoa abiarazlearen funtzio bat da, ez pywebview-en integratutako portaera: abiarazleak leihoa saiatzen du eta huts egiten badu nabigatzaile lehenetsia irekitzen du helbide berean. Bezero guztietan WebView2 dagoenez, segurtasun-sare bat baino ez da. 04 eta 03 kode-oinarri bera dira, bi aurkezpen-modurekin.

### 5.4 Puntuazio konbinatuak

| Aukera                      | A puntuazioa: azken erabiltzailearen esperientzia | B puntuazioa: Python-ekiko erraztasuna | **Konbinatua (A 80 / B 20)** |
| --------------------------- | ------------------------------------------------: | -------------------------------------: | ---------------------------: |
| 01 Qt Widgets, modernizatua |                                                64 |                                 **88** |                         68,8 |
| 02 Qt WebEngine hibridoa    |                                                88 |                                     60 |                         82,4 |
| 03 Nabigatzailea            |                                                86 |                                     80 |                         84,8 |
| **04 pywebview leihoa**     |                                            **94** |                                     74 |                     **90,0** |

Irizpide bakoitzeko puntuazioak, arrazoiak eta bi ardatzeko ikuspegia [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md)-n daude.

### 5.5 Sentikortasuna

| A-ren pisua                              |       01 |   02 |       03 |       04 |
| ---------------------------------------- | -------: | ---: | -------: | -------: |
| %100 (azken erabiltzailea bakarrik)      |     64,0 | 88,0 |     86,0 | **94,0** |
| %80 (erabilitakoa)                       |     68,8 | 82,4 |     84,8 | **90,0** |
| %60                                      |     73,6 | 76,8 |     83,6 | **86,0** |
| %50                                      |     76,0 | 74,0 |     83,0 | **84,0** |
| %40                                      |     78,4 | 71,2 | **82,4** |     82,0 |
| %30                                      | **80,8** | 68,4 |     81,8 |     80,0 |
| %0 (garatzailearen erosotasuna bakarrik) | **88,0** | 60,0 |     80,0 |     74,0 |

| Tamaina-irizpidearen pisua A barruan |   01 |   02 |   03 |       04 |
| ------------------------------------ | ---: | ---: | ---: | -------: |
| %0 (tamaina ezikusia)                | 69,1 | 88,5 | 83,5 | **89,4** |
| %10 (erabilitakoa)                   | 68,8 | 82,4 | 84,8 | **90,0** |
| %30                                  | 68,1 | 70,3 | 87,3 | **91,0** |

Interpretazioa:

1. **Azken erabiltzaileentzat web-aukerek argi irabazten dute** (86–94, 64ren aurrean). Qt Widgets-ek garatzailearen erosotasunak azken erabiltzailearen esperientziak baino pisu handiagoa duenean soilik egiten du aurrera (azken erabiltzailearen pisua %32 inguru baino txikiagoa).
2. **04 lehen geratzen da %100etik %43 inguruko edozein pisurekin.**
3. **Tamaina da 02 atzean uzten duena.** Tamaina ezikusten bada, 02 04rengandik puntu bat baino gutxiagora geratzen da (88,5 vs. 89,4); erabilitako pisuarekin 82,4ra jaisten da (hirugarrena), eta tamainak gero eta gehiago axola duen heinean, gehiago.

### 5.6 Esperientzia azken erabiltzailearen aldetik

- **01:** azkar abiarazten da eta mahaigaineko programa normal baten sentsazioa ematen du, baina pantailak zaharkituak dirudite; programak 55–90 MB Qt darama.
- **02:** interfaze landuena eta koherenteena, baina programa 04 baino ia bi aldiz handiagoa da, instalazio eta eguneraketa bakoitza 135–150 MB inguru (konprimituta) astunagoa da eta abiaraztea motelagoa da.
- **03:** besteak bezain ondo ikusten da eta txikiena da, baina nabigatzaile-fitxa batean bizi da: karpeta-hautatzaile egokirik ez, erabiltzailearen nabigatzailearen araberako itxura.
- **04:** 02 bezain ondo ikusten da, bere leihoan irekitzen da, hautatzaile natiboak erabiltzen ditu, azkar abiarazten da eta gaurko instalatzailea baino txikiagoa da; bezero guztietan dagoen Edge WebView2 motorra erabiltzen du.

---

## 6. Gomendioa

### 6.1 Proposatutako arkitektura

```
 piXeval abiarazlea (PyInstaller)
   ├─ Python motorra: db / omr / cat_lib / dataReports   (lehendik dagoen kodea, zerbitzu-geruza baten atzean)
   ├─ FastAPI + Uvicorn 127.0.0.1-en (abiarazte bakoitzeko tokena)  ← pilan jada
   ├─ React + TypeScript interfazea (FastAPI-k zerbitzatutako konpilazio estatikoa)
   └─ oskola: pywebview leiho natiboa  ── ordezkoa: sistemako nabigatzailea
```

### 6.2 Justifikazioa (1. erabakia: weba; 2. erabakia: pywebview)

1. **Aipatutako murrizketak betetzen ditu:** motorra Python izaten jarraitzen du; React, FastAPI, pywebview eta euskarri-liburutegiak kode irekikoak dira lizentzia ahalbidetzaileekin (argitaratu aurretik osagai bakoitzeko baieztatzeko), beraz ez da lizentzia- edo ostatatze-kosturik sortzen.
2. **Azken erabiltzaileei esperientzia onena ematen die (100etik 94, 02ren 88aren aurretik) ezartze-puntuazio hobearekin (74, 60ren aurrean):** web plataformak osagai heldu eta irisgarrien multzorik handiena eskaintzen du (taulak, elkarrizketa-koadroak, grafikoak, komando-bilaketa, teklatuaren kudeaketa) eta diseinu bisual modernoa. Prototipoak emaitza erakusten du: orri eta elkarrizketa-koadroen 30 iturburu-fitxategik eta TypeScript eta CSS-ren 3.400 lerro inguruk piXeval-en lan-fluxu nagusiko pantailak eta elkarrizketa-koadroak (irakasgaietatik notetara, utilitateetara eta konfiguraziora) erreproduzitzen dituzte diseinu modernoan, lagin-datuen gainean sortu/editatu/ezabatu portaera funtzionalarekin. Biltegiko aplikazio osagarriak (EBAP, CAT3 Audit) ez daude barne.
3. **Nabigatzaile-aukeraren hutsune funtzional nagusia ixten du** (benetako fitxategi-bideak) pywebview-ek eskaintzen dituen elkarrizketa-koadro natiboen bidez, eta Chromium banatzea saihesten du: interfaze-geruzak 11 MB inguru gehitzen dizkio konpilatutako emaitzari, Qt barruko nabigatzailearen 340–370 MB inguruen aldean, eta gaur egungo Qt konpilazioa baino 45–80 MB inguru gutxiago Qt kendu ondoren (%12–%21 txikiagoa).
4. **Atzerapausoak erabiltzaileek ikusi aurretik harrapatzen dira:** tipatutako kodeak (TypeScript) eta nabigatzaile-proba automatikoek (Playwright) pantaila bakoitza benetako datu-base laginekin egiaztatzen dute argitaratu aurretik, bat-bateko eguneraketa nagusi baterako axola duena.
5. **Konpilatutako programa eta bere eguneraketak txikiak mantentzen ditu:** Python exekutagarri bat gehi bezero guztietan dagoen Windows-eko WebView2 motorra, lehendik dagoen PyInstaller eta Inno Setup katea berrerabiliz.
6. **Etorkizuneko aukerak irekita uzten ditu:** API berak geroago LAN edo urruneko hedapen bat onartu dezake, Qt soilik duen aukerak ezin duena.
7. **Zati batean itzulgarria da:** sistema eragilearen web-ikuspegia desegokia gertatuko balitz, web konpilazio bera nabigatzailean (03) edo Qt WebEngine barruan (02) exekutatzen da interfazea berridatzi gabe, eta horrek bertsio bakarra baino lehen oskol okerra aukeratzearen kaltea mugatzen du.

### 6.3 Zergatik ez ziren beste hirurak hautatu

- **01:** ezartzeko errazena (88) eta argitalpen seguruena, baina azken erabiltzaileek esperientziarik ahulena lortzen dute (64): osagai modernoetarako marrazketa pertsonalizatua, benetako efekturik edo trantsiziorik ez, itxura zaharkitua. Helburu nagusia neurri handi batean betetzeke utziko luke.
- **02:** azken erabiltzailearen esperientzia 04ren hurbila (88, 94ren aurrean) errendatze koherenteenarekin, baina bere interfaze-geruzak 340–370 MB inguru gehitzen dizkio konpilatutako programari (135–150 MB inguru gehiago deskargatzeko, instalazio eta eguneraketa bakoitzean), motelago abiarazten da eta ezartzeko zailagoa da (60, 74ren aurrean): Chromium instalatzailean, QtWebEngine paketatzea eta zubi asinkrono bat. Errendatze-motor berdin bermatuak tamainak baino gehiago axola badu, edo zerbitzari lokal bat onartezina bada, hori da aukera.
- **03:** frontend bera erabiltzailearen nabigatzailea leiho gisa duela: banatzeko errazena (80) eta txikiena, baina azken erabiltzaileentzat web-aukerarik ahulena (86): fitxategi-hautatzaile natiborik ez eta nabigatzailearen arabera aldatzen den itxura. **04ren ordezko modu gisa** mantentzen da.

---

## 7. Arriskuak eta arintzeak

| Arriskua                                                                                                           | Probabilitatea / eragina | Arintzea                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Widgetetan txertatutako negozio-logika gaizki erauzten da                                                          | altua / handia           | kalifikazio-, OMR- eta txosten-irteeren karakterizazio-probak berrantolatu aurretik (F3)                                                                                                                                    |
| Interfazearen berridazketan (IAk sortutako kodea barne) sartutako akatsak notetan edo OMR fluxuetan                | ertaina / handia         | motorra aldatu gabe mantendu; TypeScript zorrotza; zerbitzu-geruzaren proba unitarioak; muturretik muturrerako probak (Playwright) benetako datu-base laginekin; notei eragiten dien aldaketa bakoitzaren giza berrikuspena |
| Windows bertsioen edo WebView2 exekuzio-ingurunearen bertsioen arteko aldeak                                       | baxua / ertaina          | Windows 10 eta 11n probatu; puntako CSS/JS saihestu; nabigatzaile-ordezkoa segurtasun-sare izaten jarraitzen du                                                                                                             |
| pywebview-en Windows backend-a pythonnet-en mende dago eta PyInstaller-ekin gaizki paketa daiteke                  | ertaina / handia         | paketea balidazio-frogan frogatu; nabigatzaile-ordezkoa mantendu                                                                                                                                                            |
| Zerbitzari lokala beste prozesu lokalei agerian                                                                    | ertaina / handia         | loopback-era lotu, portu aleatorioa, abiarazte bakoitzeko tokena, jatorri-egiaztapen zorrotzak                                                                                                                              |
| Atzerapauso edo falta den funtzio bat erabiltzaile guztiengana aldi berean iristen da (hedapen inkrementalik gabe) | altua / handia           | pantaila, elkarrizketa-koadro eta txosten bakoitzaren parekotasun-zerrenda idatzia; benetako datu-baseekin muturretik muturrerako probak; beta itxia argitaratu aurretik                                                    |
| Lehendik dauden erabiltzaile-datu-baseak ez dira irekitzen edo migratzen                                           | ertaina / handia         | bertsio berriak oraingo datu-baseak eskema-aldaketarik gabe irekitzen ditu; segurtasun-kopia automatikoa lehen irekieraren aurretik; aurreko instalatzailea atzera egiteko mantendu                                         |
| Aldi berean instalatutako bi bertsiok SQLite fitxategi bera idazten dute                                           | baxua / handia           | idazle bakarreko zerbitzua; instalatzaileak instalazio zaharra detektatu eta abisatzen du                                                                                                                                   |
| Taula handiak edo irudi-astuneko pantailak motelak dira                                                            | ertaina / ertaina        | taula birtualizatuak; 5.000+ errenkadarekin benchmark-a; eskaneatzeetarako miniaturak                                                                                                                                       |
| Mantentzaile bakarraren mendekotasuna (pywebview)                                                                  | ertaina / ertaina        | oskolaren gaineko abstrakzio-geruza mehea; nabigatzailera edo Qt WebEngine-ra ordezkoa                                                                                                                                      |
| Tamaina-aurrezkia galtzen da Qt konpilatutako programan geratzen delako                                            | ertaina / ertaina        | interfazekoak ez diren ~7 Qt inportazioak kendu zerbitzu-geruzaren urratsean; paketearen edukia balidazio-frogan egiaztatu                                                                                                  |
| Irismenaren hazkundea biltegiko hainbat aplikaziogatik (EBAP, CAT3 Audit)                                          | ertaina / ertaina        | piXeval lehenengo migratu; diseinu-sistema gero berrerabili                                                                                                                                                                 |

---

## 8. Ezarpen-plana (bertsio nagusi bat)

| Fasea | Lana                                                                                                                                                  | Irteera-irizpidea                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 0     | Txostena berrikusi; balidazio-froga exekutatu (§9)                                                                                                    | erabaki-erregistroa                                                                     |
| 1     | Zerbitzu-geruza; Qt seinaleak callback/gertaeraz ordezkatu; karakterizazio-probak                                                                     | lehendik dagoen Qt aplikazioa aldatu gabe eta probak gaindituz                          |
| 2     | FastAPI API erabilera-kasu bakoitzerako; web interfaze osoa haren gainean eraiki, prototipotik abiatuta                                               | parekotasun-zerrenda: gaurko pantaila, elkarrizketa-koadro eta txosten bakoitza         |
| 3     | Elkarrizketa-koadro natiboak pywebview bidez; OMR eta zuzenketa fluxuak aurrerapen-gertaerekin; instalatzailea; lehendik dauden datu-baseak irekitzea | bertsio hautagaiak muturretik muturrerako probak gainditzen ditu benetako datu-baseekin |
| 4     | Beta itxia benetako erabiltzaile eta datu-baseekin; akatsak konpondu; aurreko instalatzailea eskuragarri mantendu atzera egiteko                      | betaren onespena                                                                        |
| 5     | Hurrengo bertsio nagusi gisa argitaratu                                                                                                               | erabiltzaileak bertsio berrian; aurreko instalatzailea bertsio batez mantenduta         |

---

## 9. Konprometitu aurreko balidazio-zereginak (oraindik egin gabe)

1. FastAPI + pywebview-en PyInstaller pakete bat eraiki (pythonnet mendekotasuna barne) **Qt gabe**, eta **instalatzailearen tamaina, instalatutako tamaina eta abiarazte hotza neurtu** uneko instalatzailearen aurrean; paketea Qt WebEngine-rekin errepikatu konparatzeko.
2. pywebview leihoaren portaera **Windows 10 eta 11n** egiaztatu (WebView2 bezero-ekipo guztietan eskuragarri dago).
3. **Karpeta-elkarrizketa natiboaren zubia** eta iraupen luzeko eskaneatze bat gertaera-jariorekin prototipatu.
4. **5.000+ errenkadako notak taularen** eta eskaneatutako irudien berrikuspen-pantaila baten errendimendua neurtu.
5. **Erabilgarritasun-konparazio** bat egin (zereginaren denbora eta akatsak) Qt pantaila baten eta bere web baliokidearen artean benetako erabiltzaile gutxirekin.
6. Paketeko mendekotasun bakoitzaren **lizentziak** berrikusi (LGPL osagaiak barne, Qt konpilazioan geratzen bada).

---

## 10. Kostuei buruzko gogoetak

Gomendatutako pilako osagai guztiak (Python, FastAPI, React, TypeScript, pywebview, Vite) kode irekikoak dira; kostu bakarra garapen-denbora da. Qt oinarritutako aukerek ere ez dute kuotarik LGPL baldintzak errespetatzen badira. Garapen-ahalegina interfazearen berrezarpenak (F2) menderatzen du, aukera guztiek partekatzen dutena; berrikuspena eta probak beharrezkoak izaten jarraitzen dute kodea nola idatzi den kontuan hartu gabe.

---

## 11. Azterlan honen mugak

- Puntuazioak iritziak dira; sentikortasun-azterketak nola aldatzen diren erakusten du, baina ez du subjektibotasuna ezabatzen.
- Instalatzailearen tamaina, errendimendua eta helburuko ekipoen datuak ez ziren neurtu (§9).
- Kanpoko teknologia-datuak (Qt, pywebview) behean zerrendatutako dokumentazio eta artikulu publikoetatik datoz; bertsio-zenbakiak eta proiektuen egoera azkar aldatzen dira eta erabakitzeko unean berriz egiaztatu behar dira.
- Lerro-kopuruek tamaina neurtzen dute, ez konplexutasuna; ahalegin erlatiboa adierazten dute, ez ahalegin zehatza.
- Prototipoak lagin-datuak erabiltzen ditu eta ez du benetako motorra exekutatzen.

---

## 12. Ondorioa

piXeval-en prozesamendu-motorra neurri handi batean bere erabiltzaile-interfazetik independentea da, beraz interfaze-teknologia ordeztea teknikoki bideragarria da Python utzi gabe. Aukera guztiek lehen urrats bera behar dute, zerbitzu-geruza bat. Web plataformak azken erabiltzaileei esperientzia nabarmen hobea ematen die (100etik 86–94, Qt Widgets-en 64ren aurrean). Interfaze hori leiho natibo batean duen Python motor batek azken erabiltzaile-puntuaziorik handiena lortzen du (94, Qt WebEngine barruko nabigatzailearen 88ren aurrean) ezartze-puntuazio hobearekin (74, 60ren aurrean), eta konpilatutako programa askoz txikiagoarekin (interfaze-geruzarako 11 MB inguru, Qt WebEngine-rekin 340–370 MB inguruen aldean, programa ia bikoiztuko lukeena; gaur egungo Qt Widgets konpilazioa baino %12–%21 txikiagoa), kanpoko nabigatzailea segurtasun-ordezko gisa duela. Qt Widgets hobetsiko litzateke soilik garatzailearen erosotasunak erabakiaren bi herenak baino gehiago balio balu. Migrazioa bertsio bakar bat denez, arrisku nagusia argitalpenaren kalitatea da, ez migrazio-bidea; horregatik parekotasun-zerrenda, beta itxi bat eta atzera egiteko bide bat planaren parte dira. Hurrengo urratsa §9ko balidazio-lana da, inbertsio handi bat baino lehen froga labur eta arrisku txikiko batean osa daitekeena.

---

## Erreferentziak

1. Qt Dokumentazioa, _User Interfaces_ (Widgets, animazioa eta mahaigaineko aplikazio konplexuak), <https://doc.qt.io/qt-6.9/topics-ui.html>
2. Qt for Python, _QtWebChannel_, <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
3. Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_, <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
4. pywebview 6.x paketearen zerrenda, <https://www.archlinux.org/packages/extra/any/python-pywebview>
5. piXeval biltegiaren neurriak: [00-baseline-current-stack.md](00-baseline-current-stack.md)
