# 03 · Application web locale : Python (FastAPI) + React, ouverte dans le navigateur

**En une ligne :** double-clic sur pixeval → le moteur Python démarre un serveur web local → l'interface s'ouvre dans le navigateur de l'utilisateur. Python reste le produit ; l'interface devient un frontend web.

C'est l'architecture pour laquelle l'aperçu interactif de la nouvelle interface est construit (<https://prmpsmart.github.io/pixeval_web/>). L'option 04 est la même architecture avec une fenêtre native au lieu d'un onglet de navigateur.

## Comment cela fonctionne

```
 lanceur pixeval (exe PyInstaller)
   ├─ démarre Uvicorn sur 127.0.0.1:<port libre>   ← application FastAPI (déjà dans requirements.txt)
   │     ├─ /api/*   routes minces → couche de services → db / omr / cat_lib / dataReports (code existant)
   │     ├─ /events  progression des numérisations, sauvegardes et corrections (SSE ou WebSocket)
   │     └─ /*       l'application React compilée (fichiers statiques issus de `npm run build`)
   └─ ouvre le navigateur par défaut (ou Chrome/Edge en mode `--app=` pour une fenêtre sans cadre de navigateur)
```

- La fenêtre de console/terminal peut être masquée (exe sans console, icône dans la zone de notification) ou conservée comme vue des journaux.
- Les données locales restent dans SQLite exactement comme aujourd'hui.

## Avantages

- **Le meilleur écosystème d'interface et d'expérience disponible** pour le même effort : composants, graphiques, tableaux, accessibilité, i18n, animation, mode sombre, mises en page adaptatives, passation de Figma à CSS, rechargement à chaud, outils de développement du navigateur.
- **Ni Qt ni Chromium embarqué.** Le navigateur de l'utilisateur est le moteur de rendu : la couche d'interface représente environ 9 Mo (FastAPI/Uvicorn/Starlette/Pydantic ≈ 8,9 Mo, le frontend 0,34 Mo), moins que les binaires Qt qu'elle remplace (≈ 55–90 Mo).
- **Réutilise le moteur Python et FastAPI**, déjà présents dans la base de code.
- **Les maquettes et prototypes sont directement réutilisables** (l'aperçu React contient déjà tous les écrans et boîtes de dialogue).
- **Testable :** `pytest` sur l'API, Playwright sur l'interface ; la CI est simple.
- **Ouvre des portes pour plus tard sans dépense supplémentaire :** la même API peut servir plus tard une installation en réseau local/serveur ou des postes de correction distants.
- Les tâches longues deviennent plus propres : tâches en arrière-plan + flux d'événements plutôt que de passer des signaux Qt à la logique.
- La séparation des responsabilités impose la couche de services dont la base de code a de toute façon besoin.

## Inconvénients

- **Les navigateurs ne peuvent pas donner à Python de vrais chemins de fichiers.** piXeval s'appuie sur des chemins de dossiers (dossiers de numérisation, sauvegardes, exports). Options : demander au _serveur_ d'afficher une boîte de dialogue native (Tk/pywebview), saisir/coller les chemins ou téléverser les fichiers. C'est la plus grande lacune fonctionnelle par rapport à Qt (corrigée en 04).
- **Cycle de vie du serveur à gérer :** choisir un port libre, s'arrêter à la fermeture du dernier onglet, gérer un second lancement, afficher quelque chose d'utile si l'utilisateur ferme le terminal.
- **Une conception de la sécurité est nécessaire** même en local : écoute sur 127.0.0.1 uniquement, jeton d'accès par lancement, contrôles stricts de CORS/Origin (d'autres processus locaux et pages web peuvent appeler localhost).
- **Des alertes d'antivirus/pare-feu** peuvent apparaître pour un programme qui ouvre un socket (généralement aucune en boucle locale, mais les outils d'entreprise diffèrent).
- **Variabilité des navigateurs et erreurs d'utilisateur :** navigateurs et versions différents, onglets fermés par erreur, plusieurs onglets modifiant le même fichier SQLite.
- **L'impression et le PDF** sont pris en charge par le navigateur ou par une génération côté serveur (reportlab/xhtml2pdf existent déjà), pas par `QtPrint`.
- **Un second langage et une seconde chaîne d'outils pour l'interface** (TypeScript ; Node n'est nécessaire que pour _compiler_, les utilisateurs finaux n'ont besoin ni de l'un ni de l'autre).
- Pour certains utilisateurs, cela ressemble à « un site web », pas à un programme de bureau.

## Avantages par rapport aux autres options

- face à 01 : composants et vitesse de conception bien supérieurs ; pas de limites de style de Qt.
- face à 02 : pas de Chromium dans l'installateur ; empaquetage plus simple ; pas de passerelle.
- face à 04 : la plus simple et la plus petite ; rien de plus à livrer.

## Inconvénients par rapport aux autres options

- face à 04 : pas de fenêtre native, pas de boîtes de dialogue de fichiers natives, dépend du navigateur de l'utilisateur.
- face à 01 : demande une couche de services/API et une chaîne de compilation du frontend.

## Quand la choisir

- La voie la plus rapide vers une interface moderne avec un poids d'installation minimal, et un produit qui « s'exécute dans le navigateur » est acceptable.
- On veut garder ouverte la porte du réseau local/distant/multi-utilisateur pour plus tard.

## Effort et risques

- Effort : extraction de la couche de services + API (commune à toutes les options) + portage de l'interface. Risques : gestion des chemins de fichiers, durcissement du cycle de vie et de la sécurité, concurrence SQLite si deux interfaces sont ouvertes.
- Atténuations : choisir l'option 04 pour la fenêtre et les boîtes de dialogue natives ; garder une API à écrivain unique.
