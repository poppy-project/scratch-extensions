/* global $, ScratchExtensions */

(function() {
  const COMPLIANCY_STIFF = 'STIFF';
  const DEFAULT_ROBOT_URL = 'http://poppy.local:6969';
  const DEFAULT_MOVEMENT_DURATION = 2;
  const ALL_MOTORS = 'm1,m2,m3,m4,m5,m6';

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

  /**
   * Converts seconds milliseconds
   * @function
   * @param  {Number} duration time in seconds
   * @return {Number}          time in milliseconds
   */
  const msToSeconds = function(duration) {
    return 1000 * duration;
  }

  /**
   * Cleans a motors list for HTTP calls.
   * If the provided parameter is empty, `'m1,m2,m3,m4,m5,m6'` will be used.
   * @function
   * @param  {String} motors Comma separated motors names
   * @return {String}        Clean motors names
   */
  const safeMotorsList = function(motors) {
    let targetMotors = motors.trim();

    if (targetMotors === '') {
      targetMotors = ALL_MOTORS;
    }

    return targetMotors;
  }

  /**
   * Converts a localized string to its boolean equivalent.
   * @function
   * @param  {String} yesno [description]
   * @return {boolean}      Converted value
   */
  const yesnoToBool = function(yesno) {
    return yesno === KS.YES;
  }

  /**
   * Converts a localized LED color to a value processable by the remote web service.
   * If the provided color is not valid, `off` will be used.
   * @function
   * @param  {String} color Localized LED color
   * @return {String}       Converted LED color
   */
  const colorToLedColor = function(color) {
    let ledColor = 'off';

    for (const key in KS.LED_COLORS) {
      if (KS.LED_COLORS[key] === color) {
        ledColor = key.toLowerCase();
      }
    }

    return ledColor;
  }

  /**
   * Converts compliancy string to a number. Remote service only understands 0 or 1.
   * @function
   * @param  {String} compliancy Motor compliancy; should be `stiff` or `compliant`
   * @return {Number}            Converted motor compliancy
   */
  const compliancyToInt = function(compliancy) {
    return Number(compliancy !== COMPLIANCY_STIFF);
  }

  /**
   * Check if a move is being recorded. It doesn't read values from the remote service,
   * it only checks moves started during this session.
   * @param  {String} moveName Move name to check
   * @return {boolean}         `true` if the movement is being recorded
   */
  const isRecording = function(moveName) {
    return recordingMoves.filter((item) => item === moveName).length > 0;
  }

  /**
   * Removes a move from the local recording moves list.
   * @param  {String} moveName Move to exclude
   * @return {undefined}
   */
  const removeRecordingMove = function(moveName) {
    recordingMoves = recordingMoves.filter((item) => item !== moveName);
  }


  // The Scratch extension object
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

    /**
     * Set current robot URL. If provided `url` is empty, `DEFAULT_ROBOT_URL` will be used.
     * The expected type is a valid http(s) string.
     * @param {String} url Robot URL to use.
     * @return {undefined}
     */
    setCurrentRobotURL(url) {
      if (url.trim() === '') {
        currentRobotURL = DEFAULT_ROBOT_URL;
      } else {
        currentRobotURL = url;
      }
    },

    /**
     * Asynchrounous call to test remote connection
     * @param  {String}     url      Remote URL to test
     * @param  {Function}   callback callback
     * @return {undefined}
     */
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

    /**
     * Set motors compliancy register
     * @param {String}      motors     Target motors to set
     * @param {String}      compliancy Localized compliancy
     * @param {Function}    callback   callback
     * @return {undefined}
     */
    setMotorsCompliancy(motors, compliancy, callback) {
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

    /**
     * Make given motors go to a position within a duration.
     * If `wait` is `true`, a timeout of same duration will be set.
     * @param {String}      motors   Target motors
     * @param {Number}      position Position to set motors to
     * @param {Number}      duration Movement duration in seconds
     * @param {boolean}     wait     Wait for movement to complete
     * @param {Function}    callback callback
     * @return {undefined}
     */
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

    /**
     * Get available motors names from the robot
     * @param  {Function} callback callback
     * @return {undefined}
     */
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

      if (safeMoveName === '') {
        callback(false);
      } else {
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
      }
    },

    playMove(moveName, callback) {
      const safeMoveName = moveName.trim();

      if (safeMoveName === '') {
        callback(false);
      } else {
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
      }
    },

    stopMove(moveName, callback) {
      const safeMoveName = moveName.trim();

      if (safeMoveName === '') {
        callback(false);
      } else {
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
      }
    },

    deleteMove(moveName, callback) {
      const safeMoveName = moveName.trim();

      if (safeMoveName === '') {
        callback(false);
      } else {
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
  }

  const descriptor = {
    menus: {
      allRegisters: [ 'name', 'model', 'present_position', 'goal_position', 'present_speed', 'moving_speed', 'present_load', 'torque_limit', 'lower_limit', 'upper_limit', 'present_voltage', 'present_temperature' ],
      behaviors: [ 'dance', 'tracking_feedback', 'curious_posture', 'tetris_posture', 'safe_power_up', 'base_posture', 'rest_posture' ],
      compliancy: [ KS.COMPLIANT, KS.STIFF ],
      ledColors: [ KS.LED_COLORS.OFF, KS.LED_COLORS.RED, KS.LED_COLORS.GREEN, KS.LED_COLORS.BLUE, KS.LED_COLORS.YELLOW, KS.LED_COLORS.CYAN, KS.LED_COLORS.PINK, KS.LED_COLORS.WHITE ],
      motors: ALL_MOTORS.split(','),
      registers: [ 'led', 'goal_position', 'moving_speed', 'torque_limit' ],
      yesno: [ KS.YES, KS.NO ]
    },
    blocks: [
      [ 'r', 'URL du robot', 'getCurrentRobotURL' ],
      [ ' ', 'Utiliser le robot %s', 'setCurrentRobotURL', DEFAULT_ROBOT_URL ],
      [ 'R', 'Le robot %s est disponible ?', 'testHost', DEFAULT_ROBOT_URL ],
      [ 'w', 'Rendre le(s) moteur(s) %s %m.compliancy', 'setMotorsCompliancy', ALL_MOTORS, KS.STIFF ],
      [ 'w', 'Mettre le(s) moteur(s) %s à la position %n en %n s. | Attendre la fin du mouvement ? %m.yesno', 'setMotorsPositionAndWait', ALL_MOTORS, 0, DEFAULT_MOVEMENT_DURATION, KS.YES ],
      [ 'w', 'Jouer le comportement %m.behaviors', 'startBehavior', '' ],
      [ 'w', 'Arrêter le comportement %m.behaviors', 'stopBehavior', '' ],
      [ 'w', 'Pour le(s) moteur(s) %s, définir la valeur du registre %m.registers à %s', 'setMotorsRegister', ALL_MOTORS, '', '' ],
      [ 'w', 'Pour le(s) moteur(s) %s, définir la couleur de la LED à %m.ledColors', 'setMotorsLedColor', ALL_MOTORS, KS.LED_COLORS.OFF ],
      [ 'R', 'Pour le(s) moteur(s) %s, retourner la valeur du registre %m.allRegisters', 'getMotorsRegisterValue', ALL_MOTORS, '' ],
      [ 'R', 'Tous les moteurs', 'getMotorsNames' ],
      [ 'w', 'Créer et démarrer l’enregistrement du mouvement %s avec le(s) moteur(s) %s', 'createAndRecordMove', '', ALL_MOTORS ],
      [ 'w', 'Arrêter l’enregistrement du mouvement %s et sauvegarder', 'stopMoveRecord', '' ],
      [ 'w', 'Jouer le mouvement %s', 'playMove', '' ],
      [ 'w', 'Arrêter le mouvement %s', 'stopMove', '' ],
      [ 'w', 'Supprimer le mouvement %s', 'deleteMove', '' ]
    ],
    url: 'https://poppy-project.github.io/scratch-extensions/docs/fr/ergo-jr.html'
  };

  ScratchExtensions.register('Extension Poppy Ergo Jr', descriptor, ext);
}());
