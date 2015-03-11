"use strict";

var ControlSection = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    expanded: React.PropTypes.bool
  },
  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading" role="tab" id={'heading' + this.props.id}>
          <h4 className="panel-title">
            <a data-toggle="collapse" data-parent="#accordion" href={'#collapse' + this.props.id} aria-expanded="true" aria-controls={'collapse' + this.props.id}>
              {this.props.title}
            </a>
          </h4>
        </div>
        <div id={'collapse' + this.props.id} className={"panel-collapse collapse " + (this.props.expanded ? "in" : "out")} role="tabpanel" aria-labelledby={'heading' + this.props.id}>
          <div className="panel-body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ControlSection;
