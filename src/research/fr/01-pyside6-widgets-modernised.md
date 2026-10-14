# 01 · Rester sur PySide6 Widgets et le moderniser

**En une ligne :** conserver l'application de bureau Qt Widgets, terminer la refonte déjà commencée dans `src/modern_ui` et investir dans un thème et une bibliothèque de composants dignes de ce nom.

## De quoi s'agit-il

La même technologie qu'aujourd'hui (PySide6 6.9, Qt Widgets, QSS), mais avec un système de design délibéré : jetons de couleurs et d'espacements, cartes, tableaux, boîtes de dialogue et notifications réutilisables, un cadre à barre latérale et une séparation nette entre interface et services. `src/modern_ui` contient déjà le début : `theme.py`, `buttons.py`, `inputs.py`, `table.py`, `surfaces.py`, un cadre avec barre latérale et barre supérieure, et la génération de ressources QRC.

## Comment cela s'intègre à piXeval

- Aucun changement pour l'empaquetage (PyInstaller + Inno Setup), l'exécution ou le modèle à processus unique.
- Du code Python appelle du code Python ; pas d'API, pas de passerelle, pas de second langage.
- Les signaux de progression (`SignalInstance`) continuent de fonctionner tels quels.

## Avantages

- **Risque technique le plus faible.** Rien de nouveau à apprendre, livrer, signer ou déboguer.
- **Un seul processus, un seul langage, entièrement hors ligne.** Rien n'écoute sur un port, donc pas d'alertes de pare-feu ou d'antivirus.
- **L'intégration native est gratuite :** `QFileDialog`, impression (`QtPrintSupport`), PDF (`QtPdf`), glisser-déposer, presse-papiers, zone de notification, boîtes de dialogue système.
- **Les ressources existantes et le savoir-faire Qt sont réutilisés** (QSS, icônes SVG, Lottie, habitudes de Qt Designer).
- Démarrage rapide et faible mémoire par rapport à un moteur de navigateur embarqué. Les binaires Qt du programme compilé représentent environ 55–90 Mo (Qt6 Core 9,9, Gui 9,4, Widgets 6,5, Pdf 5,7 Mo, modules PySide6 ≈ 12 Mo, plugins, éventuellement OpenGL logiciel 20,6 Mo), mesurés à partir des wheels Windows.
- Les grands tableaux de données restent rapides avec `QAbstractItemModel` et `QTableView`.

## Inconvénients

- **Le plafond de design est plus bas et le coût par composant plus élevé.** QSS est un sous-ensemble de CSS : pas de flexbox/grid, pas de vraies ombres (`QGraphicsDropShadowEffect` est lent et rogne), pas de flou d'arrière-plan, pas de variables CSS ni de transitions. La documentation de Qt elle-même note que les Widgets « ne s'adaptent pas bien aux animations » (voir les sources en [05](05-comparison-and-roadmap.md)).
- **Chaque composant moderne est construit à la main.** L'aperçu web (palette de commandes, notifications, tableaux filtrables, boîtes de dialogue à onglets, graphiques, états vides) utilise des motifs prêts à l'emploi ; avec les Widgets, chacun est une classe maison à concevoir, dessiner et tester.
- **Itération de design lente.** Un changement visuel impose de relancer ; il n'y a ni rechargement à chaud ni inspecteur d'outils de développement du navigateur pour QSS.
- **La refonte reste une réécriture d'environ 70 k lignes.** `src/modern_ui` fait 2,3 k lignes contre 71 k pour l'interface actuelle. Choisir cette option n'évite pas la réécriture ; elle garde seulement le langage.
- **Outillage :** les maquettes ne se transmettent pas directement (Figma → CSS est direct ; Figma → QSS est manuel), et l'écosystème public de composants et d'exemples de style pour Qt Widgets est bien plus petit que pour l'interface web.
- **Tester l'interface est plus difficile** (`pytest-qt` fonctionne mais est bien moins courant que les tests de type Playwright/Cypress).
- Les particularités de la haute densité de pixels, des polices et du mode sombre varient selon l'OS et demandent un soin manuel.

## Avantages par rapport aux autres options

- face aux options web (03, 04) : pas de serveur local, pas de dépendance à WebView/Chromium, pas de chaîne d'outils JS, pas de passerelle à maintenir, pas de surface de sécurité due à un service HTTP local.
- face à l'hybride (02) : binaire plus petit, empaquetage plus simple, une seule pile de rendu.

## Inconvénients par rapport aux autres options

- La voie la plus lente vers une interface _visiblement moderne_ ; chaque détail de finition est sur mesure.
- Aucune voie vers une version réseau local / distante / accessible par navigateur sans une réécriture distincte.
- Écosystème de composants plus petit que celui du web.

## Quand la choisir

- L'objectif est « plus beau, même produit », et un second environnement d'exécution ou une frontière de processus est inacceptable (par exemple des postes isolés hors ligne qui bloquent les serveurs locaux).

## Effort et risques

- Effort : élevé mais prévisible ; le travail porte sur les mêmes écrans dans tous les cas. Le risque se concentre sur les composants dessinés sur mesure et sur la cohérence entre l'ancienne et la nouvelle interface tant qu'elles coexistent.
- À faire d'abord : extraire les services des widgets (voir le constat 3 dans [00](00-baseline-current-stack.md)). C'est rentable avec toutes les options.
