import React, { Component } from 'react';

export class VirtualJoystick extends Component {
    state = {           //component state
        position: {
            x: 0,
            y: 0,
        },
        radius: 100,
        colour: "#2453FF",

    };

  componentDidMount = () => {
    //get minimap canvas context
    this.state.ctx = this.refs.joystick.getContext('2d');
  }

  componentDidUpdate = () => {
    const {joypad} = this.props; 

    //clear canvas
    this.state.ctx.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);

    this.state.position.x = joypad.positionPivot.x - this.state.radius;
    this.state.position.y = joypad.positionPivot.y - this.state.radius;

    //if joypad is on than draw pivot pad
    if(joypad.on == true) {
        this.drawCircle();
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

  //called once
  calcCenteringFactor = (shipPos) => {
  }


  update = () => {

  }

  render = () => {
    return (
      <div>
        <canvas className="joystick" ref="joystick" width = {this.state.radius*2} height = {this.state.radius*2} style={{left:this.state.position.x, top:this.state.position.y,position:'absolute'}} />
      </div>
    );
  }

}