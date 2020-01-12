import React, { Component } from "react";
import "./MessageBox.css";

export default class MessageBox extends Component {
  state = {
    change: false,
    time0: Date.now(),
    timeSinceStarted: Date.now(),
    timeToEnd: 2000,
    text: this.props.message,
    on: true
  };

  style = {
    width: 0,
    display: "absolute"
  };

  componentDidMount = () => {
    console.log("MessageBox - did mount!");
    this.restartTimer();
  };

  restartTimer = () => {
    let now = Date.now();
    this.setState({ time0: now, timeSinceStarted: now, on: true });
  };

  componentDidUpdate() {}

  render = () => {
    var message;
    this.state.timeSinceStarted = Date.now();

    if (this.state.timeSinceStarted - this.state.time0 >= 4000) {
      this.state.on = false;
    }

    if (this.state.timeSinceStarted - this.state.time0 >= 10) {
      this.style.width = 400;
    }

    message = this.state.on ? (
      <div id="message-box" style={{ ...this.style }}>
        {this.state.text}
      </div>
    ) : (
      ""
    );

    return <div>{message}</div>;
  };
}
