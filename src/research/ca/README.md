# Recerca: modernitzar la interfície d'usuari de piXeval

Pregunta: quines opcions hi ha per millorar la interfície i l'experiència d'ús de piXeval, prenent com a base la configuració actual de PySide6, mantenint el motor en Python i sense afegir noves despeses?

**Com es jutgen les opcions:** el focus principal és l'**usuari final**. La puntuació A (80 %) és l'experiència de l'usuari final (estètica i aspecte modern, interacció, eficàcia, consistència, instal·lació i inici, comportament natiu); la puntuació B (20 %) és la facilitat d'implementació amb l'entorn d'execució de Python. Dues decisions: Qt Widgets davant de web; i, després, quin embolcall web fer servir (navegador integrat Qt WebEngine, pywebview amb navegador de reserva, o backend en Python + navegador extern).

**Restriccions:** mantenir el motor en Python; la migració es fa una sola vegada, com una única versió major; sense nous costos recurrents; la mida de l'equip, les seves habilitats i la familiaritat amb els llenguatges **no** són restriccions (les opcions es jutgen pel seu mèrit tècnic).

**Comenceu per l'[informe tècnic final](06-final-technical-report.md).** La resta d'arxius són notes de suport, cadascuna amb avantatges, inconvenients i comparacions amb les altres opcions.

| Document                                                                            | Contingut                                                                                                                               |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [Informe tècnic final](06-final-technical-report.md)                                | Problema, mètode, anàlisi, recomanació, riscos, pla                                                                                     |
| [00 · Base de partida: la pila actual](00-baseline-current-stack.md)                | Dades mesurades de la base de codi actual                                                                                               |
| [01 · Modernitzar Qt Widgets](01-pyside6-widgets-modernised.md)                     | Quedar-se a Qt Widgets i modernitzar-lo                                                                                                 |
| [02 · Híbrid Qt WebEngine](02-qt-webengine-hybrid.md)                               | Interfície web dins l'aplicació Qt (navegador integrat)                                                                                 |
| [03 · Aplicació web local al navegador](03-local-web-app-fastapi-react.md)          | Backend en Python (FastAPI) amb el navegador extern                                                                                     |
| [04 · Aplicació web local en una finestra pywebview](04-pywebview-native-window.md) | El mateix, en una finestra nativa (recomanada)                                                                                          |
| [05 · Comparació i full de ruta](05-comparison-and-roadmap.md)                      | Puntuació d'usuari final davant de facilitat amb Python, les dues decisions, classificació combinada, sensibilitat, full de ruta, fonts |

Salvetats: les puntuacions són valoracions de criteri; la mida de l'instal·lador, el rendiment i les dades dels equips de destinació no s'han mesurat (vegeu la secció 9 de l'informe).
