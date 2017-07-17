# Définition des blocs de l'extension ScratchX « Poppy Ergo Jr »

## Paramètres du robot

### ![URL du robot]()

Retourne l'adresse du robot.

### ![Utiliser le robot %s]()

Change l'adresse du robot utilisé.  
La valeur proposée par défaut est `http://poppy.local:6969`.

### ![Le robot %s est disponible ?]()

Teste la disponibilité du robot.  
S'il est utilisable, le bloc retourne la valeur `true`.

## Interaction avec les moteurs et leurs registres

## ![Tous les moteurs]()

Retourne la liste de tous les moteurs.

### ![Rendre le(s) moteur(s) %s %m.compliancy]()

Rend le ou les moteurs manipulables (_stiff_).

### ![Mettre le(s) moteur(s) %s à la position %n en %n s. | Attendre la fin du mouvement ? %m.yesno]()

Change la position du ou des moteurs en donnant une durée.  
Attendre la fin du mouvement empêche les blocs suivants d'être exécutés immédiatement.

### ![Pour le(s) moteur(s) %s, retourner la valeur du registre %m.allRegisters]()

Retourne la valeur d'un registre pour un ou plusieurs moteurs.

### ![Pour le(s) moteur(s) %s, définir la valeur du registre %m.registers à %s]()

Définit la valeur d'un registre pour un ou plusieurs moteurs.

### ![Pour le(s) moteur(s) %s, définir la couleur de la LED à %m.ledColors]()

Change la couleur de la diode (_LED_) d'un ou plusieurs moteurs. La valeur `off` éteint la diode.

## Comportements du robot

### ![Jouer le comportement %m.behaviors]()

Joue un comportement du robot.

### ![Arrêter le comportement %m.behaviors]()

Arrête la lecture d'un comportement du robot.

## Enregistrement de mouvements

### ![Créer et démarrer l’enregistrement du mouvement %s avec le(s) moteur(s) %s]()

[ 'w', 'Créer et démarrer l’enregistrement du mouvement %s avec le(s) moteur(s) %s', 'createAndRecordMove', '', 'm1,m2,m3,m4,m5,m6' ],

### ![Arrêter l’enregistrement du mouvement %s]()

[ 'w', 'Arrêter l’enregistrement du mouvement %s', 'stopMoveRecord', '' ],

### ![Lire le mouvement %s]()

[ 'w', 'Lire le mouvement %s', 'playMove', '' ],

### ![Arrêter la lecture du mouvement %s et l’enregistrer]()

[ 'w', 'Arrêter la lecture du mouvement %s et l’enregistrer', 'stopAndSaveMove', '' ],

### ![Supprimer le mouvement %s]()

[ 'w', 'Supprimer le mouvement %s', 'deleteMove', '' ]
