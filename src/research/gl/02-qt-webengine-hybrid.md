# 02 · Híbrido: marco PySide6 + interface web dentro de Qt WebEngine

**Nunha liña:** manter a aplicación PySide6 (xanela, menús, diálogos, impresión, licenzas) e mostrar as pantallas como páxinas web nun Chromium incrustado (`QWebEngineView`), comunicándose con Python mediante `QWebChannel`.

## Que é

Qt WebEngine incrusta Chromium como un widget. `QtWebChannel` ofrece comunicación directa entre obxectos Python e JavaScript na páxina (compatible de serie con WebEngine). As pantallas web poden construírse con React/Vite, como na vista previa interactiva.

## Como encaixa en piXeval

- A aplicación Qt actual segue sendo o anfitrión: cada pantalla é unha páxina web aberta nun `QWebEngineView`.
- Os servizos de Python expóñense como obxectos da canle (ou a mesma lóxica exponse tamén mediante unha API local).
- Os diálogos nativos de ficheiros/cartafoles, a impresión e o PDF seguen sendo chamadas de Qt.
- O empaquetado segue sendo PyInstaller + Inno Setup, engadindo os recursos de QtWebEngine.

## Vantaxes

- **Conserva o marco Qt existente.** Xanela, menús, impresión, xestión de licenzas e diálogos nativos quedan exactamente como están; só o contido das pantallas pasa a ser páxinas web.
- **Todo o ecosistema da interface web** (React, bibliotecas de compoñentes, gráficos, recarga en quente, traspaso desde Figma) _e_ todas as capacidades nativas de Qt (diálogos, impresión, arrastrar e soltar).
- **Non precisa servidor local** (a canle vai dentro do proceso), así que non hai avisos do devasa nin deseño de seguranza de portos/tokens.
- O mesmo contorno de execución de Python e a mesma tecnoloxía de instalador de hoxe.
- O frontend pode desenvolverse e probarse nun navegador normal (simulando a canle) a toda velocidade.

## Inconvenientes

- **Tamaño e memoria, medidos:** as rodas de PySide6 para Windows amosan QtWebEngine en **255,7 MB descomprimido (105 MB comprimido)**: só `Qt6WebEngineCore.dll` ocupa 199,5 MB, máis ≈ 40 MB de traducións e ≈ 13 MB de paquetes de recursos. Coas bibliotecas Quick/Qml/Network que necesita, a parte de Qt do programa compilado pasa de ≈ 55–90 MB (só Widgets) a **≈ 340–370 MB**, uns 135–150 MB máis de descarga en cada instalación e actualización. Tamén se espera máis RAM ca con Widgets (non medida).
- **PyInstaller + QtWebEngine é delicado** (`QtWebEngineProcess`, recursos, locais, opcións de sandbox); hai que reservar tempo para depurar a compilación en Windows.
- **Dúas tecnoloxías de interface nun proceso** durante a transición; o estilo e a navegación deben ser coherentes entre o marco de Widgets e o contido web.
- **A ponte é asíncrona** e precisa un contrato tipado. Existen ferramentas de terceiros (p. ex. `pywebchannel` xera tipos TypeScript), pero son proxectos pequenos; convén contar con manter unha capa de ponte delgada propia.
- Chromium vai ligado á versión de Qt, así que as actualizacións da plataforma web e as correccións de seguranza seguen as versións de Qt.
- Licenzas: PySide6 e Qt WebEngine están dispoñibles baixo LGPL/GPL; confirma as obrigas de distribución antes de publicar (ligazón dinámica, avisos).
- Sen camiño cara a «simplemente abrilo nun navegador» salvo que o mesmo frontend se sirva tamén por HTTP (é posible, pero entón tamén estás construíndo a opción 03).

## Vantaxes fronte ás demais opcións

- fronte a 01: ecosistema web e rapidez de iteración da interface, sen abandonar a aplicación Qt.
- fronte a 03/04: **sen conexión, sen ciclo de vida de servidor, sen porto local que protexer, diálogos nativos de Qt e impresión sen cambios.**

## Desvantaxes fronte ás demais opcións

- fronte a 03/04: moito máis pesado (Chromium) e conserva toda a cadea de dependencias de Qt; sen acceso desde o navegador; CI de empaquetado máis difícil.
- fronte a 01: máis grande, máis pezas móbiles.

## Cando escollela

- Hai que conservar tal cal o marco Qt existente (menús, impresión, diálogos nativos, xestión de licenzas), non é aceptable un servidor local e o tamaño do instalador non é unha restrición dura.

## Esforzo e riscos

- Esforzo: medio-alto; a ponte e o empaquetado son as incógnitas. Risco: empaquetado de WebEngine en Windows, rendemento de táboas moi grandes dentro da vista web, dobre mantemento durante a transición.
