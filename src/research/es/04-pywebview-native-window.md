# 04 · Aplicación web local en una ventana nativa con pywebview

**En una línea:** la misma aplicación FastAPI + React de la opción 03, pero mostrada en una pequeña ventana nativa (sin marco de navegador) creada por **pywebview**, que usa el motor WebView2 de Windows.

## Qué es

pywebview es una biblioteca de Python que abre una ventana con una vista web: WebView2 (el motor de Edge basado en Chromium) en Windows. Puede cargar una URL (el servidor FastAPI local) o archivos locales, ofrece un puente JS↔Python (`js_api`) y proporciona **diálogos nativos de archivo/carpeta** desde Python. Una versión reciente de pywebview (6.x) está empaquetada en las distribuciones principales.

## Cómo encaja en piXeval

```
 pixeval.exe (PyInstaller)
   ├─ FastAPI + Uvicorn en un hilo en segundo plano  (la misma API que la opción 03)
   ├─ webview.create_window("piXeval", "http://127.0.0.1:<puerto>/?token=…")
   └─ js_api: pickFolder(), pickFile(), saveFile()  → devuelve rutas reales a la interfaz
```

- El instalador sigue siendo PyInstaller + Inno Setup. El motor WebView2 forma parte de Windows y está disponible en todos los equipos cliente, por lo que no se instala nada adicional.
- La misma compilación de React también se ejecuta en un navegador normal para desarrollo y como alternativa (botón «abrir en el navegador»).

## Ventajas

- **Todo lo bueno de 03, más una ventana de escritorio real** con barra de título, icono, comportamiento de instancia única y sin pestañas del navegador que cerrar por error.
- **Resuelve el problema de las rutas de archivo:** los diálogos de carpeta/archivo/guardar son nativos y devuelven rutas reales.
- **Huella diminuta, medida:** pywebview ocupa 1,6 MB descomprimido (WebView2 Core 0,65 MB, DLL del cargador ≈ 0,45 MB, interop ≈ 0,02 MB) más pythonnet 0,7 MB, es decir, **unos 2–3 MB de binarios**, frente a unos 55–90 MB de Qt Widgets y unos 340–370 MB con Qt WebEngine. El motor WebView2 forma parte de Windows y no se incluye. Con FastAPI, Uvicorn, Pydantic y el frontend (0,34 MB en el prototipo), toda la capa de interfaz ronda los 11 MB, menos que los binarios de Qt a los que sustituye.
- **Punto de entrada en Python puro**, sin Rust/Node en la aplicación distribuida.
- Alternativa natural: si la vista web no está disponible, se abre el navegador del sistema.
- Menor superficie de ataque que una pestaña del navegador (sin extensiones, navegación controlada).

## Inconvenientes

- **El backend de Windows de pywebview depende de pythonnet** (puente .NET), que PyInstaller debe empaquetar correctamente. Conviene demostrarlo pronto (por verificar).
- **Un proyecto pequeño con pocos mantenedores**; hay menos ejemplos de empaquetado en producción que con Qt.
- **Funciones de escritorio limitadas de serie** (bandeja, notificaciones y actualización automática son mínimas, así que se construirían aparte si hicieran falta).
- **La impresión/PDF desde la vista web varía según el sistema operativo;** la generación de PDF en el servidor (ya presente en la base de código) es la vía segura.
- **Depurar es más difícil** que en un navegador normal (usar el navegador para desarrollar, activar la opción de depuración cuando haga falta).
- Las mismas obligaciones de ciclo de vida y seguridad del servidor que en 03 (token, solo loopback).

## Ventajas frente a las demás opciones

- frente a 03: ventana y diálogos nativos, mejor sensación de producto, entorno controlado.
- frente a 02: **decenas o cientos de MB menos**; sin empaquetar QtWebEngine; sin dependencia de Qt en la nueva interfaz.
- frente a 01: ecosistema web, recarga en caliente, velocidad de diseño.

## Desventajas frente a las demás opciones

- frente a 02: las funciones nativas de Qt (vista previa de impresión, visualización de PDF con Qt) hay que sustituirlas por equivalentes web o del servidor.
- frente a 01: necesita una capa de servicios/API y una cadena de compilación del frontend.

## Cuándo elegirla

- Se quiere una aplicación con aspecto de escritorio, instalador pequeño, diálogos nativos y la mejor interfaz web, **sin añadir un nuevo lenguaje al producto distribuido.** Es la opción que más se acerca a «Python se ejecuta en segundo plano y la interfaz se abre en una ventana de la aplicación o en el navegador».

## Esfuerzo y riesgos

- Esfuerzo: el mismo que 03 más un pequeño pegamento (ventana, puente de diálogos, comprobación de WebView2). Riesgos: empaquetado de pythonnet, dependencia de un único mantenedor (mitigada porque la alternativa es «abrir en el navegador», es decir, la opción 03).
