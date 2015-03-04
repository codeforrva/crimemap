"use strict";

var MapInfoWindow = React.createClass({
  propTypes: {
    incident: React.PropTypes.object
  },
  render: function() {
    return (
      <div>
        <h4>{this.props.incident.offense_code_desc}</h4>
        <p>{this.props.incident.incident_date_time}</p>
        <p>{this.props.incident.disposition_code_desc}</p>
        <p>{this.props.incident.incident_address}</p>
        <p>({this.props.incident.incident_location.latitude}, {this.props.incident.incident_location.longitude})</p>
      </div>
    );
  }
});

module.exports = MapInfoWindow;
