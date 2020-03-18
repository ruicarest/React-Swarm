import React, { Component } from "react";

//TODO: REFACT THIS CLASS STATE AND DUPLICATED LOGIC
// a joystick has a base and the stick, the base is fixed, the stick moves
export class VirtualJoystick extends Component {
  state = {
    //component state
    basePosition: {
      x: -1,
      y: -1
    },
    stickPosition: {
      x: -1,
      y: -1
    },
    angle: {
      x: -1
    },
    radius: 100,
    colour: "#2453FF"
  };

  componentDidMount = () => {
    //get minimap canvas context
    this.state.ctx = this.refs.joystick.getContext("2d");
    this.state.ctxPad = this.refs.joystickPad.getContext("2d");
  };

  componentWillUnmount = () => {};

  componentDidUpdate = () => {
    const { joypad, handleJoystick } = this.props;

    //clear canvas
    this.state.ctx.clearRect(
      0,
      0,
      this.state.ctx.canvas.width,
      this.state.ctx.canvas.height
    );
    this.state.ctxPad.clearRect(
      0,
      0,
      this.state.ctx.canvas.width,
      this.state.ctx.canvas.height
    );

    this.state.basePosition.x = joypad.basePosition.x - this.state.radius;
    this.state.basePosition.y = joypad.basePosition.y - this.state.radius;

    this.state.stickPosition.x = joypad.stickPosition.x - this.state.radius;
    this.state.stickPosition.y = joypad.stickPosition.y - this.state.radius;

    const vx = this.state.stickPosition.x - this.state.basePosition.x;
    const vy = this.state.basePosition.y - this.state.stickPosition.y;
    const lookAtMouseAngle = (Math.atan2(vx, vy) * 180) / Math.PI;

    //if joypad is on than draw pivot pad
    if (joypad.on == true) {
      this.drawCircle();
      this.drawCircle2();
    }

    //update global state angle
    if (this.state.angle != lookAtMouseAngle) {
      this.state.angle = lookAtMouseAngle;
      handleJoystick(lookAtMouseAngle);
    }
  };

  //draw circle on minimap
  drawCircle = () => {
    this.state.ctx.save();
    this.state.ctx.strokeStyle = this.state.colour;
    this.state.ctx.lineWidth = 1;
    this.state.ctx.beginPath();
    this.state.ctx.arc(
      this.state.radius,
      this.state.radius,
      this.state.radius,
      0,
      2 * Math.PI
    ); // x, y, radius, starting, end
    this.state.ctx.stroke();
    this.state.ctx.restore();
  };

  //draw circle on minimap
  drawCircle2 = () => {
    this.state.ctxPad.save();
    this.state.ctxPad.strokeStyle = "#245322";
    this.state.ctxPad.lineWidth = 1;
    this.state.ctxPad.beginPath();
    this.state.ctxPad.arc(
      this.state.radius,
      this.state.radius,
      this.state.radius - 20,
      0,
      2 * Math.PI
    ); // x, y, radius, starting, end
    this.state.ctxPad.stroke();
    this.state.ctxPad.restore();
  };

  //called once
  calcCenteringFactor = shipPos => {};

  update = () => {};

  render = () => {
    const { joypad, game } = this.props;

    let visible = "none";

    if (joypad.on == true && game.inGame == true) {
      visible = "inline";
    }

    return (
      <div>
        <canvas
          className="joystick"
          ref="joystick"
          width={this.state.radius * 2}
          height={this.state.radius * 2}
          style={{
            left: this.state.basePosition.x,
            top: this.state.basePosition.y,
            position: "absolute",
            display: visible
          }}
        />
        <canvas
          className="joystickPad"
          ref="joystickPad"
          width={this.state.radius * 2}
          height={this.state.radius * 2}
          style={{
            left: this.state.stickPosition.x,
            top: this.state.stickPosition.y,
            position: "absolute",
            display: visible
          }}
        />
      </div>
    );
  };
}
