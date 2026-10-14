# 04 · Aplicació web local en una finestra nativa amb pywebview

**En una línia:** la mateixa aplicació FastAPI + React de l'opció 03, però mostrada en una petita finestra nativa (sense marc de navegador) creada per **pywebview**, que utilitza el motor WebView2 de Windows.

## Què és

pywebview és una biblioteca de Python que obre una finestra amb una vista web: WebView2 (el motor d'Edge basat en Chromium) a Windows. Pot carregar una URL (el servidor FastAPI local) o arxius locals, ofereix un pont JS↔Python (`js_api`) i proporciona **diàlegs natius d'arxiu/carpeta** des de Python. Una versió recent de pywebview (6.x) està empaquetada a les distribucions principals.

## Com encaixa a piXeval

```
 pixeval.exe (PyInstaller)
   ├─ FastAPI + Uvicorn en un fil en segon pla  (la mateixa API que l'opció 03)
   ├─ webview.create_window("piXeval", "http://127.0.0.1:<port>/?token=…")
   └─ js_api: pickFolder(), pickFile(), saveFile()  → retorna rutes reals a la interfície
```

- L'instal·lador continua sent PyInstaller + Inno Setup. El motor WebView2 forma part de Windows i està disponible a tots els equips client, de manera que no s'instal·la res addicional.
- La mateixa compilació de React també s'executa en un navegador normal per al desenvolupament i com a alternativa (botó «obre al navegador»).

## Avantatges

- **Tot el bo de 03, més una finestra d'escriptori real** amb barra de títol, icona, comportament d'instància única i sense pestanyes del navegador que tancar per error.
- **Resol el problema de les rutes d'arxiu:** els diàlegs de carpeta/arxiu/desa són natius i retornen rutes reals.
- **Empremta diminuta, mesurada:** pywebview ocupa 1,6 MB descomprimit (WebView2 Core 0,65 MB, DLL del carregador ≈ 0,45 MB, interop ≈ 0,02 MB) més pythonnet 0,7 MB, és a dir, **uns 2–3 MB de binaris**, davant d'uns 55–90 MB de Qt Widgets i uns 340–370 MB amb Qt WebEngine. El motor WebView2 forma part de Windows i no s'inclou. Amb FastAPI, Uvicorn, Pydantic i el frontend (0,34 MB al prototip), tota la capa d'interfície ronda els 11 MB, menys que els binaris de Qt als quals substitueix.
- **Punt d'entrada en Python pur**, sense Rust/Node a l'aplicació distribuïda.
- Alternativa natural: si la vista web no està disponible, s'obre el navegador del sistema.
- Menor superfície d'atac que una pestanya del navegador (sense extensions, navegació controlada).

## Inconvenients

- **El backend de Windows de pywebview depèn de pythonnet** (pont .NET), que PyInstaller ha d'empaquetar correctament. Convé demostrar-ho aviat (per verificar).
- **Un projecte petit amb pocs mantenidors**; hi ha menys exemples d'empaquetat en producció que amb Qt.
- **Funcions d'escriptori limitades de sèrie** (safata, notificacions i actualització automàtica són mínimes, així que es construirien a part si calguessin).
- **La impressió/PDF des de la vista web varia segons el sistema operatiu;** la generació de PDF al servidor (ja present a la base de codi) és la via segura.
- **Depurar és més difícil** que en un navegador normal (usar el navegador per desenvolupar, activar l'opció de depuració quan calgui).
- Les mateixes obligacions de cicle de vida i seguretat del servidor que a 03 (token, només loopback).

## Avantatges davant de les altres opcions

- davant de 03: finestra i diàlegs natius, millor sensació de producte, entorn controlat.
- davant de 02: **desenes o centenars de MB menys**; sense empaquetar QtWebEngine; sense dependència de Qt a la nova interfície.
- davant de 01: ecosistema web, recàrrega en calent, velocitat de disseny.

## Desavantatges davant de les altres opcions

- davant de 02: les funcions natives de Qt (vista prèvia d'impressió, visualització de PDF amb Qt) cal substituir-les per equivalents web o del servidor.
- davant de 01: necessita una capa de serveis/API i una cadena de compilació del frontend.

## Quan triar-la

- Es vol una aplicació amb aspecte d'escriptori, instal·lador petit, diàlegs natius i la millor interfície web, **sense afegir un nou llenguatge al producte distribuït.** És l'opció que més s'acosta a «Python s'executa en segon pla i la interfície s'obre en una finestra de l'aplicació o al navegador».

## Esforç i riscos

- Esforç: el mateix que 03 més una mica de cola (finestra, pont de diàlegs, comprovació de WebView2). Riscos: empaquetat de pythonnet, dependència d'un únic mantenidor (mitigada perquè l'alternativa és «obre al navegador», és a dir, l'opció 03).
