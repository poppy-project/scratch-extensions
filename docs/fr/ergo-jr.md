# Utilisation de l'extension ScratchX « Poppy Ergo Jr »

L'extension ScratchX pour Poppy Ergo Jr fonctionne avec le service [ScratchX](http://scratchx.org/).

Depuis la page d'accueil de ScratchX, cliquez sur « _Open Extension URL_ », puis renseignez le champ de formulaire avec l'adresse suivante https://poppy-project.github.io/scratch-extensions/extensions/ergo-jr.js  
Les blocs Scratch de l'extension sont maintenant chargés !

## Paramètres du robot

### ![URL du robot](../../img/fr/get-host.png)

Retourne l'adresse du robot.

### ![Utiliser le robot %s](../../img/fr/set-host.png)

Change l'adresse du robot utilisé.  
La valeur proposée par défaut est `http://poppy.local:6969`.

### ![Le robot %s est disponible ?](../../img/fr/test-host.png)

Teste la disponibilité du robot.  
S'il est utilisable, le bloc retourne la valeur `true`.

## Interaction avec les moteurs et leurs registres

## ![Tous les moteurs](../../img/fr/get-all-motors.png)

Retourne la liste de tous les moteurs.

### ![Rendre le(s) moteur(s) %s %m.compliancy](../../img/fr/set-motors-compliant.png)

Rend le ou les moteurs manipulables (`stiff`).

### ![Mettre le(s) moteur(s) %s à la position %n en %n s. | Attendre la fin du mouvement ? %m.yesno](../../img/fr/set-motors-position-wait.png)

Change la position du ou des moteurs en donnant une durée.  
Attendre la fin du mouvement empêchera les blocs suivants d'être exécutés immédiatement.

### ![Pour le(s) moteur(s) %s, retourner la valeur du registre %m.allRegisters](../../img/fr/get-motors-register.png)

Retourne la valeur d'un registre pour un ou plusieurs moteurs.

### ![Pour le(s) moteur(s) %s, définir la valeur du registre %m.registers à %s](../../img/fr/set-motors-register.png)

Définit la valeur d'un registre pour un ou plusieurs moteurs.

### ![Pour le(s) moteur(s) %s, définir la couleur de la LED à %m.ledColors](../../img/fr/set-led-color.png)

Change la couleur de la diode (_LED_) d'un ou plusieurs moteurs. La valeur `off` éteint la diode.

## Comportements du robot

### ![Jouer le comportement %m.behaviors](../../img/fr/start-behavior.png)

Joue un comportement du robot.

### ![Arrêter le comportement %m.behaviors](../../img/fr/stop-behavior.png)

Arrête la lecture d'un comportement du robot.

## Gestion des mouvements personnalisés

### ![Créer et démarrer l’enregistrement du mouvement %s avec le(s) moteur(s) %s](../../img/fr/create-move.png)

Lorsque ce bloc est activé, un nouveau mouvement est créé et l'enregistrement des positions des moteurs débute. Pour l'utiliser au mieux, pensez à mettre les moteurs dans un état manipulable.

### ![Arrêter l’enregistrement du mouvement %s](../../img/fr/stop-move-recording.png)

Arrête l'enregistrement du mouvement donné.

### ![Jouer le mouvement %s](../../img/fr/play-move.png)

Le robot va jouer le mouvement demandé.

### ![Arrêter le mouvement %s et l’enregistrer](../../img/fr/stop-and-save-move.png)

[ 'w', 'Arrêter le mouvement %s et l’enregistrer', 'stopAndSaveMove', '' ],

### ![Supprimer le mouvement %s](../../img/fr/delete-move.png)

Supprime le mouvement demandé.
