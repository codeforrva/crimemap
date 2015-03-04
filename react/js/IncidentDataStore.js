"use strict";

var IncidentDataStore = (function() {

  var apiQuery = function(queryOpts) {
    var loading = $('#loading').show();
    return $.getJSON("https://brigades.opendatanetwork.com/resource/ush7-in5v.json?$$app_token=3sg2sPslVNC65HpUxDTSfRR4d&" +
      $.param(queryOpts))/*.fail(function(response) {
        showApiResponseAlert(response);
      }).always(loading.slideUp('fast'))*/;
  };

  var queryIncidents = function(options) {

    var startDate = options.startDate;
    var endDate = options.endDate;

    var deferred = $.Deferred();

    apiQuery({
      "$select": "incident_location,offense_code_desc,incident_date_time,disposition_code_desc",
      // TODO: there is a time zone thing going on here
      "$where": "incident_date_time >= '" + startDate + "T00:00:00' and incident_date_time <= '" + endDate + "T23:59:59'"
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

  return {
    queryIncidents: queryIncidents
  };

})();

module.exports = IncidentDataStore;
