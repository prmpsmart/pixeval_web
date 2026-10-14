# 05 · Comparación, puntuación y hoja de ruta

## Nota sobre las restricciones

- **El foco principal es el usuario final, no el desarrollador.** La puntuación principal mide lo que viven a diario las personas que usan piXeval: el aspecto y la sensación del producto, su eficacia y cómo se instala, arranca y se comporta en sus equipos. La comodidad del desarrollador se puntúa aparte y pesa menos.
- **Solo Windows:** piXeval se entrega como instalador de Windows. No se consideran otros sistemas operativos; «coherencia» significa coherencia entre los PC con Windows de los usuarios.
- **WebView2 está disponible en todos los equipos cliente** (supuesto de este estudio), por lo que se trata como presente y no como requisito previo ni riesgo.
- El tamaño del equipo, sus conocimientos y la familiaridad con los lenguajes **no son restricciones**; las opciones se juzgan por su mérito técnico.
- **No hay migración incremental:** la nueva interfaz sustituye a la antigua en una única versión mayor.
- **Puntuaciones:** **Puntuación A** = experiencia del usuario final (principal, peso 80 %). **Puntuación B** = facilidad de implementarla con el entorno de ejecución de Python (secundaria, peso 20 %). Se muestran otras ponderaciones para que se vea el efecto de la elección.

## Estructura de la decisión

La elección se hace en dos pasos, porque las opciones no son cuatro iguales:

1. **Decisión 1: ¿Qt Widgets o web (React, etc.)?** La opción 01 frente a la interfaz web. Es la gran decisión: determina el techo de UI/UX y la cadena de herramientas.
2. **Decisión 2 (si es web): ¿qué contenedor la presenta?** El mismo frontend React puede mostrarse de tres formas:
   - **02** dentro de la aplicación Qt (**navegador integrado, Qt WebEngine**),
   - **04** en una ventana de **pywebview**, con el **navegador externo como alternativa** cuando no hay vista web disponible,
   - **03** con **Python como backend y el navegador externo usado directamente**.

Las secciones 5 y 6 dan las dos decisiones; las secciones 1–4 contienen las pruebas y puntuaciones en que se apoyan, y la sección 7 las combina.

## 1. Python en el cuadro: cómo se ejecuta cada opción

| #   | Opción                                | Dónde se ejecuta Python                                                     | Cómo habla la interfaz con él                                                         | Qué lanza el usuario                    |
| --- | ------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| 01  | PySide6 Widgets, modernizado          | mismo proceso que la interfaz                                               | llamadas directas a funciones y señales de Qt                                         | un ejecutable                           |
| 02  | Híbrido Qt WebEngine                  | mismo proceso que la interfaz                                               | QtWebChannel (puente JS↔Python asíncrono)                                             | un ejecutable que contiene Chromium     |
| 03  | Aplicación web local, navegador       | proceso FastAPI separado iniciado por un lanzador                           | HTTP + WebSocket/SSE en 127.0.0.1                                                     | el lanzador y luego el navegador        |
| 04  | Aplicación web local + ventana pywebview | servidor FastAPI en un hilo en segundo plano del mismo ejecutable        | HTTP + WebSocket/SSE, más un pequeño puente JS↔Python para los diálogos nativos       | un ejecutable con su propia ventana     |

## 2. Tamaño del programa compilado

El resultado compilado es lo que PyInstaller mete en el instalador. **Los binarios de Qt forman parte de él siempre que interviene Qt**; las opciones web los sustituyen por unos pocos megabytes. Las cifras siguientes están **medidas a partir de las ruedas (wheels) de Windows en PyPI** (listas de archivos leídas directamente), no de una compilación real; el resultado real depende de lo que recoja PyInstaller.

**Común a todas las opciones: la pila del motor Python** (tamaño descomprimido de las ruedas de Windows fijadas en `requirements.txt`):

| Componente                | Descomprimido | Rueda (comprimida) |
| ------------------------- | ------------: | -----------------: |
| OpenCV 4.12               |        110 MB |              39 MB |
| SciPy 1.16                |        116 MB |              39 MB |
| NumPy                     |         43 MB |              13 MB |
| pandas                    |         39 MB |              11 MB |
| scikit-image              |         25 MB |              13 MB |
| matplotlib                |         20 MB |               8 MB |
| Pillow, reportlab         |         11 MB |               5 MB |
| **Total de la pila del motor** | **≈ 364 MB** |       **≈ 127 MB** |

**Varía según la opción: la capa de interfaz**

| Capa de interfaz         | Qué se incluye                                                                                                                                                                                                   |                 Descomprimido | Comprimido (rueda) |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------: | -----------------: |
| 01 Qt Widgets            | Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7, PrintSupport 0,4 MB; módulos de PySide6 ≈ 12 MB; complementos ≈ 5 MB; opcionalmente OpenGL por software 20,6 MB y traducciones ≈ 12 MB                              |    **≈ 55–90 MB** (estimación) |        ≈ 20–33 MB |
| 02 Híbrido Qt WebEngine  | todo lo de 01, **más** QtWebEngine (`Qt6WebEngineCore.dll` 199,5 MB, traducciones ≈ 40 MB, paquetes de recursos ≈ 13 MB: 255,7 MB en total, medido) **más** Quick/Qml/Network/OpenGL/Positioning ≈ 26 MB          | **≈ 340–370 MB** (estimación) |     ≈ 135–150 MB |
| 03 Navegador             | FastAPI, Uvicorn, Starlette, Pydantic ≈ 8,9 MB; frontend web 0,34 MB (la compilación del prototipo: 322 KB de JS + 22 KB de CSS); **sin Qt, sin motor de navegador**                                            |                   **≈ 9 MB** |              ≈ 3 MB |
| 04 Ventana pywebview     | todo lo de 03, **más** pywebview 1,6 MB (cargador de WebView2 y DLL de interoperabilidad ≈ 1 MB) y pythonnet 0,7 MB; **el motor WebView2 en sí no se incluye** (forma parte de Windows, compartido con Edge)      |                  **≈ 11 MB** |              ≈ 4 MB |

**Totales (componentes conocidos)**

|                 | Descomprimido | Comprimido (rueda; aproximación de la descarga) |                 Comparado con 04 |
| --------------- | ------------: | ----------------------------------------------: | -------------------------------: |
| 01 Qt Widgets   |  ≈ 420–455 MB |                                  ≈ 147–160 MB |                 **+12 a +21 %** |
| 02 Qt WebEngine |  ≈ 705–735 MB |                                  ≈ 263–276 MB | **+88 a +96 %** (casi el doble) |
| 03 Navegador    |      ≈ 373 MB |                                      ≈ 130 MB |                             −1 % |
| 04 pywebview    |      ≈ 375 MB |                                      ≈ 131 MB |                       referencia |

Observaciones:

1. **pywebview añade unos 2–3 MB de binarios; Qt añade unos 55–90 MB (Widgets) o unos 340–370 MB (con WebEngine).** Los contenedores web que evitan Qt son las opciones más pequeñas, y **04 es más pequeña que la compilación actual con Qt Widgets en unos 45–80 MB** (12–21 %) una vez retirado PySide6 del paquete.
2. **Ese ahorro exige retirar Qt del programa compilado.** Unos siete archivos que no son de interfaz todavía importan Qt (hallazgo F1 del informe); el paso de la capa de servicios los elimina. Sin ese paso, PySide6 se queda en el paquete.
3. **La capa de interfaz es una parte importante del resultado.** La pila del motor ronda los 364 MB (encabezada por OpenCV y SciPy); Qt Widgets le añade un 12–21 % aproximadamente, y Qt WebEngine casi duplica el programa.
4. **Tiempo de descarga y actualización:** la capa de interfaz de 02 son unos 135–150 MB comprimidos frente a unos 4 MB de 04, aproximadamente 2 minutos extra a 10 Mbit/s en cada instalación y cada actualización.
5. No medido: el entorno de ejecución de Python, otras dependencias (clientes de Google, etc.), la sobrecarga de PyInstaller, la compresión de Inno Setup. Una compilación real es la primera tarea de validación.

## 3. Puntuación A: experiencia del usuario final (principal)

| Criterio (peso dentro de A)                    | Lo que siente el usuario final                                                                                                                                             |     01 |     02 |     03 |     04 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Estética y aspecto moderno (25)                | tipografía, espaciado, sombras, desenfoque, modo oscuro, acabado                                                                                                           |      2 |      5 |      5 |      5 |
| Interacción agradable (15)                     | transiciones, respuesta al pasar el cursor o enfocar, rapidez de respuesta                                                                                                 |      2 |      5 |      5 |      5 |
| Eficacia (20)                                  | tablas densas, búsqueda/filtro, paleta de comandos, uso del teclado, respuesta clara, gráficos, accesibilidad                                                              |      3 |      5 |      5 |      5 |
| Coherencia entre los PC Windows de los usuarios (10) | se ve y se comporta igual en cualquier equipo con Windows                                                                                                            |      5 |      5 |      3 |      4 |
| Instalación y arranque (10)                    | tiempo de arranque, sin requisitos previos, sensación de aplicación                                                                                                        |      5 |      3 |      3 |      4 |
| Comportamiento de escritorio nativo (10)       | selectores reales de archivo/carpeta, impresión, arrastrar y soltar, funciona sin conexión                                                                                 |      5 |      5 |      2 |      4 |
| **Tamaño del programa compilado (10)**         | tamaño del instalador y de la instalación, tiempo de descarga y actualización (sección 2); 5 = el más pequeño, 4 = hasta +10 % sobre él, 3 = +10–25 %, 2 = +25–60 %, 1 = más de +60 % |      3 |      1 |      5 |      5 |
| **Puntuación A (0–100)**                       |                                                                                                                                                                            | **64** | **88** | **86** | **94** |

Lo que notaría un usuario final:

- **01** arranca rápido y se comporta como cualquier programa de escritorio, pero las pantallas parecen anticuadas y la interfaz sigue siendo sencilla. El programa lleva 55–90 MB de Qt.
- **02** ofrece la interfaz más pulida y coherente, pero el programa es casi el doble de grande que 04, cada instalación y actualización pesa unos 135–150 MB (comprimidos) más, y el arranque es más lento porque lleva dentro un motor de navegador completo.
- **03** se ve tan bien como 02 y es la más pequeña, pero es una pestaña del navegador: lanza un servidor y un navegador, no puede ofrecer selectores de carpeta adecuados y depende del navegador que tenga el usuario (Edge y Chrome comparten motor; Firefox no).
- **04** se ve tan bien como 02, se abre en su propia ventana como un programa normal, usa selectores nativos de archivo y carpeta y es más pequeña que el programa actual. Usa el motor WebView2 de Edge, presente en todos los equipos cliente; si algún día faltara, el programa recurre al navegador (comportamiento de 03).

## 4. Puntuación B: facilidad de implementarla con el entorno de ejecución de Python (secundaria)

| Criterio (peso dentro de B)               | Qué pide                                                                       |     01 |     02 |     03 |     04 |
| ----------------------------------------- | ------------------------------------------------------------------------------ | -----: | -----: | -----: | -----: |
| Integración con el motor (30)             | llamar al código Python, eventos de progreso para escaneos/copias, hilos       |      5 |      4 |      4 |      4 |
| Esfuerzo de compilación y empaquetado (30)| PyInstaller, entornos de ejecución a incluir, firma, cadena de publicación     |      5 |      2 |      4 |      3 |
| Piezas móviles que probar (20)            | cadenas de herramientas, fronteras entre procesos, contratos de puente/API     |      5 |      2 |      3 |      3 |
| Reutilización del trabajo existente (20)  | FastAPI ya en la pila, prototipo existente, capa de servicios                  |      2 |      4 |      5 |      5 |
| **Puntuación B (0–100)**                  |                                                                                | **88** | **60** | **80** | **74** |

Las comodidades solo para desarrolladores (recarga en caliente, traspaso de diseño, grandes ecosistemas) **no** se puntúan; importan únicamente por el resultado para el usuario final que hacen posible.

## 5. Decisión 1: ¿Qt Widgets o web?

|                                                |                  01 Qt Widgets |                          Interfaz web (02, 03, 04) |
| ---------------------------------------------- | -----------------------------: | -------------------------------------------------: |
| Estética, interacción, eficacia                |                        2, 2, 3 |                                            5, 5, 5 |
| Coherencia entre los PC Windows de los usuarios |                              5 |                                              3–5 |
| Instalación y arranque                         |                              5 |                                              3–4 |
| Comportamiento de escritorio nativo            |                              5 |                      2–5 (depende del contenedor) |
| Tamaño del programa compilado                  | 3 (≈ 420–455 MB, 12–21 % sobre 04) | 1–5 (≈ 373–375 MB para 03/04; ≈ 705–735 MB para 02) |
| **Puntuación A: experiencia del usuario final** |                         **64** |                                        **86–94** |
| **Puntuación B: facilidad con Python**         |                         **88** |                                        **60–80** |

**Veredicto: web.** Las opciones web dan a los usuarios finales una interfaz claramente mejor (5 frente a 2–3 en aspecto, interacción y eficacia), y los mejores contenedores web son **más pequeños que la compilación con Qt**, porque prescinden de los binarios de Qt. Las desventajas de Qt Widgets para el usuario final son **estructurales**: QSS no tiene motores de maquetación, sombras reales, desenfoque ni transiciones, y cada componente moderno se dibuja a mano. Las desventajas de la web son **tareas identificables** (diálogos nativos, retirar Qt del motor, una cadena de empaquetado).

Qt Widgets supera al mejor contenedor web (04) solo si la experiencia del usuario final pesa **menos de un 32 % aproximadamente** (frente a 03: 27 %; frente a 02: 54 %). Con el 80 % que se usa aquí, las opciones web ganan por 14–21 puntos combinados.

## 6. Decisión 2: ¿qué contenedor web?

Los tres muestran el mismo frontend React, así que el aspecto y la interacción son idénticos. Lo que cambia para el usuario final es la coherencia del renderizado, el tamaño, la instalación y el arranque, y el comportamiento nativo.

| Aspecto                         | **02 Navegador integrado (Qt WebEngine)**        | **04 Ventana pywebview, alternativa con navegador externo**                                           | **03 Backend Python + navegador externo**                                   |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Aspecto e interacción           | idénticos                                        | idénticos                                                                                             | idénticos                                                                   |
| Coherencia del renderizado      | idéntica en todos los PC (Chromium incluido)     | muy cercana: Edge WebView2 se basa en Chromium, está en todos los equipos cliente y lo actualiza Windows | depende del navegador (Edge/Chrome comparten motor; Firefox no)           |
| Lo que ve el usuario            | la ventana de la aplicación Qt                   | una pequeña ventana nativa, sin marco de navegador                                                    | una pestaña o ventana del navegador                                         |
| **Programa compilado (total)**  | **≈ 705–735 MB** (capa de interfaz ≈ 340–370 MB) | **≈ 375 MB** (capa de interfaz ≈ 11 MB; pywebview ≈ 2–3 MB de binarios, sin Qt)                       | **≈ 373 MB** (capa de interfaz ≈ 9 MB)                                      |
| Descarga / actualización        | ≈ 263–276 MB                                     | ≈ 131 MB                                                                                              | ≈ 130 MB                                                                    |
| Arranque                        | más lento (motor Chromium)                       | rápido                                                                                                | arranca el servidor y luego se abre el navegador                            |
| Requisitos previos              | ninguno                                          | ninguno (WebView2 presente en todos los clientes)                                                     | un navegador moderno                                                        |
| Selectores de archivo/carpeta   | nativos (Qt)                                     | nativos (pywebview); en modo alternativo, mediante el servidor                                        | no disponibles desde un navegador; escritos o abiertos por el servidor      |
| Impresión / PDF                 | impresión y PDF de Qt                            | vista web o PDF generado en el servidor                                                               | navegador o PDF generado en el servidor                                     |
| Funciona sin conexión           | sí                                               | sí                                                                                                    | sí                                                                          |
| Alternativa                     | no aplicable                                     | el lanzador abre el navegador externo si la ventana no puede iniciarse                                | no aplicable                                                                |
| Actualizaciones de seguridad del motor | requieren una nueva versión de piXeval    | WebView2 se actualiza solo mediante Windows                                                           | siguen al navegador del usuario                                             |
| Puntuación A / B                | 88 / 60                                          | **94 / 74**                                                                                           | 86 / 80                                                                     |

Notas:

- **04 supera a 02 para el usuario final (94 frente a 88):** 02 es algo más coherente, pero casi el doble de grande, más lenta al arrancar y más lenta de actualizar. 04 también es más fácil de implementar (74 frente a 60).
- **La alternativa es una función del lanzador, no algo que pywebview haga por sí solo,** y con WebView2 en todos los clientes es solo una red de seguridad. En modo alternativo la experiencia baja a la de 03.
- **03 por sí sola** es la más pequeña y la más sencilla de entregar, pero es la opción web más débil para los usuarios finales (86): sin selectores nativos y con un aspecto que depende del navegador.

**Veredicto: 04**, con el navegador externo como alternativa de seguridad. 02 se prefiere solo si importa más un motor de renderizado idéntico garantizado que un programa casi el doble de grande, o si un servidor local es inaceptable.

## 7. Resultado combinado y sensibilidad

| Opción                              | Puntuación A: experiencia del usuario final | Puntuación B: facilidad con Python | **Combinada (A 80 / B 20)** |
| ----------------------------------- | ------------------------------------------: | ---------------------------------: | --------------------------: |
| 01 PySide6 Widgets, modernizado     |                                          64 |                             **88** |                        68,8 |
| 02 Híbrido Qt WebEngine             |                                          88 |                                 60 |                        82,4 |
| 03 Aplicación web local, navegador  |                                          86 |                                 80 |                        84,8 |
| **04 Aplicación web local + pywebview** |                                    **94** |                                 74 |                    **90,0** |

Vista en dos ejes (experiencia del usuario final arriba, facilidad de implementación a la derecha):

```
 experiencia 94 |                   04
 del usuario 88 |        02
             86 |                   03
                |
             64 |                              01
                +-----------------------------------
                  60        74  80       88   facilidad con Python
```

Sensibilidad al peso de la experiencia del usuario final (A):

| Peso de A                         |       01 |   02 |       03 |       04 |
| --------------------------------- | -------: | ---: | -------: | -------: |
| 100 % (solo usuario final)        |     64,0 | 88,0 |     86,0 | **94,0** |
| 90 %                              |     66,4 | 85,2 |     85,4 | **92,0** |
| 80 % (usado)                      |     68,8 | 82,4 |     84,8 | **90,0** |
| 70 %                              |     71,2 | 79,6 |     84,2 | **88,0** |
| 60 %                              |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                              |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                              |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                              | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (solo comodidad del desarrollador) | **88,0** | 60,0 |     80,0 |     74,0 |

Sensibilidad al peso del criterio de tamaño dentro de A (los demás se escalan proporcionalmente; puntuación combinada con A 80 / B 20):

| Peso del tamaño dentro de A |   01 |   02 |   03 |       04 |
| --------------------------- | ---: | ---: | ---: | -------: |
| 0 % (tamaño ignorado)       | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (usado)                | 68,8 | 82,4 | 84,8 | **90,0** |
| 20 %                        | 68,5 | 76,3 | 86,1 | **90,6** |
| 30 %                        | 68,1 | 70,3 | 87,3 | **91,0** |

Conclusiones:

1. **Para los usuarios finales las opciones web ganan con claridad:** 86–94 frente a 64 de Qt Widgets. Qt Widgets solo lidera cuando la comodidad del desarrollador pesa más que la experiencia del usuario final (peso del usuario final inferior a un 32 % aproximadamente).
2. **04 queda primera con cualquier peso del usuario final entre el 100 % y cerca del 43 %**; por debajo, lidera 03 hasta que domina la comodidad del desarrollador.
3. **El tamaño es lo que frena a 02.** Si se ignora el tamaño, 02 sube a 88,5, a menos de un punto de 04 (89,4); con el peso usado (10 %) baja a 82,4 (tercera); con pesos mayores baja aún más.
4. **La ventaja de tamaño de los contenedores web depende de retirar Qt del programa compilado.** Sin ello, PySide6 (≈ 55–90 MB) se queda en el paquete y 04 tendría aproximadamente el tamaño de 01.

## 8. Requisitos previos transversales (necesarios para cualquier opción)

1. **Extraer una capa de servicios** de los 103 archivos de interfaz que llaman directamente a la capa de datos; definir funciones de casos de uso (p. ej. `grades.list(exam_id)`, `correction.run(folder)`).
2. **Sustituir las señales de Qt en el código de lógica** (`SignalInstance` en `cat_lib`, `utils`) por callbacks/eventos; retirar las 7 importaciones de Qt de los módulos que no son de interfaz.
3. **Definir un único escritor** para SQLite (dos interfaces abiertas a la vez no deben corromper ni bloquear la base de datos).
4. **Pruebas de caracterización** de las fórmulas de calificación, las salidas de OMR y la generación de informes antes de refactorizar.

## 9. Hoja de ruta sugerida (una versión mayor)

| Fase | Trabajo                                                                                                                                                                  | Resultado                                                       | Criterio de salida                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| 0    | Revisar este informe; ejecutar la prueba de validación (tamaños reales del paquete con y sin Qt, diálogos nativos, rendimiento de tablas)                                | registro de decisión                                            | aprobación                                                            |
| 1    | Capa de servicios + eventos de progreso + pruebas de caracterización (sin cambios en la interfaz)                                                                        | paquete Python `pixeval_core` usado por la aplicación Qt actual | la aplicación actual sin cambios y en verde                           |
| 2    | API FastAPI para cada caso de uso; interfaz web construida pantalla a pantalla sobre ella, con el prototipo existente como punto de partida                              | nueva interfaz completa en una rama de desarrollo               | lista de paridad: cada pantalla, diálogo e informe actuales           |
| 3    | Diálogos nativos mediante pywebview; flujos de OMR/corrección con flujo de eventos; empaquetado (PyInstaller + Inno); apertura automática y migración de las bases de datos existentes | candidata a versión instalable                      | supera las pruebas de extremo a extremo con bases de datos reales     |
| 4    | Beta cerrada con usuarios y bases de datos reales; corregir defectos; mantener disponible el instalador anterior para volver atrás                                       | aprobación de la beta                                           | sin defectos bloqueantes durante un periodo acordado                  |
| 5    | Publicar como la próxima versión mayor                                                                                                                                   | publicación                                                     | usuarios en la nueva versión; instalador anterior conservado una versión |

## 10. Fuentes

- Documentación de Qt, _User Interfaces_ (Widgets frente a la pila declarativa de Qt; notas sobre animación y aplicaciones de escritorio complejas): <https://doc.qt.io/qt-6.9/topics-ui.html>
- Qt for Python, _QtWebChannel_: <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
- Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_: <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
- Metadatos de versiones de PyPI y listas de archivos de las ruedas de Windows de PySide6 6.9.0 (Essentials, Addons), OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview y pythonnet (cifras de tamaño de la sección 2): <https://pypi.org>
- Listado del paquete pywebview 6.x: <https://www.archlinux.org/packages/extra/any/python-pywebview>
