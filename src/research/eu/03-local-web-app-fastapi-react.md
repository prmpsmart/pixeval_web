# 03 · Web-aplikazio lokala: Python (FastAPI) + React, nabigatzailean irekita

**Lerro batean:** egin klik bikoitza pixeval-en → Python motoreak web-zerbitzari lokal bat abiarazten du → interfazea erabiltzailearen nabigatzailean irekitzen da. Python produktua izaten jarraitzen du; interfazea web frontend bihurtzen da.

Hau da interfaze berriaren aurrebista interaktiboa eraikita dagoen arkitektura (<https://prmpsmart.github.io/pixeval_web/>). 04 aukera arkitektura bera da, nabigatzaile-fitxa baten ordez leiho natibo batekin.

## Nola funtzionatzen duen

```
 pixeval abiarazlea (PyInstaller exe)
   ├─ Uvicorn abiarazten du 127.0.0.1:<portu librea>   ← FastAPI aplikazioa (requirements.txt-en jada)
   │     ├─ /api/*   bide meheak → zerbitzu-geruza → db / omr / cat_lib / dataReports (lehendik dagoen kodea)
   │     ├─ /events  eskaneatzeen, segurtasun-kopien eta zuzenketen aurrerapena (SSE edo WebSocket)
   │     └─ /*       konpilatutako React aplikazioa (`npm run build`-eko fitxategi estatikoak)
   └─ nabigatzaile lehenetsia irekitzen du (edo Chrome/Edge `--app=` moduan, nabigatzaile-markorik gabeko leiho baterako)
```

- Kontsola/terminal leihoa ezkuta daiteke (kontsolarik gabeko exe, erretiluko ikonoa) edo erregistro-ikuspegi gisa mantendu.
- Datu lokalak SQLite-n geratzen dira gaur bezala.

## Abantailak

- **Eskuragarri dagoen interfaze- eta esperientzia-ekosistema onena** ahalegin berarekin: osagaiak, grafikoak, taulak, irisgarritasuna, i18n, animazioa, modu iluna, diseinu moldagarriak, Figma-tik CSS-ra pasatzea, bero-birkarga, nabigatzailearen garapen-tresnak.
- **Qt-rik gabe eta Chromium txertatu gabe.** Erabiltzailearen nabigatzailea da errendatze-motorra: interfaze-geruzak 9 MB inguru betetzen ditu (FastAPI/Uvicorn/Starlette/Pydantic ≈ 8,9 MB, frontend-a 0,34 MB), ordezkatzen dituen Qt bitarrak baino gutxiago (≈ 55–90 MB).
- **Python motorea eta FastAPI berrerabiltzen ditu**, kode-oinarrian jada daudenak.
- **Diseinuak eta prototipoak zuzenean berrerabilgarriak dira** (React aurrebistak pantaila eta elkarrizketa-koadro guztiak ditu jada).
- **Probagarria:** `pytest` APIan, Playwright interfazean; CI erraza da.
- **Etorkizuneko ateak irekitzen ditu gastu gehigarririk gabe:** API berak geroago LAN/zerbitzari instalazio bat edo urruneko zuzenketa-postuak zerbitzatu ditzake.
- Zeregin luzeak garbiagoak dira: atzeko planoko zereginak + gertaera-jarioa, Qt seinaleak logikara pasatu beharrean.
- Ardurak bereizteak kode-oinarriak edonola ere behar duen zerbitzu-geruza sortzera behartzen du.

## Desabantailak

- **Nabigatzaileek ezin diote Pythonri benetako fitxategi-biderik eman.** piXeval karpeta-bideetan oinarritzen da (eskaneatze-karpetak, segurtasun-kopiak, esportazioak). Aukerak: _zerbitzariari_ elkarrizketa-koadro natibo bat erakusteko eskatu (Tk/pywebview), bideak idatzi/itsatsi edo fitxategiak igo. Qt-rekiko hutsune funtzional handiena da (04n konponduta).
- **Zerbitzariaren bizi-zikloa kudeatu behar da:** portu libre bat aukeratu, azken fitxa ixten denean itzali, bigarren abiarazte bat kudeatu, erabiltzaileak terminala ixten badu zerbait erabilgarria erakutsi.
- **Segurtasun-diseinua beharrezkoa da** lokalean ere: 127.0.0.1-en bakarrik entzun, abiarazte bakoitzeko sarbide-tokena, CORS/Origin egiaztapen zorrotzak (beste prozesu lokalek eta web-orriek localhost dei dezakete).
- **Antibirus/suebaki abisuak** ager daitezke socket bat irekitzen duen programa batengatik (normalean bakar bat ere ez loopback-ean, baina enpresa-tresnak desberdinak dira).
- **Nabigatzaileen aldakortasuna eta erabiltzaile-akatsak:** nabigatzaile eta bertsio desberdinak, akatsez itxitako fitxak, SQLite fitxategi bera editatzen duten hainbat fitxa.
- **Inprimaketa eta PDFa** nabigatzaileak edo zerbitzari-aldeko sorkuntzak kudeatzen ditu (reportlab/xhtml2pdf badaude jada), ez `QtPrint`-ek.
- **Bigarren lengoaia eta tresna-kate bat interfazerako** (TypeScript; Node _konpilatzeko_ bakarrik behar da, azken erabiltzaileek ez dute bat ere behar).
- Erabiltzaile batzuentzat «webgune bat» dirudi, ez mahaigaineko programa bat.

## Beste aukerekiko abantailak

- 01ekin alderatuta: osagai eta diseinu-abiadura askoz hobeak; Qt-ren estilo-mugarik ez.
- 02rekin alderatuta: Chromium-ik gabe instalatzailean; paketatze errazagoa; zubirik gabe.
- 04rekin alderatuta: errazena eta txikiena; ez dago banatzeko ezer gehiagorik.

## Beste aukerekiko desabantailak

- 04rekin alderatuta: leiho natiborik ez, fitxategi-elkarrizketa natiborik ez, erabiltzailearen nabigatzailearen mende dago.
- 01ekin alderatuta: zerbitzu/API geruza bat eta frontend-aren konpilazio-kate bat behar ditu.

## Noiz aukeratu

- Interfaze moderno baterako bide azkarrena, instalazio-pisu minimoarekin, eta «nabigatzailean exekutatzen den» produktu bat onargarria da.
- LAN/urruneko/erabiltzaile anitzeko aukera geroago irekita utzi nahi da.

## Ahalegina eta arriskuak

- Ahalegina: zerbitzu-geruzaren erauzketa + API (aukera guztientzat komuna) + interfazearen eraman. Arriskuak: fitxategi-bideen kudeaketa, bizi-zikloaren eta segurtasunaren gogortzea, SQLite-ren konkurrentzia bi interfaze irekita badaude.
- Arintzeak: 04 aukera aukeratu leiho eta elkarrizketa-koadro natiboetarako; API idazle bakarrekoa mantendu.
