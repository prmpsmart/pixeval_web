# 01 · Quedar-se a PySide6 Widgets i modernitzar-lo

**En una línia:** mantenir l'aplicació d'escriptori amb Qt Widgets, acabar el redisseny ja iniciat a `src/modern_ui` i invertir en un tema i una biblioteca de components adequats.

## Què és

La mateixa tecnologia d'avui (PySide6 6.9, Qt Widgets, QSS), però amb un sistema de disseny deliberat: tokens de color i espaiat, targetes, taules, diàlegs i avisos reutilitzables, un marc amb barra lateral i una separació neta entre interfície i serveis. `src/modern_ui` ja conté el començament: `theme.py`, `buttons.py`, `inputs.py`, `table.py`, `surfaces.py`, un marc amb barra lateral i superior, i generació de recursos QRC.

## Com encaixa a piXeval

- Cap canvi en l'empaquetat (PyInstaller + Inno Setup), l'entorn d'execució ni el model d'un sol procés.
- El codi Python crida codi Python; sense API, sense pont, sense un segon llenguatge.
- Els senyals de progrés (`SignalInstance`) continuen funcionant tal com estan.

## Avantatges

- **Menor risc tècnic.** Res de nou per aprendre, distribuir, signar ni depurar.
- **Un procés, un llenguatge, totalment sense connexió.** Res escolta en un port, així que no hi ha avisos del tallafocs ni de l'antivirus.
- **La integració nativa és gratuïta:** `QFileDialog`, impressió (`QtPrintSupport`), PDF (`QtPdf`), arrossegar i deixar anar, porta-retalls, safata, diàlegs del sistema.
- **Es reutilitzen els recursos existents i el coneixement de Qt** (QSS, icones SVG, Lottie, costums de Qt Designer).
- Arrencada ràpida i poca memòria davant d'un motor de navegador inclòs. Els binaris de Qt del programa compilat ocupen uns 55–90 MB (Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7 MB, mòduls de PySide6 ≈ 12 MB, connectors, opcionalment OpenGL per programari 20,6 MB), mesurat a partir de les rodes de Windows.
- Les taules de dades grans continuen sent ràpides amb `QAbstractItemModel` i `QTableView`.

## Inconvenients

- **El sostre de disseny és més baix i el cost per component més alt.** QSS és un subconjunt de CSS: sense flexbox/grid, sense ombres reals (`QGraphicsDropShadowEffect` és lent i retalla), sense desenfocament de fons, sense variables CSS ni transicions. La mateixa documentació de Qt assenyala que els Widgets «no escalen bé per a animacions» (vegeu les fonts a [05](05-comparison-and-roadmap.md)).
- **Cada component modern es construeix a mà.** La vista prèvia web (paleta d'ordres, avisos, taules filtrables, diàlegs amb pestanyes, gràfics, estats buits) fa servir patrons llestos per utilitzar; a Widgets cadascun és una classe pròpia que cal dissenyar, pintar i provar.
- **Iteració de disseny lenta.** Un canvi visual implica reiniciar i executar; no hi ha recàrrega en calent ni inspector d'eines de desenvolupament del navegador per a QSS.
- **El redisseny continua sent una reescriptura de ~70 mil línies.** `src/modern_ui` té 2,3 mil línies davant de les 71 mil de la interfície actual. Triar aquesta opció no evita la reescriptura; només conserva el llenguatge.
- **Eines:** els dissenys no es poden traspassar directament (Figma → CSS és directe; Figma → QSS és manual), i l'ecosistema públic de components i exemples d'estils per a Qt Widgets és molt menor que el de la interfície web.
- **Provar la interfície és més difícil** (`pytest-qt` funciona, però és molt menys habitual que les proves a l'estil Playwright/Cypress).
- Les raresses d'alta densitat de píxels, tipus de lletra i mode fosc canvien segons el SO i requereixen cura manual.

## Avantatges davant de les altres opcions

- davant de les opcions web (03, 04): sense servidor local, sense dependència de WebView/Chromium, sense cadena d'eines JS, sense pont per mantenir, sense superfície de seguretat per un servei HTTP local.
- davant de l'híbrid (02): binari més petit, empaquetat més senzill, una sola pila de renderitzat.

## Desavantatges davant de les altres opcions

- La via més lenta cap a una interfície _visiblement moderna_; cada detall de poliment és a mida.
- Sense camí cap a una versió en xarxa local / remota / accessible des del navegador sense una reescriptura a part.
- Ecosistema de components més petit que el de la web.

## Quan triar-la

- L'objectiu és «millor aspecte, mateix producte», i un segon entorn d'execució o límit de procés és inacceptable (per exemple, equips aïllats sense connexió que bloquegen servidors locals).

## Esforç i riscos

- Esforç: alt però previsible; la feina són les mateixes pantalles en qualsevol cas. El risc es concentra en els components pintats a mida i en mantenir coherents la interfície antiga i la nova mentre coexisteixen.
- Primer: extreure serveis dels widgets (vegeu la troballa 3 a [00](00-baseline-current-stack.md)). Això compensa en totes les opcions.
