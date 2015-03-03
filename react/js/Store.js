"use strict";

var AppDispatcher = require('./AppDispatcher');
var Constants = require('./Constants');
var Actions = require('./Actions');

var Store = (function() {

  var state = {
    startDate: "2015-01-01",
    endDate: "2015-01-31"
  };

  var dateChangeHandlers = [];
  var markersUpdatedHandlers = [];

  var apiQuery = function(queryOpts) {
    var loading = $('#loading').show();
    return $.getJSON("https://brigades.opendatanetwork.com/resource/ush7-in5v.json?$$app_token=3sg2sPslVNC65HpUxDTSfRR4d&" +
      $.param(queryOpts)).fail(function(response) {
        showApiResponseAlert(response);
      }).always(loading.slideUp('fast'));
  };

  var getMarkers = function() {

    var infoWindow;
    var startDate = state.startDate;
    var endDate = state.endDate;

    return apiQuery({
      "$select": "incident_location,offense_code_desc,incident_date_time,disposition_code_desc",
      // TODO: there is a time zone thing going on here
      "$where": "incident_date_time >= '" + startDate + "T00:00:00' and incident_date_time <= '" + endDate + "T23:59:59'"
    }).done(function(data) {

      state.markers = data.filter(function(row) {
        return row.incident_location.latitude && row.incident_location.longitude;
      }).map(function(row) {
        // TODO: would be better to filter these out in the query. not sure what the syntax is.
        if (!row.incident_location.latitude || !row.incident_location.longitude)
          return;

        row.incident_address = JSON.parse(row.incident_location.human_address).address;

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(
              row.incident_location.latitude,
              row.incident_location.longitude),
          title: row.offense_code_desc,
          icon: getIcon(row.offense_code_desc)
        });

        google.maps.event.addListener(marker, 'click', function() {
          if (infoWindow) {
            infoWindow.close();
          }
          infoWindow = new google.maps.InfoWindow({
            content: "TODO: info content"
          });
          infoWindow.open(marker.map, marker);
        });

        return marker;
      });

      Actions.markersUpdated();
    });
  }

  var getIcon = function(str) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: getColorString(str),
      fillOpacity: 0.9,
      strokeColor: getColorString(str, true),
      strokeOpacity: 0.6,
      strokeWeight: 1
    };
  }

  var getColorString = function(str, stroke) {
    // hash code for strings, used to generate color codes
    // http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
    }

    var h = hash % 360;
    var s = Math.abs((hash >> 8) % 50);
    var l = Math.abs((hash >> 4) % 50);

    return 'hsl(' + h + ', ' + (s+50) + '%, ' + (l+(stroke?0:25)) + '%)';
  }

  return {
    state: state,
    getMarkers: getMarkers,

    addDateChangeHandler: function(f) {
      dateChangeHandlers.push(f);
    },

    addMarkersUpdatedHandler: function(f) {
      markersUpdatedHandlers.push(f);
    },

    emitDateChange: function() {
      for (var i = 0; i < dateChangeHandlers.length; i++) {
        dateChangeHandlers[i]();
      }
    },

    emitMarkersUpdated: function() {
      for (var i = 0; i < markersUpdatedHandlers.length; i++) {
        markersUpdatedHandlers[i]();
      }
    }
  };

})();

AppDispatcher.register(function(action) {
  console.log("AppDispatcher:", action);
  switch (action.actionType) {
    case Constants.changeDateRange:
      if (Store.state.startDate != action.startDate || Store.state.endDate != action.endDate) {
        Store.state.startDate = action.startDate;
        Store.state.endDate = action.endDate;
        Store.emitDateChange();
      }
      break;
    case Constants.requestMarkerUpdate:
      Store.getMarkers();
      break;
    case Constants.markersUpdated:
      Store.emitMarkersUpdated();
      break;
  }
});

module.exports = Store;
