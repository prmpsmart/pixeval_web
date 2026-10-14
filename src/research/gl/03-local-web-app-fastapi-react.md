# 03 · Aplicación web local: Python (FastAPI) + React, aberta no navegador

**Nunha liña:** dobre clic en pixeval → o motor Python arranca un servidor web local → a interface ábrese no navegador do usuario. Python segue sendo o produto; a interface pasa a ser un frontend web.

Esta é a arquitectura para a que está construída a vista previa interactiva da nova interface (<https://prmpsmart.github.io/pixeval_web/>). A opción 04 é a mesma arquitectura cunha xanela nativa en lugar dunha lapela do navegador.

## Como funciona

```
 lanzador de pixeval (exe de PyInstaller)
   ├─ inicia Uvicorn en 127.0.0.1:<porto libre>   ← aplicación FastAPI (xa en requirements.txt)
   │     ├─ /api/*   rutas finas → capa de servizos → db / omr / cat_lib / dataReports (código existente)
   │     ├─ /events  progreso de escaneos, copias de seguranza e corrección (SSE ou WebSocket)
   │     └─ /*       a aplicación React compilada (ficheiros estáticos de `npm run build`)
   └─ abre o navegador predeterminado (ou Chrome/Edge en modo `--app=` para unha xanela sen marco de navegador)
```

- A xanela de consola/terminal pode ocultarse (exe sen consola, icona na bandexa) ou conservarse como vista de rexistro.
- Os datos locais seguen en SQLite exactamente como hoxe.

## Vantaxes

- **O mellor ecosistema de interface e experiencia dispoñible** co mesmo esforzo: compoñentes, gráficos, táboas, accesibilidade, i18n, animación, modo escuro, deseños adaptables, traspaso de Figma a CSS, recarga en quente, ferramentas de desenvolvemento do navegador.
- **Sen Qt e sen Chromium incluído.** O navegador do usuario é o motor de renderizado: a capa de interface ocupa uns 9 MB (FastAPI/Uvicorn/Starlette/Pydantic ≈ 8,9 MB, o frontend 0,34 MB), menos cós binarios de Qt aos que substitúe (≈ 55–90 MB).
- **Reutiliza o motor Python e FastAPI**, xa presentes na base de código.
- **Os deseños e prototipos son directamente reutilizables** (a vista previa en React xa contén todas as pantallas e diálogos).
- **Pódese probar:** `pytest` sobre a API, Playwright sobre a interface; a CI é sinxela.
- **Abre portas futuras sen gasto adicional:** a mesma API pode servir máis adiante unha instalación en rede local/servidor ou postos remotos de corrección.
- As tarefas longas quedan máis limpas: tarefas en segundo plano + fluxo de eventos en lugar de pasar sinais de Qt á lóxica.
- A separación de responsabilidades obriga a crear a capa de servizos que a base de código precisa de todos os xeitos.

## Inconvenientes

- **Os navegadores non poden dar a Python rutas de ficheiro reais.** piXeval depende de rutas de cartafol (cartafoles de escaneo, copias de seguranza, exportacións). Opcións: pedir ao _servidor_ que amose un diálogo nativo (Tk/pywebview), escribir/pegar rutas ou subir ficheiros. É a maior carencia funcional fronte a Qt (resolta en 04).
- **Hai que xestionar o ciclo de vida do servidor:** escoller un porto libre, pechalo cando se pecha a última lapela, xestionar un segundo arranque, amosar algo útil se o usuario pecha o terminal.
- **Fai falta deseño de seguranza** mesmo en local: escoitar só en 127.0.0.1, token de acceso por arranque, comprobacións estritas de CORS/Origin (outros procesos locais e páxinas web poden chamar a localhost).
- **Poden aparecer avisos do antivirus ou devasa** por un programa que abre un socket (normalmente ningún en loopback, pero as ferramentas corporativas difiren).
- **Variación entre navegadores e erro do usuario:** distintos navegadores e versións, lapelas pechadas por erro, varias lapelas editando o mesmo ficheiro SQLite.
- **A impresión e o PDF** xestiónaos o navegador ou a xeración no servidor (reportlab/xhtml2pdf xa existen), non `QtPrint`.
- **Unha segunda linguaxe e cadea de ferramentas para a interface** (TypeScript; Node só se precisa para _compilar_, os usuarios finais non precisan ningún).
- Para algúns usuarios parece «unha páxina web», non un programa de escritorio.

## Vantaxes fronte ás demais opcións

- fronte a 01: compoñentes e velocidade de deseño moi superiores; sen os límites de estilo de Qt.
- fronte a 02: sen Chromium no instalador; empaquetado máis simple; sen ponte.
- fronte a 04: a máis simple e pequena; nada extra que distribuír.

## Desvantaxes fronte ás demais opcións

- fronte a 04: sen xanela nativa, sen diálogos nativos de ficheiros, depende do navegador do usuario.
- fronte a 01: precisa unha capa de servizos/API e unha cadea de compilación do frontend.

## Cando escollela

- A vía máis rápida cara a unha interface moderna co mínimo peso de instalación, e un produto que «se executa no navegador» é aceptable.
- Quérese deixar aberta a porta a rede local/remoto/multiusuario máis adiante.

## Esforzo e riscos

- Esforzo: extracción da capa de servizos + API (común a todas as opcións) + portar a interface. Riscos: xestión de rutas de ficheiro, endurecemento do ciclo de vida e da seguranza, concorrencia de SQLite se hai dúas interfaces abertas.
- Mitigacións: escoller a opción 04 para ter xanela e diálogos nativos; manter a API cun único escritor.
