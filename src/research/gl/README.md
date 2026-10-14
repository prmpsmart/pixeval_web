# Investigación: modernizar a interface de usuario de piXeval

Pregunta: que opcións hai para mellorar a interface e a experiencia de uso de piXeval, tomando como base a configuración actual de PySide6, mantendo o motor en Python e sen engadir novos gastos?

**Como se xulgan as opcións:** o foco principal é o **usuario final**. A puntuación A (80 %) é a experiencia do usuario final (estética e aspecto moderno, interacción, eficacia, consistencia, instalación e inicio, comportamento nativo); a puntuación B (20 %) é a facilidade de implementación co contorno de execución de Python. Dúas decisións: Qt Widgets fronte a web; e, despois, que envoltorio web usar (navegador integrado Qt WebEngine, pywebview con navegador de reserva, ou backend en Python + navegador externo).

**Restricións:** manter o motor en Python; a migración fágase unha soa vez, como unha única versión maior; sen novos custos recorrentes; o tamaño do equipo, as súas habilidades e a familiaridade coas linguaxes **non** son restricións (as opcións xúlganse polo seu mérito técnico).

**Comeza polo [informe técnico final](06-final-technical-report.md).** O resto dos ficheiros son notas de apoio, cada unha con vantaxes, inconvenientes e comparacións coas demais opcións.

| Documento                                                                         | Contido                                                                                                                                      |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Informe técnico final](06-final-technical-report.md)                             | Problema, método, análise, recomendación, riscos, plan                                                                                       |
| [00 · Base de partida: a pila actual](00-baseline-current-stack.md)               | Datos medidos da base de código actual                                                                                                       |
| [01 · Modernizar Qt Widgets](01-pyside6-widgets-modernised.md)                    | Quedar en Qt Widgets e modernizalo                                                                                                           |
| [02 · Híbrido Qt WebEngine](02-qt-webengine-hybrid.md)                            | Interface web dentro da aplicación Qt (navegador integrado)                                                                                  |
| [03 · Aplicación web local no navegador](03-local-web-app-fastapi-react.md)       | Backend en Python (FastAPI) co navegador externo                                                                                             |
| [04 · Aplicación web local nunha xanela pywebview](04-pywebview-native-window.md) | O mesmo, nunha xanela nativa (recomendada)                                                                                                   |
| [05 · Comparación e folla de ruta](05-comparison-and-roadmap.md)                  | Puntuación de usuario final fronte a facilidade con Python, as dúas decisións, clasificación combinada, sensibilidade, folla de ruta, fontes |

Salvidades: as puntuacións son valoracións de criterio; o tamaño do instalador, o rendemento e os datos dos equipos de destino non se mediron (véxase a sección 9 do informe).
