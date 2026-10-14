# 02 · Hybride : cadre PySide6 + interface web dans Qt WebEngine

**En une ligne :** conserver l'application PySide6 (fenêtre, menus, boîtes de dialogue, impression, licences) et afficher les écrans sous forme de pages web dans un Chromium intégré (`QWebEngineView`), en dialoguant avec Python via `QWebChannel`.

## De quoi s'agit-il

Qt WebEngine intègre Chromium comme un widget. `QtWebChannel` offre une communication directe entre des objets Python et du JavaScript dans la page (pris en charge nativement par WebEngine). Les écrans web peuvent être construits avec React/Vite, comme dans l'aperçu interactif.

## Comment cela s'intègre à piXeval

- L'application Qt actuelle reste l'hôte : chaque écran est une page web ouverte dans un `QWebEngineView`.
- Les services Python sont exposés comme objets du canal (ou la même logique est aussi exposée via une API locale).
- Les boîtes de dialogue natives de fichiers/dossiers, l'impression et le PDF restent des appels Qt.
- L'empaquetage reste PyInstaller + Inno Setup, avec les ressources de QtWebEngine en plus.

## Avantages

- **Conserve le cadre Qt existant.** Fenêtre, menus, impression, gestion des licences et boîtes de dialogue natives restent exactement tels quels ; seul le contenu des écrans devient des pages web.
- **Tout l'écosystème de l'interface web** (React, bibliothèques de composants, graphiques, rechargement à chaud, passation depuis Figma) _et_ toutes les capacités natives de Qt (boîtes de dialogue, impression, glisser-déposer).
- **Pas de serveur local nécessaire** (le canal est dans le processus), donc pas d'alertes de pare-feu ni de conception de sécurité de port/jeton.
- Le même environnement d'exécution Python et la même technologie d'installateur qu'aujourd'hui.
- Le frontend peut être développé et testé dans un navigateur ordinaire (en simulant le canal) à pleine vitesse.

## Inconvénients

- **Taille et mémoire, mesurées :** les wheels PySide6 pour Windows montrent QtWebEngine à **255,7 Mo décompressé (105 Mo compressé)** : `Qt6WebEngineCore.dll` seul fait 199,5 Mo, plus ≈ 40 Mo de traductions et ≈ 13 Mo de paquets de ressources. Avec les bibliothèques Quick/Qml/Network nécessaires, la part Qt du programme compilé passe de ≈ 55–90 Mo (Widgets seul) à **≈ 340–370 Mo**, soit environ 135–150 Mo de plus à télécharger à chaque installation et mise à jour. Une consommation de RAM supérieure à celle de Widgets est aussi attendue (non mesurée).
- **PyInstaller + QtWebEngine est délicat** (`QtWebEngineProcess`, ressources, locales, options de bac à sable) ; prévoir du temps pour déboguer la compilation sous Windows.
- **Deux technologies d'interface dans un même processus** pendant la transition ; le style et la navigation doivent rester cohérents entre le cadre Widgets et le contenu web.
- **La passerelle est asynchrone** et demande un contrat typé. Des outils tiers existent (p. ex. `pywebchannel` génère des types TypeScript) mais ce sont de petits projets ; mieux vaut prévoir de maintenir soi-même une fine couche de passerelle.
- Chromium est lié à la version de Qt : les mises à jour de la plateforme web et les correctifs de sécurité suivent donc les versions de Qt.
- Licences : PySide6 et Qt WebEngine sont disponibles sous LGPL/GPL ; confirmer les obligations de distribution avant livraison (liaison dynamique, mentions).
- Pas de voie vers « simplement ouvrir dans un navigateur » sauf à servir aussi le même frontend en HTTP (possible, mais vous construisez alors aussi l'option 03).

## Avantages par rapport aux autres options

- face à 01 : écosystème web et rapidité d'itération de l'interface, sans abandonner l'application Qt.
- face à 03/04 : **hors ligne, pas de cycle de vie de serveur, pas de port local à sécuriser, boîtes de dialogue Qt natives et impression inchangées.**

## Inconvénients par rapport aux autres options

- face à 03/04 : bien plus lourd (Chromium) et conserve toute la chaîne de dépendances Qt ; pas d'accès par navigateur ; CI d'empaquetage plus difficile.
- face à 01 : plus gros, plus de pièces mobiles.

## Quand la choisir

- Le cadre Qt existant (menus, impression, boîtes de dialogue natives, gestion des licences) doit être conservé tel quel, un serveur local est inacceptable et la taille de l'installateur n'est pas une contrainte stricte.

## Effort et risques

- Effort : moyen à élevé ; la passerelle et l'empaquetage sont les inconnues. Risque : empaquetage de WebEngine sous Windows, performances de très grands tableaux dans la vue web, double maintenance pendant la transition.
