/* global $, ScratchExtensions */

(function() {
  const COMPLIANCY_STIFF = 'STIFF';
  const DEFAULT_ROBOT_URL = 'http://poppy.local:6969';
  const DEFAULT_MOVEMENT_DURATION = 2;

  const KS = {
    COMPLIANT: 'manipulable(s)',
    NO: 'non',
    READY: 'Prêt',
    SFALSE: 'faux',
    [COMPLIANCY_STIFF]: 'rigide(s)',
    STRUE: 'vrai',
    YES: 'oui',
    LED_COLORS: {
      OFF: 'aucune',
      RED: 'rouge',
      GREEN: 'vert',
      BLUE: 'bleu',
      YELLOW: 'jaune',
      CYAN: 'cyan',
      PINK: 'rose',
      WHITE: 'blanc'
    }
  }

  let currentRobotURL = DEFAULT_ROBOT_URL;
  let recordingMoves = [];

  const msToSeconds = function(duration) {
    return 1000 * duration;
  }

  const safeMotorsList = function(motors) {
    let targetMotors = motors.trim();

    if (targetMotors === '') {
      targetMotors = 'm1,m2,m3,m4,m5,m6';
    }

    return targetMotors;
  }

  const yesnoToBool = function(yesno) {
    return yesno === KS.YES;
  }

  const colorToLedColor = function(color) {
    let ledColor = 'off';

    for (const key in KS.LED_COLORS) {
      if (KS.LED_COLORS[key] === color) {
        ledColor = key.toLowerCase();
      }
    }

    return ledColor;
  }

  const compliancyToInt = function(compliancy) {
    return Number(compliancy !== COMPLIANCY_STIFF);
  }

  const isRecording = function(moveName) {
    return recordingMoves.filter((item) => item === moveName).length > 0;
  }

  const removeRecordingMove = function(moveName) {
    recordingMoves = recordingMoves.filter((item) => item !== moveName);
  }


  // The extension
  const ext = {
    _shutdown() {},

    _getStatus() {
      return {
        status: 2,
        msg: KS.READY
      }
    },

    getCurrentRobotURL() {
      return currentRobotURL;
    },

    getRecordingMoves() {
      return recordingMoves;
    },

    setCurrentRobotURL(url) {
      currentRobotURL = url;
    },

    testHost(url, callback) {
      $.ajax({
        url,
        method: 'GET',
        success() {
          callback(true);
        },
        error() {
          callback(false);
        }
      });
    },

    setMotorCompliancy(motors, compliancy, callback) {
      let compliancyKey = null;
      const targetMotors = safeMotorsList(motors);

      for (const key in KS) {
        if (KS[key] === compliancy) {
          compliancyKey = key;
        }
      }

      const params = targetMotors
        .split(',')
        .map((current) => `${current.trim()}:compliant:${compliancyToInt(compliancyKey)}`)
        .join(';');

      $.ajax({
        url: `${currentRobotURL}/motors/set/registers/${params}`,
        method: 'GET',
        success() {
          callback();
        },
        error() {
          callback();
        }
      });
    },

    setMotorsPositionAndWait(motors, position, duration, wait, callback) {
      const targetMotors = safeMotorsList(motors);

      const params = targetMotors
        .split(',')
        .map((current) => `${current.trim()}:${position}:${duration}`)
        .join(';');

      $.ajax({
        url: `${currentRobotURL}/motors/set/goto/${params}`,
        method: 'GET',
        success() {
          if (yesnoToBool(wait) === true) {
            callback();
            const waitTimeoutID = setTimeout(() => {
              clearTimeout(waitTimeoutID);
              callback();
            }, msToSeconds(duration));
          } else {
            callback();
          }
        },
        error() {
          callback();
        }
      });
    },

    startBehavior(behaviorName, callback) {
      if (behaviorName === '') {
        callback(false);
      }

      $.ajax({
        url: `${currentRobotURL}/primitive/${behaviorName}/start`,
        method: 'GET',
        success() {
          callback();
        },
        error() {
          callback();
        }
      });
    },

    stopBehavior(behaviorName, callback) {
      $.ajax({
        url: `${currentRobotURL}/primitive/${behaviorName}/stop`,
        method: 'GET',
        success() {
          callback();
        },
        error() {
          callback();
        }
      });
    },

    setMotorsRegister(motors, register, registerValue, callback) {
      const targetMotors = safeMotorsList(motors);
      const params = targetMotors
        .split(',')
        .map((current) => `${current.trim()}:${register}:${registerValue.trim()}`)
        .join(';');

      $.ajax({
        url: `${currentRobotURL}/motors/set/registers/${params}`,
        method: 'GET',
        success() {
          callback();
        },
        error() {
          callback();
        }
      });
    },

    setMotorsLedColor(motors, color, callback) {
      const ledColor = colorToLedColor(color);
      const targetMotors = safeMotorsList(motors);
      const params = targetMotors
        .split(',')
        .map((current) => `${current.trim()}:led:${ledColor}`)
        .join(';');

      $.ajax({
        url: `${currentRobotURL}/motors/set/registers/${params}`,
        method: 'GET',
        success() {
          callback();
        },
        error() {
          callback();
        }
      });
    },

    getMotorsRegisterValue(motors, register, callback) {
      const targetMotors = safeMotorsList(motors).replace(/,/g, ';');

      $.ajax({
        url: `${currentRobotURL}/motors/${targetMotors}/get/${register}`,
        method: 'GET',
        success(data) {
          callback(data.split(';'));
        },
        error() {
          callback(null);
        }
      });
    },

    getMotorsNames(callback) {
      $.ajax({
        url: `${currentRobotURL}/motors/motors`,
        method: 'GET',
        success(data) {
          callback(data.split('/'));
        },
        error() {
          callback(false);
        }
      });
    },

    createAndRecordMove(moveName, motors, callback) {
      if (isRecording(moveName)) {
        callback(false);
      } else {
        const safeMoveName = moveName.trim();
        const targetMotors = safeMotorsList(motors).replace(/,/g, ';');

        if (safeMoveName.length > 0) {
          $.ajax({
            url: `${currentRobotURL}/primitive/MoveRecorder/${safeMoveName}/start/${targetMotors}`,
            method: 'GET',
            success() {
              recordingMoves.push(safeMoveName);
              callback(true);
            },
            error() {
              callback(false);
            }
          });
        } else {
          callback(false);
        }
      }
    },

    stopMoveRecord(moveName, callback) {
      const safeMoveName = moveName.trim();

      $.ajax({
        url: `${currentRobotURL}/primitive/MoveRecorder/${safeMoveName}/stop`,
        method: 'GET',
        success() {
          removeRecordingMove(safeMoveName);
          callback(true);
        },
        error() {
          callback(false);
        }
      });
    },

    playMove(moveName, callback) {
      const safeMoveName = moveName.trim();

      $.ajax({
        url: `${currentRobotURL}/primitive/MovePlayer/${safeMoveName}/start`,
        method: 'GET',
        success() {
          callback(true);
        },
        error() {
          callback(false);
        }
      });
    },

    stopAndSaveMove(moveName, callback) {
      const safeMoveName = moveName.trim();

      $.ajax({
        url: `${currentRobotURL}/primitive/MovePlayer/${safeMoveName}/stop`,
        method: 'GET',
        success() {
          callback(true);
        },
        error() {
          callback(false);
        }
      });
    },

    deleteMove(moveName, callback) {
      const safeMoveName = moveName.trim();

      $.ajax({
        url: `${currentRobotURL}/primitive/MoveRecorder/${safeMoveName}/remove`,
        method: 'GET',
        success() {
          callback(true);
        },
        error() {
          callback(false);
        }
      });
    }
  }

  const descriptor = {
    menus: {
      allRegisters: [ 'name', 'model', 'present_position', 'goal_position', 'present_speed', 'moving_speed', 'present_load', 'torque_limit', 'lower_limit', 'upper_limit', 'present_voltage', 'present_temperature' ],
      behaviors: [ 'dance', 'tracking_feedback', 'curious_posture', 'tetris_posture', 'safe_power_up', 'base_posture', 'rest_posture' ],
      compliancy: [ KS.COMPLIANT, KS.STIFF ],
      ledColors: [ KS.LED_COLORS.OFF, KS.LED_COLORS.RED, KS.LED_COLORS.GREEN, KS.LED_COLORS.BLUE, KS.LED_COLORS.YELLOW, KS.LED_COLORS.CYAN, KS.LED_COLORS.PINK, KS.LED_COLORS.WHITE ],
      motors: [ 'm1', 'm2', 'm3', 'm4', 'm5', 'm6' ],
      registers: [ 'led', 'goal_position', 'moving_speed', 'torque_limit' ],
      yesno: [ KS.YES, KS.NO ]
    },
    blocks: [
      [ 'r', 'URL du robot', 'getCurrentRobotURL' ],
      [ 'r', 'Mouvements en cours d’enregistrement', 'getRecordingMoves' ],
      [ 'R', 'Le robot %s est disponible ?', 'testHost', '' ],
      [ ' ', 'Utiliser le robot %s', 'setCurrentRobotURL', '' ],
      [ 'w', 'Rendre le(s) moteur(s) %s %m.compliancy', 'setMotorCompliancy', '', KS.STIFF ],
      [ 'w', 'Mettre le(s) moteur(s) %s à la position %n en %n s. | Attendre la fin du mouvement ? %m.yesno', 'setMotorsPositionAndWait', '', 0, DEFAULT_MOVEMENT_DURATION, KS.YES ],
      [ 'w', 'Jouer le comportement %m.behaviors', 'startBehavior', '' ],
      [ 'w', 'Arrêter le comportement %m.behaviors', 'stopBehavior', '' ],
      [ 'w', 'Pour le(s) moteur(s) %s, définir la valeur du registre %m.registers à %s', 'setMotorsRegister', '', '', '' ],
      [ 'w', 'Pour le(s) moteur(s) %s, définir la couleur de la LED à %m.ledColors', 'setMotorsLedColor', '', 'off' ],
      [ 'R', 'Pour le(s) moteur(s) %s, donner la valeur du registre %m.allRegisters', 'getMotorsRegisterValue', '', '' ],
      [ 'R', 'Donner la liste des noms de tous les moteurs', 'getMotorsNames' ],
      [ 'w', 'Créer et démarrer l’enregistrement du mouvement %s avec le(s) moteur(s) %s', 'createAndRecordMove', '', 'm1,m2,m3,m4,m5,m6' ],
      [ 'w', 'Arrêter l’enregistrement du mouvement %s', 'stopMoveRecord', '' ],
      [ 'w', 'Lire le mouvement %s', 'playMove', '' ],
      [ 'w', 'Arrêter la lecture du mouvement %s et l’enregistrer', 'stopAndSaveMove', '' ],
      [ 'w', 'Supprimer le mouvement %s', 'deleteMove', '' ]
    ]
  };

  ScratchExtensions.register('Poppy bootcamp extension', descriptor, ext);
}());
