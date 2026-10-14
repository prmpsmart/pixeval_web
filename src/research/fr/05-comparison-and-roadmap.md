# 05 · Comparaison, notation et feuille de route

## Note sur les contraintes

- **L'accent principal est mis sur l'utilisateur final, pas sur le développeur.** La note principale mesure ce que vivent au quotidien les personnes qui utilisent piXeval : l'apparence et la sensation du produit, son efficacité, et la façon dont il s'installe, démarre et se comporte sur leurs ordinateurs. Le confort du développeur est noté séparément et pèse moins.
- **Windows uniquement :** piXeval est livré sous forme d'installateur Windows. Les autres systèmes d'exploitation ne sont pas considérés ; « cohérence » signifie cohérence entre les PC Windows des utilisateurs.
- **WebView2 est disponible sur tous les postes clients** (hypothèse de cette étude) ; il est donc traité comme présent, ni comme prérequis ni comme risque.
- La taille de l'équipe, ses compétences et sa familiarité avec les langages **ne sont pas des contraintes** ; les options sont jugées sur leur mérite technique.
- **Il n'y a pas de migration progressive :** la nouvelle interface remplace l'ancienne dans une seule version majeure.
- **Notes :** **Note A** = expérience de l'utilisateur final (principale, poids 80 %). **Note B** = facilité de mise en œuvre avec l'environnement d'exécution Python (secondaire, poids 20 %). D'autres pondérations sont présentées pour que l'effet du choix soit visible.

## Structure de la décision

Le choix se fait en deux étapes, car les options ne sont pas quatre égales :

1. **Décision 1 : Qt Widgets ou web (React, etc.) ?** L'option 01 face à l'interface web. C'est la grande décision : elle détermine le plafond d'UI/UX et la chaîne d'outils.
2. **Décision 2 (si web) : quelle enveloppe la présente ?** Le même frontend React peut être montré de trois façons :
   - **02** à l'intérieur de l'application Qt (**navigateur intégré, Qt WebEngine**),
   - **04** dans une fenêtre **pywebview**, avec le **navigateur externe en repli** lorsqu'aucune vue web n'est disponible,
   - **03** avec **Python comme backend et le navigateur externe utilisé directement**.

Les sections 5 et 6 donnent les deux décisions ; les sections 1 à 4 contiennent les preuves et les notes sur lesquelles elles reposent, et la section 7 les combine.

## 1. Python dans le tableau : comment chaque option s'exécute

| #   | Option                                     | Où s'exécute Python                                              | Comment l'interface lui parle                                                        | Ce que l'utilisateur lance                      |
| --- | ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 01  | PySide6 Widgets, modernisé                 | même processus que l'interface                                   | appels directs de fonctions et signaux Qt                                            | un exécutable                                   |
| 02  | Hybride Qt WebEngine                       | même processus que l'interface                                   | QtWebChannel (passerelle JS↔Python asynchrone)                                       | un exécutable contenant Chromium                |
| 03  | Application web locale, navigateur         | processus FastAPI séparé démarré par un lanceur                  | HTTP + WebSocket/SSE sur 127.0.0.1                                                   | le lanceur, puis le navigateur de l'utilisateur |
| 04  | Application web locale + fenêtre pywebview | serveur FastAPI dans un thread d'arrière-plan du même exécutable | HTTP + WebSocket/SSE, plus une petite passerelle JS↔Python pour les dialogues natifs | un exécutable avec sa propre fenêtre            |

## 2. Taille du programme compilé

Le résultat compilé est ce que PyInstaller place dans l'installateur. **Les binaires Qt en font partie dès que Qt est impliqué** ; les options web les remplacent par quelques mégaoctets. Les chiffres ci-dessous sont **mesurés à partir des wheels Windows sur PyPI** (listes de fichiers lues directement), pas d'une vraie compilation ; le résultat réel dépend de ce que PyInstaller collecte.

**Commun à toutes les options : la pile du moteur Python** (taille décompressée des wheels Windows figés dans `requirements.txt`) :

| Composant                   |  Décompressé | Wheel (compressé) |
| --------------------------- | -----------: | ----------------: |
| OpenCV 4.12                 |       110 Mo |             39 Mo |
| SciPy 1.16                  |       116 Mo |             39 Mo |
| NumPy                       |        43 Mo |             13 Mo |
| pandas                      |        39 Mo |             11 Mo |
| scikit-image                |        25 Mo |             13 Mo |
| matplotlib                  |        20 Mo |              8 Mo |
| Pillow, reportlab           |        11 Mo |              5 Mo |
| **Total de la pile moteur** | **≈ 364 Mo** |      **≈ 127 Mo** |

**Varie selon l'option : la couche d'interface**

| Couche d'interface      | Ce qui est embarqué                                                                                                                                                                                                             |                   Décompressé | Compressé (wheel) |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------: | ----------------: |
| 01 Qt Widgets           | Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7, PrintSupport 0,4 Mo ; modules PySide6 ≈ 12 Mo ; plugins ≈ 5 Mo ; éventuellement OpenGL logiciel 20,6 Mo et traductions ≈ 12 Mo                                                     |   **≈ 55–90 Mo** (estimation) |        ≈ 20–33 Mo |
| 02 Hybride Qt WebEngine | tout ce qui est dans 01, **plus** QtWebEngine (`Qt6WebEngineCore.dll` 199,5 Mo, traductions ≈ 40 Mo, paquets de ressources ≈ 13 Mo : 255,7 Mo au total, mesuré) **plus** Quick/Qml/Network/OpenGL/Positioning ≈ 26 Mo           | **≈ 340–370 Mo** (estimation) |      ≈ 135–150 Mo |
| 03 Navigateur           | FastAPI, Uvicorn, Starlette, Pydantic ≈ 8,9 Mo ; frontend web 0,34 Mo (le build du prototype : 322 Ko de JS + 22 Ko de CSS) ; **ni Qt ni moteur de navigateur**                                                                 |                    **≈ 9 Mo** |            ≈ 3 Mo |
| 04 Fenêtre pywebview    | tout ce qui est dans 03, **plus** pywebview 1,6 Mo (chargeur WebView2 et DLL d'interopérabilité ≈ 1 Mo) et pythonnet 0,7 Mo ; **le moteur WebView2 lui-même n'est pas embarqué** (il fait partie de Windows, partagé avec Edge) |                   **≈ 11 Mo** |            ≈ 4 Mo |

**Totaux (composants connus)**

|                 |  Décompressé | Compressé (wheel ; approximation du téléchargement) |                    Par rapport à 04 |
| --------------- | -----------: | --------------------------------------------------: | ----------------------------------: |
| 01 Qt Widgets   | ≈ 420–455 Mo |                                        ≈ 147–160 Mo |                     **+12 à +21 %** |
| 02 Qt WebEngine | ≈ 705–735 Mo |                                        ≈ 263–276 Mo | **+88 à +96 %** (presque le double) |
| 03 Navigateur   |     ≈ 373 Mo |                                            ≈ 130 Mo |                                −1 % |
| 04 pywebview    |     ≈ 375 Mo |                                            ≈ 131 Mo |                           référence |

Observations :

1. **pywebview ajoute environ 2–3 Mo de binaires ; Qt ajoute environ 55–90 Mo (Widgets) ou environ 340–370 Mo (avec WebEngine).** Les enveloppes web qui évitent Qt sont les options les plus petites, et **04 est plus petite que la compilation actuelle en Qt Widgets d'environ 45–80 Mo** (12–21 %) une fois PySide6 retiré du paquet.
2. **Cette économie exige de retirer Qt du programme compilé.** Environ sept fichiers hors interface importent encore Qt (constat F1 du rapport) ; l'étape de la couche de services les supprime. Sans cette étape, PySide6 reste dans le paquet.
3. **La couche d'interface représente une grande part du résultat.** La pile du moteur pèse environ 364 Mo (dominée par OpenCV et SciPy) ; Qt Widgets y ajoute environ 12–21 %, et Qt WebEngine double presque le programme.
4. **Temps de téléchargement et de mise à jour :** la couche d'interface de 02 représente environ 135–150 Mo compressés contre environ 4 Mo pour 04, soit environ 2 minutes de plus à 10 Mbit/s à chaque installation et chaque mise à jour.
5. Non mesuré : l'environnement d'exécution Python, les autres dépendances (clients Google, etc.), le surcoût de PyInstaller, la compression d'Inno Setup. Une vraie compilation est la première tâche de validation.

## 3. Note A : expérience de l'utilisateur final (principale)

| Critère (poids dans A)                               | Ce que ressent l'utilisateur final                                                                                                                                                                   |     01 |     02 |     03 |     04 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Esthétique et aspect moderne (25)                    | typographie, espacement, ombres, flou, mode sombre, finition                                                                                                                                         |      2 |      5 |      5 |      5 |
| Interaction agréable (15)                            | transitions, retour au survol/focus, réactivité                                                                                                                                                      |      2 |      5 |      5 |      5 |
| Efficacité (20)                                      | tableaux denses, recherche/filtre, palette de commandes, usage du clavier, retours clairs, graphiques, accessibilité                                                                                 |      3 |      5 |      5 |      5 |
| Cohérence entre les PC Windows des utilisateurs (10) | même apparence et même comportement sur tout poste Windows                                                                                                                                           |      5 |      5 |      3 |      4 |
| Installation et lancement (10)                       | temps de démarrage, aucun prérequis, impression d'application                                                                                                                                        |      5 |      3 |      3 |      4 |
| Comportement de bureau natif (10)                    | vrais sélecteurs de fichier/dossier, impression, glisser-déposer, fonctionne hors ligne                                                                                                              |      5 |      5 |      2 |      4 |
| **Taille du programme compilé (10)**                 | taille de l'installateur et de l'installation, temps de téléchargement et de mise à jour (section 2) ; 5 = le plus petit, 4 = jusqu'à +10 % au-dessus, 3 = +10–25 %, 2 = +25–60 %, 1 = plus de +60 % |      3 |      1 |      5 |      5 |
| **Note A (0–100)**                                   |                                                                                                                                                                                                      | **64** | **88** | **86** | **94** |

Ce que remarquerait un utilisateur final :

- **01** démarre vite et se comporte comme n'importe quel programme de bureau, mais les écrans paraissent datés et l'interface reste sobre. Le programme embarque 55–90 Mo de Qt.
- **02** offre l'interface la plus soignée et la plus cohérente, mais le programme est presque deux fois plus gros que 04, chaque installation et mise à jour pèse environ 135–150 Mo (compressés) de plus, et le démarrage est plus lent car un moteur de navigateur complet y est embarqué.
- **03** est aussi belle que 02 et la plus petite, mais c'est un onglet de navigateur : elle lance un serveur et un navigateur, ne peut pas proposer de vrais sélecteurs de dossier, et dépend du navigateur de l'utilisateur (Edge et Chrome partagent un moteur ; Firefox non).
- **04** est aussi belle que 02, s'ouvre dans sa propre fenêtre comme un programme normal, utilise des sélecteurs natifs de fichier et de dossier, et est plus petite que le programme actuel. Elle utilise le moteur WebView2 d'Edge, présent sur tous les postes clients ; s'il venait à manquer, le programme se replie sur le navigateur (comportement de 03).

## 4. Note B : facilité de mise en œuvre avec l'environnement d'exécution Python (secondaire)

| Critère (poids dans B)                      | Ce qu'il demande                                                                        |     01 |     02 |     03 |     04 |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | -----: | -----: | -----: | -----: |
| Intégration du moteur (30)                  | appel du code Python, événements de progression pour numérisations/sauvegardes, threads |      5 |      4 |      4 |      4 |
| Effort de compilation et d'empaquetage (30) | PyInstaller, environnements à embarquer, signature, chaîne de publication               |      5 |      2 |      4 |      3 |
| Pièces mobiles à tester (20)                | chaînes d'outils, frontières entre processus, contrats de passerelle/API                |      5 |      2 |      3 |      3 |
| Réutilisation du travail existant (20)      | FastAPI déjà dans la pile, prototype existant, couche de services                       |      2 |      4 |      5 |      5 |
| **Note B (0–100)**                          |                                                                                         | **88** | **60** | **80** | **74** |

Les commodités réservées aux développeurs (rechargement à chaud, passation de maquettes, grands écosystèmes) **ne sont pas** notées ; elles comptent uniquement par le résultat pour l'utilisateur final qu'elles rendent possible.

## 5. Décision 1 : Qt Widgets ou web ?

|                                                 |                            01 Qt Widgets |                           Interface web (02, 03, 04) |
| ----------------------------------------------- | ---------------------------------------: | ---------------------------------------------------: |
| Esthétique, interaction, efficacité             |                                  2, 2, 3 |                                              5, 5, 5 |
| Cohérence entre les PC Windows des utilisateurs |                                        5 |                                                  3–5 |
| Installation et lancement                       |                                        5 |                                                  3–4 |
| Comportement de bureau natif                    |                                        5 |                              2–5 (selon l'enveloppe) |
| Taille du programme compilé                     | 3 (≈ 420–455 Mo, 12–21 % de plus que 04) | 1–5 (≈ 373–375 Mo pour 03/04 ; ≈ 705–735 Mo pour 02) |
| **Note A : expérience de l'utilisateur final**  |                                   **64** |                                            **86–94** |
| **Note B : facilité avec Python**               |                                   **88** |                                            **60–80** |

**Verdict : le web.** Les options web offrent aux utilisateurs finaux une interface nettement meilleure (5 contre 2–3 pour l'apparence, l'interaction et l'efficacité), et les meilleures enveloppes web sont **plus petites que la compilation Qt**, car elles abandonnent les binaires de Qt. Les désavantages de Qt Widgets pour l'utilisateur final sont **structurels** : QSS n'a ni moteurs de mise en page, ni vraies ombres, ni flou, ni transitions, et chaque composant moderne est dessiné à la main. Les désavantages du web sont des **tâches identifiables** (dialogues natifs, retrait de Qt du moteur, une chaîne d'empaquetage).

Qt Widgets ne dépasse la meilleure enveloppe web (04) que si l'expérience de l'utilisateur final pèse **moins d'environ 32 %** (face à 03 : 27 % ; face à 02 : 54 %). Avec les 80 % retenus ici, les options web l'emportent de 14 à 21 points combinés.

## 6. Décision 2 : quelle enveloppe web ?

Les trois affichent le même frontend React ; l'apparence et l'interaction sont donc identiques. Ce qui diffère pour l'utilisateur final, c'est la cohérence du rendu, la taille, l'installation et le lancement, et le comportement natif.

| Aspect                             | **02 Navigateur intégré (Qt WebEngine)**           | **04 Fenêtre pywebview, repli sur navigateur externe**                                                           | **03 Backend Python + navigateur externe**                            |
| ---------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Apparence et interaction           | identiques                                         | identiques                                                                                                       | identiques                                                            |
| Cohérence du rendu                 | identique sur tous les PC (Chromium embarqué)      | très proche : Edge WebView2 est basé sur Chromium, présent sur tous les postes clients et mis à jour par Windows | dépend du navigateur (Edge/Chrome partagent un moteur ; Firefox non)  |
| Ce que voit l'utilisateur          | la fenêtre de l'application Qt                     | une petite fenêtre native, sans cadre de navigateur                                                              | un onglet ou une fenêtre de navigateur                                |
| **Programme compilé (total)**      | **≈ 705–735 Mo** (couche d'interface ≈ 340–370 Mo) | **≈ 375 Mo** (couche d'interface ≈ 11 Mo ; pywebview ≈ 2–3 Mo de binaires, sans Qt)                              | **≈ 373 Mo** (couche d'interface ≈ 9 Mo)                              |
| Téléchargement / mise à jour       | ≈ 263–276 Mo                                       | ≈ 131 Mo                                                                                                         | ≈ 130 Mo                                                              |
| Démarrage                          | plus lent (moteur Chromium)                        | rapide                                                                                                           | démarrage du serveur, puis ouverture du navigateur                    |
| Prérequis                          | aucun                                              | aucun (WebView2 présent sur tous les clients)                                                                    | un navigateur moderne                                                 |
| Sélecteurs de fichier/dossier      | natifs (Qt)                                        | natifs (pywebview) ; en mode de repli, via le serveur                                                            | indisponibles depuis un navigateur ; saisis ou ouverts par le serveur |
| Impression / PDF                   | impression et PDF Qt                               | vue web ou PDF côté serveur                                                                                      | navigateur ou PDF côté serveur                                        |
| Fonctionne hors ligne              | oui                                                | oui                                                                                                              | oui                                                                   |
| Repli                              | sans objet                                         | le lanceur ouvre le navigateur externe si la fenêtre ne peut pas démarrer                                        | sans objet                                                            |
| Mises à jour de sécurité du moteur | demandent une nouvelle version de piXeval          | WebView2 se met à jour seul via Windows                                                                          | suivent le navigateur de l'utilisateur                                |
| Note A / B                         | 88 / 60                                            | **94 / 74**                                                                                                      | 86 / 80                                                               |

Remarques :

- **04 devance 02 pour l'utilisateur final (94 contre 88) :** 02 est légèrement plus cohérente, mais presque deux fois plus grosse, plus lente à démarrer et plus lente à mettre à jour. 04 est aussi plus facile à mettre en œuvre (74 contre 60).
- **Le repli est une fonction du lanceur, pas quelque chose que pywebview fait de lui-même,** et avec WebView2 sur chaque client ce n'est qu'un filet de sécurité. En mode de repli, l'expérience retombe à celle de 03.
- **03 seule** est la plus petite et la plus simple à livrer, mais c'est l'option web la plus faible pour les utilisateurs finaux (86) : pas de sélecteurs natifs et un rendu qui dépend du navigateur.

**Verdict : 04**, avec le navigateur externe comme repli de sécurité. 02 n'est préférable que si un moteur de rendu identique garanti compte plus qu'un programme presque deux fois plus gros, ou si un serveur local est inacceptable.

## 7. Résultat combiné et sensibilité

| Option                                    | Note A : expérience de l'utilisateur final | Note B : facilité avec Python | **Combinée (A 80 / B 20)** |
| ----------------------------------------- | -----------------------------------------: | ----------------------------: | -------------------------: |
| 01 PySide6 Widgets, modernisé             |                                         64 |                        **88** |                       68,8 |
| 02 Hybride Qt WebEngine                   |                                         88 |                            60 |                       82,4 |
| 03 Application web locale, navigateur     |                                         86 |                            80 |                       84,8 |
| **04 Application web locale + pywebview** |                                     **94** |                            74 |                   **90,0** |

Vue à deux axes (expérience de l'utilisateur final en haut, facilité de mise en œuvre à droite) :

```
 expérience  94 |                   04
 utilisateur 88 |        02
             86 |                   03
                |
             64 |                              01
                +-----------------------------------
                  60        74  80       88   facilité avec Python
```

Sensibilité au poids de l'expérience de l'utilisateur final (A) :

| Poids de A                        |       01 |   02 |       03 |       04 |
| --------------------------------- | -------: | ---: | -------: | -------: |
| 100 % (utilisateur final seul)    |     64,0 | 88,0 |     86,0 | **94,0** |
| 90 %                              |     66,4 | 85,2 |     85,4 | **92,0** |
| 80 % (retenu)                     |     68,8 | 82,4 |     84,8 | **90,0** |
| 70 %                              |     71,2 | 79,6 |     84,2 | **88,0** |
| 60 %                              |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                              |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                              |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                              | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (confort du développeur seul) | **88,0** | 60,0 |     80,0 |     74,0 |

Sensibilité au poids du critère de taille dans A (les autres sont mis à l'échelle au prorata ; note combinée avec A 80 / B 20) :

| Poids de la taille dans A |   01 |   02 |   03 |       04 |
| ------------------------- | ---: | ---: | ---: | -------: |
| 0 % (taille ignorée)      | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (retenu)             | 68,8 | 82,4 | 84,8 | **90,0** |
| 20 %                      | 68,5 | 76,3 | 86,1 | **90,6** |
| 30 %                      | 68,1 | 70,3 | 87,3 | **91,0** |

Conclusions :

1. **Pour les utilisateurs finaux, les options web gagnent nettement :** 86–94 contre 64 pour Qt Widgets. Qt Widgets ne mène que lorsque le confort du développeur pèse plus que l'expérience de l'utilisateur final (poids de l'utilisateur final inférieur à environ 32 %).
2. **04 se classe première pour tout poids de l'utilisateur final de 100 % jusqu'à environ 43 %**, en dessous duquel 03 mène jusqu'à ce que le confort du développeur domine.
3. **La taille est ce qui retient 02.** Si la taille est ignorée, 02 monte à 88,5, à moins d'un point de 04 (89,4) ; au poids retenu (10 %) elle tombe à 82,4 (troisième) ; à des poids plus élevés elle baisse encore.
4. **L'avantage de taille des enveloppes web dépend du retrait de Qt du programme compilé.** Sans cela, PySide6 (≈ 55–90 Mo) reste dans le paquet et 04 aurait à peu près la taille de 01.

## 8. Prérequis transversaux (nécessaires à toute option)

1. **Extraire une couche de services** des 103 fichiers d'interface qui appellent directement la couche de données ; définir des fonctions de cas d'usage (p. ex. `grades.list(exam_id)`, `correction.run(folder)`).
2. **Remplacer les signaux Qt dans le code de logique** (`SignalInstance` dans `cat_lib`, `utils`) par des rappels/événements ; retirer les 7 importations de Qt des modules hors interface.
3. **Définir un écrivain unique** pour SQLite (deux interfaces ouvertes en même temps ne doivent pas corrompre ni verrouiller la base).
4. **Tests de caractérisation** des formules de notation, des sorties OMR et de la génération de rapports avant de refactoriser.

## 9. Feuille de route suggérée (une version majeure)

| Phase | Travail                                                                                                                                                                  | Livrable                                                           | Critère de sortie                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 0     | Relire ce rapport ; exécuter le sondage de validation (tailles réelles du paquet avec et sans Qt, dialogues natifs, performances des tableaux)                           | note de décision                                                   | validation                                                                      |
| 1     | Couche de services + événements de progression + tests de caractérisation (sans changement d'interface)                                                                  | paquet Python `pixeval_core` utilisé par l'application Qt actuelle | application actuelle inchangée et au vert                                       |
| 2     | API FastAPI pour chaque cas d'usage ; interface web construite écran par écran par-dessus, avec le prototype existant comme point de départ                              | nouvelle interface complète dans une branche de développement      | liste de parité : chaque écran, boîte de dialogue et rapport actuels            |
| 3     | Dialogues natifs via pywebview ; flux OMR/correction avec flux d'événements ; empaquetage (PyInstaller + Inno) ; ouverture automatique et migration des bases existantes | version candidate installable                                      | réussit les tests de bout en bout sur de vraies bases de données                |
| 4     | Bêta fermée avec de vrais utilisateurs et de vraies bases ; corriger les défauts ; garder l'ancien installateur disponible pour un retour arrière                        | validation de la bêta                                              | aucun défaut bloquant pendant une période convenue                              |
| 5     | Publier comme prochaine version majeure                                                                                                                                  | publication                                                        | utilisateurs sur la nouvelle version ; ancien installateur conservé une version |

## 10. Sources

- Documentation Qt, _User Interfaces_ (Widgets face à la pile déclarative de Qt ; remarques sur l'animation et les applications de bureau complexes) : <https://doc.qt.io/qt-6.9/topics-ui.html>
- Qt for Python, _QtWebChannel_ : <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
- Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_ : <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
- Métadonnées de versions PyPI et listes de fichiers des wheels Windows de PySide6 6.9.0 (Essentials, Addons), OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview et pythonnet (chiffres de taille de la section 2) : <https://pypi.org>
- Liste du paquet pywebview 6.x : <https://www.archlinux.org/packages/extra/any/python-pywebview>
