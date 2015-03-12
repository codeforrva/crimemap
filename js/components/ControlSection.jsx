"use strict";

var ControlSection = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    expanded: React.PropTypes.bool,
    renderBody: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      renderBody: true
    };
  },
  render: function() {
    if (this.props.renderBody) {
      var body = <div className="panel-body">{this.props.children}</div>;
    } else {
      var body = <div>{this.props.children}</div>;
    }
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
          {body}
        </div>
      </div>
    );
  }
});

module.exports = ControlSection;
