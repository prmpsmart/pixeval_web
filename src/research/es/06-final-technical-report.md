# Informe técnico: opciones para modernizar la interfaz de usuario de piXeval

**Asunto:** piXeval 7.6.2 (sistema de gestión de exámenes OMR)
**Elaborado por:** Miracle Apata, BEng
**Estado:** borrador para revisión — las notas de apoyo están en esta carpeta
**Artefacto complementario:** prototipo interactivo, <https://prmpsmart.github.io/pixeval_web/>

---

## Resumen

piXeval es una aplicación de escritorio en Python para Windows cuya interfaz de usuario está construida con PySide6 (Qt Widgets). La interfaz comprende unas 71 000 líneas de código y es la principal limitación de usabilidad y calidad visual para las personas que la usan a diario, mientras que el motor de procesamiento (OMR, base de datos, informes) tiene unas 21 000 líneas y es en gran parte independiente de Qt. Este informe evalúa formas de mejorar la interfaz conservando el motor Python y sin incurrir en costes de licencia ni de alojamiento, como dos decisiones. **Decisión 1:** modernizar Qt Widgets (01) o pasar a un frontend web (React, etc.). **Decisión 2**, si es web: presentarlo como navegador integrado dentro de Qt (Qt WebEngine, 02), en una ventana de pywebview con el navegador externo como alternativa de seguridad (04), o con Python como backend y el navegador externo usado directamente (03). La migración se hará una sola vez, como una única versión mayor. El **foco principal es el usuario final**: la puntuación principal (80 %) mide lo que viven los usuarios (estética y aspecto moderno, interacción agradable, eficacia, coherencia, instalación y arranque, comportamiento nativo y **el tamaño del programa compilado**); una puntuación secundaria (20 %) mide la facilidad de implementación con el entorno de ejecución de Python. Medido a partir de las ruedas de Windows, Qt añade unos 55–90 MB al resultado compilado (Widgets) o unos 340–370 MB (con WebEngine), mientras que pywebview añade unos 2–3 MB de binarios y toda la capa de interfaz web unos 11 MB (el motor Edge WebView2 forma parte de Windows y está disponible en todos los equipos cliente). Las opciones web puntúan 86–94 sobre 100 en experiencia del usuario final frente a 64 de Qt Widgets, que es más fácil de implementar (88 frente a 60–80). Qt Widgets solo gana si la experiencia del usuario final pesa menos de un tercio aproximadamente. Entre los contenedores web, la ventana de pywebview queda primera (94) por delante del navegador integrado de Qt (88), frenado por su tamaño (casi el doble del programa compilado) y su arranque. La dirección recomendada es **un motor Python (FastAPI) con una interfaz web presentada en una ventana nativa de pywebview, con «abrir en el navegador» como alternativa**, precedida por una refactorización de la capa de servicios necesaria con cualquier opción. Varias magnitudes (tamaño real del instalador, tiempo de arranque, rendimiento con tablas grandes) no se midieron en una compilación real y se enumeran como tareas de validación.

---

## 1. Introducción

### 1.1 Antecedentes

piXeval da soporte a todo el ciclo de vida de un examen tipo test en papel: bancos de preguntas, composición de exámenes, generación de hojas de respuestas, escaneo y reconocimiento óptico de marcas (OMR), asignación de identidades, corrección, notas e informes. Se distribuye como un instalador de Windows creado con PyInstaller e Inno Setup.

### 1.2 Planteamiento del problema

Los usuarios interactúan con el producto mediante una interfaz basada en Widgets con estilo de hojas de estilo de Qt. Conseguir un aspecto y una calidad de interacción contemporáneos (transiciones animadas, tablas densas pero legibles, búsqueda de comandos, diseños adaptables, tokens de diseño coherentes) es lento y costoso con esta pila. La pregunta es si otra tecnología de interfaz ofrece una mejor experiencia de usuario a un coste y riesgo aceptables.

### 1.3 Objetivos y restricciones

1. **Principal: el usuario final.** Mejorar lo que los usuarios ven y viven cada día: una interfaz agradable, eficaz, estética y moderna que además se instale, arranque y se comporte bien en sus equipos. La comodidad del desarrollador es secundaria.
2. **Secundario:** que esa experiencia sea sencilla de implementar y entregar con el motor Python en el cuadro (el motor en sí se conserva).
3. **No introducir ningún coste recurrente nuevo** (licencias, alojamiento, suscripciones).
4. Conservar la experiencia de aplicación instalada en **Windows** (la única plataforma de destino): arranque, trabajo sin conexión, acceso a archivos locales y a la salida del escáner.
5. Migrar **una sola vez**: la nueva interfaz sustituye a la antigua en una única versión mayor que llega a todos los usuarios. No hay migración incremental ni en paralelo, por lo que la fiabilidad de la versión y la paridad de funciones importan más.
6. El tamaño del equipo, sus conocimientos y la familiaridad con los lenguajes **no** se tratan como restricciones. Las opciones se juzgan por su mérito técnico; un lenguaje nuevo no cuenta como coste en sí mismo, mientras que los entornos de ejecución adicionales, las cadenas de compilación y las fronteras entre procesos sí.

### 1.4 Alcance

Solo se consideran la capa de presentación y su integración con el motor. Los algoritmos de OMR, las reglas de calificación y el esquema de la base de datos no cambian.

---

## 2. Análisis del sistema actual

Medido a partir del repositorio (detalles en [00-baseline-current-stack.md](00-baseline-current-stack.md)):

| Capa                                                            | Archivos |         Líneas | Dependencia de Qt |
| --------------------------------------------------------------- | -------: | -------------: | ----------------- |
| Interfaz (`src/ui`)                                             |      194 |         71 077 | completa          |
| Rediseño en curso (`src/modern_ui`)                             |       28 |          2 301 | completa          |
| Base de datos (`src/db`)                                        |        7 |          3 648 | 1 archivo         |
| OMR (`src/omr`, más una copia del mismo tamaño `src/omr_audit`) | 16 (+16) | 6 704 (+6 704) | ninguna           |
| Envoltorio del motor CAT (`src/cat_lib`)                        |       13 |          4 832 | 3 archivos        |
| Informes (`src/dataReports`)                                    |        9 |            830 | 1 archivo         |
| Utilidades (`src/utils`)                                        |       28 |          5 242 | 2 archivos        |

Hallazgos que guían el análisis:

- **F1 — El motor es separable.** Unas 21 000 líneas de lógica usan Qt en solo unos siete archivos, sobre todo para señales de progreso y tipos de imagen.
- **F2 — La interfaz es el mayor volumen de trabajo.** Es aproximadamente 3,4 veces el tamaño del motor. Sea cual sea la tecnología elegida, un rediseño supone reimplementar las pantallas; el esfuerzo actual de `modern_ui` es ya una reescritura de ese tipo y está completado en torno a un 3 % por número de líneas.
- **F3 — Presentación y lógica están entremezcladas.** 103 de los 194 archivos de interfaz importan la capa de datos, y pantallas como la de notas leen y modifican objetos de dominio directamente. Una capa de servicios es, por tanto, un requisito previo para cualquier nuevo frontend.
- **F4 — Ya hay una pila web.** FastAPI 0.115, Uvicorn y Starlette están en los requisitos y los usa el servicio CAT remoto.
- **F5 — El empaquetado está establecido.** PyInstaller + Inno Setup entregan un instalador de Windows; cualquier opción debería reutilizarlo cuando sea posible.
- **F6 — Se usan diálogos nativos de archivo** (nueve puntos de llamada en cinco archivos para carpetas de escaneo, copias de seguridad y exportación). Las rutas de carpeta son un requisito operativo, lo que afecta a las soluciones solo de navegador.

---

## 3. Método de evaluación

### 3.1 Dos puntuaciones

**Puntuación A: experiencia del usuario final (principal, 80 % de la puntuación combinada).**

| Criterio                                        | Peso dentro de A | Lo que siente el usuario final                                                                                                 |
| ----------------------------------------------- | ---------------: | ------------------------------------------------------------------------------------------------------------------------------ |
| Estética y aspecto moderno                      |               25 | tipografía, espaciado, sombras, desenfoque, modo oscuro, acabado                                                               |
| Interacción agradable                           |               15 | transiciones, respuesta al pasar el cursor o enfocar, rapidez de respuesta                                                     |
| Eficacia                                        |               20 | tablas densas, búsqueda/filtro, paleta de comandos, uso del teclado, respuesta clara, gráficos, accesibilidad                  |
| Coherencia entre los PC Windows de los usuarios |               10 | se ve y se comporta igual en cualquier equipo con Windows (versiones, navegadores, entornos de ejecución)                      |
| Instalación y arranque                          |               10 | tiempo de arranque, requisitos previos, sensación de aplicación                                                                |
| Comportamiento de escritorio nativo             |               10 | selectores reales de archivo/carpeta, impresión, arrastrar y soltar, funciona sin conexión (hallazgo F6)                       |
| **Tamaño del programa compilado**               |               10 | tamaño del instalador y de la instalación, tiempo de descarga y actualización (medido a partir de las ruedas de Windows, §5.1) |

**Puntuación B: facilidad de implementarla con el entorno de ejecución de Python (secundaria, 20 %).**

| Criterio                              | Peso dentro de B | Pregunta                                                                   |
| ------------------------------------- | ---------------: | -------------------------------------------------------------------------- |
| Integración con el motor              |               30 | llamar al código Python, eventos de progreso para escaneos/copias, hilos   |
| Esfuerzo de compilación y empaquetado |               30 | PyInstaller, entornos de ejecución a incluir, firma, cadena de publicación |
| Piezas móviles que probar             |               20 | cadenas de herramientas, fronteras entre procesos, contratos de puente/API |
| Reutilización del trabajo existente   |               20 | FastAPI ya en la pila, prototipo existente, capa de servicios              |

Las comodidades solo para desarrolladores (recarga en caliente, traspaso de diseño, grandes ecosistemas) deliberadamente **no** se puntúan; importan únicamente por el resultado para el usuario final que hacen posible.

### 3.2 Método y limitaciones

Cada opción se puntúa de 1 a 5 por criterio a partir de la documentación, guías publicadas y las métricas de código anteriores. **Las puntuaciones son juicio experto y no mediciones.** Las tres opciones web puntúan igual en aspecto, interacción y eficacia por construcción (misma plataforma web); se distinguen por la coherencia, la instalación/arranque y el comportamiento nativo, y por la Puntuación B. Todavía no se ha realizado ninguna prueba comparativa de ninguna opción dentro de piXeval ni ninguna prueba de usabilidad con usuarios reales.

---

## 4. Soluciones candidatas

Las descripciones completas con ventajas, inconvenientes y comparaciones están en [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md) y [04](04-pywebview-native-window.md); la puntuación está en [05](05-comparison-and-roadmap.md).

**01 — Modernizar PySide6 Widgets.** Menor riesgo técnico y mejor integración nativa; sin conexión, un solo proceso, sin herramientas nuevas. Pero QSS es un subconjunto de CSS (sin motores de maquetación, efectos ni transiciones), cada componente moderno hay que construirlo a medida, la iteración es lenta y el ecosistema de componentes ya hechos es pequeño. No evita la reescritura de unas 70 000 líneas de interfaz; solo conserva el kit de herramientas. _Motivo para elegirla:_ no se acepta una frontera de proceso ni un entorno de ejecución adicional. _Motivo para no elegirla:_ el techo de interfaz más bajo.

**02 — Híbrido Qt WebEngine.** Incrustar pantallas web (Chromium) en la aplicación Qt existente y conectarlas con QtWebChannel. Conserva el contenedor Qt actual (ventana, menús, impresión, diálogos nativos) y no necesita servidor local. Los costes son el tamaño del programa compilado (QtWebEngine añade unos 256 MB de archivos a los 55–90 MB de Qt Widgets), la complejidad de empaquetar Chromium y un puente asíncrono. Con una versión única, su principal fortaleza (migrar pantalla a pantalla) no hace falta. _Motivo para elegirla:_ hay que conservar el contenedor Qt tal cual y no se acepta ningún servidor local. _Motivo para no elegirla:_ con diferencia la más pesada de las cuatro (unos 340–370 MB de Qt en el programa compilado, casi duplicándolo).

**03 — Aplicación web local en el navegador.** FastAPI sirve una interfaz React; un lanzador abre el navegador predeterminado. Máxima libertad de diseño y ecosistema, crecimiento mínimo del instalador y reutiliza FastAPI. Los navegadores no pueden devolver rutas reales de archivo, un servidor en localhost necesita gestión del ciclo de vida y endurecimiento de seguridad (enlace a loopback, tokens, comprobaciones de origen) y el producto se parece a un sitio web. _Motivo para elegirla:_ la vía más rápida y ligera. _Motivo para no elegirla:_ gestión de rutas de archivo y sensación de escritorio.

**04 — Aplicación web local en una ventana de pywebview.** 03 más una ventana nativa que usa la vista web del sistema operativo y los diálogos nativos de archivo. Resuelve la principal carencia funcional de 03, no añade ningún paquete de Chromium (el motor WebView2 forma parte de Windows y está en todos los equipos cliente), añade solo unos 2–3 MB de binarios al programa compilado y conserva la cadena de PyInstaller. Costes: dependencia del backend de Windows de pywebview basado en pythonnet, una base reducida de mantenedores y pocos extras de escritorio (sin actualización automática ni bandeja integradas). _Motivo para elegirla:_ sensación de escritorio con la menor huella distribuida. _Motivo para no elegirla:_ depende de un paquete correcto de PyInstaller con pywebview y pythonnet, que debe demostrarse en la prueba de validación.

---

## 5. Análisis comparativo

### 5.1 Tamaño del programa compilado

Los binarios de Qt forman parte del resultado compilado siempre que interviene Qt. Las cifras están **medidas a partir de las ruedas de Windows en PyPI** (listas de archivos de PySide6 6.9.0 Essentials y Addons, OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview, pythonnet), no de una compilación real. Las tablas completas están en [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

| Capa de interfaz | Qué se incluye                                                                                                                                                             | Añadido descomprimido | Añadido comprimido |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -----------------: |
| 01 Qt Widgets    | Qt6 Core/Gui/Widgets/Pdf/PrintSupport, módulos de PySide6, complementos (opcionalmente OpenGL por software, traducciones)                                                  |            ≈ 55–90 MB |         ≈ 20–33 MB |
| 02 Qt WebEngine  | lo anterior **más** `Qt6WebEngineCore.dll` (199,5 MB), traducciones, paquetes de recursos (255,7 MB de archivos de WebEngine en total) y Quick/Qml/Network ≈ 26 MB         |          ≈ 340–370 MB |       ≈ 135–150 MB |
| 03 Navegador     | FastAPI/Uvicorn/Starlette/Pydantic ≈ 9 MB, frontend web 0,34 MB; sin Qt, sin motor de navegador                                                                            |                ≈ 9 MB |             ≈ 3 MB |
| 04 pywebview     | lo anterior **más** pywebview 1,6 MB (cargador de WebView2 y DLL de interoperabilidad ≈ 1 MB) y pythonnet 0,7 MB; el motor WebView2 forma parte de Windows y no se incluye |               ≈ 11 MB |             ≈ 4 MB |

| Programa compilado completo | Descomprimido | Comprimido (aproximación) | Comparado con 04 |
| --------------------------- | ------------: | ------------------------: | ---------------: |
| 01 Qt Widgets               |  ≈ 420–455 MB |              ≈ 147–160 MB |      +12 a +21 % |
| 02 Qt WebEngine             |  ≈ 705–735 MB |              ≈ 263–276 MB |      +88 a +96 % |
| 03 Navegador                |      ≈ 373 MB |                  ≈ 130 MB |             −1 % |
| 04 pywebview                |      ≈ 375 MB |                  ≈ 131 MB |       referencia |

- **pywebview no tiene binarios del tamaño de Qt:** añade unos 2–3 MB, frente a unos 55–90 MB de Qt Widgets y 340–370 MB con WebEngine.
- **La pila común del motor ronda los 364 MB descomprimidos (≈ 127 MB comprimidos),** encabezada por OpenCV (110 MB) y SciPy (116 MB). La capa de interfaz es, por tanto, una parte importante del resultado: Qt Widgets añade un 12–21 % y Qt WebEngine casi duplica el programa.
- **Los contenedores web son más pequeños que la compilación actual con Qt solo si se retira Qt del programa compilado,** lo que exige eliminar los ~7 archivos que no son de interfaz y que importan Qt (hallazgo F1).
- No medido: el entorno de ejecución de Python, otras dependencias, la sobrecarga de PyInstaller, la compresión del instalador. Una compilación real es la primera tarea de validación.

### 5.2 Decisión 1: ¿Qt Widgets o web?

|                                                           |                      01 Qt Widgets |                           Interfaz web (02, 03, 04) |
| --------------------------------------------------------- | ---------------------------------: | --------------------------------------------------: |
| Estética, interacción, eficacia (aspecto y uso)           |                            2, 2, 3 |                                             5, 5, 5 |
| Coherencia, instalación y arranque, comportamiento nativo |                            5, 5, 5 |              3–5, 3–4, 2–5 (depende del contenedor) |
| Tamaño del programa compilado                             | 3 (≈ 420–455 MB, 12–21 % sobre 04) | 1–5 (≈ 373–375 MB para 03/04; ≈ 705–735 MB para 02) |
| **Puntuación A: experiencia del usuario final**           |                             **64** |                                           **86–94** |
| **Puntuación B: facilidad con Python**                    |                             **88** |                                           **60–80** |

Las opciones web dan a los usuarios finales una interfaz claramente mejor, y los mejores contenedores web son **más pequeños que la compilación con Qt** porque prescinden de los binarios de Qt. Los límites de Qt Widgets son estructurales (QSS no tiene motores de maquetación, sombras reales, desenfoque ni transiciones; los componentes modernos se dibujan a mano); los costes de la web son tareas identificables. Qt Widgets supera al mejor contenedor web solo si la experiencia del usuario final pesa menos de un 32 % aproximadamente (frente a 03: 27 %; frente a 02: 54 %).

### 5.3 Decisión 2: ¿qué contenedor web?

| Aspecto                        | **02 Navegador integrado (Qt WebEngine)**        | **04 Ventana pywebview + alternativa de navegador**                                                      | **03 Backend Python + navegador externo** |
| ------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Aspecto e interacción          | idénticos                                        | idénticos                                                                                                | idénticos                                 |
| Coherencia del renderizado     | idéntica en todos los PC                         | muy cercana (Edge WebView2, basado en Chromium, presente en todos los clientes, actualizado por Windows) | depende del navegador                     |
| Lo que ve el usuario           | la ventana de la aplicación Qt                   | una pequeña ventana nativa                                                                               | una pestaña o ventana del navegador       |
| **Programa compilado (total)** | **≈ 705–735 MB** (capa de interfaz ≈ 340–370 MB) | **≈ 375 MB** (capa de interfaz ≈ 11 MB)                                                                  | **≈ 373 MB** (capa de interfaz ≈ 9 MB)    |
| Descarga / actualización       | ≈ 263–276 MB                                     | ≈ 131 MB                                                                                                 | ≈ 130 MB                                  |
| Arranque                       | más lento                                        | rápido                                                                                                   | servidor y luego el navegador             |
| Requisitos previos             | ninguno                                          | ninguno (WebView2 presente en todos los clientes)                                                        | un navegador moderno                      |
| Selectores de archivo/carpeta  | nativos (Qt)                                     | nativos (pywebview); mediante el servidor en modo alternativo                                            | no desde un navegador                     |
| Puntuación A / B               | 88 / 60                                          | **94 / 74**                                                                                              | 86 / 80                                   |

La alternativa es una función del lanzador, no un comportamiento integrado en pywebview: el lanzador prueba la ventana y abre el navegador predeterminado en la misma dirección si falla. Con WebView2 en todos los clientes es solo una red de seguridad. 04 y 03 son una misma base de código con dos modos de presentación.

### 5.4 Puntuaciones combinadas

| Opción                     | Puntuación A: experiencia del usuario final | Puntuación B: facilidad con Python | **Combinada (A 80 / B 20)** |
| -------------------------- | ------------------------------------------: | ---------------------------------: | --------------------------: |
| 01 Qt Widgets, modernizado |                                          64 |                             **88** |                        68,8 |
| 02 Híbrido Qt WebEngine    |                                          88 |                                 60 |                        82,4 |
| 03 Navegador               |                                          86 |                                 80 |                        84,8 |
| **04 Ventana pywebview**   |                                      **94** |                                 74 |                    **90,0** |

Las puntuaciones por criterio, los motivos y la vista de dos ejes están en [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

### 5.5 Sensibilidad

| Peso de A                              |       01 |   02 |       03 |       04 |
| -------------------------------------- | -------: | ---: | -------: | -------: |
| 100 % (solo usuario final)             |     64,0 | 88,0 |     86,0 | **94,0** |
| 80 % (usado)                           |     68,8 | 82,4 |     84,8 | **90,0** |
| 60 %                                   |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                                   |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                                   |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                                   | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (solo comodidad del desarrollador) | **88,0** | 60,0 |     80,0 |     74,0 |

| Peso del criterio de tamaño dentro de A |   01 |   02 |   03 |       04 |
| --------------------------------------- | ---: | ---: | ---: | -------: |
| 0 % (tamaño ignorado)                   | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (usado)                            | 68,8 | 82,4 | 84,8 | **90,0** |
| 30 %                                    | 68,1 | 70,3 | 87,3 | **91,0** |

Interpretación:

1. **Para los usuarios finales las opciones web ganan con claridad** (86–94 frente a 64). Qt Widgets solo lidera cuando la comodidad del desarrollador pesa más que la experiencia del usuario final (peso del usuario final inferior a un 32 % aproximadamente).
2. **04 queda primera con cualquier peso entre el 100 % y cerca del 43 %.**
3. **El tamaño es lo que frena a 02.** Si se ignora el tamaño, 02 queda a menos de un punto de 04 (88,5 frente a 89,4); con el peso usado baja a 82,4 (tercera), y más aún cuanto más importa el tamaño.

### 5.6 La experiencia desde el lado del usuario final

- **01:** arranca rápido y se siente como un programa de escritorio normal, pero las pantallas parecen anticuadas; el programa lleva 55–90 MB de Qt.
- **02:** la interfaz más pulida y coherente, pero el programa es casi el doble de grande que 04, cada instalación y actualización pesa unos 135–150 MB (comprimidos) más y el arranque es más lento.
- **03:** se ve tan bien como las demás y es la más pequeña, pero vive en una pestaña del navegador: sin selectores de carpeta adecuados y con un aspecto que depende del navegador del usuario.
- **04:** se ve tan bien como 02, se abre en su propia ventana, usa selectores nativos, arranca rápido y es más pequeña que el instalador actual; usa el motor Edge WebView2 que ya está en todos los clientes.

---

## 6. Recomendación

### 6.1 Arquitectura propuesta

```
 lanzador de piXeval (PyInstaller)
   ├─ Motor Python: db / omr / cat_lib / dataReports   (código existente, tras una capa de servicios)
   ├─ FastAPI + Uvicorn en 127.0.0.1 (token por arranque)  ← ya en la pila
   ├─ Interfaz React + TypeScript (compilación estática servida por FastAPI)
   └─ contenedor: ventana nativa de pywebview  ── alternativa: navegador del sistema
```

### 6.2 Justificación (Decisión 1: web; Decisión 2: pywebview)

1. **Cumple las restricciones planteadas:** el motor sigue siendo Python; React, FastAPI, pywebview y las bibliotecas de apoyo son de código abierto con licencias permisivas (por confirmar componente a componente antes de la publicación), por lo que no surge coste de licencia ni de alojamiento.
2. **Da a los usuarios finales la mejor experiencia (94 sobre 100, por delante del 88 de 02) con una mejor puntuación de implementación (74 frente a 60):** la plataforma web ofrece el mayor conjunto de componentes maduros y accesibles (tablas, diálogos, gráficos, búsqueda de comandos, gestión del teclado) y un diseño visual moderno. El prototipo demuestra el resultado: 30 archivos fuente de páginas y diálogos y unas 3 400 líneas de TypeScript y CSS reproducen las pantallas y diálogos del flujo principal de piXeval (de asignaturas a notas, utilidades y configuración) con un diseño moderno y un comportamiento operativo de crear/editar/eliminar sobre datos de ejemplo. Las aplicaciones auxiliares del repositorio (EBAP, CAT3 Audit) no están cubiertas.
3. **Cierra la principal carencia funcional de la opción de navegador** (rutas reales de archivo) mediante diálogos nativos expuestos por pywebview, y evita distribuir Chromium: la capa de interfaz añade unos 11 MB al resultado compilado, frente a unos 340–370 MB del navegador integrado de Qt, y unos 45–80 MB menos que la compilación actual con Qt una vez retirado Qt (un 12–21 % más pequeña).
4. **Las regresiones se detectan antes de que las vean los usuarios:** el código tipado (TypeScript) y las pruebas automáticas de navegador (Playwright) comprueban cada pantalla con bases de datos de ejemplo reales antes de la publicación, algo que importa en una actualización mayor de una sola vez.
5. **Mantiene pequeños el programa compilado y sus actualizaciones:** un ejecutable de Python más el motor WebView2 de Windows ya presente en cada cliente, reutilizando la cadena existente de PyInstaller e Inno Setup.
6. **Mantiene abiertas opciones futuras:** la misma API puede dar soporte más adelante a un despliegue en red local o remoto, algo que la opción solo con Qt no puede.
7. **Es en parte reversible:** si la vista web del sistema operativo resultara inadecuada, la misma compilación web se ejecuta en el navegador (03) o dentro de Qt WebEngine (02) sin reescribir la interfaz, lo que limita el daño de una mala elección de contenedor antes de la versión única.

### 6.3 Por qué no se seleccionaron las otras tres

- **01:** la más fácil de implementar (88) y la publicación más segura, pero los usuarios finales obtienen la experiencia más débil (64): dibujo a medida para cada componente moderno, sin efectos ni transiciones reales, un aspecto anticuado. Dejaría el objetivo principal en gran parte sin cumplir.
- **02:** experiencia del usuario final cercana a 04 (88 frente a 94) con el renderizado más coherente, pero su capa de interfaz añade unos 340–370 MB al programa compilado (unos 135–150 MB más de descarga, en cada instalación y actualización), arranca más lenta y es más difícil de implementar (60 frente a 74): Chromium en el instalador, empaquetado de QtWebEngine y un puente asíncrono. Es la elección si un motor de renderizado idéntico garantizado importa más que el tamaño, o si un servidor local es inaceptable.
- **03:** el mismo frontend con el navegador del usuario como ventana: la más sencilla de entregar (80) y la más pequeña, pero la opción web más débil para los usuarios finales (86): sin selectores nativos de archivo y con un aspecto que varía según el navegador. Se conserva como **modo alternativo de 04**.

---

## 7. Riesgos y mitigaciones

| Riesgo                                                                                                                        | Probabilidad / impacto | Mitigación                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| La lógica de negocio incrustada en los widgets se extrae mal                                                                  | alta / alto            | pruebas de caracterización de las salidas de calificación, OMR e informes antes de refactorizar (F3)                                                                                                                                 |
| Defectos introducidos durante la reescritura de la interfaz (incluido el código generado por IA) en los flujos de notas u OMR | media / alto           | mantener el motor sin cambios; TypeScript estricto; pruebas unitarias de la capa de servicios; pruebas de extremo a extremo (Playwright) con bases de datos de ejemplo reales; revisión humana de cada cambio que afecte a las notas |
| Diferencias entre versiones de Windows o entre versiones del entorno de ejecución de WebView2                                 | baja / media           | probar en Windows 10 y 11; evitar CSS/JS de vanguardia; la alternativa de navegador sigue siendo una red de seguridad                                                                                                                |
| El backend de Windows de pywebview depende de pythonnet y puede empaquetarse mal con PyInstaller                              | media / alto           | demostrar el paquete en la prueba de validación; mantener la alternativa de navegador                                                                                                                                                |
| Servidor local expuesto a otros procesos locales                                                                              | media / alto           | enlazar a loopback, puerto aleatorio, token por arranque, comprobaciones estrictas de origen                                                                                                                                         |
| Una regresión o una función ausente llega a todos los usuarios a la vez (sin despliegue incremental)                          | alta / alto            | lista escrita de paridad de cada pantalla, diálogo e informe; pruebas de extremo a extremo con bases de datos reales; beta cerrada antes de la publicación                                                                           |
| Las bases de datos de usuario existentes no se abren o no se migran                                                           | media / alto           | la nueva versión abre las bases de datos actuales sin cambios de esquema; copia de seguridad automática antes de la primera apertura; conservar el instalador anterior para volver atrás                                             |
| Dos versiones instaladas en paralelo escriben en un mismo archivo SQLite                                                      | baja / alto            | servicio de escritor único; el instalador detecta y avisa de una instalación anterior                                                                                                                                                |
| Las tablas grandes o las pantallas con muchas imágenes van lentas                                                             | media / media          | tablas virtualizadas; prueba con más de 5 000 filas; miniaturas para los escaneos                                                                                                                                                    |
| Dependencia de un único mantenedor (pywebview)                                                                                | media / media          | capa fina de abstracción sobre el contenedor; alternativa al navegador o a Qt WebEngine                                                                                                                                              |
| Se pierde el ahorro de tamaño porque Qt se queda en el programa compilado                                                     | media / media          | eliminar las ~7 importaciones de Qt de módulos que no son de interfaz en el paso de la capa de servicios; comprobar el contenido del paquete en la prueba de validación                                                              |
| Crecimiento del alcance por las varias aplicaciones del repositorio (EBAP, CAT3 Audit)                                        | media / media          | migrar primero piXeval; reutilizar después el sistema de diseño                                                                                                                                                                      |

---

## 8. Plan de implementación (una versión mayor)

| Fase | Trabajo                                                                                                                                        | Criterio de salida                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0    | Revisar el informe; ejecutar la prueba de validación (§9)                                                                                      | registro de decisión                                                                     |
| 1    | Capa de servicios; sustituir las señales de Qt por callbacks/eventos; pruebas de caracterización                                               | la aplicación Qt actual sin cambios y superando las pruebas                              |
| 2    | API FastAPI para cada caso de uso; construir la interfaz web completa sobre ella, partiendo del prototipo                                      | lista de paridad: cada pantalla, diálogo e informe actuales                              |
| 3    | Diálogos nativos mediante pywebview; flujos de OMR y corrección con eventos de progreso; instalador; apertura de las bases de datos existentes | la candidata a versión supera las pruebas de extremo a extremo con bases de datos reales |
| 4    | Beta cerrada con usuarios y bases de datos reales; corregir defectos; mantener disponible el instalador anterior para volver atrás             | aprobación de la beta                                                                    |
| 5    | Publicar como la próxima versión mayor                                                                                                         | usuarios en la nueva versión; instalador anterior conservado una versión                 |

---

## 9. Tareas de validación antes de comprometerse (aún no realizadas)

1. Crear un paquete de PyInstaller de FastAPI + pywebview (incluida su dependencia pythonnet) **sin Qt**, y **medir el tamaño del instalador, el tamaño instalado y el arranque en frío** frente al instalador actual; repetir el paquete con Qt WebEngine para compararlo.
2. Comprobar el comportamiento de la ventana de pywebview en **Windows 10 y 11** (WebView2 está disponible en todos los equipos cliente).
3. Prototipar el **puente del diálogo nativo de carpeta** y un escaneo de larga duración con flujo de eventos.
4. Medir el rendimiento de la **tabla de notas con más de 5 000 filas** y de una pantalla de revisión de imágenes escaneadas.
5. Realizar una **comparación de usabilidad** (tiempo de tarea y errores) entre una pantalla actual de Qt y su equivalente web con unos pocos usuarios reales.
6. Revisar las **licencias** de cada dependencia del paquete (incluidos los componentes LGPL si Qt permanece en la compilación).

---

## 10. Consideraciones de coste

Todos los componentes de la pila recomendada (Python, FastAPI, React, TypeScript, pywebview, Vite) son de código abierto; el único coste es el tiempo de desarrollo. Las opciones basadas en Qt tampoco tienen tarifa siempre que se respeten los términos de la LGPL. El esfuerzo de desarrollo lo domina la reimplementación de la interfaz (F2), que todas las opciones comparten; la revisión y las pruebas siguen siendo necesarias sea cual sea la forma de escribir el código.

---

## 11. Limitaciones de este estudio

- Las puntuaciones son juicios; el análisis de sensibilidad muestra cómo cambian, pero no elimina la subjetividad.
- No se midieron el tamaño del instalador, el rendimiento ni los datos de los equipos de destino (§9).
- Los datos tecnológicos externos (Qt, pywebview) proceden de la documentación pública y de los artículos citados más abajo; los números de versión y el estado de los proyectos cambian con rapidez y deben volver a comprobarse en el momento de decidir.
- Los recuentos de líneas miden el tamaño, no la complejidad; indican el esfuerzo relativo, pero no el esfuerzo exacto.
- El prototipo usa datos de ejemplo y no ejecuta el motor real.

---

## 12. Conclusión

El motor de procesamiento de piXeval es en gran parte independiente de su interfaz de usuario, por lo que sustituir la tecnología de la interfaz es técnicamente viable sin salir de Python. Todas las opciones requieren el mismo primer paso, una capa de servicios. La plataforma web da a los usuarios finales una experiencia claramente mejor (86–94 sobre 100 frente a 64 de Qt Widgets). Un motor Python con esa interfaz en una ventana nativa alcanza la mejor puntuación de usuario final (94, frente a 88 del navegador integrado Qt WebEngine) con una mejor puntuación de implementación (74 frente a 60), y con un programa compilado mucho más pequeño (unos 11 MB para la capa de interfaz frente a unos 340–370 MB con Qt WebEngine, que casi duplicaría el programa; un 12–21 % más pequeño que la compilación actual con Qt Widgets), con el navegador externo como alternativa de seguridad. Qt Widgets se preferiría solo si la comodidad del desarrollador contara más de dos tercios de la decisión. Como la migración es una única versión, el riesgo dominante es la calidad de la publicación y no la vía de migración, por lo que una lista de paridad, una beta cerrada y una vía de retroceso forman parte del plan. El siguiente paso es el trabajo de validación del §9, que puede completarse en una prueba breve y de bajo riesgo antes de cualquier inversión importante.

---

## Referencias

1. Documentación de Qt, _User Interfaces_ (Widgets, animación y aplicaciones de escritorio complejas), <https://doc.qt.io/qt-6.9/topics-ui.html>
2. Qt for Python, _QtWebChannel_, <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
3. Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_, <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
4. Listado del paquete pywebview 6.x, <https://www.archlinux.org/packages/extra/any/python-pywebview>
5. Métricas del repositorio de piXeval: [00-baseline-current-stack.md](00-baseline-current-stack.md)
