# 04 · Aplicación web local nunha xanela nativa con pywebview

**Nunha liña:** a mesma aplicación FastAPI + React da opción 03, pero amosada nunha pequena xanela nativa (sen marco de navegador) creada por **pywebview**, que usa o motor WebView2 de Windows.

## Que é

pywebview é unha biblioteca de Python que abre unha xanela cunha vista web: WebView2 (o motor de Edge baseado en Chromium) en Windows. Pode cargar unha URL (o servidor FastAPI local) ou ficheiros locais, ofrece unha ponte JS↔Python (`js_api`) e proporciona **diálogos nativos de ficheiro/cartafol** desde Python. Unha versión recente de pywebview (6.x) está empaquetada nas distribucións principais.

## Como encaixa en piXeval

```
 pixeval.exe (PyInstaller)
   ├─ FastAPI + Uvicorn nun fío en segundo plano  (a mesma API que a opción 03)
   ├─ webview.create_window("piXeval", "http://127.0.0.1:<porto>/?token=…")
   └─ js_api: pickFolder(), pickFile(), saveFile()  → devolve rutas reais á interface
```

- O instalador segue sendo PyInstaller + Inno Setup. O motor WebView2 forma parte de Windows e está dispoñible en todos os equipos cliente, polo que non se instala nada adicional.
- A mesma compilación de React tamén se executa nun navegador normal para desenvolvemento e como alternativa (botón «abrir no navegador»).

## Vantaxes

- **Todo o bo de 03, máis unha xanela de escritorio real** con barra de título, icona, comportamento de instancia única e sen lapelas do navegador que pechar por erro.
- **Resolve o problema das rutas de ficheiro:** os diálogos de cartafol/ficheiro/gardar son nativos e devolven rutas reais.
- **Pegada minúscula, medida:** pywebview ocupa 1,6 MB descomprimido (WebView2 Core 0,65 MB, DLL do cargador ≈ 0,45 MB, interop ≈ 0,02 MB) máis pythonnet 0,7 MB, é dicir, **uns 2–3 MB de binarios**, fronte a uns 55–90 MB de Qt Widgets e uns 340–370 MB con Qt WebEngine. O motor WebView2 forma parte de Windows e non se inclúe. Con FastAPI, Uvicorn, Pydantic e o frontend (0,34 MB no prototipo), toda a capa de interface ronda os 11 MB, menos cós binarios de Qt aos que substitúe.
- **Punto de entrada en Python puro**, sen Rust/Node na aplicación distribuída.
- Alternativa natural: se a vista web non está dispoñible, ábrese o navegador do sistema.
- Menor superficie de ataque que unha lapela do navegador (sen extensións, navegación controlada).

## Inconvenientes

- **O backend de Windows de pywebview depende de pythonnet** (ponte .NET), que PyInstaller debe empaquetar correctamente. Convén demostralo cedo (por verificar).
- **Un proxecto pequeno con poucos mantedores**; hai menos exemplos de empaquetado en produción ca con Qt.
- **Funcións de escritorio limitadas de serie** (bandexa, notificacións e actualización automática son mínimas, así que se construirían á parte se fixeran falta).
- **A impresión/PDF desde a vista web varía segundo o sistema operativo;** a xeración de PDF no servidor (xa presente na base de código) é a vía segura.
- **Depurar é máis difícil** ca nun navegador normal (usar o navegador para desenvolver, activar a opción de depuración cando faga falta).
- As mesmas obrigas de ciclo de vida e seguranza do servidor ca en 03 (token, só loopback).

## Vantaxes fronte ás demais opcións

- fronte a 03: xanela e diálogos nativos, mellor sensación de produto, contorna controlada.
- fronte a 02: **decenas ou centos de MB menos**; sen empaquetar QtWebEngine; sen dependencia de Qt na nova interface.
- fronte a 01: ecosistema web, recarga en quente, velocidade de deseño.

## Desvantaxes fronte ás demais opcións

- fronte a 02: as funcións nativas de Qt (vista previa de impresión, visualización de PDF con Qt) hai que substituílas por equivalentes web ou do servidor.
- fronte a 01: precisa unha capa de servizos/API e unha cadea de compilación do frontend.

## Cando escollela

- Quérese unha aplicación con aspecto de escritorio, instalador pequeno, diálogos nativos e a mellor interface web, **sen engadir unha nova linguaxe ao produto distribuído.** É a opción que máis se achega a «Python execútase en segundo plano e a interface ábrese nunha xanela da aplicación ou no navegador».

## Esforzo e riscos

- Esforzo: o mesmo ca 03 máis un pequeno pegamento (xanela, ponte de diálogos, comprobación de WebView2). Riscos: empaquetado de pythonnet, dependencia dun único mantedor (mitigada porque a alternativa é «abrir no navegador», é dicir, a opción 03).
