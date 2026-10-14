# 02 · Híbrid: marc PySide6 + interfície web dins de Qt WebEngine

**En una línia:** mantenir l'aplicació PySide6 (finestra, menús, diàlegs, impressió, llicències) i mostrar les pantalles com a pàgines web en un Chromium incrustat (`QWebEngineView`), comunicant-se amb Python mitjançant `QWebChannel`.

## Què és

Qt WebEngine incrusta Chromium com un widget. `QtWebChannel` ofereix comunicació directa entre objectes Python i JavaScript a la pàgina (compatible de sèrie amb WebEngine). Les pantalles web es poden construir amb React/Vite, com a la vista prèvia interactiva.

## Com encaixa a piXeval

- L'aplicació Qt actual continua sent l'amfitrió: cada pantalla és una pàgina web oberta en un `QWebEngineView`.
- Els serveis de Python s'exposen com a objectes del canal (o la mateixa lògica s'exposa també mitjançant una API local).
- Els diàlegs natius d'arxius/carpetes, la impressió i el PDF continuen sent crides de Qt.
- L'empaquetat continua sent PyInstaller + Inno Setup, afegint-hi els recursos de QtWebEngine.

## Avantatges

- **Conserva el marc Qt existent.** Finestra, menús, impressió, gestió de llicències i diàlegs natius es queden exactament com estan; només el contingut de les pantalles passa a ser pàgines web.
- **Tot l'ecosistema de la interfície web** (React, biblioteques de components, gràfics, recàrrega en calent, traspàs des de Figma) _i_ totes les capacitats natives de Qt (diàlegs, impressió, arrossegar i deixar anar).
- **No necessita servidor local** (el canal va dins del procés), així que no hi ha avisos del tallafocs ni disseny de seguretat de ports/tokens.
- El mateix entorn d'execució de Python i la mateixa tecnologia d'instal·lador d'avui.
- El frontend es pot desenvolupar i provar en un navegador normal (simulant el canal) a tota velocitat.

## Inconvenients

- **Mida i memòria, mesurades:** les rodes de PySide6 per a Windows mostren QtWebEngine a **255,7 MB descomprimit (105 MB comprimit)**: només `Qt6WebEngineCore.dll` ocupa 199,5 MB, més ≈ 40 MB de traduccions i ≈ 13 MB de paquets de recursos. Amb les biblioteques Quick/Qml/Network que necessita, la part de Qt del programa compilat passa de ≈ 55–90 MB (només Widgets) a **≈ 340–370 MB**, uns 135–150 MB més de descàrrega a cada instal·lació i actualització. També s'espera més RAM que amb Widgets (no mesurada).
- **PyInstaller + QtWebEngine és delicat** (`QtWebEngineProcess`, recursos, locals, opcions de sandbox); cal reservar temps per depurar la compilació a Windows.
- **Dues tecnologies d'interfície en un procés** durant la transició; l'estil i la navegació han de ser coherents entre el marc de Widgets i el contingut web.
- **El pont és asíncron** i necessita un contracte tipat. Hi ha eines de tercers (p. ex. `pywebchannel` genera tipus TypeScript), però són projectes petits; convé comptar amb mantenir una capa de pont prima pròpia.
- Chromium va lligat a la versió de Qt, així que les actualitzacions de la plataforma web i les correccions de seguretat segueixen les versions de Qt.
- Llicències: PySide6 i Qt WebEngine estan disponibles sota LGPL/GPL; confirmeu les obligacions de distribució abans de publicar (enllaçat dinàmic, avisos).
- Sense camí cap a «simplement obrir-ho en un navegador» tret que el mateix frontend se serveixi també per HTTP (és possible, però llavors també esteu construint l'opció 03).

## Avantatges davant de les altres opcions

- davant de 01: ecosistema web i rapidesa d'iteració de la interfície, sense abandonar l'aplicació Qt.
- davant de 03/04: **sense connexió, sense cicle de vida de servidor, sense port local per protegir, diàlegs natius de Qt i impressió sense canvis.**

## Desavantatges davant de les altres opcions

- davant de 03/04: molt més pesat (Chromium) i conserva tota la cadena de dependències de Qt; sense accés des del navegador; CI d'empaquetat més difícil.
- davant de 01: més gran, més peces mòbils.

## Quan triar-la

- Cal conservar tal qual el marc Qt existent (menús, impressió, diàlegs natius, gestió de llicències), no és acceptable un servidor local i la mida de l'instal·lador no és una restricció dura.

## Esforç i riscos

- Esforç: mitjà-alt; el pont i l'empaquetat són les incògnites. Risc: empaquetat de WebEngine a Windows, rendiment de taules molt grans dins la vista web, doble manteniment durant la transició.
