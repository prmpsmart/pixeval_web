# 05 · Comparació, puntuació i full de ruta

## Nota sobre les restriccions

- **El focus principal és l'usuari final, no el desenvolupador.** La puntuació principal mesura el que viuen a diari les persones que fan servir piXeval: l'aspecte i la sensació del producte, la seva eficàcia i com s'instal·la, arrenca i es comporta als seus equips. La comoditat del desenvolupador es puntua a part i pesa menys.
- **Només Windows:** piXeval es lliura com a instal·lador de Windows. No es consideren altres sistemes operatius; «coherència» vol dir coherència entre els PC amb Windows dels usuaris.
- **WebView2 està disponible a tots els equips client** (supòsit d'aquest estudi), per la qual cosa es tracta com a present i no com a requisit previ ni risc.
- La mida de l'equip, els seus coneixements i la familiaritat amb els llenguatges **no són restriccions**; les opcions es jutgen pel seu mèrit tècnic.
- **No hi ha migració incremental:** la nova interfície substitueix l'antiga en una única versió major.
- **Puntuacions:** **Puntuació A** = experiència de l'usuari final (principal, pes 80 %). **Puntuació B** = facilitat d'implementar-la amb l'entorn d'execució de Python (secundària, pes 20 %). Es mostren altres ponderacions perquè es vegi l'efecte de l'elecció.

## Estructura de la decisió

L'elecció es fa en dos passos, perquè les opcions no són quatre iguals:

1. **Decisió 1: Qt Widgets o web (React, etc.)?** L'opció 01 davant de la interfície web. És la gran decisió: determina el sostre d'UI/UX i la cadena d'eines.
2. **Decisió 2 (si és web): quin contenidor la presenta?** El mateix frontend React es pot mostrar de tres maneres:
   - **02** dins de l'aplicació Qt (**navegador integrat, Qt WebEngine**),
   - **04** en una finestra de **pywebview**, amb el **navegador extern com a alternativa** quan no hi ha vista web disponible,
   - **03** amb **Python com a backend i el navegador extern utilitzat directament**.

Les seccions 5 i 6 donen les dues decisions; les seccions 1–4 contenen les proves i puntuacions en què es basen, i la secció 7 les combina.

## 1. Python en el quadre: com s'executa cada opció

| #   | Opció                                    | On s'executa Python                                           | Com hi parla la interfície                                               | Què llança l'usuari                       |
| --- | ---------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| 01  | PySide6 Widgets, modernitzat             | mateix procés que la interfície                               | crides directes a funcions i senyals de Qt                               | un executable                             |
| 02  | Híbrid Qt WebEngine                      | mateix procés que la interfície                               | QtWebChannel (pont JS↔Python asíncron)                                   | un executable que conté Chromium          |
| 03  | Aplicació web local, navegador           | procés FastAPI separat iniciat per un llançador               | HTTP + WebSocket/SSE a 127.0.0.1                                         | el llançador i després el navegador       |
| 04  | Aplicació web local + finestra pywebview | servidor FastAPI en un fil en segon pla del mateix executable | HTTP + WebSocket/SSE, més un petit pont JS↔Python per als diàlegs natius | un executable amb la seva pròpia finestra |

## 2. Mida del programa compilat

El resultat compilat és el que PyInstaller posa a l'instal·lador. **Els binaris de Qt en formen part sempre que hi intervé Qt**; les opcions web els substitueixen per uns pocs megabytes. Les xifres següents estan **mesurades a partir de les rodes (wheels) de Windows a PyPI** (llistes d'arxius llegides directament), no d'una compilació real; el resultat real depèn del que reculli PyInstaller.

**Comú a totes les opcions: la pila del motor Python** (mida descomprimida de les rodes de Windows fixades a `requirements.txt`):

| Component                      | Descomprimit | Roda (comprimida) |
| ------------------------------ | -----------: | ----------------: |
| OpenCV 4.12                    |       110 MB |             39 MB |
| SciPy 1.16                     |       116 MB |             39 MB |
| NumPy                          |        43 MB |             13 MB |
| pandas                         |        39 MB |             11 MB |
| scikit-image                   |        25 MB |             13 MB |
| matplotlib                     |        20 MB |              8 MB |
| Pillow, reportlab              |        11 MB |              5 MB |
| **Total de la pila del motor** | **≈ 364 MB** |      **≈ 127 MB** |

**Varia segons l'opció: la capa d'interfície**

| Capa d'interfície      | Què s'inclou                                                                                                                                                                                             |                 Descomprimit | Comprimit (roda) |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------: | ---------------: |
| 01 Qt Widgets          | Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7, PrintSupport 0,4 MB; mòduls de PySide6 ≈ 12 MB; connectors ≈ 5 MB; opcionalment OpenGL per programari 20,6 MB i traduccions ≈ 12 MB                         |   **≈ 55–90 MB** (estimació) |       ≈ 20–33 MB |
| 02 Híbrid Qt WebEngine | tot el de 01, **més** QtWebEngine (`Qt6WebEngineCore.dll` 199,5 MB, traduccions ≈ 40 MB, paquets de recursos ≈ 13 MB: 255,7 MB en total, mesurat) **més** Quick/Qml/Network/OpenGL/Positioning ≈ 26 MB   | **≈ 340–370 MB** (estimació) |     ≈ 135–150 MB |
| 03 Navegador           | FastAPI, Uvicorn, Starlette, Pydantic ≈ 8,9 MB; frontend web 0,34 MB (la compilació del prototip: 322 KB de JS + 22 KB de CSS); **sense Qt, sense motor de navegador**                                   |                   **≈ 9 MB** |           ≈ 3 MB |
| 04 Finestra pywebview  | tot el de 03, **més** pywebview 1,6 MB (carregador de WebView2 i DLL d'interoperabilitat ≈ 1 MB) i pythonnet 0,7 MB; **el motor WebView2 en si no s'inclou** (forma part de Windows, compartit amb Edge) |                  **≈ 11 MB** |           ≈ 4 MB |

**Totals (components coneguts)**

|                 | Descomprimit | Comprimit (roda; aproximació de la descàrrega) |                    Comparat amb 04 |
| --------------- | -----------: | ---------------------------------------------: | ---------------------------------: |
| 01 Qt Widgets   | ≈ 420–455 MB |                                   ≈ 147–160 MB |                    **+12 a +21 %** |
| 02 Qt WebEngine | ≈ 705–735 MB |                                   ≈ 263–276 MB | **+88 a +96 %** (gairebé el doble) |
| 03 Navegador    |     ≈ 373 MB |                                       ≈ 130 MB |                               −1 % |
| 04 pywebview    |     ≈ 375 MB |                                       ≈ 131 MB |                         referència |

Observacions:

1. **pywebview afegeix uns 2–3 MB de binaris; Qt afegeix uns 55–90 MB (Widgets) o uns 340–370 MB (amb WebEngine).** Els contenidors web que eviten Qt són les opcions més petites, i **04 és més petita que la compilació actual amb Qt Widgets en uns 45–80 MB** (12–21 %) un cop retirat PySide6 del paquet.
2. **Aquest estalvi exigeix retirar Qt del programa compilat.** Uns set arxius que no són d'interfície encara importen Qt (troballa F1 de l'informe); el pas de la capa de serveis els elimina. Sense aquest pas, PySide6 es queda al paquet.
3. **La capa d'interfície és una part important del resultat.** La pila del motor ronda els 364 MB (encapçalada per OpenCV i SciPy); Qt Widgets li afegeix un 12–21 % aproximadament, i Qt WebEngine gairebé duplica el programa.
4. **Temps de descàrrega i actualització:** la capa d'interfície de 02 són uns 135–150 MB comprimits davant d'uns 4 MB de 04, aproximadament 2 minuts extra a 10 Mbit/s a cada instal·lació i cada actualització.
5. No mesurat: l'entorn d'execució de Python, altres dependències (clients de Google, etc.), la sobrecàrrega de PyInstaller, la compressió d'Inno Setup. Una compilació real és la primera tasca de validació.

## 3. Puntuació A: experiència de l'usuari final (principal)

| Criteri (pes dins d'A)                            | El que sent l'usuari final                                                                                                                                                              |     01 |     02 |     03 |     04 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Estètica i aspecte modern (25)                    | tipografia, espaiat, ombres, desenfocament, mode fosc, acabat                                                                                                                           |      2 |      5 |      5 |      5 |
| Interacció agradable (15)                         | transicions, resposta en passar el cursor o enfocar, rapidesa de resposta                                                                                                               |      2 |      5 |      5 |      5 |
| Eficàcia (20)                                     | taules denses, cerca/filtre, paleta d'ordres, ús del teclat, resposta clara, gràfics, accessibilitat                                                                                    |      3 |      5 |      5 |      5 |
| Coherència entre els PC Windows dels usuaris (10) | es veu i es comporta igual a qualsevol equip amb Windows                                                                                                                                |      5 |      5 |      3 |      4 |
| Instal·lació i arrencada (10)                     | temps d'arrencada, sense requisits previs, sensació d'aplicació                                                                                                                         |      5 |      3 |      3 |      4 |
| Comportament d'escriptori natiu (10)              | selectors reals d'arxiu/carpeta, impressió, arrossegar i deixar anar, funciona sense connexió                                                                                           |      5 |      5 |      2 |      4 |
| **Mida del programa compilat (10)**               | mida de l'instal·lador i de la instal·lació, temps de descàrrega i actualització (secció 2); 5 = el més petit, 4 = fins a +10 % sobre ell, 3 = +10–25 %, 2 = +25–60 %, 1 = més de +60 % |      3 |      1 |      5 |      5 |
| **Puntuació A (0–100)**                           |                                                                                                                                                                                         | **64** | **88** | **86** | **94** |

El que notaria un usuari final:

- **01** arrenca ràpid i es comporta com qualsevol programa d'escriptori, però les pantalles semblen antiquades i la interfície continua sent senzilla. El programa porta 55–90 MB de Qt.
- **02** ofereix la interfície més polida i coherent, però el programa és gairebé el doble de gran que 04, cada instal·lació i actualització pesa uns 135–150 MB (comprimits) més, i l'arrencada és més lenta perquè porta dins un motor de navegador complet.
- **03** es veu tan bé com 02 i és la més petita, però és una pestanya del navegador: llança un servidor i un navegador, no pot oferir selectors de carpeta adequats i depèn del navegador que tingui l'usuari (Edge i Chrome comparteixen motor; Firefox no).
- **04** es veu tan bé com 02, s'obre en la seva pròpia finestra com un programa normal, fa servir selectors natius d'arxiu i carpeta i és més petita que el programa actual. Fa servir el motor WebView2 d'Edge, present a tots els equips client; si algun dia faltés, el programa recorre al navegador (comportament de 03).

## 4. Puntuació B: facilitat d'implementar-la amb l'entorn d'execució de Python (secundària)

| Criteri (pes dins de B)                 | Què demana                                                                   |     01 |     02 |     03 |     04 |
| --------------------------------------- | ---------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Integració amb el motor (30)            | cridar el codi Python, esdeveniments de progrés per a escanejos/còpies, fils |      5 |      4 |      4 |      4 |
| Esforç de compilació i empaquetat (30)  | PyInstaller, entorns d'execució a incloure, signatura, cadena de publicació  |      5 |      2 |      4 |      3 |
| Peces mòbils a provar (20)              | cadenes d'eines, fronteres entre processos, contractes de pont/API           |      5 |      2 |      3 |      3 |
| Reutilització del treball existent (20) | FastAPI ja a la pila, prototip existent, capa de serveis                     |      2 |      4 |      5 |      5 |
| **Puntuació B (0–100)**                 |                                                                              | **88** | **60** | **80** | **74** |

Les comoditats només per a desenvolupadors (recàrrega en calent, traspàs de disseny, grans ecosistemes) **no** es puntuen; importen únicament pel resultat per a l'usuari final que fan possible.

## 5. Decisió 1: Qt Widgets o web?

|                                                |                      01 Qt Widgets |                           Interfície web (02, 03, 04) |
| ---------------------------------------------- | ---------------------------------: | ----------------------------------------------------: |
| Estètica, interacció, eficàcia                 |                            2, 2, 3 |                                               5, 5, 5 |
| Coherència entre els PC Windows dels usuaris   |                                  5 |                                                   3–5 |
| Instal·lació i arrencada                       |                                  5 |                                                   3–4 |
| Comportament d'escriptori natiu                |                                  5 |                            2–5 (depèn del contenidor) |
| Mida del programa compilat                     | 3 (≈ 420–455 MB, 12–21 % sobre 04) | 1–5 (≈ 373–375 MB per a 03/04; ≈ 705–735 MB per a 02) |
| **Puntuació A: experiència de l'usuari final** |                             **64** |                                             **86–94** |
| **Puntuació B: facilitat amb Python**          |                             **88** |                                             **60–80** |

**Veredicte: web.** Les opcions web donen als usuaris finals una interfície clarament millor (5 davant de 2–3 en aspecte, interacció i eficàcia), i els millors contenidors web són **més petits que la compilació amb Qt**, perquè prescindeixen dels binaris de Qt. Els desavantatges de Qt Widgets per a l'usuari final són **estructurals**: QSS no té motors de maquetació, ombres reals, desenfocament ni transicions, i cada component modern es dibuixa a mà. Els desavantatges de la web són **tasques identificables** (diàlegs natius, retirar Qt del motor, una cadena d'empaquetat).

Qt Widgets supera el millor contenidor web (04) només si l'experiència de l'usuari final pesa **menys d'un 32 % aproximadament** (davant de 03: 27 %; davant de 02: 54 %). Amb el 80 % que es fa servir aquí, les opcions web guanyen per 14–21 punts combinats.

## 6. Decisió 2: quin contenidor web?

Els tres mostren el mateix frontend React, així que l'aspecte i la interacció són idèntics. El que canvia per a l'usuari final és la coherència del renderitzat, la mida, la instal·lació i l'arrencada, i el comportament natiu.

| Aspecte                                | **02 Navegador integrat (Qt WebEngine)**          | **04 Finestra pywebview, alternativa amb navegador extern**                                         | **03 Backend Python + navegador extern**                         |
| -------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Aspecte i interacció                   | idèntics                                          | idèntics                                                                                            | idèntics                                                         |
| Coherència del renderitzat             | idèntica a tots els PC (Chromium inclòs)          | molt propera: Edge WebView2 es basa en Chromium, és a tots els equips client i l'actualitza Windows | depèn del navegador (Edge/Chrome comparteixen motor; Firefox no) |
| El que veu l'usuari                    | la finestra de l'aplicació Qt                     | una petita finestra nativa, sense marc de navegador                                                 | una pestanya o finestra del navegador                            |
| **Programa compilat (total)**          | **≈ 705–735 MB** (capa d'interfície ≈ 340–370 MB) | **≈ 375 MB** (capa d'interfície ≈ 11 MB; pywebview ≈ 2–3 MB de binaris, sense Qt)                   | **≈ 373 MB** (capa d'interfície ≈ 9 MB)                          |
| Descàrrega / actualització             | ≈ 263–276 MB                                      | ≈ 131 MB                                                                                            | ≈ 130 MB                                                         |
| Arrencada                              | més lenta (motor Chromium)                        | ràpida                                                                                              | arrenca el servidor i després s'obre el navegador                |
| Requisits previs                       | cap                                               | cap (WebView2 present a tots els clients)                                                           | un navegador modern                                              |
| Selectors d'arxiu/carpeta              | natius (Qt)                                       | natius (pywebview); en mode alternatiu, mitjançant el servidor                                      | no disponibles des d'un navegador; escrits o oberts pel servidor |
| Impressió / PDF                        | impressió i PDF de Qt                             | vista web o PDF generat al servidor                                                                 | navegador o PDF generat al servidor                              |
| Funciona sense connexió                | sí                                                | sí                                                                                                  | sí                                                               |
| Alternativa                            | no aplicable                                      | el llançador obre el navegador extern si la finestra no pot iniciar-se                              | no aplicable                                                     |
| Actualitzacions de seguretat del motor | requereixen una nova versió de piXeval            | WebView2 s'actualitza sol mitjançant Windows                                                        | segueixen el navegador de l'usuari                               |
| Puntuació A / B                        | 88 / 60                                           | **94 / 74**                                                                                         | 86 / 80                                                          |

Notes:

- **04 supera 02 per a l'usuari final (94 davant de 88):** 02 és una mica més coherent, però gairebé el doble de gran, més lenta en arrencar i més lenta d'actualitzar. 04 també és més fàcil d'implementar (74 davant de 60).
- **L'alternativa és una funció del llançador, no una cosa que pywebview faci per si sol,** i amb WebView2 a tots els clients és només una xarxa de seguretat. En mode alternatiu l'experiència baixa a la de 03.
- **03 per si sola** és la més petita i la més senzilla de lliurar, però és l'opció web més feble per als usuaris finals (86): sense selectors natius i amb un aspecte que depèn del navegador.

**Veredicte: 04**, amb el navegador extern com a alternativa de seguretat. 02 es prefereix només si importa més un motor de renderitzat idèntic garantit que un programa gairebé el doble de gran, o si un servidor local és inacceptable.

## 7. Resultat combinat i sensibilitat

| Opció                                  | Puntuació A: experiència de l'usuari final | Puntuació B: facilitat amb Python | **Combinada (A 80 / B 20)** |
| -------------------------------------- | -----------------------------------------: | --------------------------------: | --------------------------: |
| 01 PySide6 Widgets, modernitzat        |                                         64 |                            **88** |                        68,8 |
| 02 Híbrid Qt WebEngine                 |                                         88 |                                60 |                        82,4 |
| 03 Aplicació web local, navegador      |                                         86 |                                80 |                        84,8 |
| **04 Aplicació web local + pywebview** |                                     **94** |                                74 |                    **90,0** |

Vista en dos eixos (experiència de l'usuari final amunt, facilitat d'implementació a la dreta):

```
 experiència 94 |                   04
 de l'usuari 88 |        02
             86 |                   03
                |
             64 |                              01
                +-----------------------------------
                  60        74  80       88   facilitat amb Python
```

Sensibilitat al pes de l'experiència de l'usuari final (A):

| Pes d'A                                  |       01 |   02 |       03 |       04 |
| ---------------------------------------- | -------: | ---: | -------: | -------: |
| 100 % (només usuari final)               |     64,0 | 88,0 |     86,0 | **94,0** |
| 90 %                                     |     66,4 | 85,2 |     85,4 | **92,0** |
| 80 % (utilitzat)                         |     68,8 | 82,4 |     84,8 | **90,0** |
| 70 %                                     |     71,2 | 79,6 |     84,2 | **88,0** |
| 60 %                                     |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                                     |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                                     |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                                     | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (només comoditat del desenvolupador) | **88,0** | 60,0 |     80,0 |     74,0 |

Sensibilitat al pes del criteri de mida dins d'A (els altres s'escalen proporcionalment; puntuació combinada amb A 80 / B 20):

| Pes de la mida dins d'A |   01 |   02 |   03 |       04 |
| ----------------------- | ---: | ---: | ---: | -------: |
| 0 % (mida ignorada)     | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (utilitzat)        | 68,8 | 82,4 | 84,8 | **90,0** |
| 20 %                    | 68,5 | 76,3 | 86,1 | **90,6** |
| 30 %                    | 68,1 | 70,3 | 87,3 | **91,0** |

Conclusions:

1. **Per als usuaris finals les opcions web guanyen amb claredat:** 86–94 davant de 64 de Qt Widgets. Qt Widgets només lidera quan la comoditat del desenvolupador pesa més que l'experiència de l'usuari final (pes de l'usuari final inferior a un 32 % aproximadament).
2. **04 queda primera amb qualsevol pes de l'usuari final entre el 100 % i prop del 43 %**; per sota, lidera 03 fins que domina la comoditat del desenvolupador.
3. **La mida és el que frena 02.** Si s'ignora la mida, 02 puja a 88,5, a menys d'un punt de 04 (89,4); amb el pes utilitzat (10 %) baixa a 82,4 (tercera); amb pesos majors baixa encara més.
4. **L'avantatge de mida dels contenidors web depèn de retirar Qt del programa compilat.** Sense això, PySide6 (≈ 55–90 MB) es queda al paquet i 04 tindria aproximadament la mida de 01.

## 8. Requisits previs transversals (necessaris per a qualsevol opció)

1. **Extreure una capa de serveis** dels 103 arxius d'interfície que criden directament la capa de dades; definir funcions de casos d'ús (p. ex. `grades.list(exam_id)`, `correction.run(folder)`).
2. **Substituir els senyals de Qt al codi de lògica** (`SignalInstance` a `cat_lib`, `utils`) per callbacks/esdeveniments; retirar les 7 importacions de Qt dels mòduls que no són d'interfície.
3. **Definir un únic escriptor** per a SQLite (dues interfícies obertes alhora no han de corrompre ni bloquejar la base de dades).
4. **Proves de caracterització** de les fórmules de qualificació, les sortides d'OMR i la generació d'informes abans de refactoritzar.

## 9. Full de ruta suggerit (una versió major)

| Fase | Treball                                                                                                                                                                               | Resultat                                                    | Criteri de sortida                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| 0    | Revisar aquest informe; executar la prova de validació (mides reals del paquet amb i sense Qt, diàlegs natius, rendiment de taules)                                                   | registre de decisió                                         | aprovació                                                            |
| 1    | Capa de serveis + esdeveniments de progrés + proves de caracterització (sense canvis a la interfície)                                                                                 | paquet Python `pixeval_core` usat per l'aplicació Qt actual | l'aplicació actual sense canvis i en verd                            |
| 2    | API FastAPI per a cada cas d'ús; interfície web construïda pantalla a pantalla sobre ella, amb el prototip existent com a punt de partida                                             | nova interfície completa en una branca de desenvolupament   | llista de paritat: cada pantalla, diàleg i informe actuals           |
| 3    | Diàlegs natius mitjançant pywebview; fluxos d'OMR/correcció amb flux d'esdeveniments; empaquetat (PyInstaller + Inno); obertura automàtica i migració de les bases de dades existents | candidata a versió instal·lable                             | supera les proves d'extrem a extrem amb bases de dades reals         |
| 4    | Beta tancada amb usuaris i bases de dades reals; corregir defectes; mantenir disponible l'instal·lador anterior per tornar enrere                                                     | aprovació de la beta                                        | sense defectes bloquejants durant un període acordat                 |
| 5    | Publicar com la propera versió major                                                                                                                                                  | publicació                                                  | usuaris a la nova versió; instal·lador anterior conservat una versió |

## 10. Fonts

- Documentació de Qt, _User Interfaces_ (Widgets davant de la pila declarativa de Qt; notes sobre animació i aplicacions d'escriptori complexes): <https://doc.qt.io/qt-6.9/topics-ui.html>
- Qt for Python, _QtWebChannel_: <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
- Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_: <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
- Metadades de versions de PyPI i llistes d'arxius de les rodes de Windows de PySide6 6.9.0 (Essentials, Addons), OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview i pythonnet (xifres de mida de la secció 2): <https://pypi.org>
- Llistat del paquet pywebview 6.x: <https://www.archlinux.org/packages/extra/any/python-pywebview>
