# 03 · Aplicació web local: Python (FastAPI) + React, oberta al navegador

**En una línia:** doble clic a pixeval → el motor Python arrenca un servidor web local → la interfície s'obre al navegador de l'usuari. Python continua sent el producte; la interfície passa a ser un frontend web.

Aquesta és l'arquitectura per a la qual està construïda la vista prèvia interactiva de la nova interfície (<https://prmpsmart.github.io/pixeval_web/>). L'opció 04 és la mateixa arquitectura amb una finestra nativa en lloc d'una pestanya del navegador.

## Com funciona

```
 llançador de pixeval (exe de PyInstaller)
   ├─ inicia Uvicorn a 127.0.0.1:<port lliure>   ← aplicació FastAPI (ja a requirements.txt)
   │     ├─ /api/*   rutes primes → capa de serveis → db / omr / cat_lib / dataReports (codi existent)
   │     ├─ /events  progrés d'escanejos, còpies de seguretat i correccions (SSE o WebSocket)
   │     └─ /*       l'aplicació React compilada (arxius estàtics de `npm run build`)
   └─ obre el navegador predeterminat (o Chrome/Edge en mode `--app=` per a una finestra sense marc de navegador)
```

- La finestra de consola/terminal es pot ocultar (exe sense consola, icona a la safata) o conservar com a vista de registre.
- Les dades locals continuen a SQLite exactament com avui.

## Avantatges

- **El millor ecosistema d'interfície i experiència disponible** amb el mateix esforç: components, gràfics, taules, accessibilitat, i18n, animació, mode fosc, dissenys adaptables, traspàs de Figma a CSS, recàrrega en calent, eines de desenvolupament del navegador.
- **Sense Qt i sense Chromium inclòs.** El navegador de l'usuari és el motor de renderitzat: la capa d'interfície ocupa uns 9 MB (FastAPI/Uvicorn/Starlette/Pydantic ≈ 8,9 MB, el frontend 0,34 MB), menys que els binaris de Qt als quals substitueix (≈ 55–90 MB).
- **Reutilitza el motor Python i FastAPI**, ja presents a la base de codi.
- **Els dissenys i prototips són directament reutilitzables** (la vista prèvia en React ja conté totes les pantalles i diàlegs).
- **Es pot provar:** `pytest` sobre l'API, Playwright sobre la interfície; la CI és senzilla.
- **Obre portes futures sense despesa addicional:** la mateixa API pot servir més endavant una instal·lació en xarxa local/servidor o llocs remots de correcció.
- Les tasques llargues queden més netes: tasques en segon pla + flux d'esdeveniments en lloc de passar senyals de Qt a la lògica.
- La separació de responsabilitats obliga a crear la capa de serveis que la base de codi necessita de totes maneres.

## Inconvenients

- **Els navegadors no poden donar a Python rutes d'arxiu reals.** piXeval depèn de rutes de carpeta (carpetes d'escaneig, còpies de seguretat, exportacions). Opcions: demanar al _servidor_ que mostri un diàleg natiu (Tk/pywebview), escriure/enganxar rutes o pujar arxius. És la major mancança funcional davant de Qt (resolta a 04).
- **Cal gestionar el cicle de vida del servidor:** triar un port lliure, aturar-lo quan es tanca l'última pestanya, gestionar una segona arrencada, mostrar alguna cosa útil si l'usuari tanca el terminal.
- **Cal disseny de seguretat** fins i tot en local: escoltar només a 127.0.0.1, token d'accés per arrencada, comprovacions estrictes de CORS/Origin (altres processos locals i pàgines web poden cridar localhost).
- **Poden aparèixer avisos de l'antivirus o el tallafocs** per un programa que obre un socket (normalment cap en loopback, però les eines corporatives difereixen).
- **Variació entre navegadors i error de l'usuari:** diferents navegadors i versions, pestanyes tancades per error, diverses pestanyes editant el mateix fitxer SQLite.
- **La impressió i el PDF** els gestiona el navegador o la generació al servidor (reportlab/xhtml2pdf ja existeixen), no `QtPrint`.
- **Un segon llenguatge i cadena d'eines per a la interfície** (TypeScript; Node només cal per _compilar_, els usuaris finals no necessiten cap dels dos).
- Per a alguns usuaris sembla «una pàgina web», no un programa d'escriptori.

## Avantatges davant de les altres opcions

- davant de 01: components i velocitat de disseny molt superiors; sense els límits d'estil de Qt.
- davant de 02: sense Chromium a l'instal·lador; empaquetat més simple; sense pont.
- davant de 04: la més simple i petita; res extra per distribuir.

## Desavantatges davant de les altres opcions

- davant de 04: sense finestra nativa, sense diàlegs natius d'arxius, depèn del navegador de l'usuari.
- davant de 01: necessita una capa de serveis/API i una cadena de compilació del frontend.

## Quan triar-la

- La via més ràpida cap a una interfície moderna amb el mínim pes d'instal·lació, i un producte que «s'executa al navegador» és acceptable.
- Es vol deixar oberta la porta a xarxa local/remot/multiusuari més endavant.

## Esforç i riscos

- Esforç: extracció de la capa de serveis + API (comuna a totes les opcions) + portar la interfície. Riscos: gestió de rutes d'arxiu, enduriment del cicle de vida i la seguretat, concurrència de SQLite si hi ha dues interfícies obertes.
- Mitigacions: triar l'opció 04 per tenir finestra i diàlegs natius; mantenir l'API amb un únic escriptor.
