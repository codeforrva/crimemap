"use strict";

var ControlSection = require('./ControlSection');

var ControlPanel = React.createClass({
  propTypes: {
    startDate: React.PropTypes.string.isRequired,
    endDate: React.PropTypes.string.isRequired,
    viewType: React.PropTypes.string.isRequired,
    pointCount: React.PropTypes.number,
    onDateRangeChanged: React.PropTypes.func,
    onDateRangeUpdate: React.PropTypes.func,
    onViewTypeChanged: React.PropTypes.func
  },
  dateRangeChanged: function(e) {
    if (this.props.onDateRangeChanged) {
      this.props.onDateRangeChanged({
        startDate: this.refs.startDate.getDOMNode().value,
        endDate: this.refs.endDate.getDOMNode().value
      });
    }
  },
  dateRangeUpdate: function(e) {
    if (this.props.onDateRangeUpdate) { this.props.onDateRangeUpdate(); }
  },
  viewTypeChanged: function(choice, e) {
    if (this.props.onViewTypeChanged) { this.props.onViewTypeChanged(choice); }
  },
  render: function() {
    var pointCountMessage = this.props.pointCount !== undefined ? this.props.pointCount + " points displayed. " : undefined;
    return (
      <div id="sidebar" className="col-sm-3 col-sm-push-9 hidden-xs">
        <h4>Richmond Police Incident Data</h4>
        <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
          <ControlSection id="DateRange" title="Date Range" expanded={true}>
            <p>Display incidents within this date range:</p>
            <form>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input id="startDate" ref="startDate" type="date" value={this.props.startDate} className="form-control" onChange={this.dateRangeChanged}/>
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input id="endDate" ref="endDate" type="date" value={this.props.endDate} className="form-control" onChange={this.dateRangeChanged}/>
              </div>
              <span id="numMarkers"></span>
              <button type="button" className="btn pull-right btn-primary" onClick={this.dateRangeUpdate}>Update</button>
            </form>
          </ControlSection>
          <ControlSection id="ViewType" title="View Type">
            <form>
              <div className="form-group">
                <label>
                  <input id="showMarkers" type="radio" name="viewType" onChange={this.viewTypeChanged.bind(this, 'markers')}
                    checked={this.props.viewType == 'markers' ? 'checked' : ''}/>&nbsp;
                  Markers
                </label>
                <br/>Show police incidents as markers on the map, which you can click for more info.
              </div>
              <div className="form-group">
                <label>
                  <input id="showHeatmap" type="radio" name="viewType" onChange={this.viewTypeChanged.bind(this, 'heatmap')}
                  checked={this.props.viewType == 'heatmap' ? 'checked' : ''}/>&nbsp;
                  Heatmap
                </label>
                <br/>Show a heatmap view of police incidents, highlighting areas of more activity.
              </div>
            </form>
          </ControlSection>
          <ControlSection id="About" title="About">
            <p>This app shows police incidents in Richmond. It has events from January of 2004 through January of 2015.</p>
            <p>Information comes from the Richmond Police Department's public data portal. The location is accurate to the block number, not the exact address.</p>
            <p>This app was built by <a href="http://www.codeforrva.org/">Code for RVA</a>, a brigade of <a href="http://www.codeforamerica.org/">Code for America</a>.</p>
            <p>Data is hosted by <a href="http://www.socrata.com/">Socrata</a> on the <a href="https://brigades.opendatanetwork.com/TRANSPARENCY/Richmond-Police-Incident-Data/ush7-in5v">Open Data Network</a>.</p>
          </ControlSection>
        </div>
        <div className="pull-right">
          {pointCountMessage}
        </div>
      </div>
    );
  }
});

module.exports = ControlPanel;
