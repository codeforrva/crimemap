"use strict";

var MapInfoWindow = require('./MapInfoWindow');

var Map = React.createClass({
  // component lifecycle functions
  getInitialState: function() {
    return {
      incidentFetchTime: this.props.incidentFetchTime
    }
  },
  componentDidMount: function(el) {
    // load new google map
    var mapOptions = {
      center: { lat: 37.5333, lng: -77.4667 },
      zoom: 12
    };
    this.setState({
      map: new google.maps.Map(this.getDOMNode(), mapOptions),
      infoWindow: new google.maps.InfoWindow()
    });
  },
  componentWillReceiveProps: function(nextProps) {
    if (this.shouldComponentUpdate(nextProps)) {
      if (nextProps.viewType == 'markers') {
        // clear existing markers
        if (this.state.markers) {
          this.state.markers.map(function(m){m.setMap(null);});
        }
        // generate new markers
        var markers = nextProps.incidents.map(function(row) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(
                row.incident_location.latitude,
                row.incident_location.longitude),
            title: row.offense_code_desc,
            icon: getIcon(row.offense_code_desc)
          });

          google.maps.event.addListener(marker, 'click', function() {
            this.state.infoWindow.close();
            this.state.infoWindow.setContent(React.renderToStaticMarkup(<MapInfoWindow incident={row}/>));
            this.state.infoWindow.open(this.state.map, marker);
          }.bind(this));

          return marker;

        }.bind(this));

        // add new markers to the state along with the fetch time so we can check if we need to update
        this.setState({ markers: markers, incidentFetchTime: nextProps.incidentFetchTime });
      } else {
        // TODO: load heatmap
      }
    }
  },
  shouldComponentUpdate: function(nextProps) {
    // do not update unless the incidents have been fetched more recently than the ones we have
    // or if we are changing view type
    return (!!nextProps.incidents && nextProps.incidentFetchTime > this.state.incidentFetchTime) || this.props.viewType != nextProps.viewType;
  },
  render: function() {
    if (this.props.viewType == 'markers') {
      this.setMarkerMap(this.state.map);
      // TODO: hide heatmap
    } else if (this.props.viewType == 'heatmap') {
      this.setMarkerMap(null);
      // TODO: show heatmap
    }
    return (
      <div id="map-canvas" className="col-sm-9 col-sm-pull-3 col-xs-12"/>
    );
  },
  // other functions
  setMarkerMap: function(obj) {
    if (this.state && this.state.markers) {
      for (var i in this.state.markers) {
        this.state.markers[i].setMap(obj);
      }
    }
  }
});

var getIcon = function(str) {
  // return an icon object for a given incident type
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
      hash = ((hash << 5) + hash) + char; // hash * 33 + c
  }

  var h = hash % 360;
  var s = Math.abs((hash >> 8) % 50);
  var l = Math.abs((hash >> 4) % 50);

  return 'hsl(' + h + ', ' + (s+50) + '%, ' + (l+(stroke?0:25)) + '%)';
}

module.exports = Map;
