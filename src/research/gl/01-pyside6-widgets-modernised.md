# 01 · Quedar en PySide6 Widgets e modernizalo

**Nunha liña:** manter a aplicación de escritorio con Qt Widgets, rematar o redeseño xa iniciado en `src/modern_ui` e investir nun tema e nunha biblioteca de compoñentes axeitados.

## Que é

A mesma tecnoloxía de hoxe (PySide6 6.9, Qt Widgets, QSS), pero cun sistema de deseño deliberado: tokens de cor e espazado, tarxetas, táboas, diálogos e avisos reutilizables, un marco con barra lateral e unha separación limpa entre interface e servizos. `src/modern_ui` xa contén o comezo: `theme.py`, `buttons.py`, `inputs.py`, `table.py`, `surfaces.py`, un marco con barra lateral e superior, e xeración de recursos QRC.

## Como encaixa en piXeval

- Sen cambios no empaquetado (PyInstaller + Inno Setup), no contorno de execución nin no modelo dun só proceso.
- O código Python chama a código Python; sen API, sen ponte, sen unha segunda linguaxe.
- Os sinais de progreso (`SignalInstance`) seguen funcionando como están.

## Vantaxes

- **Menor risco técnico.** Nada novo que aprender, distribuír, asinar nin depurar.
- **Un proceso, unha linguaxe, totalmente sen conexión.** Nada escoita nun porto, así que non hai avisos do devasa nin do antivirus.
- **A integración nativa é gratuíta:** `QFileDialog`, impresión (`QtPrintSupport`), PDF (`QtPdf`), arrastrar e soltar, portapapeis, bandexa, diálogos do sistema.
- **Reutilízanse os recursos existentes e o coñecemento de Qt** (QSS, iconas SVG, Lottie, costumes de Qt Designer).
- Arranque rápido e pouca memoria fronte a un motor de navegador incluído. Os binarios de Qt do programa compilado ocupan uns 55–90 MB (Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7 MB, módulos de PySide6 ≈ 12 MB, complementos, opcionalmente OpenGL por software 20,6 MB), medido a partir das rodas de Windows.
- As táboas de datos grandes seguen sendo rápidas con `QAbstractItemModel` e `QTableView`.

## Inconvenientes

- **O teito de deseño é máis baixo e o custo por compoñente máis alto.** QSS é un subconxunto de CSS: sen flexbox/grid, sen sombras reais (`QGraphicsDropShadowEffect` é lento e recorta), sen desenfoque de fondo, sen variables CSS nin transicións. A propia documentación de Qt sinala que os Widgets «non escalan ben para animacións» (véxanse as fontes en [05](05-comparison-and-roadmap.md)).
- **Cada compoñente moderno constrúese a man.** A vista previa web (paleta de comandos, avisos, táboas filtrables, diálogos con lapelas, gráficos, estados baleiros) usa patróns listos para usar; en Widgets cada un é unha clase propia que hai que deseñar, pintar e probar.
- **Iteración de deseño lenta.** Un cambio visual implica reiniciar e executar; non hai recarga en quente nin inspector de ferramentas de desenvolvemento do navegador para QSS.
- **O redeseño segue sendo unha reescritura de ~70 mil liñas.** `src/modern_ui` ten 2,3 mil liñas fronte ás 71 mil da interface actual. Escoller esta opción non evita a reescritura; só conserva a linguaxe.
- **Ferramentas:** os deseños non se poden traspasar directamente (Figma → CSS é directo; Figma → QSS é manual), e o ecosistema público de compoñentes e exemplos de estilos para Qt Widgets é moito menor que o da interface web.
- **Probar a interface é máis difícil** (`pytest-qt` funciona, pero é moito menos habitual que as probas ao estilo Playwright/Cypress).
- As rarezas de alta densidade de píxeles, fontes e modo escuro cambian segundo o SO e requiren coidado manual.

## Vantaxes fronte ás demais opcións

- fronte ás opcións web (03, 04): sen servidor local, sen dependencia de WebView/Chromium, sen cadea de ferramentas JS, sen ponte que manter, sen superficie de seguranza por un servizo HTTP local.
- fronte ao híbrido (02): binario máis pequeno, empaquetado máis sinxelo, unha soa pila de renderizado.

## Desvantaxes fronte ás demais opcións

- A vía máis lenta cara a unha interface _visiblemente moderna_; cada detalle de pulido é a medida.
- Sen camiño cara a unha versión en rede local / remota / accesible desde navegador sen unha reescritura á parte.
- Ecosistema de compoñentes máis pequeno que o da web.

## Cando escollela

- O obxectivo é «mellor aspecto, mesmo produto», e un segundo contorno de execución ou límite de proceso é inaceptable (por exemplo, equipos illados sen conexión que bloquean servidores locais).

## Esforzo e riscos

- Esforzo: alto pero previsible; o traballo son as mesmas pantallas en calquera caso. O risco concéntrase nos compoñentes pintados a medida e en manter coherentes a interface antiga e a nova mentres coexisten.
- Primeiro: extraer servizos dos widgets (véxase o achado 3 en [00](00-baseline-current-stack.md)). Isto compensa en todas as opcións.
