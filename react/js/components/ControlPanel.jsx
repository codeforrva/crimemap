"use strict";

var ControlSection = require('./ControlSection');
var Actions = require('../Actions');

var ControlPanel = React.createClass({
  propTypes: {
    startDate: React.PropTypes.string.isRequired,
    endDate: React.PropTypes.string.isRequired
  },
  handleDateRangeChange: function(e) {
    Actions.changeDateRange(this.refs.startDate.getDOMNode().value, this.refs.endDate.getDOMNode().value);
  },
  handleDateRangeUpdate: function(e) {
    //this.props.onDateRangeChanged({
    //  startDate: this.state.startDate,
    //  endDate: this.state.endDate
    //});
    Actions.requestMarkerUpdate(this.refs.startDate.getDOMNode().value, this.refs.endDate.getDOMNode().value);
  },
  render: function() {
    return (
      <div id="sidebar" className="col-sm-3 col-sm-push-9 hidden-xs">
        <h4>Richmond Police Incident Data</h4>
        <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
          <ControlSection id="DateRange" title="Date Range" expanded={true}>
            <p>Display incidents within this date range:</p>
            <form>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input id="startDate" ref="startDate" type="date" value={this.props.startDate} className="form-control" onChange={this.handleDateRangeChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input id="endDate" ref="endDate" type="date" value={this.props.endDate} className="form-control" onChange={this.handleDateRangeChange}/>
              </div>
              <span id="numMarkers"></span>
              <button type="button" className="btn pull-right btn-primary" onClick={this.handleDateRangeUpdate}>Update</button>
            </form>
          </ControlSection>
          <ControlSection id="ViewType" title="View Type">
            <form>
              <div className="form-group">
                <label>
                  <input id="showMarkers" type="radio" name="viewType"/>
                  Marker
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input id="showHeatmap" type="radio" name="viewType"/>
                  Heatmap
                </label>
              </div>
            </form>
          </ControlSection>
        </div>
      </div>
    );
  }
});

module.exports = ControlPanel;
