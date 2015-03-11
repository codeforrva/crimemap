"use strict";

var Alert = (function() {
  var listeners = [];

  return {
    sendAlert: function(text, alertClass) {
      alertClass = alertClass || 'danger';
      for (var i in listeners) {
        listeners[i](text, alertClass);
      }
    },
    addAlertListener: function(func) {
      listeners.push(func);
    }
  };
})();

module.exports = Alert;
