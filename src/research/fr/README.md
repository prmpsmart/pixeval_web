# Recherche : moderniser l'interface utilisateur de piXeval

Question : quelles sont les options pour améliorer l'interface et l'expérience d'utilisation de piXeval, en prenant comme base la configuration actuelle de PySide6, en conservant le moteur Python et sans ajouter de nouvelles dépenses ?

**Comment les options sont jugées :** l'accent principal est mis sur l'**utilisateur final**. Le score A (80 %) est l'expérience de l'utilisateur final (esthétique et aspect moderne, interaction, efficacité, cohérence, installation et lancement, comportement natif) ; le score B (20 %) est la facilité de mise en œuvre avec l'environnement d'exécution Python. Deux décisions : Qt Widgets ou web ; puis quelle enveloppe web (navigateur intégré Qt WebEngine, pywebview avec navigateur de secours, ou backend Python + navigateur externe).

**Contraintes :** conserver le moteur Python ; la migration se fait en une seule fois, sous la forme d'une seule version majeure ; aucun nouveau coût récurrent ; la taille de l'équipe, ses compétences et sa familiarité avec les langages ne sont **pas** des contraintes (les options sont jugées sur leur mérite technique).

**Commencez par le [rapport technique final](06-final-technical-report.md).** Les autres fichiers sont des notes complémentaires, chacune avec ses avantages, ses inconvénients et des comparaisons avec les autres options.

| Document                                                                                | Contenu                                                                                                                             |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Rapport technique final](06-final-technical-report.md)                                 | Problème, méthode, analyse, recommandation, risques, plan                                                                           |
| [00 · Point de départ : la pile actuelle](00-baseline-current-stack.md)                 | Données mesurées sur la base de code actuelle                                                                                       |
| [01 · Moderniser Qt Widgets](01-pyside6-widgets-modernised.md)                          | Rester sur Qt Widgets et le moderniser                                                                                              |
| [02 · Hybride Qt WebEngine](02-qt-webengine-hybrid.md)                                  | Interface web dans l'application Qt (navigateur intégré)                                                                            |
| [03 · Application web locale dans le navigateur](03-local-web-app-fastapi-react.md)     | Backend Python (FastAPI) avec le navigateur externe                                                                                 |
| [04 · Application web locale dans une fenêtre pywebview](04-pywebview-native-window.md) | Idem, dans une fenêtre native (recommandée)                                                                                         |
| [05 · Comparaison et feuille de route](05-comparison-and-roadmap.md)                    | Score utilisateur final contre facilité avec Python, les deux décisions, classement combiné, sensibilité, feuille de route, sources |

Réserves : les scores relèvent du jugement ; la taille de l'installateur, les performances et les caractéristiques des machines cibles n'ont pas été mesurées (voir la section 9 du rapport).
