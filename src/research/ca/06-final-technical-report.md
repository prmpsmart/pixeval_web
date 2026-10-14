# Informe tècnic: opcions per modernitzar la interfície d'usuari de piXeval

**Assumpte:** piXeval 7.6.2 (sistema de gestió d'exàmens OMR)
**Elaborat per:** Miracle Apata, BEng
**Estat:** esborrany per a revisió — les notes de suport són en aquesta carpeta
**Artefacte complementari:** prototip interactiu, <https://prmpsmart.github.io/pixeval_web/>

---

## Resum

piXeval és una aplicació d'escriptori en Python per a Windows la interfície d'usuari de la qual està construïda amb PySide6 (Qt Widgets). La interfície comprèn unes 71 000 línies de codi i és la principal limitació d'usabilitat i qualitat visual per a les persones que la fan servir a diari, mentre que el motor de processament (OMR, base de dades, informes) té unes 21 000 línies i és en gran part independent de Qt. Aquest informe avalua maneres de millorar la interfície conservant el motor Python i sense incórrer en costos de llicència ni d'allotjament, com a dues decisions. **Decisió 1:** modernitzar Qt Widgets (01) o passar a un frontend web (React, etc.). **Decisió 2**, si és web: presentar-lo com a navegador integrat dins de Qt (Qt WebEngine, 02), en una finestra de pywebview amb el navegador extern com a alternativa de seguretat (04), o amb Python com a backend i el navegador extern utilitzat directament (03). La migració es farà una sola vegada, com a una única versió major. El **focus principal és l'usuari final**: la puntuació principal (80 %) mesura el que viuen els usuaris (estètica i aspecte modern, interacció agradable, eficàcia, coherència, instal·lació i arrencada, comportament natiu i **la mida del programa compilat**); una puntuació secundària (20 %) mesura la facilitat d'implementació amb l'entorn d'execució de Python. Mesurat a partir de les rodes de Windows, Qt afegeix uns 55–90 MB al resultat compilat (Widgets) o uns 340–370 MB (amb WebEngine), mentre que pywebview afegeix uns 2–3 MB de binaris i tota la capa d'interfície web uns 11 MB (el motor Edge WebView2 forma part de Windows i està disponible a tots els equips client). Les opcions web puntuen 86–94 sobre 100 en experiència de l'usuari final davant de 64 de Qt Widgets, que és més fàcil d'implementar (88 davant de 60–80). Qt Widgets només guanya si l'experiència de l'usuari final pesa menys d'un terç aproximadament. Entre els contenidors web, la finestra de pywebview queda primera (94) per davant del navegador integrat de Qt (88), frenat per la seva mida (gairebé el doble del programa compilat) i la seva arrencada. La direcció recomanada és **un motor Python (FastAPI) amb una interfície web presentada en una finestra nativa de pywebview, amb «obre al navegador» com a alternativa**, precedida per una refactorització de la capa de serveis necessària amb qualsevol opció. Diverses magnituds (mida real de l'instal·lador, temps d'arrencada, rendiment amb taules grans) no es van mesurar en una compilació real i s'enumeren com a tasques de validació.

---

## 1. Introducció

### 1.1 Antecedents

piXeval dona suport a tot el cicle de vida d'un examen tipus test en paper: bancs de preguntes, composició d'exàmens, generació de fulls de respostes, escaneig i reconeixement òptic de marques (OMR), assignació d'identitats, correcció, notes i informes. Es distribueix com un instal·lador de Windows creat amb PyInstaller i Inno Setup.

### 1.2 Plantejament del problema

Els usuaris interactuen amb el producte mitjançant una interfície basada en Widgets amb estil de fulls d'estil de Qt. Aconseguir un aspecte i una qualitat d'interacció contemporanis (transicions animades, taules denses però llegibles, cerca d'ordres, dissenys adaptables, tokens de disseny coherents) és lent i costós amb aquesta pila. La pregunta és si una altra tecnologia d'interfície ofereix una millor experiència d'usuari a un cost i risc acceptables.

### 1.3 Objectius i restriccions

1. **Principal: l'usuari final.** Millorar el que els usuaris veuen i viuen cada dia: una interfície agradable, eficaç, estètica i moderna que, a més, s'instal·li, arrenqui i es comporti bé als seus equips. La comoditat del desenvolupador és secundària.
2. **Secundari:** que aquesta experiència sigui senzilla d'implementar i lliurar amb el motor Python en el quadre (el motor en si es conserva).
3. **No introduir cap cost recurrent nou** (llicències, allotjament, subscripcions).
4. Conservar l'experiència d'aplicació instal·lada a **Windows** (l'única plataforma de destinació): arrencada, treball sense connexió, accés a arxius locals i a la sortida de l'escàner.
5. Migrar **una sola vegada**: la nova interfície substitueix l'antiga en una única versió major que arriba a tots els usuaris. No hi ha migració incremental ni en paral·lel, per la qual cosa la fiabilitat de la versió i la paritat de funcions importen més.
6. La mida de l'equip, els seus coneixements i la familiaritat amb els llenguatges **no** es tracten com a restriccions. Les opcions es jutgen pel seu mèrit tècnic; un llenguatge nou no compta com a cost en si mateix, mentre que els entorns d'execució addicionals, les cadenes de compilació i les fronteres entre processos sí.

### 1.4 Abast

Només es consideren la capa de presentació i la seva integració amb el motor. Els algorismes d'OMR, les regles de qualificació i l'esquema de la base de dades no canvien.

---

## 2. Anàlisi del sistema actual

Mesurat a partir del repositori (detalls a [00-baseline-current-stack.md](00-baseline-current-stack.md)):

| Capa                                                              |   Arxius |         Línies | Dependència de Qt |
| ----------------------------------------------------------------- | -------: | -------------: | ----------------- |
| Interfície (`src/ui`)                                             |      194 |         71 077 | completa          |
| Redisseny en curs (`src/modern_ui`)                               |       28 |          2 301 | completa          |
| Base de dades (`src/db`)                                          |        7 |          3 648 | 1 arxiu           |
| OMR (`src/omr`, més una còpia de la mateixa mida `src/omr_audit`) | 16 (+16) | 6 704 (+6 704) | cap               |
| Embolcall del motor CAT (`src/cat_lib`)                           |       13 |          4 832 | 3 arxius          |
| Informes (`src/dataReports`)                                      |        9 |            830 | 1 arxiu           |
| Utilitats (`src/utils`)                                           |       28 |          5 242 | 2 arxius          |

Troballes que guien l'anàlisi:

- **F1 — El motor és separable.** Unes 21 000 línies de lògica fan servir Qt només en uns set arxius, sobretot per a senyals de progrés i tipus d'imatge.
- **F2 — La interfície és el major volum de treball.** És aproximadament 3,4 vegades la mida del motor. Sigui quina sigui la tecnologia triada, un redisseny suposa reimplementar les pantalles; l'esforç actual de `modern_ui` és ja una reescriptura d'aquest tipus i està completat al voltant d'un 3 % per nombre de línies.
- **F3 — Presentació i lògica estan barrejades.** 103 dels 194 arxius d'interfície importen la capa de dades, i pantalles com la de notes llegeixen i modifiquen objectes de domini directament. Una capa de serveis és, per tant, un requisit previ per a qualsevol nou frontend.
- **F4 — Ja hi ha una pila web.** FastAPI 0.115, Uvicorn i Starlette són als requisits i els fa servir el servei CAT remot.
- **F5 — L'empaquetat està establert.** PyInstaller + Inno Setup lliuren un instal·lador de Windows; qualsevol opció hauria de reutilitzar-lo quan sigui possible.
- **F6 — Es fan servir diàlegs natius d'arxiu** (nou punts de crida en cinc arxius per a carpetes d'escaneig, còpies de seguretat i exportació). Les rutes de carpeta són un requisit operatiu, cosa que afecta les solucions només de navegador.

---

## 3. Mètode d'avaluació

### 3.1 Dues puntuacions

**Puntuació A: experiència de l'usuari final (principal, 80 % de la puntuació combinada).**

| Criteri                                      | Pes dins d'A | El que sent l'usuari final                                                                                                        |
| -------------------------------------------- | -----------: | --------------------------------------------------------------------------------------------------------------------------------- |
| Estètica i aspecte modern                    |           25 | tipografia, espaiat, ombres, desenfocament, mode fosc, acabat                                                                     |
| Interacció agradable                         |           15 | transicions, resposta en passar el cursor o enfocar, rapidesa de resposta                                                         |
| Eficàcia                                     |           20 | taules denses, cerca/filtre, paleta d'ordres, ús del teclat, resposta clara, gràfics, accessibilitat                              |
| Coherència entre els PC Windows dels usuaris |           10 | es veu i es comporta igual a qualsevol equip amb Windows (versions, navegadors, entorns d'execució)                               |
| Instal·lació i arrencada                     |           10 | temps d'arrencada, requisits previs, sensació d'aplicació                                                                         |
| Comportament d'escriptori natiu              |           10 | selectors reals d'arxiu/carpeta, impressió, arrossegar i deixar anar, funciona sense connexió (troballa F6)                       |
| **Mida del programa compilat**               |           10 | mida de l'instal·lador i de la instal·lació, temps de descàrrega i actualització (mesurat a partir de les rodes de Windows, §5.1) |

**Puntuació B: facilitat d'implementar-la amb l'entorn d'execució de Python (secundària, 20 %).**

| Criteri                            | Pes dins de B | Pregunta                                                                     |
| ---------------------------------- | ------------: | ---------------------------------------------------------------------------- |
| Integració amb el motor            |            30 | cridar el codi Python, esdeveniments de progrés per a escanejos/còpies, fils |
| Esforç de compilació i empaquetat  |            30 | PyInstaller, entorns d'execució a incloure, signatura, cadena de publicació  |
| Peces mòbils a provar              |            20 | cadenes d'eines, fronteres entre processos, contractes de pont/API           |
| Reutilització del treball existent |            20 | FastAPI ja a la pila, prototip existent, capa de serveis                     |

Les comoditats només per a desenvolupadors (recàrrega en calent, traspàs de disseny, grans ecosistemes) deliberadament **no** es puntuen; importen únicament pel resultat per a l'usuari final que fan possible.

### 3.2 Mètode i limitacions

Cada opció es puntua d'1 a 5 per criteri a partir de la documentació, guies publicades i les mètriques de codi anteriors. **Les puntuacions són judici expert i no mesuraments.** Les tres opcions web puntuen igual en aspecte, interacció i eficàcia per construcció (mateixa plataforma web); es distingeixen per la coherència, la instal·lació/arrencada i el comportament natiu, i per la Puntuació B. Encara no s'ha fet cap prova comparativa de cap opció dins de piXeval ni cap prova d'usabilitat amb usuaris reals.

---

## 4. Solucions candidates

Les descripcions completes amb avantatges, inconvenients i comparacions són a [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md) i [04](04-pywebview-native-window.md); la puntuació és a [05](05-comparison-and-roadmap.md).

**01 — Modernitzar PySide6 Widgets.** Menor risc tècnic i millor integració nativa; sense connexió, un sol procés, sense eines noves. Però QSS és un subconjunt de CSS (sense motors de maquetació, efectes ni transicions), cada component modern cal construir-lo a mida, la iteració és lenta i l'ecosistema de components fets és petit. No evita la reescriptura d'unes 70 000 línies d'interfície; només conserva el joc d'eines. _Motiu per triar-la:_ no s'accepta una frontera de procés ni un entorn d'execució addicional. _Motiu per no triar-la:_ el sostre d'interfície més baix.

**02 — Híbrid Qt WebEngine.** Incrustar pantalles web (Chromium) a l'aplicació Qt existent i connectar-les amb QtWebChannel. Conserva el contenidor Qt actual (finestra, menús, impressió, diàlegs natius) i no necessita servidor local. Els costos són la mida del programa compilat (QtWebEngine afegeix uns 256 MB d'arxius als 55–90 MB de Qt Widgets), la complexitat d'empaquetar Chromium i un pont asíncron. Amb una versió única, la seva principal fortalesa (migrar pantalla a pantalla) no cal. _Motiu per triar-la:_ cal conservar el contenidor Qt tal qual i no s'accepta cap servidor local. _Motiu per no triar-la:_ amb diferència la més pesada de les quatre (uns 340–370 MB de Qt al programa compilat, duplicant-lo gairebé).

**03 — Aplicació web local al navegador.** FastAPI serveix una interfície React; un llançador obre el navegador predeterminat. Màxima llibertat de disseny i ecosistema, creixement mínim de l'instal·lador i reutilitza FastAPI. Els navegadors no poden retornar rutes reals d'arxiu, un servidor a localhost necessita gestió del cicle de vida i enduriment de seguretat (enllaç a loopback, tokens, comprovacions d'origen) i el producte s'assembla a un lloc web. _Motiu per triar-la:_ la via més ràpida i lleugera. _Motiu per no triar-la:_ gestió de rutes d'arxiu i sensació d'escriptori.

**04 — Aplicació web local en una finestra de pywebview.** 03 més una finestra nativa que fa servir la vista web del sistema operatiu i els diàlegs natius d'arxiu. Resol la principal mancança funcional de 03, no afegeix cap paquet de Chromium (el motor WebView2 forma part de Windows i és a tots els equips client), afegeix només uns 2–3 MB de binaris al programa compilat i conserva la cadena de PyInstaller. Costos: dependència del backend de Windows de pywebview basat en pythonnet, una base reduïda de mantenidors i pocs extres d'escriptori (sense actualització automàtica ni safata integrades). _Motiu per triar-la:_ sensació d'escriptori amb la menor empremta distribuïda. _Motiu per no triar-la:_ depèn d'un paquet correcte de PyInstaller amb pywebview i pythonnet, que cal demostrar a la prova de validació.

---

## 5. Anàlisi comparativa

### 5.1 Mida del programa compilat

Els binaris de Qt formen part del resultat compilat sempre que hi intervé Qt. Les xifres estan **mesurades a partir de les rodes de Windows a PyPI** (llistes d'arxius de PySide6 6.9.0 Essentials i Addons, OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview, pythonnet), no d'una compilació real. Les taules completes són a [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

| Capa d'interfície | Què s'inclou                                                                                                                                                            | Afegit descomprimit | Afegit comprimit |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------: | ---------------: |
| 01 Qt Widgets     | Qt6 Core/Gui/Widgets/Pdf/PrintSupport, mòduls de PySide6, connectors (opcionalment OpenGL per programari, traduccions)                                                  |          ≈ 55–90 MB |       ≈ 20–33 MB |
| 02 Qt WebEngine   | l'anterior **més** `Qt6WebEngineCore.dll` (199,5 MB), traduccions, paquets de recursos (255,7 MB d'arxius de WebEngine en total) i Quick/Qml/Network ≈ 26 MB            |        ≈ 340–370 MB |     ≈ 135–150 MB |
| 03 Navegador      | FastAPI/Uvicorn/Starlette/Pydantic ≈ 9 MB, frontend web 0,34 MB; sense Qt, sense motor de navegador                                                                     |              ≈ 9 MB |           ≈ 3 MB |
| 04 pywebview      | l'anterior **més** pywebview 1,6 MB (carregador de WebView2 i DLL d'interoperabilitat ≈ 1 MB) i pythonnet 0,7 MB; el motor WebView2 forma part de Windows i no s'inclou |             ≈ 11 MB |           ≈ 4 MB |

| Programa compilat complet | Descomprimit | Comprimit (aproximació) | Comparat amb 04 |
| ------------------------- | -----------: | ----------------------: | --------------: |
| 01 Qt Widgets             | ≈ 420–455 MB |            ≈ 147–160 MB |     +12 a +21 % |
| 02 Qt WebEngine           | ≈ 705–735 MB |            ≈ 263–276 MB |     +88 a +96 % |
| 03 Navegador              |     ≈ 373 MB |                ≈ 130 MB |            −1 % |
| 04 pywebview              |     ≈ 375 MB |                ≈ 131 MB |      referència |

- **pywebview no té binaris de la mida de Qt:** afegeix uns 2–3 MB, davant d'uns 55–90 MB de Qt Widgets i 340–370 MB amb WebEngine.
- **La pila comuna del motor ronda els 364 MB descomprimits (≈ 127 MB comprimits),** encapçalada per OpenCV (110 MB) i SciPy (116 MB). La capa d'interfície és, per tant, una part important del resultat: Qt Widgets hi afegeix un 12–21 % i Qt WebEngine gairebé duplica el programa.
- **Els contenidors web són més petits que la compilació actual amb Qt només si es retira Qt del programa compilat,** cosa que exigeix eliminar els ~7 arxius que no són d'interfície i que importen Qt (troballa F1).
- No mesurat: l'entorn d'execució de Python, altres dependències, la sobrecàrrega de PyInstaller, la compressió de l'instal·lador. Una compilació real és la primera tasca de validació.

### 5.2 Decisió 1: Qt Widgets o web?

|                                                          |                      01 Qt Widgets |                           Interfície web (02, 03, 04) |
| -------------------------------------------------------- | ---------------------------------: | ----------------------------------------------------: |
| Estètica, interacció, eficàcia (aspecte i ús)            |                            2, 2, 3 |                                               5, 5, 5 |
| Coherència, instal·lació i arrencada, comportament natiu |                            5, 5, 5 |                  3–5, 3–4, 2–5 (depèn del contenidor) |
| Mida del programa compilat                               | 3 (≈ 420–455 MB, 12–21 % sobre 04) | 1–5 (≈ 373–375 MB per a 03/04; ≈ 705–735 MB per a 02) |
| **Puntuació A: experiència de l'usuari final**           |                             **64** |                                             **86–94** |
| **Puntuació B: facilitat amb Python**                    |                             **88** |                                             **60–80** |

Les opcions web donen als usuaris finals una interfície clarament millor, i els millors contenidors web són **més petits que la compilació amb Qt** perquè prescindeixen dels binaris de Qt. Els límits de Qt Widgets són estructurals (QSS no té motors de maquetació, ombres reals, desenfocament ni transicions; els components moderns es dibuixen a mà); els costos de la web són tasques identificables. Qt Widgets supera el millor contenidor web només si l'experiència de l'usuari final pesa menys d'un 32 % aproximadament (davant de 03: 27 %; davant de 02: 54 %).

### 5.3 Decisió 2: quin contenidor web?

| Aspecte                       | **02 Navegador integrat (Qt WebEngine)**          | **04 Finestra pywebview + alternativa de navegador**                                                 | **03 Backend Python + navegador extern** |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Aspecte i interacció          | idèntics                                          | idèntics                                                                                             | idèntics                                 |
| Coherència del renderitzat    | idèntica a tots els PC                            | molt propera (Edge WebView2, basat en Chromium, present a tots els clients, actualitzat per Windows) | depèn del navegador                      |
| El que veu l'usuari           | la finestra de l'aplicació Qt                     | una petita finestra nativa                                                                           | una pestanya o finestra del navegador    |
| **Programa compilat (total)** | **≈ 705–735 MB** (capa d'interfície ≈ 340–370 MB) | **≈ 375 MB** (capa d'interfície ≈ 11 MB)                                                             | **≈ 373 MB** (capa d'interfície ≈ 9 MB)  |
| Descàrrega / actualització    | ≈ 263–276 MB                                      | ≈ 131 MB                                                                                             | ≈ 130 MB                                 |
| Arrencada                     | més lenta                                         | ràpida                                                                                               | servidor i després el navegador          |
| Requisits previs              | cap                                               | cap (WebView2 present a tots els clients)                                                            | un navegador modern                      |
| Selectors d'arxiu/carpeta     | natius (Qt)                                       | natius (pywebview); mitjançant el servidor en mode alternatiu                                        | no des d'un navegador                    |
| Puntuació A / B               | 88 / 60                                           | **94 / 74**                                                                                          | 86 / 80                                  |

L'alternativa és una funció del llançador, no un comportament integrat a pywebview: el llançador prova la finestra i obre el navegador predeterminat a la mateixa adreça si falla. Amb WebView2 a tots els clients és només una xarxa de seguretat. 04 i 03 són una mateixa base de codi amb dos modes de presentació.

### 5.4 Puntuacions combinades

| Opció                      | Puntuació A: experiència de l'usuari final | Puntuació B: facilitat amb Python | **Combinada (A 80 / B 20)** |
| -------------------------- | -----------------------------------------: | --------------------------------: | --------------------------: |
| 01 Qt Widgets, modernitzat |                                         64 |                            **88** |                        68,8 |
| 02 Híbrid Qt WebEngine     |                                         88 |                                60 |                        82,4 |
| 03 Navegador               |                                         86 |                                80 |                        84,8 |
| **04 Finestra pywebview**  |                                     **94** |                                74 |                    **90,0** |

Les puntuacions per criteri, els motius i la vista de dos eixos són a [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

### 5.5 Sensibilitat

| Pes d'A                                  |       01 |   02 |       03 |       04 |
| ---------------------------------------- | -------: | ---: | -------: | -------: |
| 100 % (només usuari final)               |     64,0 | 88,0 |     86,0 | **94,0** |
| 80 % (utilitzat)                         |     68,8 | 82,4 |     84,8 | **90,0** |
| 60 %                                     |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                                     |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                                     |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                                     | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (només comoditat del desenvolupador) | **88,0** | 60,0 |     80,0 |     74,0 |

| Pes del criteri de mida dins d'A |   01 |   02 |   03 |       04 |
| -------------------------------- | ---: | ---: | ---: | -------: |
| 0 % (mida ignorada)              | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (utilitzat)                 | 68,8 | 82,4 | 84,8 | **90,0** |
| 30 %                             | 68,1 | 70,3 | 87,3 | **91,0** |

Interpretació:

1. **Per als usuaris finals les opcions web guanyen amb claredat** (86–94 davant de 64). Qt Widgets només lidera quan la comoditat del desenvolupador pesa més que l'experiència de l'usuari final (pes de l'usuari final inferior a un 32 % aproximadament).
2. **04 queda primera amb qualsevol pes entre el 100 % i prop del 43 %.**
3. **La mida és el que frena 02.** Si s'ignora la mida, 02 queda a menys d'un punt de 04 (88,5 davant de 89,4); amb el pes utilitzat baixa a 82,4 (tercera), i encara més com més importa la mida.

### 5.6 L'experiència des del costat de l'usuari final

- **01:** arrenca ràpid i se sent com un programa d'escriptori normal, però les pantalles semblen antiquades; el programa porta 55–90 MB de Qt.
- **02:** la interfície més polida i coherent, però el programa és gairebé el doble de gran que 04, cada instal·lació i actualització pesa uns 135–150 MB (comprimits) més i l'arrencada és més lenta.
- **03:** es veu tan bé com les altres i és la més petita, però viu en una pestanya del navegador: sense selectors de carpeta adequats i amb un aspecte que depèn del navegador de l'usuari.
- **04:** es veu tan bé com 02, s'obre a la seva pròpia finestra, fa servir selectors natius, arrenca ràpid i és més petita que l'instal·lador actual; fa servir el motor Edge WebView2 que ja és a tots els clients.

---

## 6. Recomanació

### 6.1 Arquitectura proposada

```
 llançador de piXeval (PyInstaller)
   ├─ Motor Python: db / omr / cat_lib / dataReports   (codi existent, darrere d'una capa de serveis)
   ├─ FastAPI + Uvicorn a 127.0.0.1 (token per arrencada)  ← ja a la pila
   ├─ Interfície React + TypeScript (compilació estàtica servida per FastAPI)
   └─ contenidor: finestra nativa de pywebview  ── alternativa: navegador del sistema
```

### 6.2 Justificació (Decisió 1: web; Decisió 2: pywebview)

1. **Compleix les restriccions plantejades:** el motor continua sent Python; React, FastAPI, pywebview i les biblioteques de suport són de codi obert amb llicències permissives (per confirmar component a component abans de la publicació), per la qual cosa no sorgeix cost de llicència ni d'allotjament.
2. **Dona als usuaris finals la millor experiència (94 sobre 100, per davant del 88 de 02) amb una millor puntuació d'implementació (74 davant de 60):** la plataforma web ofereix el major conjunt de components madurs i accessibles (taules, diàlegs, gràfics, cerca d'ordres, gestió del teclat) i un disseny visual modern. El prototip demostra el resultat: 30 arxius font de pàgines i diàlegs i unes 3 400 línies de TypeScript i CSS reprodueixen les pantalles i diàlegs del flux principal de piXeval (d'assignatures a notes, utilitats i configuració) amb un disseny modern i un comportament operatiu de crear/editar/eliminar sobre dades d'exemple. Les aplicacions auxiliars del repositori (EBAP, CAT3 Audit) no estan cobertes.
3. **Tanca la principal mancança funcional de l'opció de navegador** (rutes reals d'arxiu) mitjançant diàlegs natius exposats per pywebview, i evita distribuir Chromium: la capa d'interfície afegeix uns 11 MB al resultat compilat, davant d'uns 340–370 MB del navegador integrat de Qt, i uns 45–80 MB menys que la compilació actual amb Qt un cop retirat Qt (un 12–21 % més petita).
4. **Les regressions es detecten abans que les vegin els usuaris:** el codi tipat (TypeScript) i les proves automàtiques de navegador (Playwright) comproven cada pantalla amb bases de dades d'exemple reals abans de la publicació, cosa que importa en una actualització major d'una sola vegada.
5. **Manté petits el programa compilat i les seves actualitzacions:** un executable de Python més el motor WebView2 de Windows ja present a cada client, reutilitzant la cadena existent de PyInstaller i Inno Setup.
6. **Manté obertes opcions futures:** la mateixa API pot donar suport més endavant a un desplegament en xarxa local o remot, cosa que l'opció només amb Qt no pot.
7. **És en part reversible:** si la vista web del sistema operatiu resultés inadequada, la mateixa compilació web s'executa al navegador (03) o dins de Qt WebEngine (02) sense reescriure la interfície, cosa que limita el dany d'una mala elecció de contenidor abans de la versió única.

### 6.3 Per què no es van seleccionar les altres tres

- **01:** la més fàcil d'implementar (88) i la publicació més segura, però els usuaris finals obtenen l'experiència més feble (64): dibuix a mida per a cada component modern, sense efectes ni transicions reals, un aspecte antiquat. Deixaria l'objectiu principal en gran part sense complir.
- **02:** experiència de l'usuari final propera a 04 (88 davant de 94) amb el renderitzat més coherent, però la seva capa d'interfície afegeix uns 340–370 MB al programa compilat (uns 135–150 MB més de descàrrega, a cada instal·lació i actualització), arrenca més lenta i és més difícil d'implementar (60 davant de 74): Chromium a l'instal·lador, empaquetat de QtWebEngine i un pont asíncron. És l'elecció si un motor de renderitzat idèntic garantit importa més que la mida, o si un servidor local és inacceptable.
- **03:** el mateix frontend amb el navegador de l'usuari com a finestra: la més senzilla de lliurar (80) i la més petita, però l'opció web més feble per als usuaris finals (86): sense selectors natius d'arxiu i amb un aspecte que varia segons el navegador. Es conserva com a **mode alternatiu de 04**.

---

## 7. Riscos i mitigacions

| Risc                                                                                                                  | Probabilitat / impacte | Mitigació                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| La lògica de negoci incrustada als widgets s'extreu malament                                                          | alta / alt             | proves de caracterització de les sortides de qualificació, OMR i informes abans de refactoritzar (F3)                                                                                                                    |
| Defectes introduïts durant la reescriptura de la interfície (inclòs el codi generat per IA) als fluxos de notes o OMR | mitjana / alt          | mantenir el motor sense canvis; TypeScript estricte; proves unitàries de la capa de serveis; proves d'extrem a extrem (Playwright) amb bases de dades d'exemple reals; revisió humana de cada canvi que afecti les notes |
| Diferències entre versions de Windows o entre versions de l'entorn d'execució de WebView2                             | baixa / mitjà          | provar a Windows 10 i 11; evitar CSS/JS d'avantguarda; l'alternativa de navegador continua sent una xarxa de seguretat                                                                                                   |
| El backend de Windows de pywebview depèn de pythonnet i es pot empaquetar malament amb PyInstaller                    | mitjana / alt          | demostrar el paquet a la prova de validació; mantenir l'alternativa de navegador                                                                                                                                         |
| Servidor local exposat a altres processos locals                                                                      | mitjana / alt          | enllaçar a loopback, port aleatori, token per arrencada, comprovacions estrictes d'origen                                                                                                                                |
| Una regressió o una funció absent arriba a tots els usuaris alhora (sense desplegament incremental)                   | alta / alt             | llista escrita de paritat de cada pantalla, diàleg i informe; proves d'extrem a extrem amb bases de dades reals; beta tancada abans de la publicació                                                                     |
| Les bases de dades d'usuari existents no s'obren o no es migren                                                       | mitjana / alt          | la nova versió obre les bases de dades actuals sense canvis d'esquema; còpia de seguretat automàtica abans de la primera obertura; conservar l'instal·lador anterior per tornar enrere                                   |
| Dues versions instal·lades en paral·lel escriuen en un mateix fitxer SQLite                                           | baixa / alt            | servei d'escriptor únic; l'instal·lador detecta i avisa d'una instal·lació anterior                                                                                                                                      |
| Les taules grans o les pantalles amb moltes imatges van lentes                                                        | mitjana / mitjà        | taules virtualitzades; prova amb més de 5 000 files; miniatures per als escanejos                                                                                                                                        |
| Dependència d'un únic mantenidor (pywebview)                                                                          | mitjana / mitjà        | capa fina d'abstracció sobre el contenidor; alternativa al navegador o a Qt WebEngine                                                                                                                                    |
| Es perd l'estalvi de mida perquè Qt es queda al programa compilat                                                     | mitjana / mitjà        | eliminar les ~7 importacions de Qt de mòduls que no són d'interfície al pas de la capa de serveis; comprovar el contingut del paquet a la prova de validació                                                             |
| Creixement de l'abast per les diverses aplicacions del repositori (EBAP, CAT3 Audit)                                  | mitjana / mitjà        | migrar primer piXeval; reutilitzar després el sistema de disseny                                                                                                                                                         |

---

## 8. Pla d'implementació (una versió major)

| Fase | Treball                                                                                                                                            | Criteri de sortida                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 0    | Revisar l'informe; executar la prova de validació (§9)                                                                                             | registre de decisió                                                                |
| 1    | Capa de serveis; substituir els senyals de Qt per callbacks/esdeveniments; proves de caracterització                                               | l'aplicació Qt actual sense canvis i superant les proves                           |
| 2    | API FastAPI per a cada cas d'ús; construir la interfície web completa sobre ella, partint del prototip                                             | llista de paritat: cada pantalla, diàleg i informe actuals                         |
| 3    | Diàlegs natius mitjançant pywebview; fluxos d'OMR i correcció amb esdeveniments de progrés; instal·lador; obertura de les bases de dades existents | la candidata a versió supera les proves d'extrem a extrem amb bases de dades reals |
| 4    | Beta tancada amb usuaris i bases de dades reals; corregir defectes; mantenir disponible l'instal·lador anterior per tornar enrere                  | aprovació de la beta                                                               |
| 5    | Publicar com la propera versió major                                                                                                               | usuaris a la nova versió; instal·lador anterior conservat una versió               |

---

## 9. Tasques de validació abans de comprometre's (encara no fetes)

1. Crear un paquet de PyInstaller de FastAPI + pywebview (inclosa la seva dependència pythonnet) **sense Qt**, i **mesurar la mida de l'instal·lador, la mida instal·lada i l'arrencada en fred** davant de l'instal·lador actual; repetir el paquet amb Qt WebEngine per comparar-lo.
2. Comprovar el comportament de la finestra de pywebview a **Windows 10 i 11** (WebView2 està disponible a tots els equips client).
3. Prototipar el **pont del diàleg natiu de carpeta** i un escaneig de llarga durada amb flux d'esdeveniments.
4. Mesurar el rendiment de la **taula de notes amb més de 5 000 files** i d'una pantalla de revisió d'imatges escanejades.
5. Fer una **comparació d'usabilitat** (temps de tasca i errors) entre una pantalla actual de Qt i el seu equivalent web amb uns quants usuaris reals.
6. Revisar les **llicències** de cada dependència del paquet (inclosos els components LGPL si Qt roman a la compilació).

---

## 10. Consideracions de cost

Tots els components de la pila recomanada (Python, FastAPI, React, TypeScript, pywebview, Vite) són de codi obert; l'únic cost és el temps de desenvolupament. Les opcions basades en Qt tampoc tenen tarifa sempre que es respectin els termes de la LGPL. L'esforç de desenvolupament el domina la reimplementació de la interfície (F2), que totes les opcions comparteixen; la revisió i les proves continuen sent necessàries sigui quina sigui la manera d'escriure el codi.

---

## 11. Limitacions d'aquest estudi

- Les puntuacions són judicis; l'anàlisi de sensibilitat mostra com canvien, però no elimina la subjectivitat.
- No es van mesurar la mida de l'instal·lador, el rendiment ni les dades dels equips de destinació (§9).
- Les dades tecnològiques externes (Qt, pywebview) provenen de la documentació pública i dels articles citats més avall; els números de versió i l'estat dels projectes canvien amb rapidesa i s'han de tornar a comprovar en el moment de decidir.
- Els recomptes de línies mesuren la mida, no la complexitat; indiquen l'esforç relatiu, però no l'esforç exacte.
- El prototip fa servir dades d'exemple i no executa el motor real.

---

## 12. Conclusió

El motor de processament de piXeval és en gran part independent de la seva interfície d'usuari, per la qual cosa substituir la tecnologia de la interfície és tècnicament viable sense sortir de Python. Totes les opcions requereixen el mateix primer pas, una capa de serveis. La plataforma web dona als usuaris finals una experiència clarament millor (86–94 sobre 100 davant de 64 de Qt Widgets). Un motor Python amb aquesta interfície en una finestra nativa assoleix la millor puntuació d'usuari final (94, davant de 88 del navegador integrat Qt WebEngine) amb una millor puntuació d'implementació (74 davant de 60), i amb un programa compilat molt més petit (uns 11 MB per a la capa d'interfície davant d'uns 340–370 MB amb Qt WebEngine, que gairebé duplicaria el programa; un 12–21 % més petit que la compilació actual amb Qt Widgets), amb el navegador extern com a alternativa de seguretat. Qt Widgets es preferiria només si la comoditat del desenvolupador comptés més de dos terços de la decisió. Com que la migració és una única versió, el risc dominant és la qualitat de la publicació i no la via de migració, per la qual cosa una llista de paritat, una beta tancada i una via de retrocés formen part del pla. El pas següent és el treball de validació del §9, que es pot completar en una prova breu i de baix risc abans de qualsevol inversió important.

---

## Referències

1. Documentació de Qt, _User Interfaces_ (Widgets, animació i aplicacions d'escriptori complexes), <https://doc.qt.io/qt-6.9/topics-ui.html>
2. Qt for Python, _QtWebChannel_, <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
3. Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_, <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
4. Llistat del paquet pywebview 6.x, <https://www.archlinux.org/packages/extra/any/python-pywebview>
5. Mètriques del repositori de piXeval: [00-baseline-current-stack.md](00-baseline-current-stack.md)
