"use strict";

var Alert = require('./mixins/Alert');
var Logging = require('./mixins/Logging');

var IncidentDataStore = (function() {

  var showApiResponseAlert = function(response) {
    if (response.responseJSON) {
      Alert.sendAlert("And lo! The ground shook and a fell voice uttered fearsome words of great import: \"" + response.responseJSON.message + "\"");
    } else {
      Alert.sendAlert("Whoops! Looks like we broke the Internet. Sorry about that.");
      Logging.error(response);
    }
  };

  var apiQuery = function(queryOpts) {
    var loading = $('#loading').show();
    return $.getJSON("https://brigades.opendatanetwork.com/resource/ush7-in5v.json?$$app_token=3sg2sPslVNC65HpUxDTSfRR4d&" +
      $.param(queryOpts)).fail(function(response) {
        showApiResponseAlert(response);
      }).then(calculateDisplayInfo);
  };

  var Fields = {
    INCIDENT_BASIC_INFO: "incident_location,offense_code,offense_code_desc,incident_date_time,disposition_code_desc",
    INCIDENT_LOCATION: "incident_location,offense_code"
  }

  var queryIncidents = function(options) {

    var startDate = options.startDate || '2015-01-01';
    var endDate = options.endDate || '2015-01-05';
    var fields = options.fields || Fields.INCIDENT_BASIC_INFO;
    var limit = parseInt(options.limit) || 1000;

    var deferred = $.Deferred();

    apiQuery({
      "$select": fields,
      // TODO: there is a time zone thing going on here
      "$where": "incident_date_time >= '" + startDate + "T00:00:00' and incident_date_time <= '" + endDate + "T23:59:59'",
      "$limit": limit
    }).done(function(data) {
      var incidents = data.filter(function(row) {
        // TODO: would be better to filter these out in the query. not sure what the syntax is.
        return row.incident_location.latitude && row.incident_location.longitude;
      }).map(function(row) {
        row.incident_address = JSON.parse(row.incident_location.human_address).address;
        return row;
      });
      deferred.resolve(incidents);
    });

    return deferred.promise();
  };

  var queryHeatmap = function(options) {
    var deferred = $.Deferred();
    options.fields = Fields.INCIDENT_LOCATION;
    options.limit = 50000;
    queryIncidents(options).done(function(data) {
      deferred.resolve(data.filter(function(row) {
        return (
          // TODO: these specific sites might be filterable in the API
          // e.g. incident_location.longitude != ...
          // filter out city hall
          !(row.incident_location.longitude == "-77.43364758299998" &&
          row.incident_location.latitude == "37.54070234900007") &&
          // filter out police HQ
          !(row.incident_location.longitude == "-77.44491629499998" &&
          row.incident_location.latitude == "37.546095328000035") &&
          // TODO: see if there are other police stations, courthouses, etc.
          // the very common 1300 Coalter Street address may be the sheriff's office, not sure
          true
        );
      }));
    });

    return deferred.promise();
  };

  var queryOffenseCodes = function() {
    // $select=offense_code,offense_code_desc&$group=offense_code,offense_code_desc&$limit=50000&$order=offense_code
    return apiQuery({
      // get unique offense codes
      "$select": "offense_code,offense_code_desc",
      "$group": "offense_code,offense_code_desc",
      "$limit": 50000,
      "$order": "offense_code"
    });
  };

  var calculateDisplayInfo = function(data) {
    return data.map(function(obj) {
      obj.weight = getWeight(parseInt(obj.offense_code));
      obj.color = getColorString(obj.weight);
      obj.strokeColor = getColorString(obj.weight, true);
      return obj;
    });
  };

  var getColorString = function(weight, stroke) {
    var h = 18 * (10 - weight); // normalize weight (1-10) to hue (0-180) inverse
    return 'hsl(' + h + ', 80%, ' + (stroke?35:50) + '%)';
  };

  var getWeight = function(code) {
    switch (parseFloat(code)) {
    // not making any kind of value judgement here
    case 9:   // homicide
    case 100: // kidnapping
    case 11:  // rape
      return 10;
    case 120: // robbery
    case 13:  // assault
    case 36:  // other sex crimes
      return 8;
    case 200: // arson
    case 220: // burglary
    case 520: // weapons
      return 6;
    case 23:  // theft
    case 240: // vehicle theft
    case 290: // vandalism
    case 35:  // drugs
    case 40:  // prostitution
      return 4;
    case 90:  // disorderly
      return 2;
    default:
      return 1;
    }
  };

  return {
    queryIncidents: queryIncidents,
    queryHeatmap: queryHeatmap,
    queryOffenseCodes: queryOffenseCodes,
    Fields: Fields
  };

})();

module.exports = IncidentDataStore;
