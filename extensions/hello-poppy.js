(function() {

  const ext = {
    _shutdown() {},

    _getStatus() {
      return {
        status: 2,
        msg: 'Ready'
      };
    },

    hello(name = 'Ergo') => return `Hello, ${name}!`,
  };

  const descriptor = {
    blocks: [
      // Block type, block name, function name, param1 default value, param2 default value
      ['r', 'Hello %s', 'hello', ''],
    ]
  };

  ScratchExtensions.register('Poppy hello world extension', descriptor, ext);
})();
