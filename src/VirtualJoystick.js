import React, { Component } from 'react';

//TODO: REFACT THIS CLASS STATE AND DUPLICATED LOGIC
export class VirtualJoystick extends Component {
    state = {           //component state
        position: {
            x: 0,
            y: 0,
        },
        positionPad: {
          x: 0,
          y: 0,
        },
        radius: 100,
        colour: "#2453FF",

    };

  componentDidMount = () => {
    //get minimap canvas context
    this.state.ctx = this.refs.joystick.getContext('2d');
    this.state.ctxPad = this.refs.joystickPad.getContext('2d');
  }

  componentDidUpdate = () => {
    const {joypad} = this.props; 

    //clear canvas
    this.state.ctx.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);
    this.state.ctxPad.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);

    this.state.position.x = joypad.positionPivot.x - this.state.radius;
    this.state.position.y = joypad.positionPivot.y - this.state.radius;

    this.state.positionPad.x = joypad.positionJoystick.x - this.state.radius;
    this.state.positionPad.y = joypad.positionJoystick.y - this.state.radius;



    //if joypad is on than draw pivot pad
    if(joypad.on == true) {
        this.drawCircle();
        this.drawCircle2();
    }

  }

  //draw circle on minimap
  drawCircle = () => {
    this.state.ctx.save();
    this.state.ctx.strokeStyle = this.state.colour;
    this.state.ctx.lineWidth = 1;
    this.state.ctx.beginPath();
    this.state.ctx.arc(this.state.radius, this.state.radius, this.state.radius, 0, 2 * Math.PI);  // x, y, radius, starting, end
    this.state.ctx.stroke();
    this.state.ctx.restore();
  }

    //draw circle on minimap
    drawCircle2 = () => {
      this.state.ctxPad.save();
      this.state.ctxPad.strokeStyle = "#245322";
      this.state.ctxPad.lineWidth = 1;
      this.state.ctxPad.beginPath();
      this.state.ctxPad.arc(this.state.radius, this.state.radius, this.state.radius - 20, 0, 2 * Math.PI);  // x, y, radius, starting, end
      this.state.ctxPad.stroke();
      this.state.ctxPad.restore();
    }

  //called once
  calcCenteringFactor = (shipPos) => {
  }


  update = () => {

  }

  render = () => {
    const {joypad, inGame} = this.props; 

    let visible = 'none'; 

    if(joypad.on == true && inGame == true) {
      visible = 'inline';
    }

    return (
      <div>
        <canvas className="joystick" ref="joystick"  width = {this.state.radius*2} height = {this.state.radius*2} style={{left:this.state.position.x, top:this.state.position.y,position:'absolute', display: visible}} />
        <canvas className="joystickPad" ref="joystickPad"  width = {this.state.radius*2} height = {this.state.radius*2} style={{left:this.state.positionPad.x, top:this.state.positionPad.y,position:'absolute', display: visible}} />
      </div>
    );
  }

}