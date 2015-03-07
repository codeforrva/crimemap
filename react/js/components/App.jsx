"use strict";

var ControlPanel = require('./ControlPanel');
var Map = require('./Map');
var AlertBox = require('./AlertBox');
var IncidentDataStore = require('../IncidentDataStore');

var App = React.createClass({

  getInitialState: function() {
    return {
      startDate: "2015-01-01",
      endDate: "2015-01-31",
      incidentFetchTime: new Date(),
      viewType: 'markers'
    }
  },

  dateRangeChanged: function(e) {
    this.setState(e);
  },

  dateRangeUpdate: function() {
    IncidentDataStore.queryIncidents({
      startDate: this.state.startDate,
      endDate: this.state.endDate
    }).done(function(data) {
      this.setState({ incidents: data, incidentFetchTime: new Date() })
    }.bind(this));
  },

  viewTypeChanged: function(choice) {
    this.setState({ viewType: choice });
  },

  render: function() {
    return (
      <div id="container" className="container-fluid pull-right">
        <ControlPanel
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          viewType={this.state.viewType}
          onDateRangeChanged={this.dateRangeChanged}
          onDateRangeUpdate={this.dateRangeUpdate}
          onViewTypeChanged={this.viewTypeChanged}/>
        <Map viewType={this.state.viewType} incidents={this.state.incidents} incidentFetchTime={this.state.incidentFetchTime}/>
        <AlertBox />
      </div>
    );
  }
});

module.exports = App;
