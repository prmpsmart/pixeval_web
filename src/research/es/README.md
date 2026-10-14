# Investigación: modernizar la interfaz de usuario de piXeval

Pregunta: ¿qué opciones hay para mejorar la interfaz y la experiencia de uso de piXeval, tomando como base la configuración actual de PySide6, manteniendo el motor en Python y sin añadir nuevos gastos?

**Cómo se juzgan las opciones:** el foco principal es el **usuario final**. La puntuación A (80 %) es la experiencia del usuario final (estética y aspecto moderno, interacción, eficacia, consistencia, instalación e inicio, comportamiento nativo); la puntuación B (20 %) es la facilidad de implementación con el entorno de ejecución de Python. Dos decisiones: Qt Widgets frente a web; y, después, qué envoltorio web usar (navegador integrado Qt WebEngine, pywebview con navegador de reserva, o backend en Python + navegador externo).

**Restricciones:** mantener el motor en Python; la migración se hace una sola vez, como una única versión mayor; sin nuevos costes recurrentes; el tamaño del equipo, sus habilidades y la familiaridad con los lenguajes **no** son restricciones (las opciones se juzgan por su mérito técnico).

**Empieza por el [informe técnico final](06-final-technical-report.md).** El resto de los archivos son notas de apoyo, cada una con ventajas, inconvenientes y comparaciones con las demás opciones.

| Documento                                                                 | Contenido                                                                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Informe técnico final](06-final-technical-report.md)                     | Problema, método, análisis, recomendación, riesgos, plan                                                                       |
| [00 · Base de partida: la pila actual](00-baseline-current-stack.md)      | Datos medidos de la base de código actual                                                                                      |
| [01 · Modernizar Qt Widgets](01-pyside6-widgets-modernised.md)            | Quedarse en Qt Widgets y modernizarlo                                                                                          |
| [02 · Híbrido Qt WebEngine](02-qt-webengine-hybrid.md)                    | Interfaz web dentro de la aplicación Qt (navegador integrado)                                                                  |
| [03 · Aplicación web local en el navegador](03-local-web-app-fastapi-react.md) | Backend en Python (FastAPI) con el navegador externo                                                                      |
| [04 · Aplicación web local en una ventana pywebview](04-pywebview-native-window.md) | Lo mismo, en una ventana nativa (recomendada)                                                                        |
| [05 · Comparación y hoja de ruta](05-comparison-and-roadmap.md)           | Puntuación de usuario final frente a facilidad con Python, las dos decisiones, clasificación combinada, sensibilidad, hoja de ruta, fuentes |

Salvedades: las puntuaciones son valoraciones de criterio; el tamaño del instalador, el rendimiento y los datos de los equipos de destino no se midieron (véase la sección 9 del informe).
