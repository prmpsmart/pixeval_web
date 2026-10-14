# 02 · Hibridoa: PySide6 markoa + web-interfazea Qt WebEngine barruan

**Lerro batean:** PySide6 aplikazioa mantendu (leihoa, menuak, elkarrizketa-koadroak, inprimaketa, lizentziak) eta pantailak web-orri gisa erakutsi Chromium txertatu batean (`QWebEngineView`), Pythonekin `QWebChannel` bidez komunikatuz.

## Zer den

Qt WebEngine-k Chromium widget gisa txertatzen du. `QtWebChannel`-ek Python objektuen eta orriko JavaScript-en arteko komunikazio zuzena eskaintzen du (WebEngine-k berez onartzen du). Web-pantailak React/Vite-rekin eraiki daitezke, interaktiboa den aurrebistan bezala.

## Nola egokitzen den piXevalen

- Qt aplikazio egungoak ostalari izaten jarraitzen du: pantaila bakoitza `QWebEngineView` batean irekitako web-orri bat da.
- Pythonen zerbitzuak kanaleko objektu gisa ageri dira (edo logika bera API lokal baten bidez ere ageri da).
- Fitxategi/karpeta elkarrizketa-koadro natiboak, inprimaketa eta PDFa Qt deiak izaten jarraitzen dute.
- Paketatzeak PyInstaller + Inno Setup izaten jarraitzen du, QtWebEngine baliabideak gehituta.

## Abantailak

- **Lehendik dagoen Qt markoa mantentzen du.** Leihoa, menuak, inprimaketa, lizentzien kudeaketa eta elkarrizketa-koadro natiboak zehazki dauden bezala geratzen dira; pantailen edukia bakarrik bihurtzen da web-orri.
- **Web-interfazearen ekosistema osoa** (React, osagai-liburutegiak, grafikoak, bero-birkarga, Figma-tik pasatzea) _eta_ Qt-ren gaitasun natibo guztiak (elkarrizketa-koadroak, inprimaketa, arrastatu eta jaregitea).
- **Ez du zerbitzari lokalik behar** (kanala prozesuaren barruan dago), beraz ez dago suebaki-abisurik ez portu/token segurtasun-diseinurik.
- Gaur egungo Python exekuzio-ingurune bera eta instalatzaile-teknologia bera.
- Frontend-a nabigatzaile arrunt batean garatu eta proba daiteke (kanala simulatuz) abiadura osoan.

## Desabantailak

- **Tamaina eta memoria, neurtuak:** Windows-erako PySide6 wheel-ek QtWebEngine **255,7 MB deskonprimituta (105 MB konprimituta)** dela erakusten dute: `Qt6WebEngineCore.dll` bakarrik 199,5 MB da, gehi ≈ 40 MB itzulpen eta ≈ 13 MB baliabide-pakete. Behar dituen Quick/Qml/Network liburutegiekin, konpilatutako programako Qt zatia ≈ 55–90 MB-tik (Widgets bakarrik) **≈ 340–370 MB**-ra igotzen da, instalazio eta eguneraketa bakoitzean 135–150 MB gehiago deskargatzeko. Widgets baino RAM gehiago ere espero da (neurtu gabe).
- **PyInstaller + QtWebEngine delikatua da** (`QtWebEngineProcess`, baliabideak, locale-ak, sandbox aukerak); denbora hartu behar da Windows-en konpilazioa arazteko.
- **Bi interfaze-teknologia prozesu berean** trantsizioan zehar; estiloak eta nabigazioak koherenteak izan behar dute Widgets markoaren eta web-edukiaren artean.
- **Zubia asinkronoa da** eta kontratu tipatua behar du. Hirugarrenen tresnak daude (adib. `pywebchannel`-ek TypeScript motak sortzen ditu), baina proiektu txikiak dira; zubi-geruza mehe bat norberak mantentzea aurreikusi behar da.
- Chromium Qt-ren bertsioari lotuta dago, beraz web-plataformaren eguneraketek eta segurtasun-zuzenketek Qt-ren bertsioak jarraitzen dituzte.
- Lizentziak: PySide6 eta Qt WebEngine LGPL/GPL lizentziapean daude; baieztatu banaketa-betebeharrak argitaratu aurretik (lotura dinamikoa, oharrak).
- «Nabigatzaile batean irekitzeko» biderik ez, frontend bera HTTP bidez ere zerbitzatzen ez bada (posible da, baina orduan 03 aukera ere eraikitzen ari zara).

## Beste aukerekiko abantailak

- 01ekin alderatuta: web-ekosistema eta interfazearen iterazio-abiadura, Qt aplikazioa utzi gabe.
- 03/04rekin alderatuta: **lineaz kanpo, zerbitzariaren bizi-zikloa gabe, babesteko portu lokalik gabe, Qt elkarrizketa-koadro natiboak eta inprimaketa aldatu gabe.**

## Beste aukerekiko desabantailak

- 03/04rekin alderatuta: askoz astunagoa (Chromium) eta Qt mendekotasun-kate osoa mantentzen du; nabigatzaile-sarbiderik ez; paketatzeko CI zailagoa.
- 01ekin alderatuta: handiagoa, pieza mugikor gehiago.

## Noiz aukeratu

- Lehendik dagoen Qt markoa (menuak, inprimaketa, elkarrizketa-koadro natiboak, lizentzien kudeaketa) dagoen bezala mantendu behar da, zerbitzari lokala onartezina da eta instalatzailearen tamaina ez da muga zorrotza.

## Ahalegina eta arriskuak

- Ahalegina: ertain-handia; zubia eta paketatzea dira ezezagunak. Arriskua: WebEngine-ren paketatzea Windows-en, taula oso handien errendimendua web-ikuspegiaren barruan, trantsizioan zeharreko mantentze-lan bikoitza.
