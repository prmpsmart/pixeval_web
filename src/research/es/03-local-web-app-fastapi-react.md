# 03 · Aplicación web local: Python (FastAPI) + React, abierta en el navegador

**En una línea:** doble clic en pixeval → el motor Python arranca un servidor web local → la interfaz se abre en el navegador del usuario. Python sigue siendo el producto; la interfaz pasa a ser un frontend web.

Esta es la arquitectura para la que está construida la vista previa interactiva de la nueva interfaz (<https://prmpsmart.github.io/pixeval_web/>). La opción 04 es la misma arquitectura con una ventana nativa en lugar de una pestaña del navegador.

## Cómo funciona

```
 lanzador de pixeval (exe de PyInstaller)
   ├─ inicia Uvicorn en 127.0.0.1:<puerto libre>   ← aplicación FastAPI (ya en requirements.txt)
   │     ├─ /api/*   rutas finas → capa de servicios → db / omr / cat_lib / dataReports (código existente)
   │     ├─ /events  progreso de escaneos, copias de seguridad y correcciones (SSE o WebSocket)
   │     └─ /*       la aplicación React compilada (archivos estáticos de `npm run build`)
   └─ abre el navegador predeterminado (o Chrome/Edge en modo `--app=` para una ventana sin marco de navegador)
```

- La ventana de consola/terminal puede ocultarse (exe sin consola, icono en la bandeja) o conservarse como vista de registro.
- Los datos locales siguen en SQLite exactamente como hoy.

## Ventajas

- **El mejor ecosistema de interfaz y experiencia disponible** con el mismo esfuerzo: componentes, gráficos, tablas, accesibilidad, i18n, animación, modo oscuro, diseños adaptables, traspaso de Figma a CSS, recarga en caliente, herramientas de desarrollo del navegador.
- **Sin Qt y sin Chromium incluido.** El navegador del usuario es el motor de renderizado: la capa de interfaz ocupa unos 9 MB (FastAPI/Uvicorn/Starlette/Pydantic ≈ 8,9 MB, el frontend 0,34 MB), menos que los binarios de Qt a los que sustituye (≈ 55–90 MB).
- **Reutiliza el motor Python y FastAPI**, ya presentes en la base de código.
- **Los diseños y prototipos son directamente reutilizables** (la vista previa en React ya contiene todas las pantallas y diálogos).
- **Se puede probar:** `pytest` sobre la API, Playwright sobre la interfaz; la CI es sencilla.
- **Abre puertas futuras sin gasto adicional:** la misma API puede servir más adelante una instalación en red local/servidor o puestos remotos de corrección.
- Las tareas largas quedan más limpias: tareas en segundo plano + flujo de eventos en lugar de pasar señales de Qt a la lógica.
- La separación de responsabilidades obliga a crear la capa de servicios que la base de código necesita de todos modos.

## Inconvenientes

- **Los navegadores no pueden dar a Python rutas de archivo reales.** piXeval depende de rutas de carpeta (carpetas de escaneo, copias de seguridad, exportaciones). Opciones: pedir al _servidor_ que muestre un diálogo nativo (Tk/pywebview), escribir/pegar rutas o subir archivos. Es la mayor carencia funcional frente a Qt (resuelta en 04).
- **Hay que gestionar el ciclo de vida del servidor:** elegir un puerto libre, cerrarlo cuando se cierra la última pestaña, gestionar un segundo arranque, mostrar algo útil si el usuario cierra el terminal.
- **Hace falta diseño de seguridad** incluso en local: escuchar solo en 127.0.0.1, token de acceso por arranque, comprobaciones estrictas de CORS/Origin (otros procesos locales y páginas web pueden llamar a localhost).
- **Pueden aparecer avisos del antivirus o cortafuegos** por un programa que abre un socket (normalmente ninguno en loopback, pero las herramientas corporativas difieren).
- **Variación entre navegadores y error del usuario:** distintos navegadores y versiones, pestañas cerradas por error, varias pestañas editando el mismo archivo SQLite.
- **La impresión y el PDF** los gestiona el navegador o la generación en el servidor (reportlab/xhtml2pdf ya existen), no `QtPrint`.
- **Un segundo lenguaje y cadena de herramientas para la interfaz** (TypeScript; Node solo se necesita para _compilar_, los usuarios finales no necesitan ninguno).
- Para algunos usuarios parece «una página web», no un programa de escritorio.

## Ventajas frente a las demás opciones

- frente a 01: componentes y velocidad de diseño muy superiores; sin los límites de estilo de Qt.
- frente a 02: sin Chromium en el instalador; empaquetado más simple; sin puente.
- frente a 04: la más simple y pequeña; nada extra que distribuir.

## Desventajas frente a las demás opciones

- frente a 04: sin ventana nativa, sin diálogos nativos de archivos, depende del navegador del usuario.
- frente a 01: necesita una capa de servicios/API y una cadena de compilación del frontend.

## Cuándo elegirla

- La vía más rápida hacia una interfaz moderna con el mínimo peso de instalación, y un producto que «se ejecuta en el navegador» es aceptable.
- Se quiere dejar abierta la puerta a red local/remoto/multiusuario más adelante.

## Esfuerzo y riesgos

- Esfuerzo: extracción de la capa de servicios + API (común a todas las opciones) + portar la interfaz. Riesgos: gestión de rutas de archivo, endurecimiento del ciclo de vida y la seguridad, concurrencia de SQLite si hay dos interfaces abiertas.
- Mitigaciones: elegir la opción 04 para tener ventana y diálogos nativos; mantener la API con un único escritor.
