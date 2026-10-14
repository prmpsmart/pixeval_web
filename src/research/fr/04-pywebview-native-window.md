# 04 · Application web locale dans une fenêtre native avec pywebview

**En une ligne :** la même application FastAPI + React que l'option 03, mais affichée dans une petite fenêtre native (sans cadre de navigateur) créée par **pywebview**, qui utilise le moteur WebView2 de Windows.

## De quoi il s'agit

pywebview est une bibliothèque Python qui ouvre une fenêtre contenant une vue web : WebView2 (le moteur d'Edge basé sur Chromium) sous Windows. Elle peut charger une URL (le serveur FastAPI local) ou des fichiers locaux, offre une passerelle JS↔Python (`js_api`) et fournit des **boîtes de dialogue natives de fichier/dossier** depuis Python. Une version récente de pywebview (6.x) est empaquetée dans les principales distributions.

## Comment elle s'intègre à piXeval

```
 pixeval.exe (PyInstaller)
   ├─ FastAPI + Uvicorn dans un thread d'arrière-plan  (même API que l'option 03)
   ├─ webview.create_window("piXeval", "http://127.0.0.1:<port>/?token=…")
   └─ js_api : pickFolder(), pickFile(), saveFile()  → renvoie de vrais chemins à l'interface
```

- L'installateur reste PyInstaller + Inno Setup. Le moteur WebView2 fait partie de Windows et est disponible sur tous les postes clients, donc rien de plus n'est installé.
- Le même build React fonctionne aussi dans un navigateur ordinaire pour le développement et comme solution de repli (bouton « ouvrir dans le navigateur »).

## Avantages

- **Tout ce qui est bien dans 03, plus une vraie fenêtre de bureau** avec barre de titre, icône, comportement d'instance unique, et sans onglets de navigateur à fermer par erreur.
- **Résout le problème des chemins de fichiers :** les boîtes de dialogue de dossier/fichier/enregistrement sont natives et renvoient de vrais chemins.
- **Empreinte minuscule, mesurée :** pywebview pèse 1,6 Mo décompressé (WebView2 Core 0,65 Mo, DLL de chargement ≈ 0,45 Mo, interop ≈ 0,02 Mo) plus pythonnet 0,7 Mo, soit **environ 2–3 Mo de binaires**, contre environ 55–90 Mo pour Qt Widgets et environ 340–370 Mo avec Qt WebEngine. Le moteur WebView2 fait partie de Windows et n'est pas embarqué. Avec FastAPI, Uvicorn, Pydantic et le frontend (0,34 Mo pour le prototype), toute la couche d'interface fait environ 11 Mo, moins que les binaires Qt qu'elle remplace.
- **Point d'entrée en Python pur**, donc ni Rust ni Node dans l'application livrée.
- Repli naturel : si la vue web n'est pas disponible, on ouvre le navigateur du système.
- Surface d'attaque plus réduite qu'un onglet de navigateur (pas d'extensions, navigation contrôlée).

## Inconvénients

- **Le backend Windows de pywebview s'appuie sur pythonnet** (passerelle .NET), que PyInstaller doit empaqueter correctement. À démontrer tôt (à vérifier).
- **Un petit projet avec peu de mainteneurs** ; moins d'exemples d'empaquetage en production que pour Qt.
- **Fonctions de bureau limitées d'origine** (zone de notification, notifications et mise à jour automatique sont minimales, il faudrait donc les construire à part si nécessaire).
- **L'impression/PDF depuis la vue web varie selon le système ;** la génération de PDF côté serveur (déjà dans la base de code) est la voie sûre.
- **Le débogage est plus difficile** que dans un navigateur ordinaire (utiliser le navigateur pour le développement, activer l'option de débogage au besoin).
- Mêmes obligations de cycle de vie et de sécurité du serveur que pour 03 (jeton, boucle locale uniquement).

## Avantages par rapport aux autres options

- face à 03 : fenêtre et boîtes de dialogue natives, meilleure impression de produit, environnement maîtrisé.
- face à 02 : **des dizaines à des centaines de Mo en moins** ; pas d'empaquetage de QtWebEngine ; pas de dépendance à Qt dans la nouvelle interface.
- face à 01 : écosystème web, rechargement à chaud, vitesse de conception.

## Inconvénients par rapport aux autres options

- face à 02 : les fonctions natives de Qt (aperçu avant impression, affichage PDF Qt) doivent être remplacées par des équivalents web ou côté serveur.
- face à 01 : demande une couche de services/API et une chaîne de compilation du frontend.

## Quand la choisir

- On veut une application aux allures de bureau, un petit installateur, des boîtes de dialogue natives et la meilleure interface web, **sans ajouter de nouveau langage au produit livré.** C'est ce qui se rapproche le plus de « Python tourne en arrière-plan et l'interface s'ouvre dans une fenêtre d'application ou dans le navigateur ».

## Effort et risques

- Effort : le même que 03 plus un peu de colle (fenêtre, passerelle de dialogues, vérification de WebView2). Risques : empaquetage de pythonnet, dépendance à un seul mainteneur (atténuée car le repli est « ouvrir dans le navigateur », c'est-à-dire l'option 03).
