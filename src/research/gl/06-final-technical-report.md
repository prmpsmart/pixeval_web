# Informe técnico: opcións para modernizar a interface de usuario de piXeval

**Asunto:** piXeval 7.6.2 (sistema de xestión de exames OMR)
**Elaborado por:** Miracle Apata, BEng
**Estado:** borrador para revisión — as notas de apoio están neste cartafol
**Artefacto complementario:** prototipo interactivo, <https://prmpsmart.github.io/pixeval_web/>

---

## Resumo

piXeval é unha aplicación de escritorio en Python para Windows cuxa interface de usuario está construída con PySide6 (Qt Widgets). A interface comprende unhas 71 000 liñas de código e é a principal limitación de usabilidade e calidade visual para as persoas que a usan a diario, mentres que o motor de procesamento (OMR, base de datos, informes) ten unhas 21 000 liñas e é en gran parte independente de Qt. Este informe avalía formas de mellorar a interface conservando o motor Python e sen incorrer en custos de licenza nin de aloxamento, como dúas decisións. **Decisión 1:** modernizar Qt Widgets (01) ou pasar a un frontend web (React, etc.). **Decisión 2**, se é web: presentalo como navegador integrado dentro de Qt (Qt WebEngine, 02), nunha xanela de pywebview co navegador externo como alternativa de seguranza (04), ou con Python como backend e o navegador externo usado directamente (03). A migración farase unha soa vez, como unha única versión maior. O **foco principal é o usuario final**: a puntuación principal (80 %) mide o que viven os usuarios (estética e aspecto moderno, interacción agradable, eficacia, coherencia, instalación e arranque, comportamento nativo e **o tamaño do programa compilado**); unha puntuación secundaria (20 %) mide a facilidade de implementación co contorno de execución de Python. Medido a partir das rodas de Windows, Qt engade uns 55–90 MB ao resultado compilado (Widgets) ou uns 340–370 MB (con WebEngine), mentres que pywebview engade uns 2–3 MB de binarios e toda a capa de interface web uns 11 MB (o motor Edge WebView2 forma parte de Windows e está dispoñible en todos os equipos cliente). As opcións web puntúan 86–94 sobre 100 en experiencia do usuario final fronte a 64 de Qt Widgets, que é máis fácil de implementar (88 fronte a 60–80). Qt Widgets só gaña se a experiencia do usuario final pesa menos dun terzo aproximadamente. Entre os contedores web, a xanela de pywebview queda primeira (94) por diante do navegador integrado de Qt (88), freado polo seu tamaño (case o dobre do programa compilado) e o seu arranque. A dirección recomendada é **un motor Python (FastAPI) cunha interface web presentada nunha xanela nativa de pywebview, con «abrir no navegador» como alternativa**, precedida por unha refactorización da capa de servizos necesaria con calquera opción. Varias magnitudes (tamaño real do instalador, tempo de arranque, rendemento con táboas grandes) non se mediron nunha compilación real e enuméranse como tarefas de validación.

---

## 1. Introdución

### 1.1 Antecedentes

piXeval dá soporte a todo o ciclo de vida dun exame tipo test en papel: bancos de preguntas, composición de exames, xeración de follas de respostas, escaneo e recoñecemento óptico de marcas (OMR), asignación de identidades, corrección, notas e informes. Distribúese como un instalador de Windows creado con PyInstaller e Inno Setup.

### 1.2 Formulación do problema

Os usuarios interactúan co produto mediante unha interface baseada en Widgets con estilo de follas de estilo de Qt. Conseguir un aspecto e unha calidade de interacción contemporáneos (transicións animadas, táboas densas pero lexibles, busca de comandos, deseños adaptables, tokens de deseño coherentes) é lento e custoso con esta pila. A pregunta é se outra tecnoloxía de interface ofrece unha mellor experiencia de usuario a un custo e risco aceptables.

### 1.3 Obxectivos e restricións

1. **Principal: o usuario final.** Mellorar o que os usuarios ven e viven cada día: unha interface agradable, eficaz, estética e moderna que ademais se instale, arranque e se comporte ben nos seus equipos. A comodidade do desenvolvedor é secundaria.
2. **Secundario:** que esa experiencia sexa sinxela de implementar e entregar co motor Python no cadro (o motor en si consérvase).
3. **Non introducir ningún custo recorrente novo** (licenzas, aloxamento, subscricións).
4. Conservar a experiencia de aplicación instalada en **Windows** (a única plataforma de destino): arranque, traballo sen conexión, acceso a ficheiros locais e á saída do escáner.
5. Migrar **unha soa vez**: a nova interface substitúe á antiga nunha única versión maior que chega a todos os usuarios. Non hai migración incremental nin en paralelo, polo que a fiabilidade da versión e a paridade de funcións importan máis.
6. O tamaño do equipo, os seus coñecementos e a familiaridade coas linguaxes **non** se tratan como restricións. As opcións xúlganse polo seu mérito técnico; unha linguaxe nova non conta como custo en si mesma, mentres que os contornos de execución adicionais, as cadeas de compilación e as fronteiras entre procesos si.

### 1.4 Alcance

Só se consideran a capa de presentación e a súa integración co motor. Os algoritmos de OMR, as regras de cualificación e o esquema da base de datos non cambian.

---

## 2. Análise do sistema actual

Medido a partir do repositorio (detalles en [00-baseline-current-stack.md](00-baseline-current-stack.md)):

| Capa                                                             | Ficheiros |          Liñas | Dependencia de Qt |
| ---------------------------------------------------------------- | --------: | -------------: | ----------------- |
| Interface (`src/ui`)                                             |       194 |         71 077 | completa          |
| Redeseño en curso (`src/modern_ui`)                              |        28 |          2 301 | completa          |
| Base de datos (`src/db`)                                         |         7 |          3 648 | 1 ficheiro        |
| OMR (`src/omr`, máis unha copia do mesmo tamaño `src/omr_audit`) |  16 (+16) | 6 704 (+6 704) | ningunha          |
| Envoltorio do motor CAT (`src/cat_lib`)                          |        13 |          4 832 | 3 ficheiros       |
| Informes (`src/dataReports`)                                     |         9 |            830 | 1 ficheiro        |
| Utilidades (`src/utils`)                                         |        28 |          5 242 | 2 ficheiros       |

Achados que guían a análise:

- **F1 — O motor é separable.** Unhas 21 000 liñas de lóxica usan Qt só en uns sete ficheiros, sobre todo para sinais de progreso e tipos de imaxe.
- **F2 — A interface é o maior volume de traballo.** É aproximadamente 3,4 veces o tamaño do motor. Sexa cal sexa a tecnoloxía elixida, un redeseño supón reimplementar as pantallas; o esforzo actual de `modern_ui` é xa unha reescritura deste tipo e está completado ao redor dun 3 % por número de liñas.
- **F3 — Presentación e lóxica están entremesturadas.** 103 dos 194 ficheiros de interface importan a capa de datos, e pantallas como a de notas len e modifican obxectos de dominio directamente. Unha capa de servizos é, polo tanto, un requisito previo para calquera novo frontend.
- **F4 — Xa hai unha pila web.** FastAPI 0.115, Uvicorn e Starlette están nos requisitos e úsaos o servizo CAT remoto.
- **F5 — O empaquetado está establecido.** PyInstaller + Inno Setup entregan un instalador de Windows; calquera opción debería reutilizalo cando sexa posible.
- **F6 — Úsanse diálogos nativos de ficheiro** (nove puntos de chamada en cinco ficheiros para cartafoles de escaneo, copias de seguranza e exportación). As rutas de cartafol son un requisito operativo, o que afecta ás solucións só de navegador.

---

## 3. Método de avaliación

### 3.1 Dúas puntuacións

**Puntuación A: experiencia do usuario final (principal, 80 % da puntuación combinada).**

| Criterio                                    | Peso dentro de A | O que sente o usuario final                                                                                           |
| ------------------------------------------- | ---------------: | --------------------------------------------------------------------------------------------------------------------- |
| Estética e aspecto moderno                  |               25 | tipografía, espazado, sombras, desenfoque, modo escuro, acabado                                                       |
| Interacción agradable                       |               15 | transicións, resposta ao pasar o cursor ou enfocar, rapidez de resposta                                               |
| Eficacia                                    |               20 | táboas densas, busca/filtro, paleta de comandos, uso do teclado, resposta clara, gráficos, accesibilidade             |
| Coherencia entre os PC Windows dos usuarios |               10 | vese e compórtase igual en calquera equipo con Windows (versións, navegadores, contornos de execución)                |
| Instalación e arranque                      |               10 | tempo de arranque, requisitos previos, sensación de aplicación                                                        |
| Comportamento de escritorio nativo          |               10 | selectores reais de ficheiro/cartafol, impresión, arrastrar e soltar, funciona sen conexión (achado F6)               |
| **Tamaño do programa compilado**            |               10 | tamaño do instalador e da instalación, tempo de descarga e actualización (medido a partir das rodas de Windows, §5.1) |

**Puntuación B: facilidade de implementala co contorno de execución de Python (secundaria, 20 %).**

| Criterio                             | Peso dentro de B | Pregunta                                                                      |
| ------------------------------------ | ---------------: | ----------------------------------------------------------------------------- |
| Integración co motor                 |               30 | chamar ao código Python, eventos de progreso para escaneos/copias, fíos       |
| Esforzo de compilación e empaquetado |               30 | PyInstaller, contornos de execución a incluír, sinatura, cadea de publicación |
| Pezas móbiles que probar             |               20 | cadeas de ferramentas, fronteiras entre procesos, contratos de ponte/API      |
| Reutilización do traballo existente  |               20 | FastAPI xa na pila, prototipo existente, capa de servizos                     |

As comodidades só para desenvolvedores (recarga en quente, traspaso de deseño, grandes ecosistemas) deliberadamente **non** se puntúan; importan unicamente polo resultado para o usuario final que fan posible.

### 3.2 Método e limitacións

Cada opción puntúase de 1 a 5 por criterio a partir da documentación, guías publicadas e as métricas de código anteriores. **As puntuacións son xuízo experto e non medicións.** As tres opcións web puntúan igual en aspecto, interacción e eficacia por construción (mesma plataforma web); distínguense pola coherencia, a instalación/arranque e o comportamento nativo, e pola Puntuación B. Aínda non se realizou ningunha proba comparativa de ningunha opción dentro de piXeval nin ningunha proba de usabilidade con usuarios reais.

---

## 4. Solucións candidatas

As descricións completas con vantaxes, inconvenientes e comparacións están en [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md) e [04](04-pywebview-native-window.md); a puntuación está en [05](05-comparison-and-roadmap.md).

**01 — Modernizar PySide6 Widgets.** Menor risco técnico e mellor integración nativa; sen conexión, un só proceso, sen ferramentas novas. Pero QSS é un subconxunto de CSS (sen motores de maquetación, efectos nin transicións), cada compoñente moderno hai que construílo a medida, a iteración é lenta e o ecosistema de compoñentes feitos é pequeno. Non evita a reescritura de unhas 70 000 liñas de interface; só conserva o kit de ferramentas. _Motivo para escollela:_ non se acepta unha fronteira de proceso nin un contorno de execución adicional. _Motivo para non escollela:_ o teito de interface máis baixo.

**02 — Híbrido Qt WebEngine.** Incrustar pantallas web (Chromium) na aplicación Qt existente e conectalas con QtWebChannel. Conserva o contedor Qt actual (xanela, menús, impresión, diálogos nativos) e non precisa servidor local. Os custos son o tamaño do programa compilado (QtWebEngine engade uns 256 MB de ficheiros aos 55–90 MB de Qt Widgets), a complexidade de empaquetar Chromium e unha ponte asíncrona. Cunha versión única, a súa principal fortaleza (migrar pantalla a pantalla) non fai falta. _Motivo para escollela:_ hai que conservar o contedor Qt tal cal e non se acepta ningún servidor local. _Motivo para non escollela:_ con diferenza a máis pesada das catro (uns 340–370 MB de Qt no programa compilado, case duplicándoo).

**03 — Aplicación web local no navegador.** FastAPI serve unha interface React; un lanzador abre o navegador predeterminado. Máxima liberdade de deseño e ecosistema, crecemento mínimo do instalador e reutiliza FastAPI. Os navegadores non poden devolver rutas reais de ficheiro, un servidor en localhost precisa xestión do ciclo de vida e endurecemento de seguranza (enlace a loopback, tokens, comprobacións de orixe) e o produto parécese a un sitio web. _Motivo para escollela:_ a vía máis rápida e lixeira. _Motivo para non escollela:_ xestión de rutas de ficheiro e sensación de escritorio.

**04 — Aplicación web local nunha xanela de pywebview.** 03 máis unha xanela nativa que usa a vista web do sistema operativo e os diálogos nativos de ficheiro. Resolve a principal carencia funcional de 03, non engade ningún paquete de Chromium (o motor WebView2 forma parte de Windows e está en todos os equipos cliente), engade só uns 2–3 MB de binarios ao programa compilado e conserva a cadea de PyInstaller. Custos: dependencia do backend de Windows de pywebview baseado en pythonnet, unha base reducida de mantedores e poucos extras de escritorio (sen actualización automática nin bandexa integradas). _Motivo para escollela:_ sensación de escritorio coa menor pegada distribuída. _Motivo para non escollela:_ depende dun paquete correcto de PyInstaller con pywebview e pythonnet, que debe demostrarse na proba de validación.

---

## 5. Análise comparativa

### 5.1 Tamaño do programa compilado

Os binarios de Qt forman parte do resultado compilado sempre que interviña Qt. As cifras están **medidas a partir das rodas de Windows en PyPI** (listas de ficheiros de PySide6 6.9.0 Essentials e Addons, OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview, pythonnet), non dunha compilación real. As táboas completas están en [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

| Capa de interface | Que se inclúe                                                                                                                                                              | Engadido descomprimido | Engadido comprimido |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------: | ------------------: |
| 01 Qt Widgets     | Qt6 Core/Gui/Widgets/Pdf/PrintSupport, módulos de PySide6, complementos (opcionalmente OpenGL por software, traducións)                                                    |             ≈ 55–90 MB |          ≈ 20–33 MB |
| 02 Qt WebEngine   | o anterior **máis** `Qt6WebEngineCore.dll` (199,5 MB), traducións, paquetes de recursos (255,7 MB de ficheiros de WebEngine en total) e Quick/Qml/Network ≈ 26 MB          |           ≈ 340–370 MB |        ≈ 135–150 MB |
| 03 Navegador      | FastAPI/Uvicorn/Starlette/Pydantic ≈ 9 MB, frontend web 0,34 MB; sen Qt, sen motor de navegador                                                                            |                 ≈ 9 MB |              ≈ 3 MB |
| 04 pywebview      | o anterior **máis** pywebview 1,6 MB (cargador de WebView2 e DLL de interoperabilidade ≈ 1 MB) e pythonnet 0,7 MB; o motor WebView2 forma parte de Windows e non se inclúe |                ≈ 11 MB |              ≈ 4 MB |

| Programa compilado completo | Descomprimido | Comprimido (aproximación) | Comparado con 04 |
| --------------------------- | ------------: | ------------------------: | ---------------: |
| 01 Qt Widgets               |  ≈ 420–455 MB |              ≈ 147–160 MB |      +12 a +21 % |
| 02 Qt WebEngine             |  ≈ 705–735 MB |              ≈ 263–276 MB |      +88 a +96 % |
| 03 Navegador                |      ≈ 373 MB |                  ≈ 130 MB |             −1 % |
| 04 pywebview                |      ≈ 375 MB |                  ≈ 131 MB |       referencia |

- **pywebview non ten binarios do tamaño de Qt:** engade uns 2–3 MB, fronte a uns 55–90 MB de Qt Widgets e 340–370 MB con WebEngine.
- **A pila común do motor ronda os 364 MB descomprimidos (≈ 127 MB comprimidos),** encabezada por OpenCV (110 MB) e SciPy (116 MB). A capa de interface é, polo tanto, unha parte importante do resultado: Qt Widgets engade un 12–21 % e Qt WebEngine case duplica o programa.
- **Os contedores web son máis pequenos ca a compilación actual con Qt só se se retira Qt do programa compilado,** o que esixe eliminar os ~7 ficheiros que non son de interface e que importan Qt (achado F1).
- Non medido: o contorno de execución de Python, outras dependencias, a sobrecarga de PyInstaller, a compresión do instalador. Unha compilación real é a primeira tarefa de validación.

### 5.2 Decisión 1: Qt Widgets ou web?

|                                                          |                      01 Qt Widgets |                          Interface web (02, 03, 04) |
| -------------------------------------------------------- | ---------------------------------: | --------------------------------------------------: |
| Estética, interacción, eficacia (aspecto e uso)          |                            2, 2, 3 |                                             5, 5, 5 |
| Coherencia, instalación e arranque, comportamento nativo |                            5, 5, 5 |                 3–5, 3–4, 2–5 (depende do contedor) |
| Tamaño do programa compilado                             | 3 (≈ 420–455 MB, 12–21 % sobre 04) | 1–5 (≈ 373–375 MB para 03/04; ≈ 705–735 MB para 02) |
| **Puntuación A: experiencia do usuario final**           |                             **64** |                                           **86–94** |
| **Puntuación B: facilidade con Python**                  |                             **88** |                                           **60–80** |

As opcións web dan aos usuarios finais unha interface claramente mellor, e os mellores contedores web son **máis pequenos ca a compilación con Qt** porque prescinden dos binarios de Qt. Os límites de Qt Widgets son estruturais (QSS non ten motores de maquetación, sombras reais, desenfoque nin transicións; os compoñentes modernos debúxanse a man); os custos da web son tarefas identificables. Qt Widgets supera ao mellor contedor web só se a experiencia do usuario final pesa menos dun 32 % aproximadamente (fronte a 03: 27 %; fronte a 02: 54 %).

### 5.3 Decisión 2: que contedor web?

| Aspecto                         | **02 Navegador integrado (Qt WebEngine)**         | **04 Xanela pywebview + alternativa de navegador**                                                       | **03 Backend Python + navegador externo** |
| ------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Aspecto e interacción           | idénticos                                         | idénticos                                                                                                | idénticos                                 |
| Coherencia do renderizado       | idéntica en todos os PC                           | moi próxima (Edge WebView2, baseado en Chromium, presente en todos os clientes, actualizado por Windows) | depende do navegador                      |
| O que ve o usuario              | a xanela da aplicación Qt                         | unha pequena xanela nativa                                                                               | unha lapela ou xanela do navegador        |
| **Programa compilado (total)**  | **≈ 705–735 MB** (capa de interface ≈ 340–370 MB) | **≈ 375 MB** (capa de interface ≈ 11 MB)                                                                 | **≈ 373 MB** (capa de interface ≈ 9 MB)   |
| Descarga / actualización        | ≈ 263–276 MB                                      | ≈ 131 MB                                                                                                 | ≈ 130 MB                                  |
| Arranque                        | máis lento                                        | rápido                                                                                                   | servidor e despois o navegador            |
| Requisitos previos              | ningún                                            | ningún (WebView2 presente en todos os clientes)                                                          | un navegador moderno                      |
| Selectores de ficheiro/cartafol | nativos (Qt)                                      | nativos (pywebview); mediante o servidor en modo alternativo                                             | non desde un navegador                    |
| Puntuación A / B                | 88 / 60                                           | **94 / 74**                                                                                              | 86 / 80                                   |

A alternativa é unha función do lanzador, non un comportamento integrado en pywebview: o lanzador proba a xanela e abre o navegador predeterminado no mesmo enderezo se falla. Con WebView2 en todos os clientes é só unha rede de seguranza. 04 e 03 son unha mesma base de código con dous modos de presentación.

### 5.4 Puntuacións combinadas

| Opción                     | Puntuación A: experiencia do usuario final | Puntuación B: facilidade con Python | **Combinada (A 80 / B 20)** |
| -------------------------- | -----------------------------------------: | ----------------------------------: | --------------------------: |
| 01 Qt Widgets, modernizado |                                         64 |                              **88** |                        68,8 |
| 02 Híbrido Qt WebEngine    |                                         88 |                                  60 |                        82,4 |
| 03 Navegador               |                                         86 |                                  80 |                        84,8 |
| **04 Xanela pywebview**    |                                     **94** |                                  74 |                    **90,0** |

As puntuacións por criterio, os motivos e a vista de dous eixes están en [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

### 5.5 Sensibilidade

| Peso de A                            |       01 |   02 |       03 |       04 |
| ------------------------------------ | -------: | ---: | -------: | -------: |
| 100 % (só usuario final)             |     64,0 | 88,0 |     86,0 | **94,0** |
| 80 % (usado)                         |     68,8 | 82,4 |     84,8 | **90,0** |
| 60 %                                 |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                                 |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                                 |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                                 | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (só comodidade do desenvolvedor) | **88,0** | 60,0 |     80,0 |     74,0 |

| Peso do criterio de tamaño dentro de A |   01 |   02 |   03 |       04 |
| -------------------------------------- | ---: | ---: | ---: | -------: |
| 0 % (tamaño ignorado)                  | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (usado)                           | 68,8 | 82,4 | 84,8 | **90,0** |
| 30 %                                   | 68,1 | 70,3 | 87,3 | **91,0** |

Interpretación:

1. **Para os usuarios finais as opcións web gañan con claridade** (86–94 fronte a 64). Qt Widgets só lidera cando a comodidade do desenvolvedor pesa máis ca a experiencia do usuario final (peso do usuario final inferior a un 32 % aproximadamente).
2. **04 queda primeira con calquera peso entre o 100 % e preto do 43 %.**
3. **O tamaño é o que frea a 02.** Se se ignora o tamaño, 02 queda a menos dun punto de 04 (88,5 fronte a 89,4); co peso usado baixa a 82,4 (terceira), e máis aínda canto máis importa o tamaño.

### 5.6 A experiencia desde o lado do usuario final

- **01:** arranca rápido e séntese como un programa de escritorio normal, pero as pantallas parecen anticuadas; o programa leva 55–90 MB de Qt.
- **02:** a interface máis pulida e coherente, pero o programa é case o dobre de grande ca 04, cada instalación e actualización pesa uns 135–150 MB (comprimidos) máis e o arranque é máis lento.
- **03:** vese tan ben coma as demais e é a máis pequena, pero vive nunha lapela do navegador: sen selectores de cartafol adecuados e cun aspecto que depende do navegador do usuario.
- **04:** vese tan ben coma 02, ábrese na súa propia xanela, usa selectores nativos, arranca rápido e é máis pequena ca o instalador actual; usa o motor Edge WebView2 que xa está en todos os clientes.

---

## 6. Recomendación

### 6.1 Arquitectura proposta

```
 lanzador de piXeval (PyInstaller)
   ├─ Motor Python: db / omr / cat_lib / dataReports   (código existente, tras unha capa de servizos)
   ├─ FastAPI + Uvicorn en 127.0.0.1 (token por arranque)  ← xa na pila
   ├─ Interface React + TypeScript (compilación estática servida por FastAPI)
   └─ contedor: xanela nativa de pywebview  ── alternativa: navegador do sistema
```

### 6.2 Xustificación (Decisión 1: web; Decisión 2: pywebview)

1. **Cumpre as restricións formuladas:** o motor segue sendo Python; React, FastAPI, pywebview e as bibliotecas de apoio son de código aberto con licenzas permisivas (por confirmar compoñente a compoñente antes da publicación), polo que non xorde custo de licenza nin de aloxamento.
2. **Dá aos usuarios finais a mellor experiencia (94 sobre 100, por diante do 88 de 02) cunha mellor puntuación de implementación (74 fronte a 60):** a plataforma web ofrece o maior conxunto de compoñentes maduros e accesibles (táboas, diálogos, gráficos, busca de comandos, xestión do teclado) e un deseño visual moderno. O prototipo demostra o resultado: 30 ficheiros fonte de páxinas e diálogos e unhas 3 400 liñas de TypeScript e CSS reproducen as pantallas e diálogos do fluxo principal de piXeval (de materias a notas, utilidades e configuración) cun deseño moderno e un comportamento operativo de crear/editar/eliminar sobre datos de exemplo. As aplicacións auxiliares do repositorio (EBAP, CAT3 Audit) non están cubertas.
3. **Pecha a principal carencia funcional da opción de navegador** (rutas reais de ficheiro) mediante diálogos nativos expostos por pywebview, e evita distribuír Chromium: a capa de interface engade uns 11 MB ao resultado compilado, fronte a uns 340–370 MB do navegador integrado de Qt, e uns 45–80 MB menos ca a compilación actual con Qt unha vez retirado Qt (un 12–21 % máis pequena).
4. **As regresións detéctanse antes de que as vexan os usuarios:** o código tipado (TypeScript) e as probas automáticas de navegador (Playwright) comproban cada pantalla con bases de datos de exemplo reais antes da publicación, algo que importa nunha actualización maior de unha soa vez.
5. **Mantén pequenos o programa compilado e as súas actualizacións:** un executable de Python máis o motor WebView2 de Windows xa presente en cada cliente, reutilizando a cadea existente de PyInstaller e Inno Setup.
6. **Mantén abertas opcións futuras:** a mesma API pode dar soporte máis adiante a un despregamento en rede local ou remoto, algo que a opción só con Qt non pode.
7. **É en parte reversible:** se a vista web do sistema operativo resultase inadecuada, a mesma compilación web execútase no navegador (03) ou dentro de Qt WebEngine (02) sen reescribir a interface, o que limita o dano dunha mala escolla de contedor antes da versión única.

### 6.3 Por que non se seleccionaron as outras tres

- **01:** a máis fácil de implementar (88) e a publicación máis segura, pero os usuarios finais obteñen a experiencia máis débil (64): debuxo a medida para cada compoñente moderno, sen efectos nin transicións reais, un aspecto anticuado. Deixaría o obxectivo principal en gran parte sen cumprir.
- **02:** experiencia do usuario final próxima a 04 (88 fronte a 94) co renderizado máis coherente, pero a súa capa de interface engade uns 340–370 MB ao programa compilado (uns 135–150 MB máis de descarga, en cada instalación e actualización), arranca máis lenta e é máis difícil de implementar (60 fronte a 74): Chromium no instalador, empaquetado de QtWebEngine e unha ponte asíncrona. É a escolla se un motor de renderizado idéntico garantido importa máis ca o tamaño, ou se un servidor local é inaceptable.
- **03:** o mesmo frontend co navegador do usuario como xanela: a máis sinxela de entregar (80) e a máis pequena, pero a opción web máis débil para os usuarios finais (86): sen selectores nativos de ficheiro e cun aspecto que varía segundo o navegador. Consérvase como **modo alternativo de 04**.

---

## 7. Riscos e mitigacións

| Risco                                                                                                                 | Probabilidade / impacto | Mitigación                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A lóxica de negocio incrustada nos widgets extráese mal                                                               | alta / alto             | probas de caracterización das saídas de cualificación, OMR e informes antes de refactorizar (F3)                                                                                                                       |
| Defectos introducidos durante a reescritura da interface (incluído o código xerado por IA) nos fluxos de notas ou OMR | media / alto            | manter o motor sen cambios; TypeScript estrito; probas unitarias da capa de servizos; probas de extremo a extremo (Playwright) con bases de datos de exemplo reais; revisión humana de cada cambio que afecte ás notas |
| Diferenzas entre versións de Windows ou entre versións do contorno de execución de WebView2                           | baixa / medio           | probar en Windows 10 e 11; evitar CSS/JS de vangarda; a alternativa de navegador segue sendo unha rede de seguranza                                                                                                    |
| O backend de Windows de pywebview depende de pythonnet e pode empaquetarse mal con PyInstaller                        | media / alto            | demostrar o paquete na proba de validación; manter a alternativa de navegador                                                                                                                                          |
| Servidor local exposto a outros procesos locais                                                                       | media / alto            | enlazar a loopback, porto aleatorio, token por arranque, comprobacións estritas de orixe                                                                                                                               |
| Unha regresión ou unha función ausente chega a todos os usuarios á vez (sen despregamento incremental)                | alta / alto             | lista escrita de paridade de cada pantalla, diálogo e informe; probas de extremo a extremo con bases de datos reais; beta pechada antes da publicación                                                                 |
| As bases de datos de usuario existentes non se abren ou non se migran                                                 | media / alto            | a nova versión abre as bases de datos actuais sen cambios de esquema; copia de seguranza automática antes da primeira apertura; conservar o instalador anterior para volver atrás                                      |
| Dúas versións instaladas en paralelo escriben nun mesmo ficheiro SQLite                                               | baixa / alto            | servizo de escritor único; o instalador detecta e avisa dunha instalación anterior                                                                                                                                     |
| As táboas grandes ou as pantallas con moitas imaxes van lentas                                                        | media / media           | táboas virtualizadas; proba con máis de 5 000 filas; miniaturas para os escaneos                                                                                                                                       |
| Dependencia dun único mantedor (pywebview)                                                                            | media / media           | capa fina de abstracción sobre o contedor; alternativa ao navegador ou a Qt WebEngine                                                                                                                                  |
| Perdese o aforro de tamaño porque Qt queda no programa compilado                                                      | media / media           | eliminar as ~7 importacións de Qt de módulos que non son de interface no paso da capa de servizos; comprobar o contido do paquete na proba de validación                                                               |
| Crecemento do alcance polas varias aplicacións do repositorio (EBAP, CAT3 Audit)                                      | media / media           | migrar primeiro piXeval; reutilizar despois o sistema de deseño                                                                                                                                                        |

---

## 8. Plan de implementación (unha versión maior)

| Fase | Traballo                                                                                                                                    | Criterio de saída                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 0    | Revisar o informe; executar a proba de validación (§9)                                                                                      | rexistro de decisión                                                                 |
| 1    | Capa de servizos; substituír os sinais de Qt por callbacks/eventos; probas de caracterización                                               | a aplicación Qt actual sen cambios e superando as probas                             |
| 2    | API FastAPI para cada caso de uso; construír a interface web completa sobre ela, partindo do prototipo                                      | lista de paridade: cada pantalla, diálogo e informe actuais                          |
| 3    | Diálogos nativos mediante pywebview; fluxos de OMR e corrección con eventos de progreso; instalador; apertura das bases de datos existentes | a candidata a versión supera as probas de extremo a extremo con bases de datos reais |
| 4    | Beta pechada con usuarios e bases de datos reais; corrixir defectos; manter dispoñible o instalador anterior para volver atrás              | aprobación da beta                                                                   |
| 5    | Publicar como a próxima versión maior                                                                                                       | usuarios na nova versión; instalador anterior conservado unha versión                |

---

## 9. Tarefas de validación antes de comprometerse (aínda non realizadas)

1. Crear un paquete de PyInstaller de FastAPI + pywebview (incluída a súa dependencia pythonnet) **sen Qt**, e **medir o tamaño do instalador, o tamaño instalado e o arranque en frío** fronte ao instalador actual; repetir o paquete con Qt WebEngine para comparalo.
2. Comprobar o comportamento da xanela de pywebview en **Windows 10 e 11** (WebView2 está dispoñible en todos os equipos cliente).
3. Prototipar a **ponte do diálogo nativo de cartafol** e un escaneo de longa duración con fluxo de eventos.
4. Medir o rendemento da **táboa de notas con máis de 5 000 filas** e dunha pantalla de revisión de imaxes escaneadas.
5. Realizar unha **comparación de usabilidade** (tempo de tarefa e erros) entre unha pantalla actual de Qt e o seu equivalente web con uns poucos usuarios reais.
6. Revisar as **licenzas** de cada dependencia do paquete (incluídos os compoñentes LGPL se Qt permanece na compilación).

---

## 10. Consideracións de custo

Todos os compoñentes da pila recomendada (Python, FastAPI, React, TypeScript, pywebview, Vite) son de código aberto; o único custo é o tempo de desenvolvemento. As opcións baseadas en Qt tampouco teñen tarifa sempre que se respecten os termos da LGPL. O esforzo de desenvolvemento dominao a reimplementación da interface (F2), que todas as opcións comparten; a revisión e as probas seguen sendo necesarias sexa cal sexa a forma de escribir o código.

---

## 11. Limitacións deste estudo

- As puntuacións son xuízos; a análise de sensibilidade mostra como cambian, pero non elimina a subxectividade.
- Non se mediron o tamaño do instalador, o rendemento nin os datos dos equipos de destino (§9).
- Os datos tecnolóxicos externos (Qt, pywebview) proceden da documentación pública e dos artigos citados máis abaixo; os números de versión e o estado dos proxectos cambian con rapidez e deben volver comprobarse no momento de decidir.
- Os recontos de liñas miden o tamaño, non a complexidade; indican o esforzo relativo, pero non o esforzo exacto.
- O prototipo usa datos de exemplo e non executa o motor real.

---

## 12. Conclusión

O motor de procesamento de piXeval é en gran parte independente da súa interface de usuario, polo que substituír a tecnoloxía da interface é tecnicamente viable sen saír de Python. Todas as opcións requiren o mesmo primeiro paso, unha capa de servizos. A plataforma web dá aos usuarios finais unha experiencia claramente mellor (86–94 sobre 100 fronte a 64 de Qt Widgets). Un motor Python con esa interface nunha xanela nativa alcanza a mellor puntuación de usuario final (94, fronte a 88 do navegador integrado Qt WebEngine) cunha mellor puntuación de implementación (74 fronte a 60), e cun programa compilado moito máis pequeno (uns 11 MB para a capa de interface fronte a uns 340–370 MB con Qt WebEngine, que case duplicaría o programa; un 12–21 % máis pequeno ca a compilación actual con Qt Widgets), co navegador externo como alternativa de seguranza. Qt Widgets preferiríase só se a comodidade do desenvolvedor contase máis de dous terzos da decisión. Como a migración é unha única versión, o risco dominante é a calidade da publicación e non a vía de migración, polo que unha lista de paridade, unha beta pechada e unha vía de retroceso forman parte do plan. O seguinte paso é o traballo de validación do §9, que pode completarse nunha proba breve e de baixo risco antes de calquera investimento importante.

---

## Referencias

1. Documentación de Qt, _User Interfaces_ (Widgets, animación e aplicacións de escritorio complexas), <https://doc.qt.io/qt-6.9/topics-ui.html>
2. Qt for Python, _QtWebChannel_, <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
3. Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_, <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
4. Listaxe do paquete pywebview 6.x, <https://www.archlinux.org/packages/extra/any/python-pywebview>
5. Métricas do repositorio de piXeval: [00-baseline-current-stack.md](00-baseline-current-stack.md)
