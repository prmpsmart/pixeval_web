# 04 · Web-aplikazio lokala leiho natibo batean pywebview-rekin

**Lerro batean:** 03 aukerako FastAPI + React aplikazio bera, baina **pywebview**-ek sortutako leiho natibo txiki batean erakusten da (nabigatzaile-markorik gabe); horrek Windows-eko WebView2 motorra erabiltzen du.

## Zer den

pywebview web-ikuspegi bat duen leiho bat irekitzen duen Python liburutegia da: WebView2 (Chromium oinarritutako Edge motorra) Windows-en. URL bat (FastAPI zerbitzari lokala) edo fitxategi lokalak kargatu ditzake, JS↔Python zubi bat (`js_api`) eskaintzen du eta Pythonetik **fitxategi/karpeta elkarrizketa-koadro natiboak** ematen ditu. pywebview-en bertsio berri bat (6.x) banaketa nagusietan paketatuta dago.

## Nola egokitzen den piXeval-en

```
 pixeval.exe (PyInstaller)
   ├─ FastAPI + Uvicorn atzeko planoko hari batean  (03 aukeraren API bera)
   ├─ webview.create_window("piXeval", "http://127.0.0.1:<portua>/?token=…")
   └─ js_api: pickFolder(), pickFile(), saveFile()  → benetako bideak itzultzen dizkio interfazeari
```

- Instalatzailea PyInstaller + Inno Setup izaten jarraitzen du. WebView2 motorra Windows-en zati da eta bezero-ekipo guztietan eskuragarri dago, beraz ez da ezer gehiagorik instalatzen.
- React konpilazio bera nabigatzaile arrunt batean ere exekutatzen da garapenerako eta ordezko gisa («ireki nabigatzailean» botoia).

## Abantailak

- **03ren on guztia, gehi mahaigaineko benetako leiho bat**: titulu-barra, ikonoa, instantzia bakarreko portaera eta akatsez itxi beharreko nabigatzaile-fitxarik gabe.
- **Fitxategi-bideen arazoa konpontzen du:** karpeta/fitxategi/gordetzeko elkarrizketa-koadroak natiboak dira eta benetako bideak itzultzen dituzte.
- **Aztarna txikia, neurtua:** pywebview-ek 1,6 MB hartzen ditu deskonprimituta (WebView2 Core 0,65 MB, kargatzaile-DLLak ≈ 0,45 MB, interop ≈ 0,02 MB) eta pythonnet-ek 0,7 MB, hau da, **2–3 MB inguruko bitarrak**, Qt Widgets-en 55–90 MB inguruen eta Qt WebEngine-rekin 340–370 MB inguruen aldean. WebView2 motorra Windows-en zati da eta ez da txertatzen. FastAPI, Uvicorn, Pydantic eta frontend-arekin (prototipoan 0,34 MB), interfaze-geruza osoak 11 MB inguru hartzen ditu, ordezkatzen dituen Qt bitarrak baino gutxiago.
- **Python hutseko sarrera-puntua**, beraz Rust/Node-rik gabe banatutako aplikazioan.
- Ordezko natural bat: web-ikuspegia eskuragarri ez badago, sistemako nabigatzailea irekitzen da.
- Nabigatzaile-fitxa batek baino eraso-gainazal txikiagoa (luzapenik gabe, nabigazio kontrolatua).

## Desabantailak

- **pywebview-en Windows backend-ak pythonnet-en oinarritzen da** (.NET zubia), eta PyInstaller-ek zuzen paketatu behar du. Goiz frogatzea komeni da (egiaztatzeko).
- **Mantentzaile gutxiko proiektu txikia**; ekoizpeneko paketatze-adibide gutxiago Qt-rekin baino.
- **Mahaigaineko funtzio mugatuak berez** (erretilua, jakinarazpenak eta eguneraketa automatikoa minimoak dira, beraz bereizita eraikiko lirateke behar izanez gero).
- **Web-ikuspegitik inprimatzea/PDFa sistema eragilearen arabera aldatzen da;** zerbitzari-aldeko PDF sorkuntza (kode-oinarrian jada dagoena) da bide segurua.
- **Arazketa zailagoa da** nabigatzaile arrunt batean baino (garapenerako nabigatzailea erabili, arazketa-aukera behar denean aktibatu).
- 03n bezalako zerbitzariaren bizi-ziklo eta segurtasun betebeharrak (tokena, loopback bakarrik).

## Beste aukerekiko abantailak

- 03rekin alderatuta: leiho eta elkarrizketa-koadro natiboak, produktu-sentsazio hobea, ingurune kontrolatua.
- 02rekin alderatuta: **hamarnaka edo ehunka MB arinagoa**; QtWebEngine paketatu gabe; interfaze berrian Qt-ren mendekotasunik gabe.
- 01ekin alderatuta: web ekosistema, bero-birkarga, diseinu-abiadura.

## Beste aukerekiko desabantailak

- 02rekin alderatuta: Qt-ren funtzio natiboak (inprimatze-aurrebista, Qt-rekin PDFak ikustea) web edo zerbitzari-aldeko baliokideekin ordeztu behar dira.
- 01ekin alderatuta: zerbitzu/API geruza bat eta frontend-aren konpilazio-kate bat behar ditu.

## Noiz aukeratu

- Mahaigaineko itxura duen aplikazio bat nahi da, instalatzaile txikia, elkarrizketa-koadro natiboak eta web interfaze onena, **banatutako produktuari lengoaia berririk gehitu gabe.** «Python atzeko planoan exekutatzen da eta interfazea aplikazio-leiho batean edo nabigatzailean irekitzen da» ideiara gehien hurbiltzen dena da.

## Ahalegina eta arriskuak

- Ahalegina: 03ren bera gehi kola pixka bat (leihoa, elkarrizketa-koadroen zubia, WebView2 egiaztapena). Arriskuak: pythonnet-en paketatzea, mantentzaile bakarraren mendekotasuna (arinduta, ordezkoa «ireki nabigatzailean» delako, hau da, 03 aukera).
