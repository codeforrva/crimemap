"use strict";

var AppDispatcher = require('./AppDispatcher');
var Constants = require('./Constants');

var Actions = {

  changeDateRange: function(startDate, endDate) {
    AppDispatcher.dispatch({
      actionType: Constants.changeDateRange,
      startDate: startDate,
      endDate: endDate
    });
  },

  requestMarkerUpdate: function(startDate, endDate) {
    AppDispatcher.dispatch({
      actionType: Constants.requestMarkerUpdate,
      startDate: startDate,
      endDate: endDate
    });
  },
  
  markersUpdated: function() {
    AppDispatcher.dispatch({
      actionType: Constants.markersUpdated
    })
  }

}

module.exports = Actions;
