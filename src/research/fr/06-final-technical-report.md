# Rapport technique : options pour moderniser l'interface utilisateur de piXeval

**Objet :** piXeval 7.6.2 (système de gestion d'examens OMR)
**Rédigé par :** Miracle Apata, BEng
**Statut :** brouillon pour relecture — les notes d'appui se trouvent dans ce dossier
**Artefact complémentaire :** prototype interactif, <https://prmpsmart.github.io/pixeval_web/>

---

## Résumé

piXeval est une application de bureau Python pour Windows dont l'interface utilisateur est construite avec PySide6 (Qt Widgets). L'interface compte environ 71 000 lignes de code et constitue la principale limite d'utilisabilité et de qualité visuelle pour les personnes qui l'utilisent chaque jour, tandis que le moteur de traitement (OMR, base de données, rapports) compte environ 21 000 lignes et est en grande partie indépendant de Qt. Ce rapport évalue des moyens d'améliorer l'interface tout en conservant le moteur Python et sans engendrer de coût de licence ni d'hébergement, sous forme de deux décisions. **Décision 1 :** moderniser Qt Widgets (01) ou passer à un frontend web (React, etc.). **Décision 2**, si web : le présenter comme un navigateur intégré dans Qt (Qt WebEngine, 02), dans une fenêtre pywebview avec le navigateur externe comme repli de sécurité (04), ou avec Python comme backend et le navigateur externe utilisé directement (03). La migration se fera en une seule fois, en une seule version majeure. L'**accent principal est mis sur l'utilisateur final** : la note principale (80 %) mesure ce que vivent les utilisateurs (esthétique et aspect moderne, interaction agréable, efficacité, cohérence, installation et lancement, comportement natif, et **taille du programme compilé**) ; une note secondaire (20 %) mesure la facilité de mise en œuvre avec l'environnement d'exécution Python. Mesuré à partir des wheels Windows, Qt ajoute environ 55–90 Mo au résultat compilé (Widgets) ou environ 340–370 Mo (avec WebEngine), alors que pywebview ajoute environ 2–3 Mo de binaires et toute la couche d'interface web environ 11 Mo (le moteur Edge WebView2 fait partie de Windows et est disponible sur tous les postes clients). Les options web obtiennent 86–94 sur 100 pour l'expérience de l'utilisateur final contre 64 pour Qt Widgets, plus facile à mettre en œuvre (88 contre 60–80). Qt Widgets ne l'emporte que si l'expérience de l'utilisateur final pèse moins d'un tiers environ. Parmi les enveloppes web, la fenêtre pywebview se classe première (94) devant le navigateur Qt intégré (88), pénalisé par sa taille (presque le double du programme compilé) et son démarrage. L'orientation recommandée est **un moteur Python (FastAPI) avec une interface web présentée dans une fenêtre pywebview native, avec « ouvrir dans le navigateur » comme repli**, précédée d'un remaniement de la couche de services nécessaire quelle que soit l'option. Plusieurs grandeurs (taille réelle de l'installateur, temps de démarrage, performance sur de grands tableaux) n'ont pas été mesurées sur une vraie compilation et sont listées comme tâches de validation.

---

## 1. Introduction

### 1.1 Contexte

piXeval prend en charge tout le cycle de vie d'un examen à choix multiples sur papier : banques de questions, composition d'examens, génération de feuilles de réponses, numérisation et reconnaissance optique de marques (OMR), attribution des identités, correction, notes et rapports. Il est distribué sous forme d'un installateur Windows construit avec PyInstaller et Inno Setup.

### 1.2 Énoncé du problème

Les utilisateurs interagissent avec le produit via une interface à base de Widgets stylée avec les feuilles de style Qt. Obtenir un aspect et une qualité d'interaction contemporains (transitions animées, tableaux denses mais lisibles, recherche de commandes, mises en page adaptatives, jetons de conception cohérents) est lent et coûteux avec cette pile. La question est de savoir si une autre technologie d'interface offre une meilleure expérience utilisateur à un coût et un risque acceptables.

### 1.3 Objectifs et contraintes

1. **Principal : l'utilisateur final.** Améliorer ce que les utilisateurs voient et vivent chaque jour : une interface agréable, efficace, esthétique et moderne qui s'installe, démarre et se comporte aussi bien sur leurs ordinateurs. Le confort du développeur est secondaire.
2. **Secondaire :** rendre cette expérience simple à mettre en œuvre et à livrer avec le moteur Python dans le tableau (le moteur lui-même est conservé).
3. **N'introduire aucun nouveau coût récurrent** (licences, hébergement, abonnements).
4. Préserver l'expérience d'application installée sur **Windows** (seule plateforme cible) : lancement, travail hors ligne, accès aux fichiers locaux et à la sortie du scanner.
5. Migrer **une seule fois** : la nouvelle interface remplace l'ancienne dans une seule version majeure poussée à tous les utilisateurs. Il n'y a ni migration progressive ni cohabitation, donc la fiabilité de la version et la parité des fonctions comptent davantage.
6. La taille de l'équipe, ses compétences et sa familiarité avec les langages **ne sont pas** traitées comme des contraintes. Les options sont jugées sur leur mérite technique ; un nouveau langage n'est pas en soi un coût, alors que des environnements d'exécution supplémentaires, des chaînes de compilation et des frontières entre processus le sont.

### 1.4 Périmètre

Seuls la couche de présentation et son intégration avec le moteur sont considérées. Les algorithmes OMR, les règles de notation et le schéma de la base de données ne changent pas.

---

## 2. Analyse du système actuel

Mesuré à partir du dépôt (détails dans [00-baseline-current-stack.md](00-baseline-current-stack.md)) :

| Couche                                                          | Fichiers |         Lignes | Dépendance à Qt |
| --------------------------------------------------------------- | -------: | -------------: | --------------- |
| Interface (`src/ui`)                                            |      194 |         71 077 | complète        |
| Refonte en cours (`src/modern_ui`)                              |       28 |          2 301 | complète        |
| Base de données (`src/db`)                                      |        7 |          3 648 | 1 fichier       |
| OMR (`src/omr`, plus une copie de taille égale `src/omr_audit`) | 16 (+16) | 6 704 (+6 704) | aucune          |
| Enveloppe du moteur CAT (`src/cat_lib`)                         |       13 |          4 832 | 3 fichiers      |
| Rapports (`src/dataReports`)                                    |        9 |            830 | 1 fichier       |
| Utilitaires (`src/utils`)                                       |       28 |          5 242 | 2 fichiers      |

Constats qui orientent l'analyse :

- **F1 — Le moteur est séparable.** Environ 21 000 lignes de logique n'utilisent Qt que dans environ sept fichiers, surtout pour des signaux de progression et des types d'image.
- **F2 — L'interface représente la plus grande part du travail.** Elle est environ 3,4 fois plus grande que le moteur. Quelle que soit la technologie choisie, une refonte implique de réimplémenter les écrans ; l'effort `modern_ui` existant est lui-même une telle réécriture et est achevé à environ 3 % en nombre de lignes.
- **F3 — Présentation et logique sont entremêlées.** 103 des 194 fichiers d'interface importent la couche de données, et des écrans comme celui des notes lisent et modifient directement des objets du domaine. Une couche de services est donc un prérequis à tout nouveau frontend.
- **F4 — Une pile web est déjà présente.** FastAPI 0.115, Uvicorn et Starlette figurent dans les dépendances et sont utilisés par le service CAT distant.
- **F5 — L'empaquetage est établi.** PyInstaller + Inno Setup livrent un installateur Windows ; toute option devrait le réutiliser autant que possible.
- **F6 — Des boîtes de dialogue de fichier natives sont utilisées** (neuf points d'appel dans cinq fichiers pour les dossiers de numérisation, de sauvegarde et d'export). Les chemins de dossier sont une exigence opérationnelle, ce qui touche les solutions uniquement navigateur.

---

## 3. Méthode d'évaluation

### 3.1 Deux notes

**Note A : expérience de l'utilisateur final (principale, 80 % de la note combinée).**

| Critère                                         | Poids dans A | Ce que ressent l'utilisateur final                                                                                                  |
| ----------------------------------------------- | -----------: | ----------------------------------------------------------------------------------------------------------------------------------- |
| Esthétique et aspect moderne                    |           25 | typographie, espacement, ombres, flou, mode sombre, finition                                                                        |
| Interaction agréable                            |           15 | transitions, retour au survol/focus, réactivité                                                                                     |
| Efficacité                                      |           20 | tableaux denses, recherche/filtre, palette de commandes, usage du clavier, retours clairs, graphiques, accessibilité                |
| Cohérence entre les PC Windows des utilisateurs |           10 | même apparence et même comportement sur tout poste Windows (versions, navigateurs, environnements d'exécution)                      |
| Installation et lancement                       |           10 | temps de démarrage, prérequis, impression d'application                                                                             |
| Comportement de bureau natif                    |           10 | vrais sélecteurs de fichier/dossier, impression, glisser-déposer, fonctionne hors ligne (constat F6)                                |
| **Taille du programme compilé**                 |           10 | taille de l'installateur et de l'installation, temps de téléchargement et de mise à jour (mesuré à partir des wheels Windows, §5.1) |

**Note B : facilité de mise en œuvre avec l'environnement d'exécution Python (secondaire, 20 %).**

| Critère                                | Poids dans B | Question                                                                                |
| -------------------------------------- | -----------: | --------------------------------------------------------------------------------------- |
| Intégration du moteur                  |           30 | appel du code Python, événements de progression pour numérisations/sauvegardes, threads |
| Effort de compilation et d'empaquetage |           30 | PyInstaller, environnements à embarquer, signature, chaîne de publication               |
| Pièces mobiles à tester                |           20 | chaînes d'outils, frontières entre processus, contrats de passerelle/API                |
| Réutilisation du travail existant      |           20 | FastAPI déjà dans la pile, prototype existant, couche de services                       |

Les commodités réservées aux développeurs (rechargement à chaud, passation de maquettes, grands écosystèmes) ne sont délibérément **pas** notées ; elles comptent uniquement par le résultat pour l'utilisateur final qu'elles rendent possible.

### 3.2 Méthode et limites

Chaque option est notée de 1 à 5 par critère à partir de la documentation, de guides publiés et des mesures de code ci-dessus. **Les notes relèvent du jugement d'expert et ne sont pas des mesures.** Les trois options web obtiennent la même note pour l'apparence, l'interaction et l'efficacité par construction (même plateforme web) ; elles se distinguent par la cohérence, l'installation/le lancement et le comportement natif, ainsi que par la note B. Aucun test comparatif d'aucune option dans piXeval ni aucun test d'utilisabilité avec de vrais utilisateurs n'a encore été réalisé.

---

## 4. Solutions candidates

Les descriptions complètes avec avantages, inconvénients et comparaisons sont dans [01](01-pyside6-widgets-modernised.md), [02](02-qt-webengine-hybrid.md), [03](03-local-web-app-fastapi-react.md) et [04](04-pywebview-native-window.md) ; la notation est dans [05](05-comparison-and-roadmap.md).

**01 — Moderniser PySide6 Widgets.** Risque technique le plus faible et meilleure intégration native ; hors ligne, un seul processus, aucun nouvel outil. Mais QSS est un sous-ensemble de CSS (pas de moteurs de mise en page, d'effets ni de transitions), chaque composant moderne doit être fait sur mesure, l'itération est lente et l'écosystème de composants prêts à l'emploi est réduit. Elle n'évite pas la réécriture d'environ 70 000 lignes d'interface ; elle ne fait que conserver la boîte à outils. _Raison de la choisir :_ une frontière de processus ou un environnement d'exécution supplémentaire est inacceptable. _Raison de ne pas la choisir :_ le plafond d'interface le plus bas.

**02 — Hybride Qt WebEngine.** Intégrer des écrans web (Chromium) dans l'application Qt existante et les relier avec QtWebChannel. Elle conserve l'enveloppe Qt existante (fenêtre, menus, impression, boîtes de dialogue natives) et n'a pas besoin de serveur local. Les coûts sont la taille du programme compilé (QtWebEngine ajoute environ 256 Mo de fichiers aux 55–90 Mo de Qt Widgets), la complexité d'empaquetage de Chromium et une passerelle asynchrone. Avec une version unique, sa principale force (migrer écran par écran) n'est pas nécessaire. _Raison de la choisir :_ l'enveloppe Qt doit être conservée telle quelle et aucun serveur local n'est acceptable. _Raison de ne pas la choisir :_ de loin la plus lourde des quatre (environ 340–370 Mo de Qt dans le programme compilé, qu'elle double presque).

**03 — Application web locale dans le navigateur.** FastAPI sert une interface React ; un lanceur ouvre le navigateur par défaut. Liberté de conception et écosystème maximaux, croissance minimale de l'installateur, et réutilisation de FastAPI. Les navigateurs ne peuvent pas renvoyer de vrais chemins de fichiers, un serveur localhost demande une gestion du cycle de vie et un durcissement de la sécurité (liaison à la boucle locale, jetons, contrôles d'origine), et le produit ressemble à un site web. _Raison de la choisir :_ la voie la plus rapide et la plus légère. _Raison de ne pas la choisir :_ gestion des chemins de fichiers et impression de bureau.

**04 — Application web locale dans une fenêtre pywebview.** 03 plus une fenêtre native qui utilise la vue web du système d'exploitation et les boîtes de dialogue de fichier natives. Elle comble la principale lacune fonctionnelle de 03, n'ajoute aucun paquet Chromium (le moteur WebView2 fait partie de Windows et est présent sur tous les postes clients), n'ajoute qu'environ 2–3 Mo de binaires au programme compilé et conserve la chaîne PyInstaller. Coûts : dépendance au backend Windows de pywebview basé sur pythonnet, une base de mainteneurs réduite et peu d'extras de bureau (pas de mise à jour automatique ni de zone de notification intégrées). _Raison de la choisir :_ impression de bureau avec la plus petite empreinte livrée. _Raison de ne pas la choisir :_ dépend d'un paquet PyInstaller correct de pywebview et pythonnet, à démontrer lors du sondage de validation.

---

## 5. Analyse comparative

### 5.1 Taille du programme compilé

Les binaires Qt font partie du résultat compilé dès que Qt est impliqué. Les chiffres sont **mesurés à partir des wheels Windows sur PyPI** (listes de fichiers de PySide6 6.9.0 Essentials et Addons, OpenCV, SciPy, NumPy, pandas, scikit-image, matplotlib, pywebview, pythonnet), pas d'une vraie compilation. Les tableaux complets sont dans [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

| Couche d'interface | Ce qui est embarqué                                                                                                                                                                 | Ajout décompressé | Ajout compressé |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------: | --------------: |
| 01 Qt Widgets      | Qt6 Core/Gui/Widgets/Pdf/PrintSupport, modules PySide6, plugins (éventuellement OpenGL logiciel, traductions)                                                                       |        ≈ 55–90 Mo |      ≈ 20–33 Mo |
| 02 Qt WebEngine    | ce qui précède **plus** `Qt6WebEngineCore.dll` (199,5 Mo), traductions, paquets de ressources (255,7 Mo de fichiers WebEngine au total) et Quick/Qml/Network ≈ 26 Mo                |      ≈ 340–370 Mo |    ≈ 135–150 Mo |
| 03 Navigateur      | FastAPI/Uvicorn/Starlette/Pydantic ≈ 9 Mo, frontend web 0,34 Mo ; ni Qt ni moteur de navigateur                                                                                     |            ≈ 9 Mo |          ≈ 3 Mo |
| 04 pywebview       | ce qui précède **plus** pywebview 1,6 Mo (chargeur WebView2 et DLL d'interopérabilité ≈ 1 Mo) et pythonnet 0,7 Mo ; le moteur WebView2 fait partie de Windows et n'est pas embarqué |           ≈ 11 Mo |          ≈ 4 Mo |

| Programme compilé entier |  Décompressé | Compressé (approximation) | Par rapport à 04 |
| ------------------------ | -----------: | ------------------------: | ---------------: |
| 01 Qt Widgets            | ≈ 420–455 Mo |              ≈ 147–160 Mo |      +12 à +21 % |
| 02 Qt WebEngine          | ≈ 705–735 Mo |              ≈ 263–276 Mo |      +88 à +96 % |
| 03 Navigateur            |     ≈ 373 Mo |                  ≈ 130 Mo |             −1 % |
| 04 pywebview             |     ≈ 375 Mo |                  ≈ 131 Mo |        référence |

- **pywebview n'a pas de binaires de la taille de ceux de Qt :** il ajoute environ 2–3 Mo, contre environ 55–90 Mo pour Qt Widgets et 340–370 Mo avec WebEngine.
- **La pile commune du moteur pèse environ 364 Mo décompressés (≈ 127 Mo compressés),** dominée par OpenCV (110 Mo) et SciPy (116 Mo). La couche d'interface représente donc une grande part du résultat : Qt Widgets ajoute 12–21 % et Qt WebEngine double presque le programme.
- **Les enveloppes web ne sont plus petites que la compilation Qt actuelle que si Qt est retiré du programme compilé,** ce qui impose de supprimer les ~7 fichiers hors interface qui importent Qt (constat F1).
- Non mesuré : l'environnement d'exécution Python, les autres dépendances, le surcoût de PyInstaller, la compression de l'installateur. Une vraie compilation est la première tâche de validation.

### 5.2 Décision 1 : Qt Widgets ou web ?

|                                                          |                            01 Qt Widgets |                           Interface web (02, 03, 04) |
| -------------------------------------------------------- | ---------------------------------------: | ---------------------------------------------------: |
| Esthétique, interaction, efficacité (apparence et usage) |                                  2, 2, 3 |                                              5, 5, 5 |
| Cohérence, installation et lancement, comportement natif |                                  5, 5, 5 |                    3–5, 3–4, 2–5 (selon l'enveloppe) |
| Taille du programme compilé                              | 3 (≈ 420–455 Mo, 12–21 % de plus que 04) | 1–5 (≈ 373–375 Mo pour 03/04 ; ≈ 705–735 Mo pour 02) |
| **Note A : expérience de l'utilisateur final**           |                                   **64** |                                            **86–94** |
| **Note B : facilité avec Python**                        |                                   **88** |                                            **60–80** |

Les options web offrent aux utilisateurs finaux une interface nettement meilleure, et les meilleures enveloppes web sont **plus petites que la compilation Qt** car elles abandonnent les binaires de Qt. Les limites de Qt Widgets sont structurelles (QSS n'a ni moteurs de mise en page, ni vraies ombres, ni flou, ni transitions ; les composants modernes sont dessinés à la main) ; les coûts du web sont des tâches identifiables. Qt Widgets ne dépasse la meilleure enveloppe web que si l'expérience de l'utilisateur final pèse moins d'environ 32 % (face à 03 : 27 % ; face à 02 : 54 %).

### 5.3 Décision 2 : quelle enveloppe web ?

| Aspect                        | **02 Navigateur intégré (Qt WebEngine)**           | **04 Fenêtre pywebview + repli sur navigateur**                                                      | **03 Backend Python + navigateur externe** |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Apparence et interaction      | identiques                                         | identiques                                                                                           | identiques                                 |
| Cohérence du rendu            | identique sur tous les PC                          | très proche (Edge WebView2, basé sur Chromium, présent sur tous les clients, mis à jour par Windows) | dépend du navigateur                       |
| Ce que voit l'utilisateur     | la fenêtre de l'application Qt                     | une petite fenêtre native                                                                            | un onglet ou une fenêtre de navigateur     |
| **Programme compilé (total)** | **≈ 705–735 Mo** (couche d'interface ≈ 340–370 Mo) | **≈ 375 Mo** (couche d'interface ≈ 11 Mo)                                                            | **≈ 373 Mo** (couche d'interface ≈ 9 Mo)   |
| Téléchargement / mise à jour  | ≈ 263–276 Mo                                       | ≈ 131 Mo                                                                                             | ≈ 130 Mo                                   |
| Démarrage                     | plus lent                                          | rapide                                                                                               | serveur, puis navigateur                   |
| Prérequis                     | aucun                                              | aucun (WebView2 présent sur tous les clients)                                                        | un navigateur moderne                      |
| Sélecteurs de fichier/dossier | natifs (Qt)                                        | natifs (pywebview) ; via le serveur en mode de repli                                                 | pas depuis un navigateur                   |
| Note A / B                    | 88 / 60                                            | **94 / 74**                                                                                          | 86 / 80                                    |

Le repli est une fonction du lanceur, pas un comportement intégré à pywebview : le lanceur essaie la fenêtre et ouvre le navigateur par défaut à la même adresse en cas d'échec. Avec WebView2 sur chaque client, ce n'est qu'un filet de sécurité. 04 et 03 sont une même base de code avec deux modes de présentation.

### 5.4 Notes combinées

| Option                   | Note A : expérience de l'utilisateur final | Note B : facilité avec Python | **Combinée (A 80 / B 20)** |
| ------------------------ | -----------------------------------------: | ----------------------------: | -------------------------: |
| 01 Qt Widgets, modernisé |                                         64 |                        **88** |                       68,8 |
| 02 Hybride Qt WebEngine  |                                         88 |                            60 |                       82,4 |
| 03 Navigateur            |                                         86 |                            80 |                       84,8 |
| **04 Fenêtre pywebview** |                                     **94** |                            74 |                   **90,0** |

Les notes par critère, les raisons et la vue à deux axes sont dans [05-comparison-and-roadmap.md](05-comparison-and-roadmap.md).

### 5.5 Sensibilité

| Poids de A                        |       01 |   02 |       03 |       04 |
| --------------------------------- | -------: | ---: | -------: | -------: |
| 100 % (utilisateur final seul)    |     64,0 | 88,0 |     86,0 | **94,0** |
| 80 % (retenu)                     |     68,8 | 82,4 |     84,8 | **90,0** |
| 60 %                              |     73,6 | 76,8 |     83,6 | **86,0** |
| 50 %                              |     76,0 | 74,0 |     83,0 | **84,0** |
| 40 %                              |     78,4 | 71,2 | **82,4** |     82,0 |
| 30 %                              | **80,8** | 68,4 |     81,8 |     80,0 |
| 0 % (confort du développeur seul) | **88,0** | 60,0 |     80,0 |     74,0 |

| Poids du critère de taille dans A |   01 |   02 |   03 |       04 |
| --------------------------------- | ---: | ---: | ---: | -------: |
| 0 % (taille ignorée)              | 69,1 | 88,5 | 83,5 | **89,4** |
| 10 % (retenu)                     | 68,8 | 82,4 | 84,8 | **90,0** |
| 30 %                              | 68,1 | 70,3 | 87,3 | **91,0** |

Interprétation :

1. **Pour les utilisateurs finaux, les options web gagnent nettement** (86–94 contre 64). Qt Widgets ne mène que lorsque le confort du développeur pèse plus que l'expérience de l'utilisateur final (poids de l'utilisateur final inférieur à environ 32 %).
2. **04 se classe première pour tout poids de 100 % jusqu'à environ 43 %.**
3. **La taille est ce qui retient 02.** Si la taille est ignorée, 02 est à moins d'un point de 04 (88,5 contre 89,4) ; au poids retenu elle tombe à 82,4 (troisième), et davantage à mesure que la taille compte plus.

### 5.6 L'expérience du point de vue de l'utilisateur final

- **01 :** démarre vite et se ressent comme un programme de bureau normal, mais les écrans paraissent datés ; le programme embarque 55–90 Mo de Qt.
- **02 :** l'interface la plus soignée et la plus cohérente, mais le programme est presque deux fois plus gros que 04, chaque installation et mise à jour pèse environ 135–150 Mo (compressés) de plus, et le démarrage est plus lent.
- **03 :** aussi belle que les autres et la plus petite, mais elle vit dans un onglet de navigateur : pas de vrais sélecteurs de dossier, un rendu qui dépend du navigateur de l'utilisateur.
- **04 :** aussi belle que 02, s'ouvre dans sa propre fenêtre, utilise des sélecteurs natifs, démarre vite et est plus petite que l'installateur actuel ; elle utilise le moteur Edge WebView2 déjà présent sur chaque client.

---

## 6. Recommandation

### 6.1 Architecture proposée

```
 lanceur piXeval (PyInstaller)
   ├─ Moteur Python : db / omr / cat_lib / dataReports   (code existant, derrière une couche de services)
   ├─ FastAPI + Uvicorn sur 127.0.0.1 (jeton par lancement)  ← déjà dans la pile
   ├─ Interface React + TypeScript (build statique servi par FastAPI)
   └─ enveloppe : fenêtre native pywebview  ── repli : navigateur du système
```

### 6.2 Justification (Décision 1 : web ; Décision 2 : pywebview)

1. **Elle respecte les contraintes énoncées :** le moteur reste en Python ; React, FastAPI, pywebview et les bibliothèques associées sont open source avec des licences permissives (à confirmer composant par composant avant la publication), si bien qu'aucun coût de licence ni d'hébergement n'apparaît.
2. **Elle offre aux utilisateurs finaux la meilleure expérience (94 sur 100, devant les 88 de 02) avec une meilleure note de mise en œuvre (74 contre 60) :** la plateforme web propose le plus vaste ensemble de composants matures et accessibles (tableaux, boîtes de dialogue, graphiques, recherche de commandes, gestion du clavier) et un design visuel moderne. Le prototype le démontre : 30 fichiers source de pages et de boîtes de dialogue et environ 3 400 lignes de TypeScript et de CSS reproduisent les écrans et boîtes de dialogue du flux principal de piXeval (des matières aux notes, utilitaires et configuration) dans un design moderne, avec un comportement fonctionnel de création/modification/suppression sur des données d'exemple. Les applications auxiliaires du dépôt (EBAP, CAT3 Audit) ne sont pas couvertes.
3. **Elle comble la principale lacune fonctionnelle de l'option navigateur** (vrais chemins de fichiers) grâce aux boîtes de dialogue natives exposées par pywebview, et évite de livrer Chromium : la couche d'interface ajoute environ 11 Mo au résultat compilé, contre environ 340–370 Mo pour le navigateur Qt intégré, et environ 45–80 Mo de moins que la compilation Qt actuelle une fois Qt retiré (12–21 % plus petite).
4. **Les régressions sont détectées avant que les utilisateurs ne les voient :** le code typé (TypeScript) et les tests automatisés de navigateur (Playwright) vérifient chaque écran sur de vraies bases d'exemple avant la publication, ce qui compte pour une mise à jour majeure en une seule fois.
5. **Elle garde petits le programme compilé et ses mises à jour :** un exécutable Python plus le moteur WebView2 de Windows déjà présent sur chaque client, en réutilisant la chaîne PyInstaller et Inno Setup existante.
6. **Elle garde ouvertes des options futures :** la même API peut plus tard prendre en charge un déploiement en réseau local ou distant, ce que l'option Qt seul ne peut pas.
7. **Elle est en partie réversible :** si la vue web du système d'exploitation se révélait inadaptée, le même build web fonctionne dans le navigateur (03) ou dans Qt WebEngine (02) sans réécrire l'interface, ce qui limite les dégâts d'un mauvais choix d'enveloppe avant la version unique.

### 6.3 Pourquoi les trois autres n'ont pas été retenues

- **01 :** la plus facile à mettre en œuvre (88) et la publication la plus sûre, mais les utilisateurs finaux obtiennent l'expérience la plus faible (64) : dessin sur mesure de chaque composant moderne, ni vrais effets ni transitions, un aspect daté. L'objectif principal resterait en grande partie non atteint.
- **02 :** expérience de l'utilisateur final proche de 04 (88 contre 94) avec le rendu le plus cohérent, mais sa couche d'interface ajoute environ 340–370 Mo au programme compilé (environ 135–150 Mo de plus à télécharger, à chaque installation et mise à jour), démarre plus lentement et est plus difficile à mettre en œuvre (60 contre 74) : Chromium dans l'installateur, empaquetage de QtWebEngine et passerelle asynchrone. C'est le choix si un moteur de rendu identique garanti compte plus que la taille, ou si un serveur local est inacceptable.
- **03 :** le même frontend avec le navigateur de l'utilisateur comme fenêtre : la plus simple à livrer (80) et la plus petite, mais l'option web la plus faible pour les utilisateurs finaux (86) : pas de sélecteurs de fichier natifs et un rendu qui varie selon le navigateur. Elle est conservée comme **mode de repli de 04**.

---

## 7. Risques et atténuations

| Risque                                                                                                                        | Probabilité / impact | Atténuation                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| La logique métier intégrée aux widgets est mal extraite                                                                       | élevée / élevé       | tests de caractérisation des sorties de notation, d'OMR et de rapports avant de remanier (F3)                                                                                                                         |
| Défauts introduits pendant la réécriture de l'interface (y compris par du code généré par IA) dans les flux de notes ou d'OMR | moyenne / élevé      | garder le moteur inchangé ; TypeScript strict ; tests unitaires de la couche de services ; tests de bout en bout (Playwright) sur de vraies bases d'exemple ; relecture humaine de tout changement touchant les notes |
| Différences entre versions de Windows ou entre versions du runtime WebView2                                                   | faible / moyen       | tester sous Windows 10 et 11 ; éviter le CSS/JS de pointe ; le repli sur navigateur reste un filet de sécurité                                                                                                        |
| Le backend Windows de pywebview dépend de pythonnet et peut mal s'empaqueter avec PyInstaller                                 | moyenne / élevé      | démontrer le paquet lors du sondage de validation ; garder le repli sur navigateur                                                                                                                                    |
| Serveur local exposé à d'autres processus locaux                                                                              | moyenne / élevé      | liaison à la boucle locale, port aléatoire, jeton par lancement, contrôles d'origine stricts                                                                                                                          |
| Une régression ou une fonction manquante touche tous les utilisateurs en même temps (pas de déploiement progressif)           | élevée / élevé       | liste de parité écrite de chaque écran, boîte de dialogue et rapport ; tests de bout en bout sur de vraies bases ; bêta fermée avant la publication                                                                   |
| Les bases de données d'utilisateurs existantes ne s'ouvrent ou ne migrent pas                                                 | moyenne / élevé      | la nouvelle version ouvre les bases actuelles sans changement de schéma ; sauvegarde automatique avant la première ouverture ; conserver l'ancien installateur pour un retour arrière                                 |
| Deux versions installées côte à côte écrivent dans un même fichier SQLite                                                     | faible / élevé       | service à écrivain unique ; l'installateur détecte et signale une installation héritée                                                                                                                                |
| Les grands tableaux ou les écrans riches en images sont lents                                                                 | moyenne / moyen      | tableaux virtualisés ; test avec plus de 5 000 lignes ; miniatures pour les numérisations                                                                                                                             |
| Dépendance à un seul mainteneur (pywebview)                                                                                   | moyenne / moyen      | fine couche d'abstraction sur l'enveloppe ; repli sur le navigateur ou Qt WebEngine                                                                                                                                   |
| L'économie de taille est perdue parce que Qt reste dans le programme compilé                                                  | moyenne / moyen      | supprimer les ~7 importations de Qt hors interface lors de l'étape de la couche de services ; vérifier le contenu du paquet lors du sondage de validation                                                             |
| Dérive du périmètre à cause des plusieurs applications du dépôt (EBAP, CAT3 Audit)                                            | moyenne / moyen      | migrer d'abord piXeval ; réutiliser ensuite le système de conception                                                                                                                                                  |

---

## 8. Plan de mise en œuvre (une version majeure)

| Phase | Travail                                                                                                                                           | Critère de sortie                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 0     | Relire le rapport ; exécuter le sondage de validation (§9)                                                                                        | note de décision                                                                |
| 1     | Couche de services ; remplacer les signaux Qt par des rappels/événements ; tests de caractérisation                                               | application Qt actuelle inchangée et qui réussit les tests                      |
| 2     | API FastAPI pour chaque cas d'usage ; construire l'interface web complète par-dessus, à partir du prototype                                       | liste de parité : chaque écran, boîte de dialogue et rapport actuels            |
| 3     | Dialogues natifs via pywebview ; flux OMR et de correction avec événements de progression ; installateur ; ouverture des bases existantes         | la version candidate réussit les tests de bout en bout sur de vraies bases      |
| 4     | Bêta fermée avec de vrais utilisateurs et de vraies bases ; corriger les défauts ; garder l'ancien installateur disponible pour un retour arrière | validation de la bêta                                                           |
| 5     | Publier comme prochaine version majeure                                                                                                           | utilisateurs sur la nouvelle version ; ancien installateur conservé une version |

---

## 9. Tâches de validation avant engagement (non encore réalisées)

1. Construire un paquet PyInstaller de FastAPI + pywebview (y compris sa dépendance pythonnet) **sans Qt**, et **mesurer la taille de l'installateur, la taille installée et le démarrage à froid** par rapport à l'installateur actuel ; refaire le paquet avec Qt WebEngine pour comparer.
2. Vérifier le comportement de la fenêtre pywebview sous **Windows 10 et 11** (WebView2 est disponible sur tous les postes clients).
3. Prototyper la **passerelle de la boîte de dialogue native de dossier** et une numérisation de longue durée avec flux d'événements.
4. Mesurer les performances du **tableau des notes avec plus de 5 000 lignes** et d'un écran de revue d'images numérisées.
5. Mener une **comparaison d'utilisabilité** (temps de tâche et erreurs) entre un écran Qt actuel et son équivalent web avec quelques vrais utilisateurs.
6. Examiner les **licences** de chaque dépendance du paquet (y compris les composants LGPL si Qt reste dans la compilation).

---

## 10. Considérations de coût

Tous les composants de la pile recommandée (Python, FastAPI, React, TypeScript, pywebview, Vite) sont open source ; le seul coût est le temps de développement. Les options à base de Qt n'ont pas non plus de redevance tant que les termes de la LGPL sont respectés. L'effort de développement est dominé par la réimplémentation de l'interface (F2), que toutes les options partagent ; la relecture et les tests restent nécessaires quelle que soit la façon d'écrire le code.

---

## 11. Limites de cette étude

- Les notes sont des jugements ; l'analyse de sensibilité montre comment elles changent mais n'élimine pas la subjectivité.
- La taille de l'installateur, les performances et les données des machines cibles n'ont pas été mesurées (§9).
- Les faits technologiques externes (Qt, pywebview) proviennent de la documentation publique et des articles listés ci-dessous ; les numéros de version et l'état des projets évoluent vite et doivent être revérifiés au moment de décider.
- Les nombres de lignes mesurent la taille, pas la complexité ; ils indiquent l'effort relatif mais pas l'effort exact.
- Le prototype utilise des données d'exemple et n'exécute pas le vrai moteur.

---

## 12. Conclusion

Le moteur de traitement de piXeval est en grande partie indépendant de son interface utilisateur, si bien que remplacer la technologie d'interface est techniquement faisable sans quitter Python. Toutes les options exigent la même première étape, une couche de services. La plateforme web offre aux utilisateurs finaux une expérience nettement meilleure (86–94 sur 100 contre 64 pour Qt Widgets). Un moteur Python avec cette interface dans une fenêtre native atteint la meilleure note d'utilisateur final (94, contre 88 pour le navigateur Qt WebEngine intégré) avec une meilleure note de mise en œuvre (74 contre 60), et avec un programme compilé bien plus petit (environ 11 Mo pour la couche d'interface contre environ 340–370 Mo avec Qt WebEngine, qui doublerait presque le programme ; 12–21 % plus petit que la compilation actuelle en Qt Widgets), avec le navigateur externe comme repli de sécurité. Qt Widgets ne serait préféré que si le confort du développeur comptait pour plus des deux tiers de la décision. Comme la migration est une version unique, le risque dominant est la qualité de la version plutôt que le chemin de migration, d'où la présence dans le plan d'une liste de parité, d'une bêta fermée et d'un chemin de retour arrière. L'étape suivante est le travail de validation du §9, qui peut être réalisé dans un sondage court et peu risqué avant tout investissement important.

---

## Références

1. Documentation Qt, _User Interfaces_ (Widgets, animation et applications de bureau complexes), <https://doc.qt.io/qt-6.9/topics-ui.html>
2. Qt for Python, _QtWebChannel_, <https://doc.qt.io/qtforpython-6/PySide6/QtWebChannel/index.html>
3. Python GUIs, _HTML, CSS and JS in a desktop app (Qt WebEngine)_, <https://www.pythonguis.com/faq/html-css-and-js-in-a-desktop-app-qt-webengine-vs-electron-vs/>
4. Liste du paquet pywebview 6.x, <https://www.archlinux.org/packages/extra/any/python-pywebview>
5. Métriques du dépôt piXeval : [00-baseline-current-stack.md](00-baseline-current-stack.md)
