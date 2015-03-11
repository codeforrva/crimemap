"use strict";

var ControlPanel = require('./ControlPanel');
var Map = require('./Map');
var AlertBox = require('./AlertBox');
var IncidentDataStore = require('../IncidentDataStore');
var Logging = require('../mixins/Logging');

var App = React.createClass({
  mixins: [Logging],

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
    $.when(
      // markers
      IncidentDataStore.queryIncidents({
        startDate: this.state.startDate,
        endDate: this.state.endDate
      }),
      // heatmap
      IncidentDataStore.queryHeatmap({
        startDate: this.state.startDate,
        endDate: this.state.endDate
      })
    ).done(function(markerData, heatmapData) {
      this.setState({ incidents: markerData, heatmapPoints: heatmapData, incidentFetchTime: new Date() })
    }.bind(this));
  },

  viewTypeChanged: function(choice) {
    this.setState({ viewType: choice });
  },

  render: function() {
    var pointCount = undefined;
    if (this.state.viewType == 'markers' && this.state.incidents) {
      pointCount = this.state.incidents.length;
    } else if (this.state.viewType == 'heatmap' && this.state.heatmapPoints) {
      pointCount = this.state.heatmapPoints.length;
    }
    return (
      <div id="container" className="container-fluid pull-right">
        <ControlPanel
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          viewType={this.state.viewType}
          pointCount={pointCount}
          onDateRangeChanged={this.dateRangeChanged}
          onDateRangeUpdate={this.dateRangeUpdate}
          onViewTypeChanged={this.viewTypeChanged}/>
        <Map viewType={this.state.viewType}
          incidents={this.state.incidents}
          heatmapPoints={this.state.heatmapPoints}
          incidentFetchTime={this.state.incidentFetchTime}/>
        <AlertBox />
      </div>
    );
  }
});

module.exports = App;
