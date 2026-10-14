# 02 · Híbrido: marco PySide6 + interfaz web dentro de Qt WebEngine

**En una línea:** mantener la aplicación PySide6 (ventana, menús, diálogos, impresión, licencias) y mostrar las pantallas como páginas web en un Chromium incrustado (`QWebEngineView`), comunicándose con Python mediante `QWebChannel`.

## Qué es

Qt WebEngine incrusta Chromium como un widget. `QtWebChannel` ofrece comunicación directa entre objetos Python y JavaScript en la página (compatible de serie con WebEngine). Las pantallas web pueden construirse con React/Vite, como en la vista previa interactiva.

## Cómo encaja en piXeval

- La aplicación Qt actual sigue siendo el anfitrión: cada pantalla es una página web abierta en un `QWebEngineView`.
- Los servicios de Python se exponen como objetos del canal (o la misma lógica se expone también mediante una API local).
- Los diálogos nativos de archivos/carpetas, la impresión y el PDF siguen siendo llamadas de Qt.
- El empaquetado sigue siendo PyInstaller + Inno Setup, añadiendo los recursos de QtWebEngine.

## Ventajas

- **Conserva el marco Qt existente.** Ventana, menús, impresión, gestión de licencias y diálogos nativos se quedan exactamente como están; solo el contenido de las pantallas pasa a ser páginas web.
- **Todo el ecosistema de la interfaz web** (React, bibliotecas de componentes, gráficos, recarga en caliente, traspaso desde Figma) _y_ todas las capacidades nativas de Qt (diálogos, impresión, arrastrar y soltar).
- **No necesita servidor local** (el canal va dentro del proceso), así que no hay avisos del cortafuegos ni diseño de seguridad de puertos/tokens.
- El mismo entorno de ejecución de Python y la misma tecnología de instalador de hoy.
- El frontend puede desarrollarse y probarse en un navegador normal (simulando el canal) a toda velocidad.

## Inconvenientes

- **Tamaño y memoria, medidos:** las ruedas de PySide6 para Windows muestran QtWebEngine en **255,7 MB descomprimido (105 MB comprimido)**: solo `Qt6WebEngineCore.dll` ocupa 199,5 MB, más ≈ 40 MB de traducciones y ≈ 13 MB de paquetes de recursos. Con las bibliotecas Quick/Qml/Network que necesita, la parte de Qt del programa compilado pasa de ≈ 55–90 MB (solo Widgets) a **≈ 340–370 MB**, unos 135–150 MB más de descarga en cada instalación y actualización. También se espera más RAM que con Widgets (no medida).
- **PyInstaller + QtWebEngine es delicado** (`QtWebEngineProcess`, recursos, locales, opciones de sandbox); hay que reservar tiempo para depurar la compilación en Windows.
- **Dos tecnologías de interfaz en un proceso** durante la transición; el estilo y la navegación deben ser coherentes entre el marco de Widgets y el contenido web.
- **El puente es asíncrono** y necesita un contrato tipado. Existen herramientas de terceros (p. ej. `pywebchannel` genera tipos TypeScript), pero son proyectos pequeños; conviene contar con mantener una capa de puente delgada propia.
- Chromium va ligado a la versión de Qt, así que las actualizaciones de la plataforma web y las correcciones de seguridad siguen las versiones de Qt.
- Licencias: PySide6 y Qt WebEngine están disponibles bajo LGPL/GPL; confirma las obligaciones de distribución antes de publicar (enlazado dinámico, avisos).
- Sin camino hacia «simplemente abrirlo en un navegador» salvo que el mismo frontend se sirva también por HTTP (es posible, pero entonces también estás construyendo la opción 03).

## Ventajas frente a las demás opciones

- frente a 01: ecosistema web y rapidez de iteración de la interfaz, sin abandonar la aplicación Qt.
- frente a 03/04: **sin conexión, sin ciclo de vida de servidor, sin puerto local que proteger, diálogos nativos de Qt e impresión sin cambios.**

## Desventajas frente a las demás opciones

- frente a 03/04: mucho más pesado (Chromium) y conserva toda la cadena de dependencias de Qt; sin acceso desde el navegador; CI de empaquetado más difícil.
- frente a 01: más grande, más piezas móviles.

## Cuándo elegirla

- Hay que conservar tal cual el marco Qt existente (menús, impresión, diálogos nativos, gestión de licencias), no es aceptable un servidor local y el tamaño del instalador no es una restricción dura.

## Esfuerzo y riesgos

- Esfuerzo: medio-alto; el puente y el empaquetado son las incógnitas. Riesgo: empaquetado de WebEngine en Windows, rendimiento de tablas muy grandes dentro de la vista web, doble mantenimiento durante la transición.
