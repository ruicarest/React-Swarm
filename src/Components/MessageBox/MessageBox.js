import React, { Component } from "react";
import "./MessageBox.css";

export default class MessageBox extends Component {
  state = {
    change: false,
    width: 0,
    time0: Date.now(),
    time: Date.now()
  };

  componentDidMount = () => {
    this.state.time0 = Date.now();
  };

  render = () => {
    this.state.time = Date.now();

    if (this.state.time - this.state.time0 >= 4000) {
      this.state.width = 400;
    }

    return (
      <div id="message-box" style={{ width: this.state.width }}>
        CENAS
      </div>
    );
  };
}
