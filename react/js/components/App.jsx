"use strict";

var ControlPanel = require('./ControlPanel');
var Map = require('./Map');
var AlertBox = require('./AlertBox');
var Store = require('../Store');

var App = React.createClass({

  getInitialState: function() {
    var self = this;
    Store.addDateChangeHandler(function() {
      var state = Store.state;
      self.setState({ startDate: state.startDate, endDate: state.endDate });
    });
    Store.addMarkersUpdatedHandler(function() {
      var state = Store.state;
      self.setState({ markers: state.markers });
    });
    return Store.state;
  },

  render: function() {
    return (
      <div id="container" className="container-fluid pull-right">
        <ControlPanel startDate={this.state.startDate} endDate={this.state.endDate}/>
        <Map markers={this.state.markers}/>
        <AlertBox />
      </div>
    );
  }
});

module.exports = App;
