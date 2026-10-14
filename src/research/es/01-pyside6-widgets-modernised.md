# 01 · Quedarse en PySide6 Widgets y modernizarlo

**En una línea:** mantener la aplicación de escritorio con Qt Widgets, terminar el rediseño ya iniciado en `src/modern_ui` e invertir en un tema y una biblioteca de componentes adecuados.

## Qué es

La misma tecnología de hoy (PySide6 6.9, Qt Widgets, QSS), pero con un sistema de diseño deliberado: tokens de color y espaciado, tarjetas, tablas, diálogos y avisos reutilizables, un marco con barra lateral y una separación limpia entre interfaz y servicios. `src/modern_ui` ya contiene el comienzo: `theme.py`, `buttons.py`, `inputs.py`, `table.py`, `surfaces.py`, un marco con barra lateral y superior, y generación de recursos QRC.

## Cómo encaja en piXeval

- Sin cambios en el empaquetado (PyInstaller + Inno Setup), el entorno de ejecución ni el modelo de un solo proceso.
- El código Python llama a código Python; sin API, sin puente, sin un segundo lenguaje.
- Las señales de progreso (`SignalInstance`) siguen funcionando como están.

## Ventajas

- **Menor riesgo técnico.** Nada nuevo que aprender, distribuir, firmar ni depurar.
- **Un proceso, un lenguaje, totalmente sin conexión.** Nada escucha en un puerto, así que no hay avisos del cortafuegos ni del antivirus.
- **La integración nativa es gratuita:** `QFileDialog`, impresión (`QtPrintSupport`), PDF (`QtPdf`), arrastrar y soltar, portapapeles, bandeja, diálogos del sistema.
- **Se reutilizan los recursos existentes y el conocimiento de Qt** (QSS, iconos SVG, Lottie, costumbres de Qt Designer).
- Arranque rápido y poca memoria frente a un motor de navegador incluido. Los binarios de Qt del programa compilado ocupan unos 55–90 MB (Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7 MB, módulos de PySide6 ≈ 12 MB, complementos, opcionalmente OpenGL por software 20,6 MB), medido a partir de las ruedas de Windows.
- Las tablas de datos grandes siguen siendo rápidas con `QAbstractItemModel` y `QTableView`.

## Inconvenientes

- **El techo de diseño es más bajo y el coste por componente más alto.** QSS es un subconjunto de CSS: sin flexbox/grid, sin sombras reales (`QGraphicsDropShadowEffect` es lento y recorta), sin desenfoque de fondo, sin variables CSS ni transiciones. La propia documentación de Qt señala que los Widgets «no escalan bien para animaciones» (véanse las fuentes en [05](05-comparison-and-roadmap.md)).
- **Cada componente moderno se construye a mano.** La vista previa web (paleta de comandos, avisos, tablas filtrables, diálogos con pestañas, gráficos, estados vacíos) usa patrones listos para usar; en Widgets cada uno es una clase propia que hay que diseñar, pintar y probar.
- **Iteración de diseño lenta.** Un cambio visual implica reiniciar y ejecutar; no hay recarga en caliente ni inspector de herramientas de desarrollo del navegador para QSS.
- **El rediseño sigue siendo una reescritura de ~70 mil líneas.** `src/modern_ui` tiene 2,3 mil líneas frente a las 71 mil de la interfaz actual. Elegir esta opción no evita la reescritura; solo conserva el lenguaje.
- **Herramientas:** los diseños no se pueden traspasar directamente (Figma → CSS es directo; Figma → QSS es manual), y el ecosistema público de componentes y ejemplos de estilos para Qt Widgets es mucho menor que el de la interfaz web.
- **Probar la interfaz es más difícil** (`pytest-qt` funciona, pero es mucho menos habitual que las pruebas al estilo Playwright/Cypress).
- Las rarezas de alta densidad de píxeles, fuentes y modo oscuro cambian según el SO y requieren cuidado manual.

## Ventajas frente a las demás opciones

- frente a las opciones web (03, 04): sin servidor local, sin dependencia de WebView/Chromium, sin cadena de herramientas JS, sin puente que mantener, sin superficie de seguridad por un servicio HTTP local.
- frente al híbrido (02): binario más pequeño, empaquetado más sencillo, una sola pila de renderizado.

## Desventajas frente a las demás opciones

- La vía más lenta hacia una interfaz _visiblemente moderna_; cada detalle de pulido es a medida.
- Sin camino hacia una versión en red local / remota / accesible desde navegador sin una reescritura aparte.
- Ecosistema de componentes más pequeño que el de la web.

## Cuándo elegirla

- El objetivo es «mejor aspecto, mismo producto», y un segundo entorno de ejecución o límite de proceso es inaceptable (por ejemplo, equipos aislados sin conexión que bloquean servidores locales).

## Esfuerzo y riesgos

- Esfuerzo: alto pero predecible; el trabajo son las mismas pantallas en cualquier caso. El riesgo se concentra en los componentes pintados a medida y en mantener coherentes la interfaz antigua y la nueva mientras coexisten.
- Primero: extraer servicios de los widgets (véase el hallazgo 3 en [00](00-baseline-current-stack.md)). Esto compensa en todas las opciones.
