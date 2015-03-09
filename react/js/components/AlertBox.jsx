"use strict";

var Alert = require('../mixins/Alert');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var AlertBox = React.createClass({
  getInitialState: function() {
    Alert.addAlertListener(function(text, alertClass) {
      this.setState({messages: this.state.messages.concat([{
        key: new Date().getTime() + Math.random(),
        text: text,
        alertClass: alertClass
      }])});
    }.bind(this));
    return {messages: []};
  },
  render: function() {
    var messageElements = this.state.messages.map(function(m, i) {
      setTimeout(function() {
        var messages = this.state.messages.splice(i,1);
        this.setState({messages: messages});
      }.bind(this), 10000);
      return (
        <AlertMessage key={m.key} alertClass={m.alertClass} text={m.text}/>
      );
    }.bind(this));
    return (
      <div id="alert-container">
        <ReactCSSTransitionGroup transitionName="alert">
          {messageElements}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

var AlertMessage = React.createClass({
  propTypes: {
    alertClass: React.PropTypes.oneOf(['success', 'info', 'warning', 'danger']).isRequired,
    text: React.PropTypes.string.isRequired
  },
  render: function() {
    return (
      <div className={"alert alert-" + this.props.alertClass}>
        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        {this.props.text}
      </div>
    );
  }
});

module.exports = AlertBox;
