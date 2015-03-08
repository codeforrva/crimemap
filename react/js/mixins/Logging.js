"use strict";

var Logging = (function() {
  var active = process.env.NODE_ENV == "development";
  var noop = function(){};

  return {
      log: active ? console.log.bind(console) : noop,
      warn: active ? console.warn.bind(console) : noop,
      error: active ? console.error.bind(console) : noop
  };
})();

module.exports = Logging;
