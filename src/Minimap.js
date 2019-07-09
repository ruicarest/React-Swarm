import React, { Component } from 'react';

export class Minimap extends Component {

  state = {};
  centeringFactor = {
    x: 0, 
    y: 0
  };

  componentDidMount = () => {
    //get minimap canvas context
    this.state.ctx = this.refs.minimap.getContext('2d');

    this.state.ctx.canvas.width = this.props.map.width/10;
    this.state.ctx.canvas.height = this.props.map.height/10;
  }

  componentDidUpdate = () => {
    const { Asteroids , Ship } = this.props;

    //calc ship centering factor
    //TODO: move this from here, calculated just once please!
    this.calcCenteringFactor(Ship[0].position);

    //clear canvas
    this.state.ctx.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);

    //draw asteroids on minimap
    Asteroids.forEach(asteroid => {
      //TODO: correct edges transition
       this.drawOnMinimap(asteroid.position,'#b00c1f');
    });

    //draw ship on minimap
    Ship.forEach(ship => {
      //TODO: correct edges transition
        this.drawOnMinimap(ship.position, '#424bf5');
    });

  }

  //draw circle on minimap
  createCircle = (x, y, colour) => {
    this.state.ctx.save();
    this.state.ctx.strokeStyle = colour;
    this.state.ctx.fillStyle = colour;
    this.state.ctx.lineWidth = 1;
    this.state.ctx.beginPath();
    this.state.ctx.arc(x, y, 2, 0, 2 * Math.PI);
    this.state.ctx.fill();
    this.state.ctx.stroke();
    this.state.ctx.restore();
  }

  calcCenteringFactor = (shipPos) => {
    this.centeringFactor.x = this.state.ctx.canvas.width/2 - shipPos.x/10;
    this.centeringFactor.y = this.state.ctx.canvas.height/2 - shipPos.y/10;
  }

  drawOnMinimap = (currPos, colour) => {

    let xPos = currPos.x / 10 + this.centeringFactor.x;
    let yPos = currPos.y / 10 + this.centeringFactor.y;

    // Minimap edges
    if(xPos >= this.state.ctx.canvas.width) {
      xPos = 0;
    }
    else if(xPos < 0) { 
      xPos = this.state.ctx.canvas.width;
    }

    if(yPos >= this.state.ctx.canvas.height) {
      yPos = 0;
    }
    else if(yPos < 0) {
      yPos = this.state.ctx.canvas.height;
    }

    this.createCircle(xPos, yPos, colour);

  }

  update = () => {

  }

  render = () => {
      return (
        <div>
          <canvas className="minimap" ref="minimap"/>
        </div>
      );
  }

}