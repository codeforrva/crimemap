"use strict";

$(function() {

  // build map
  var mapOptions = {
    center: { lat: 37.5333, lng: -77.4667 },
    zoom: 12
  };
  var map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  $(document).trigger('mapReady', map);

  Handlebars.registerHelper('date', function(context) {
    return moment(new Date(context)).format("MMMM D, YYYY [at] h:mm a");
  });
  
  window.infoWindowTemplate = Handlebars.compile($('#infoWindowTemplate').html());

  // date picker update
  $('#updateDate').click(function() {
    hideMarkers();
    window.markers = null;
    loadMarkers(map);
  });

  // view types
  $('#showMarkers').click(function(){
    hideHeatmap();
    loadMarkers(map);
  });

  $('#showHeatmap').click(function(){
    hideMarkers();
    loadHeatmap(map);
  });
});

// API reference is here: http://dev.socrata.com/foundry/#/brigades.opendatanetwork.com/ush7-in5v
// max 50000 records allowed

function apiQuery(queryOpts) {
  var loading = $('#loading').show();
  return $.getJSON("https://brigades.opendatanetwork.com/resource/ush7-in5v.json?$$app_token=3sg2sPslVNC65HpUxDTSfRR4d&" +
    $.param(queryOpts)).fail(function(response) {
      showApiResponseAlert(response);
    }).always(loading.slideUp('fast'));
}

function loadMarkers(map) {
  if (window.markers) {
    showMarkers(map);
    return;
  }

  var infoWindow;
  var startDate = $('#startDate').val() || '2015-01-01';
  var endDate = $('#endDate').val() || '2015-01-31';
  if (startDate > endDate) {
    showAlert("Hold up! You might want to switch your dates around.");
    return;
  }
  apiQuery({
    "$select": "incident_location,offense_code_desc,incident_date_time,disposition_code_desc",
    // TODO: there is a time zone thing going on here
    "$where": "incident_date_time >= '" + startDate + "T00:00:00' and incident_date_time <= '" + endDate + "T23:59:59'"
  }).done(function(data) {

    window.markers = data.filter(function(row) {
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
        map: map,
        title: row.offense_code_desc,
        icon: getIcon(row.offense_code_desc)
      });

      google.maps.event.addListener(marker, 'click', function() {
        if (infoWindow) {
          infoWindow.close();
        }
        infoWindow = new google.maps.InfoWindow({
          content: window.infoWindowTemplate(row)
        });
        infoWindow.open(marker.map, marker);
      });

      return marker;
    });

    $('#numMarkers').text(window.markers.length + " incidents found.");
  });
}

function hideMarkers() {
  showMarkers(null);
}

function showMarkers(map) {
  if (!window.markers) return;
  for (var i = 0; i < window.markers.length; i++) {
    window.markers[i].setMap(map);
  }
}

function loadHeatmap(map) {
  if (window.heatmap) {
    showHeatmap(map);
    return;
  }

  apiQuery({
    "$limit": 50000,
    "$select": "incident_location"
    // this makes a much greener heatmap. Perhaps things have spread out more since 2004.
    //,    "$order": "incident_date_time DESC"
  })
  .done(function(data) {

    // this does a heatmap layer. more points is better. only need incident_location in $select
    var points = data.filter(function(row) {
      return (
        // filter out rows with no coordinates
        row.incident_location.latitude && row.incident_location.longitude &&
        // TODO: these specific sites might be filterable in the API
        // e.g. incident_location.longitude != ...
        // filter out city hall
        (row.incident_location.longitude != "-77.43364758299998" &&
        row.incident_location.latitude != "37.54070234900007") &&
        // filter out police HQ
        (row.incident_location.longitude != "-77.44491629499998" &&
        row.incident_location.latitude != "37.546095328000035") &&
        // TODO: see if there are other police stations, courthouses, etc.
        // the very common 1300 Coalter Street address may be the sheriff's office, not sure
        true);
    }).map(function(row) {
      // TODO: WeightedLocation for more serious incidents?
      return new google.maps.LatLng(
        row.incident_location.latitude,
        row.incident_location.longitude);
    });
    console.log("Creating heatmap with", points.length, "points");

    window.heatmap = new google.maps.visualization.HeatmapLayer({
      data: new google.maps.MVCArray(points),
      radius: 15
    });
    showHeatmap(map);
  });
}

function hideHeatmap() {
  showHeatmap(null);
}

function showHeatmap(map) {
  if (!window.heatmap) return;
  window.heatmap.setMap(map);
}

function getIcon(str) {
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

function getColorString(str, stroke) {
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

function showApiResponseAlert(response) {
  if (response.responseJSON) {
    showAlert("And lo! The ground shook and a fell voice uttered fearsome words of great import: \"" + response.responseJSON.message + "\"");
  } else {
    showAlert("Whoops! Looks like we broke the Internet. Sorry about that.");
    console.log(response);
  }
}

function showAlert(message, cls) {
  var $d = $('<div id="alert" class="alert" style="display:none;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
  $d.addClass('alert-' + (cls || 'danger'))
    .append(message)
    .appendTo($('#alert-container'))
    .slideDown('fast');
  setTimeout(function(){$d.slideUp('fast', function(){$(this).remove();});}, 10000);
}