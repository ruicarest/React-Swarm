import React, { Component } from "react";
import "./MessageBox.css";

export default class MessageBox extends Component {
  state = {
    change: false,
    width: 0,
    time0: Date.now(),
    time: Date.now(),
    text: this.props.message,
    on: true,
    style: {
      width: 0,
      display: "none"
    }
  };

  componentDidMount = () => {
    console.log("MessageBox - did mount!");
    this.state.time0 = Date.now();
  };

  render = () => {
    var message;
    this.state.time = Date.now();

    if (this.state.time - this.state.time0 >= 4000) {
      this.state.style.width = 400;
    }

    message = this.state.on ? (
      <div id="message-box" style={{ ...this.state.style }}>
        {this.state.text}
      </div>
    ) : (
      ""
    );
    return <div>{message}</div>;
  };
}
