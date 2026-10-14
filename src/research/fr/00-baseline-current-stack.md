# 00 · Point de départ : sur quoi piXeval repose aujourd'hui

_Mesuré à partir du dépôt `pixeval` (7.6.2) sur cette machine. Les chiffres sont des nombres de lignes de fichiers `.py`, pas un jugement de qualité._

## La pile en un coup d'œil

| Domaine                    | Ce qui est utilisé                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Langage / exécution        | Python 3.12 (dev), wheels figées pour 3.13 dans `requirements.txt`                                                                                 |
| Interface                  | **PySide6 6.9.0 – Qt Widgets** (aussi `QtGui`, `QtCore`, `QtPrintSupport`, `QtPdf`, `QtPdfWidgets`). Aucun usage de `QtWebEngine` trouvé           |
| Styles                     | QSS écrit à la main (`kitchen/style-v7.6.0.qss`, ~1 100 lignes), ~1 750 icônes SVG, animations Lottie (`rlottie-python`, `qt-lottie`)              |
| Données                    | SQLite via une enveloppe maison par thread (`src/db/databases.py`) ; `psycopg2` est également présent                                              |
| OMR / vision               | OpenCV, NumPy, scikit-image, pyzbar, pytesseract                                                                                                   |
| Documents                  | reportlab, xhtml2pdf, pypdf, python-docx, openpyxl, XlsxWriter, pandas                                                                             |
| Réseau / e-mail            | requests, google-api-client, zeep, `deep-translator`, `google-cloud-translate`                                                                     |
| **Pile web déjà présente** | **FastAPI 0.115 + Uvicorn 0.34 + Starlette** (utilisée par `kitchen/remote_pixeval/server`, le service CAT distant)                                |
| Empaquetage                | PyInstaller 6.13 (`compile/*.spec`) + Inno Setup (`compile/piXeval.iss`) → installateur Windows                                                    |
| Concurrence                | Presque aucune (`threading.Thread` une fois). Les tâches longues signalent leur progression via des objets Qt `SignalInstance` passés à la logique |

Le dépôt contient plusieurs applications, pas une seule : **piXeval**, **pixEBAP02**, **CAT3 Audit**, une **Modern UI** inachevée (`src/modern_ui`) et un service FastAPI **Remote CAT**.

## Taille de chaque couche

| Couche                                             | Fichiers Python |         Lignes | Importe Qt                                                          |
| -------------------------------------------------- | --------------: | -------------: | ------------------------------------------------------------------- |
| `src/ui` (interface PySide6 actuelle)              |             194 |     **71 077** | toute                                                               |
| `src/modern_ui` (refonte PySide6, en cours)        |              28 |          2 301 | toute                                                               |
| `src/db`                                           |               7 |          3 648 | 1 fichier (`databases.py`, un import de `QApplication`)             |
| `src/omr` (+ copie de même taille `src/omr_audit`) |        16 (+16) | 6 704 (+6 704) | **0 fichier**                                                       |
| `src/cat_lib`                                      |              13 |          4 832 | 3 fichiers (`SignalInstance`, `QDesktopServices`, `QPixmap/QImage`) |
| `src/dataReports`                                  |               9 |            830 | 1 fichier (`QImage`)                                                |
| `src/utils`                                        |              28 |          5 242 | 2 fichiers (`SignalInstance` pour le suivi de progression)          |

## Ce que cela signifie

1. **Le moteur est presque indépendant de l'interface.** L'OMR, la BD, les rapports et la logique CAT totalisent environ 21 000 lignes, et seuls **7 fichiers** environ touchent à Qt (surtout pour des signaux de progression ou des types d'image). C'est pourquoi « Python reste, seule l'interface change » est réaliste.
2. **L'interface est ~3,4 fois plus grande que le moteur.** Toute refonte réelle est la réécriture d'une très grande interface, _quelle que soit la technologie_. `src/modern_ui` (2,3 k lignes pour l'instant) est déjà cette réécriture, en PySide6, et en est à environ 3 % en nombre de lignes. La vraie question est donc _« quelle pile rend la refonte la moins chère et la meilleure ? »_, et non _« web ou pas de réécriture »_.
3. **Interface et logique sont imbriquées.** 103 des 194 fichiers d'interface importent depuis la couche de données. Exemple : `src/ui/pixeval/grades/__init__.py` lit participants, formules et feuilles en erreur directement depuis `PixevalDataManager`. Les règles métier qui vivent dans des classes de widgets doivent être déplacées dans une couche de services avant que _n'importe quelle_ nouvelle interface (web ou Qt) puisse les réutiliser. Cette étape est nécessaire pour chaque option ci-dessous.
4. **Le suivi de progression est spécifique à Qt.** Les paramètres `SignalInstance` (sauvegarde, CAT3, nouvelle correction HR) doivent devenir un rappel / flux d'événements neutre. C'est simple et local, mais cela touche au cœur.
5. **Un service FastAPI est déjà livré dans le dépôt.** La technologie dont dépendent les options 03 et 04 est déjà utilisée dans la base de code.
6. **Les boîtes de dialogue de fichiers natives sont peu utilisées** (9 points d'appel dans 5 fichiers : sélecteurs de dossier pour les numérisations, sauvegardes et exports). Un navigateur ne peut pas transmettre à Python un vrai chemin de dossier, ce qui compte pour l'option navigateur seul (voir 03).

## Ce qui n'a _pas_ été mesuré (à vérifier avant de citer)

- La taille réelle de l'installateur / de l'installation, car `dist/` n'est pas dans le dépôt. OpenCV, SciPy et Qt la dominent probablement.
- Les performances réelles de l'interface sur de grands tableaux (l'écran des notes contient des centaines à des milliers de lignes).
- Le comportement sous Windows 10 et Windows 11 (WebView2 est disponible sur tous les postes clients).

## Ordre de lecture

[Index de la recherche](README.md) (résumé et recommandation) → options [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md), [04](04-pywebview-native-window.md) → [comparaison et feuille de route](05-comparison-and-roadmap.md) → [rapport technique final](06-final-technical-report.md).
