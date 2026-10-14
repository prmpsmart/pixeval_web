# 01 · PySide6 Widgets-en jarraitu eta modernizatzea

**Lerro batean:** Qt Widgets mahaigaineko aplikazioa mantendu, `src/modern_ui`-n hasitako birdiseinua amaitu eta gai eta osagai-liburutegi egoki batean inbertitu.

## Zer den

Gaur egungo teknologia bera (PySide6 6.9, Qt Widgets, QSS), baina diseinu-sistema aldez aurretik pentsatu batekin: kolore eta tarte-tokenak, txartel, taula, elkarrizketa-koadro eta jakinarazpen berrerabilgarriak, alboko barradun markoa eta interfazearen eta zerbitzuen arteko bereizketa garbia. `src/modern_ui`-k hasiera dagoeneko badu: `theme.py`, `buttons.py`, `inputs.py`, `table.py`, `surfaces.py`, alboko eta goiko barradun markoa eta QRC baliabideen sorrera.

## Nola egokitzen den piXevalen

- Aldaketarik ez paketatzean (PyInstaller + Inno Setup), exekuzio-ingurunean edo prozesu bakarreko ereduan.
- Python kodeak Python kodea deitzen du; API, zubi edo bigarren lengoaiarik ez.
- Aurrerapen-seinaleek (`SignalInstance`) lehen bezala jarraitzen dute.

## Abantailak

- **Arrisku tekniko txikiena.** Ez dago ikasteko, banatzeko, sinatzeko edo arazteko ezer berririk.
- **Prozesu bakarra, lengoaia bakarra, guztiz lineaz kanpo.** Ezerk ez du portu batean entzuten, beraz ez dago suebaki- edo antibirus-abisurik.
- **Integrazio natiboa doakoa da:** `QFileDialog`, inprimaketa (`QtPrintSupport`), PDF (`QtPdf`), arrastatu eta jaregitea, arbela, erretilua, sistemako elkarrizketa-koadroak.
- **Lehendik dauden baliabideak eta Qt-ren ezagutza berrerabiltzen dira** (QSS, SVG ikonoak, Lottie, Qt Designer ohiturak).
- Abio azkarra eta memoria gutxi, barnean sartutako nabigatzaile-motor baten aldean. Konpilatutako programako Qt bitarrek 55–90 MB inguru betetzen dute (Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7 MB, PySide6 moduluak ≈ 12 MB, pluginak, aukeran software bidezko OpenGL 20,6 MB), Windows-eko wheel-etatik neurtuta.
- Datu-taula handiek azkar jarraitzen dute `QAbstractItemModel` eta `QTableView`-rekin.

## Desabantailak

- **Diseinu-sabaia baxuagoa da eta osagai bakoitzaren kostua handiagoa.** QSS CSS-ren azpimultzoa da: flexbox/grid-ik ez, itzal errealik ez (`QGraphicsDropShadowEffect` motela da eta mozten du), atzeko plano lausotzerik ez, CSS aldagairik edo trantsiziorik ez. Qt-ren dokumentazioak berak dio Widgets-ak «ez direla ondo eskalatzen animazioetarako» (ikus iturriak [05](05-comparison-and-roadmap.md) dokumentuan).
- **Osagai on modernoa eskuz eraikitzen da.** Web-aurrebistak (komando-paleta, jakinarazpenak, iragazkidun taulak, fitxadun elkarrizketa-koadroak, grafikoak, egoera hutsak) prest dauden ereduak erabiltzen ditu; Widgets-en bakoitza diseinatu, margotu eta probatu beharreko klase propioa da.
- **Diseinuaren iterazio motela.** Aldaketa bisual batek berrabiaraztea eskatzen du; ez dago bero-birkargarik edo QSS-rentzako nabigatzailearen garapen-tresnen ikuskatzailerik.
- **Birdiseinua ~70 mila lerroko berridazketa izaten da oraindik.** `src/modern_ui`-k 2,3 mila lerro ditu, uneko interfazeak 71 mila dituen bitartean. Aukera hau hautatzeak ez du berridazketa saihesten; lengoaia mantentzen du bakarrik.
- **Tresnak:** diseinuak ezin dira zuzenean pasatu (Figma → CSS zuzena da; Figma → QSS eskuzkoa), eta Qt Widgets-en estilorako osagai eta adibideen ekosistema publikoa web-interfazearena baino askoz txikiagoa da.
- **Interfazea probatzea zailagoa da** (`pytest-qt`-k funtzionatzen du, baina Playwright/Cypress motako probak baino askoz gutxiago erabiltzen da).
- Bereizmen handiko pantailen, letra-tipoen eta modu ilunaren berezitasunak sistema eragilearen arabera aldatzen dira eta eskuzko zainketa behar dute.

## Beste aukerekiko abantailak

- web-aukerekiko (03, 04): zerbitzari lokalik ez, WebView/Chromium mendekotasunik ez, JS tresna-kateak ez, mantentzeko zubirik ez, HTTP zerbitzu lokal baten ondoriozko segurtasun-azalerarik ez.
- hibridoarekiko (02): bitar txikiagoa, paketatze errazagoa, errendatze-pila bakarra.

## Beste aukerekiko desabantailak

- _Nabarmen modernoa_ den interfaze baterako bide motelena; apaintze-xehetasun bakoitza neurrira dago.
- LAN / urruneko / nabigatzailetik atzigarria den bertsiorako biderik ez, berridazketa bereizi bat gabe.
- Osagai-ekosistema webarena baino txikiagoa.

## Noiz aukeratu

- Helburua «itxura hobea, produktu bera» da, eta bigarren exekuzio-ingurune bat edo prozesu-muga bat onartezina da (adibidez, zerbitzari lokalak blokeatzen dituzten lineaz kanpoko ekipo isolatuak).

## Ahalegina eta arriskuak

- Ahalegina: handia baina aurreikusgarria; lana pantaila berak dira edozein kasutan. Arriskua eskuz margotutako osagaietan eta interfaze zaharra eta berria koherente mantentzean metatzen da, biak elkarrekin dauden bitartean.
- Lehenik: zerbitzuak widgetetatik atera ([00](00-baseline-current-stack.md) dokumentuko 3. aurkikuntza ikusi). Aukera guztietan merezi du.
