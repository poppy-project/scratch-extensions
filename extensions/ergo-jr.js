(function() {

  const defaultHost = 'poppy.local:8080';
  const defaultScheme = 'http';
  const defaultMotorFlexibility = 'compliant';
  const defaultMotorPosition = 0;
  const defaultMovementDuration = 2;
  const noop = function() {};

  const wsHost = 'ws://poppy.local:9009';
  const WS_STATUS_DISCONNECTED = 0;
  const WS_STATUS_CONNECTING = 1;
  const WS_STATUS_CONNECTED = 2;
  const WS_STATUS_DISCONNECTING = 3;

  let host = '';
  let ws = null;
  let wsStatus = WS_STATUS_DISCONNECTED;
  let robotState = null;
  let robotSettings = {
    m1: {
      goal_position: 0,
      moving_speed: 500,
      torque_limit: 75,
      led: 'off'
    },
    m2: {
      goal_position: 0,
      moving_speed: 500,
      torque_limit: 75,
      led: 'off'
    },
    m3: {
      goal_position: 0,
      moving_speed: 500,
      torque_limit: 75,
      led: 'off'
    },
    m4: {
      goal_position: 0,
      moving_speed: 500,
      torque_limit: 75,
      led: 'off'
    },
    m5: {
      goal_position: 0,
      moving_speed: 500,
      torque_limit: 75,
      led: 'off'
    },
    m6: {
      goal_position: 0,
      moving_speed: 500,
      torque_limit: 75,
      led: 'off'
    }
  };

  const startSocket = function(url = wsHost) {
    if (ws) {
      console.log(`Socket already opened.`);
      return false;
    }

    let isOpen = false;
    let timer = null;

    wsStatus = WS_STATUS_DISCONNECTED;
    ws = new WebSocket(url);
    wsStatus = WS_STATUS_CONNECTING;

    ws.onopen = function() {
      isOpen = true;
      wsStatus = WS_STATUS_CONNECTED;
    };

    ws.onmessage = function(e) {
      if (typeof e.data == 'string') {
        const data = JSON.parse(e.data);
        robotState = data;
      }
    }

    ws.onclose = function() {
      isOpen = false;
      ws = null;
      timer = null;
      wsStatus = WS_STATUS_DISCONNECTED;
    }

    return ws;
  }

  const ext = {
    _shutdown() {
      wsStatus = WS_STATUS_DISCONNECTING;
      ws.close();
    },

    _getStatus() {
      if (wsStatus === WS_STATUS_DISCONNECTED) {
        startSocket();
        return { status: WS_STATUS_DISCONNECTED, msg: 'Not connected' };
      } else if (wsStatus === WS_STATUS_CONNECTING) {
        return { status: WS_STATUS_CONNECTING, msg: 'Connecting' };
      } else if (wsStatus === WS_STATUS_DISCONNECTING) {
        return { status: WS_STATUS_CONNECTING, msg: 'Disconnecting' };
      } else if (wsStatus === WS_STATUS_CONNECTED) {
        return { status: WS_STATUS_CONNECTED, msg: 'Ready' };
      }
    },

    logRobotState() {
      console.log(robotState);
    },

    pushRobotState() {
      ws.send(JSON.stringify(robotSettings));
    },

    getHost() {
      return host;
    },

    setHost(scheme = defaultScheme, newHost = defaultHost) {
      host = `${scheme}://${newHost}`;
      return host;
    },

    testHost(callback) {
      $.ajax({
        url: host,
        dataType: 'json',
        success() {
          callback('OK');
        }
      });
    },

    setMotorFlexibility(motor, motorflexibility = defaultMotorFlexibility, callback = noop) {
      callback();
    },

    setMotorPosition(motor, position = defaultMotorPosition, duration = defaultMovementDuration, callback = noop) {
      console.log('setMotorPosition', motor, position, duration);
      callback();
    },

    resetDevice(device, callback = noop) {
      console.log('resetDevice', device);
      callback();
    },

    setMotorRegister(registerName, motor, registerValue, callback = noop) {
      console.log('setMotorRegister', registerName, motor, registerValue);
      callback();
    },

    playMove(moveName, speed = 1, callback = noop) {
      console.log('playMove', moveName, speed);
      callback();
    },

    stopMove(moveName, callback = noop) {
      console.log('stopMove', moveName);
      callback();
    },

    updateMove(command, moveName, callback = noop) {
      console.log('updateMove', command, moveName);
      callback();
    },

    setLedColor(led, motor, callback = noop) {
      let obj = { [motor]: { led } };
      ws.send(JSON.stringify(obj));
      callback();
    }
  };

  const descriptor = {
    blocks: [
      [ ' ', 'Log robot state', 'logRobotState' ],

      [ 'r', 'Robot host', 'getHost' ],
      [ ' ', 'Set robot host to %m.schemes %s', 'setHost', defaultScheme, defaultHost ],
      [ 'R', 'Test robot connection', 'testHost' ],

      [ 'w', 'Reset %m.resetable', 'resetDevice', '' ],

      [ 'w', 'Set motor %m.motors %m.motorFlexibility', 'setMotorFlexibility', '', defaultMotorFlexibility ],
      [ 'w', 'Set motor %m.motors to position %n in %n seconds', 'setMotorPosition', '', defaultMotorPosition, defaultMovementDuration ],
      [ 'w', 'Set %m.registers of motor(s) %m.motors to %s', 'setMotorRegister', 'position', '', '' ],

      [ 'w', 'Play move %s | Speed × %n', 'playMove', '', 1 ],
      [ 'w', 'Stop move %s', 'stopMove', '' ],
      [ 'w', '%m.moveCommands behaviour %s', 'updateMove', 'start', '' ],

      [ 'w', 'Set led color to %m.ledColors for motor(s) %m.motors', 'setLedColor', 'off', 'all' ],
    ],
    menus: {
      schemes: [ 'http', 'https' ],
      motors: [ 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'all' ],
      motorFlexibility: [ 'compliant', 'stiff' ],
      resetable: [ 'robot', 'simulation' ],
      registers: [ 'position', 'speed', 'compliant', 'led' ],
      moveCommands: [ 'start', 'pause', 'stop', 'restart' ],
      ledColors: [ 'off', 'red', 'green', 'blue', 'yellow', 'cyan', 'pink', 'white' ], // @TODO: fix list
    },
    url: 'https://poppy-project.github.io/scratch-extensions/'
  };

  ScratchExtensions.register('Poppy Ergo Jr', descriptor, ext);
})();
