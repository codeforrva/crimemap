"use strict";

var Map = React.createClass({
  componentDidMount: function(el) {
    var mapOptions = {
      center: { lat: 37.5333, lng: -77.4667 },
      zoom: 12
    };
    this.setState({ map: new google.maps.Map(this.getDOMNode(), mapOptions) });
  },
  componentWillReceiveProps: function(nextProps) {
    console.log("Map", "componentWillReceiveProps", nextProps, nextProps === this.props);
    if (nextProps.markers) {
      for (var i in nextProps.markers) {
        nextProps.markers[i].setMap(this.state.map);
      }
    }
  },
  render: function() {
    return (
      <div id="map-canvas" className="col-sm-9 col-sm-pull-3 col-xs-12"/>
    );
  }
});

module.exports = Map;
