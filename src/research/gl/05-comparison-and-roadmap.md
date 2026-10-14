# 05 · Comparación, puntuación e folla de ruta

## Nota sobre as restricións

- **O foco principal é o usuario final, non o desenvolvedor.** A puntuación principal mide o que viven a diario as persoas que usan piXeval: o aspecto e a sensación do produto, a súa eficacia e como se instala, arranca e se comporta nos seus equipos. A comodidade do desenvolvedor puntúase á parte e pesa menos.
- **Só Windows:** piXeval entrégase como instalador de Windows. Non se consideran outros sistemas operativos; «coherencia» significa coherencia entre os PC con Windows dos usuarios.
- **WebView2 está dispoñible en todos os equipos cliente** (suposto deste estudo), polo que se trata como presente e non como requisito previo nin risco.
- O tamaño do equipo, os seus coñecementos e a familiaridade coas linguaxes **non son restricións**; as opcións xúlganse polo seu mérito técnico.
- **Non hai migración incremental:** a nova interface substitúe á antiga nunha única versión maior.
- **Puntuacións:** **Puntuación A** = experiencia do usuario final (principal, peso 80 %). **Puntuación B** = facilidade de implementala co contorno de execución de Python (secundaria, peso 20 %). Amósanse outras ponderacións para que se vexa o efecto da escolla.

## Estrutura da decisión

A escolla faise en dous pasos, porque as opcións non son catro iguais:

1. **Decisión 1: Qt Widgets ou web (React, etc.)?** A opción 01 fronte á interface web. É a gran decisión: determina o teito de UI/UX e a cadea de ferramentas.
2. **Decisión 2 (se é web): que contedor a presenta?** O mesmo frontend React pode amosarse de tres xeitos:
   - **02** dentro da aplicación Qt (**navegador integrado, Qt WebEngine**),
   - **04** nunha xanela de **pywebview**, co **navegador externo como alternativa** cando non hai vista web dispoñible,
   - **03** con **Python como backend e o navegador externo usado directamente**.

As seccións 5 e 6 dan as dúas decisións; as seccións 1–4 conteñen as probas e puntuacións nas que se apoian, e a sección 7 combínaas.

## 1. Python no cadro: como se executa cada opción

| #   | Opción                                  | Onde se executa Python                                        | Como fala a interface con el                                                     | Que lanza o usuario                 |
| --- | --------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| 01  | PySide6 Widgets, modernizado            | mesmo proceso ca a interface                                  | chamadas directas a funcións e sinais de Qt                                      | un executable                       |
| 02  | Híbrido Qt WebEngine                    | mesmo proceso ca a interface                                  | QtWebChannel (ponte JS↔Python asíncrona)                                         | un executable que contén Chromium   |
| 03  | Aplicación web local, navegador         | proceso FastAPI separado iniciado por un lanzador             | HTTP + WebSocket/SSE en 127.0.0.1                                                | o lanzador e despois o navegador    |
| 04  | Aplicación web local + xanela pywebview | servidor FastAPI nun fío en segundo plano do mesmo executable | HTTP + WebSocket/SSE, máis unha pequena ponte JS↔Python para os diálogos nativos | un executable coa súa propia xanela |

## 2. Tamaño do programa compilado

O resultado compilado é o que PyInstaller mete no instalador. **Os binarios de Qt forman parte del sempre que interviña Qt**; as opcións web substitúenos por uns poucos megabytes. As cifras seguintes están **medidas a partir das rodas (wheels) de Windows en PyPI** (listas de ficheiros lidas directamente), non dunha compilación real; o resultado real depende do que recolla PyInstaller.

**Común a todas as opcións: a pila do motor Python** (tamaño descomprimido das rodas de Windows fixadas en `requirements.txt`):

| Compoñente                 | Descomprimido | Roda (comprimida) |
| -------------------------- | ------------: | ----------------: |
| OpenCV 4.12                |        110 MB |             39 MB |
| SciPy 1.16                 |        116 MB |             39 MB |
| NumPy                      |         43 MB |             13 MB |
| pandas                     |         39 MB |             11 MB |
| scikit-image               |         25 MB |             13 MB |
| matplotlib                 |         20 MB |              8 MB |
| Pillow, reportlab          |         11 MB |              5 MB |
| **Total da pila do motor** |  **≈ 364 MB** |      **≈ 127 MB** |

**Varía segundo a opción: a capa de interface**

| Capa de interface       | Que se inclúe                                                                                                                                                                                                |                 Descomprimido | Comprimido (roda) |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------: | ----------------: |
| 01 Qt Widgets           | Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7, PrintSupport 0,4 MB; módulos de PySide6 ≈ 12 MB; complementos ≈ 5 MB; opcionalmente OpenGL por software 20,6 MB e traducións ≈ 12 MB                            |   **≈ 55–90 MB** (estimación) |        ≈ 20–33 MB |
| 02 Híbrido Qt WebEngine | todo o de 01, **máis** QtWebEngine (`Qt6WebEngineCore.dll` 199,5 MB, traducións ≈ 40 MB, paquetes de recursos ≈ 13 MB: 255,7 MB en total, medido) **máis** Quick/Qml/Network/OpenGL/Positioning ≈ 26 MB      | **≈ 340–370 MB** (estimación) |      ≈ 135–150 MB |
| 03 Navegador            | FastAPI, Uvicorn, Starlette, Pydantic ≈ 8,9 MB; frontend web 0,34 MB (a compilación do prototipo: 322 KB de JS + 22 KB de CSS); **sen Qt, sen motor de navegador**                                           |                    **≈ 9 MB** |            ≈ 3 MB |
| 04 Xanela pywebview     | todo o de 03, **máis** pywebview 1,6 MB (cargador de WebView2 e DLL de interoperabilidade ≈ 1 MB) e pythonnet 0,7 MB; **o motor WebView2 en si non se inclúe** (forma parte de Windows, compartido con Edge) |                   **≈ 11 MB** |            ≈ 4 MB |

**Totais (compoñentes coñecidos)**

|                 | Descomprimido | Comprimido (roda; aproximación da descarga) |               Comparado con 04 |
| --------------- | ------------: | ------------------------------------------: | -----------------------------: |
| 01 Qt Widgets   |  ≈ 420–455 MB |                                ≈ 147–160 MB |                **+12 a +21 %** |
| 02 Qt WebEngine |  ≈ 705–735 MB |                                ≈ 263–276 MB | **+88 a +96 %** (case o dobre) |
| 03 Navegador    |      ≈ 373 MB |                                    ≈ 130 MB |                           −1 % |
| 04 pywebview    |      ≈ 375 MB |                                    ≈ 131 MB |                     referencia |

Observacións:

1. **pywebview engade uns 2–3 MB de binarios; Qt engade uns 55–90 MB (Widgets) ou uns 340–370 MB (con WebEngine).** Os contedores web que evitan Qt son as opcións máis pequenas, e **04 é máis pequena ca a compilación actual con Qt Widgets en uns 45–80 MB** (12–21 %) unha vez retirado PySide6 do paquete.
2. **Ese aforro esixe retirar Qt do programa compilado.** Uns sete ficheiros que non son de interface aínda importan Qt (achado F1 do informe); o paso da capa de servizos elimínaos. Sen ese paso, PySide6 queda no paquete.
3. **A capa de interface é unha parte importante do resultado.** A pila do motor ronda os 364 MB (encabezada por OpenCV e SciPy); Qt Widgets engádelle un 12–21 % aproximadamente, e Qt WebEngine case duplica o programa.
4. **Tempo de descarga e actualización:** a capa de interface de 02 son uns 135–150 MB comprimidos fronte a uns 4 MB de 04, aproximadamente 2 minutos extra a 10 Mbit/s en cada instalación e cada actualización.
5. Non medido: o contorno de execución de Python, outras dependencias (clientes de Google, etc.), a sobrecarga de PyInstaller, a compresión de Inno Setup. Unha compilación real é a primeira tarefa de validación.

## 3. Puntuación A: experiencia do usuario final (principal)

| Criterio (peso dentro de A)                      | O que sente o usuario final                                                                                                                                                     |     01 |     02 |     03 |     04 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Estética e aspecto moderno (25)                  | tipografía, espazado, sombras, desenfoque, modo escuro, acabado                                                                                                                 |      2 |      5 |      5 |      5 |
| Interacción agradable (15)                       | transicións, resposta ao pasar o cursor ou enfocar, rapidez de resposta                                                                                                         |      2 |      5 |      5 |      5 |
| Eficacia (20)                                    | táboas densas, busca/filtro, paleta de comandos, uso do teclado, resposta clara, gráficos, accesibilidade                                                                       |      3 |      5 |      5 |      5 |
| Coherencia entre os PC Windows dos usuarios (10) | vese e compórtase igual en calquera equipo con Windows                                                                                                                          |      5 |      5 |      3 |      4 |
| Instalación e arranque (10)                      | tempo de arranque, sen requisitos previos, sensación de aplicación                                                                                                              |      5 |      3 |      3 |      4 |
| Comportamento de escritorio nativo (10)          | selectores reais de ficheiro/cartafol, impresión, arrastrar e soltar, funciona sen conexión                                                                                     |      5 |      5 |      2 |      4 |
| **Tamaño do programa compilado (10)**            | tamaño do instalador e da instalación, tempo de descarga e actualización (sección 2); 5 = o máis pequeno, 4 = ata +10 % sobre el, 3 = +10–25 %, 2 = +25–60 %, 1 = máis de +60 % |      3 |      1 |      5 |      5 |
| **Puntuación A (0–100)**                         |                                                                                                                                                                                 | **64** | **88** | **86** | **94** |

O que notaría un usuario final:

- **01** arranca rápido e compórtase coma calquera programa de escritorio, pero as pantallas parecen anticuadas e a interface segue sendo sinxela. O programa leva 55–90 MB de Qt.
- **02** ofrece a interface máis pulida e coherente, pero o programa é case o dobre de grande ca 04, cada instalación e actualización pesa uns 135–150 MB (comprimidos) máis, e o arranque é máis lento porque leva dentro un motor de navegador completo.
- **03** vese tan ben coma 02 e é a máis pequena, pero é unha lapela do navegador: lanza un servidor e un navegador, non pode ofrecer selectores de cartafol adecuados e depende do navegador que teña o usuario (Edge e Chrome comparten motor; Firefox non).
- **04** vese tan ben coma 02, ábrese na súa propia xanela coma un programa normal, usa selectores nativos de ficheiro e cartafol e é máis pequena ca o programa actual. Usa o motor WebView2 de Edge, presente en todos os equipos cliente; se algún día faltase, o programa recorre ao navegador (comportamento de 03).

## 4. Puntuación B: facilidade de implementala co contorno de execución de Python (secundaria)

| Criterio (peso dentro de B)               | O que pide                                                                    |     01 |     02 |     03 |     04 |
| ----------------------------------------- | ----------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Integración co motor (30)                 | chamar ao código Python, eventos de progreso para escaneos/copias, fíos       |      5 |      4 |      4 |      4 |
| Esforzo de compilación e empaquetado (30) | PyInstaller, contornos de execución a incluír, sinatura, cadea de publicación |      5 |      2 |      4 |      3 |
| Pezas móbiles que probar (20)             | cadeas de ferramentas, fronteiras entre procesos, contratos de ponte/API      |      5 |      2 |      3 |      3 |
| Reutilización do traballo existente (20)  | FastAPI xa na pila, prototipo existente, capa de servizos                     |      2 |      4 |      5 |      5 |
| **Puntuación B (0–100)**                  |                                                                               | **88** | **60** | **80** | **74** |

As comodidades só para desenvolvedores (recarga en quente, traspaso de deseño, grandes ecosistemas) **non** se puntúan; importan unicamente polo resultado para o usuario final que fan posible.

## 5. Decisión 1: Qt Widgets ou web?

|                                                |                      01 Qt Widgets |                          Interface web (02, 03, 04) |
| ---------------------------------------------- | ---------------------------------: | --------------------------------------------------: |
| Estética, interacción, eficacia                |                            2, 2, 3 |                                             5, 5, 5 |
| Coherencia entre os PC Windows dos usuarios    |                                  5 |                                                 3–5 |
| Instalación e arranque                         |                                  5 |                                                 3–4 |
| Comportamento de escritorio nativo             |                                  5 |                           2–5 (depende do contedor) |
| Tamaño do programa compilado                   | 3 (≈ 420–455 MB, 12–21 % sobre 04) | 1–5 (≈ 373–375 MB para 03/04; ≈ 705–735 MB para 02) |
| **Puntuación A: experiencia do usuario final** |                             **64** |                                           **86–94** |
| **Puntuación B: facilidade con Python**        |                             **88** |                                           **60–80** |

**Veredicto: web.** As opcións web dan aos usuarios finais unha interface claramente mellor (5 fronte a 2–3 en aspecto, interacción e eficacia), e os mellores contedores web son **máis pequenos ca a compilación con Qt**, porque prescinden dos binarios de Qt. As desvantaxes de Qt Widgets para o usuario final son **estruturais**: QSS non ten motores de maquetación, sombras reais, desenfoque nin transicións, e cada compoñente moderno debúxase a man. As desvantaxes da web son **tarefas identificables** (diálogos nativos, retirar Qt do motor, unha cadea de empaquetado).

Qt Widgets supera ao mellor contedor web (04) só se a experiencia do usuario final pesa **menos dun 32 % aproximadamente** (fronte a 03: 27 %; fronte a 02: 54 %). Co 80 % que se usa aquí, as opcións web gañan por 14–21 puntos combinados.

## 6. Decisión 2: que contedor web?

Os tres amosan o mesmo frontend React, así que o aspecto e a interacción son idénticos. O que cambia para o usuario final é a coherencia do renderizado, o tamaño, a instalación e o arranque, e o comportamento nativo.

| Aspecto                              | **02 Navegador integrado (Qt WebEngine)**         | **04 Xanela pywebview, alternativa con navegador externo**                                            | **03 Backend Python + navegador externo**                             |
| ------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Aspecto e interacción                | idénticos                                         | idénticos                                                                                             | idénticos                                                             |
| Coherencia do renderizado            | idéntica en todos os PC (Chromium incluído)       | moi próxima: Edge WebView2 baséase en Chromium, está en todos os equipos cliente e actualízao Windows | depende do navegador (Edge/Chrome comparten motor; Firefox non)       |
| O que ve o usuario                   | a xanela da aplicación Qt                         | unha pequena xanela nativa, sen marco de navegador                                                    | unha lapela ou xanela do navegador                                    |
| **Programa compilado (total)**       | **≈ 705–735 MB** (capa de interface ≈ 340–370 MB) | **≈ 375 MB** (capa de interface ≈ 11 MB; pywebview ≈ 2–3 MB de binarios, sen Qt)                      | **≈ 373 MB** (capa de interface ≈ 9 MB)                               |
| Descarga / actualización             | ≈ 263–276 MB                                      | ≈ 131 MB                                                                                              | ≈ 130 MB                                                              |
| Arranque                             | máis lento (motor Chromium)                       | rápido                                                                                                | arranca o servidor e despois ábrese o navegador                       |
| Requisitos previos                   | ningún                                            | ningún (WebView2 presente en todos os clientes)                                                       | un navegador moderno                                                  |
| Selectores de ficheiro/cartafol      | nativos (Qt)                                      | nativos (pywebview); en modo alternativo, mediante o servidor                                         | non dispoñibles desde un navegador; escritos ou abertos polo servidor |
| Impresión / PDF                      | impresión e PDF de Qt                             | vista web ou PDF xerado no servidor                                                                   | navegador ou PDF xerado no servidor                                   |
| Funciona sen conexión                | si                                                | si                                                                                                    | si                                                                    |
| Alternativa                          | non aplicable                                     | o lanzador abre o navegador externo se a xanela non pode iniciarse                                    | non aplicable                                                         |
| Actualizacións de seguranza do motor | requiren unha nova versión de piXeval             | WebView2 actualízase soa mediante Windows                                                             | seguen ao navegador do usuario                                        |
| Puntuación A / B                     | 88 / 60                                           | **94 / 74**                                                                                           | 86 / 80                                                               |

Notas:

- **04 supera a 02 para o usuario final (94 fronte a 88):** 02 é algo máis coherente, pero case o dobre de grande, máis lenta ao arrancar e máis lenta de actualizar. 04 tamén é máis fácil de implementar (74 fronte a 60).
- **A alternativa é unha función do lanzador, non algo que pywebview faga por si só,** e con WebView2 en todos os clientes é só unha rede de seguranza. En modo alternativo a experiencia baixa á de 03.
- **03 por si soa** é a máis pequena e a máis sinxela de entregar, pero é a opción web máis débil para os usuarios finais (86): sen selectores nativos e cun aspecto que depende do navegador.

**Veredicto: 04**, co navegador externo como alternativa de seguranza. 02 prefírese só se importa máis un motor de renderizado idéntico garantido ca un programa case o dobre de grande, ou se un servidor local é inaceptable.

## 7. Resultado combinado e sensibilidade

| Opción                                  | Puntuación A: experiencia do usuario final | Puntuación B: facilidade con Python | **Combinada (A 80 / B 20)** |
| --------------------------------------- | -----------------------------------------: | ----------------------------------: | --------------------------: |
| 01 PySide6 Widgets, modernizado         |                                         64 |                              **88** |                        68,8 |
| 02 Híbrido Qt WebEngine                 |                                         88 |                                  60 |                        82,4 |
| 03 Aplicación web local, navegador      |                                         86 |                                  80 |                        84,8 |
| **04 Aplicación web local + pywebview** |                                     **94** |                                  74 |                    **90,0** |

Vista en dous eixes (experiencia do usuario final arriba, facilidade de implementación á dereita):

```
 experiencia 94 |                   04
 do usuario  88 |        02
             86 |                   03
                |
             64 |                              01
                +-----------------------------------
                  60        74  80       88   facilidade con Python
```

Sensibilidade ao peso da experiencia do usuario final (A):

| Peso de A                            |       01 |   02 |       03 |       04 |
| ------------------------------------ | -------: | ---: | -------: | -------: |
| 100 % (só usuario final)             |     64,0 | 88,0 |     86,0 | **94,0** |
| 90 %                                 |     66,4 | 85,2 |     85,4 | **92,0** |
| 80 % (usado)                         |     68,8 | 82,4 |     84,8 | **90,0** |
| 70 %                                 |     71,2 | 79,6 |     84,2 | **88,0** |
| 60 %                                 |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                                 |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                                 |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                                 | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (só comodidade do desenvolvedor) | **88,0** | 60,0 |     80,0 |     74,0 |

Sensibilidade ao peso do criterio de tamaño dentro de A (os demais escálanse proporcionalmente; puntuación combinada con A 80 / B 20):

| Peso do tamaño dentro de A |   01 |   02 |   03 |       04 |
| -------------------------- | ---: | ---: | ---: | -------: |
| 0 % (tamaño ignorado)      | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (usado)               | 68,8 | 82,4 | 84,8 | **90,0** |
| 20 %                       | 68,5 | 76,3 | 86,1 | **90,6** |
| 30 %                       | 68,1 | 70,3 | 87,3 | **91,0** |

Conclusións:

1. **Para os usuarios finais as opcións web gañan con claridade:** 86–94 fronte a 64 de Qt Widgets. Qt Widgets só lidera cando a comodidade do desenvolvedor pesa máis ca a experiencia do usuario final (peso do usuario final inferior a un 32 % aproximadamente).
2. **04 queda primeira con calquera peso do usuario final entre o 100 % e preto do 43 %**; por debaixo, lidera 03 ata que domina a comodidade do desenvolvedor.
3. **O tamaño é o que frea a 02.** Se se ignora o tamaño, 02 sobe a 88,5, a menos dun punto de 04 (89,4); co peso usado (10 %) baixa a 82,4 (terceira); con pesos maiores baixa aínda máis.
4. **A vantaxe de tamaño dos contedores web depende de retirar Qt do programa compilado.** Sen iso, PySide6 (≈ 55–90 MB) queda no paquete e 04 tería aproximadamente o tamaño de 01.

## 8. Requisitos previos transversais (necesarios para calquera opción)

1. **Extraer unha capa de servizos** dos 103 ficheiros de interface que chaman directamente á capa de datos; definir funcións de casos de uso (p. ex. `grades.list(exam_id)`, `correction.run(folder)`).
2. **Substituír os sinais de Qt no código de lóxica** (`SignalInstance` en `cat_lib`, `utils`) por callbacks/eventos; retirar as 7 importacións de Qt dos módulos que non son de interface.
3. **Definir un único escritor** para SQLite (dúas interfaces abertas á vez non deben corromper nin bloquear a base de datos).
4. **Probas de caracterización** das fórmulas de cualificación, as saídas de OMR e a xeración de informes antes de refactorizar.

## 9. Folla de ruta suxerida (unha versión maior)

| Fase | Traballo                                                                                                                                                                            | Resultado                                                     | Criterio de saída                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| 0    | Revisar este informe; executar a proba de validación (tamaños reais do paquete con e sen Qt, diálogos nativos, rendemento de táboas)                                                | rexistro de decisión                                          | aprobación                                                            |
| 1    | Capa de servizos + eventos de progreso + probas de caracterización (sen cambios na interface)                                                                                       | paquete Python `pixeval_core` usado pola aplicación Qt actual | a aplicación actual sen cambios e en verde                            |
| 2    | API FastAPI para cada caso de uso; interface web construída pantalla a pantalla sobre ela, co prototipo existente como punto de partida                                             | nova interface completa nunha rama de desenvolvemento         | lista de paridade: cada pantalla, diálogo e informe actuais           |
| 3    | Diálogos nativos mediante pywebview; fluxos de OMR/corrección con fluxo de eventos; empaquetado (PyInstaller + Inno); apertura automática e migración das bases de datos existentes | candidata a versión instalable                                | supera as probas de extremo a extremo con bases de datos reais        |
| 4    | Beta pechada con usuarios e bases de datos reais; corrixir defectos; manter dispoñible o instalador anterior para volver atrás                                                      | aprobación da beta                                            | sen defectos bloqueantes durante un período acordado                  |
| 5    | Publicar como a próxima versión maior                                                                                                                                               | publicación                                                   | usuarios na nova versión; instalador anterior conservado unha versión |

## 10. Fontes

- Documentación de Qt, _User Interfaces_ (Widgets fronte á pila declarativa de Qt; notas sobre animación e aplicacións de escritorio complexas): <https://doc.qt.io/qt-6.9/topics-ui.html>
- Qt for Python, _QtWebChannel_: <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
- Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_: <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
- Metadatos de versións de PyPI e listas de ficheiros das rodas de Windows de PySide6 6.9.0 (Essentials, Addons), OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview e pythonnet (cifras de tamaño da sección 2): <https://pypi.org>
- Listaxe do paquete pywebview 6.x: <https://www.archlinux.org/packages/extra/any/python-pywebview>
