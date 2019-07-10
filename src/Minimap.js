import React, { Component } from 'react';

export class Minimap extends Component {

  state = {};

  centeringFactor = {
    x: 0, 
    y: 0
  };

  firstUpdate = false;
  componentDidMount = () => {
    //get minimap canvas context
    this.state.ctx = this.refs.minimap.getContext('2d');

    this.state.ctx.canvas.width = this.props.map.width/10;
    this.state.ctx.canvas.height = this.props.map.height/10;
  }

  componentDidUpdate = () => {
    const { Asteroids , Ship } = this.props;


    //TODO: move this from here please!
    if(this.firstUpdate == false) {
      //calc ship centering factor
      this.calcCenteringFactor(Ship[0].position);
      this.firstUpdate = true;
    }
    //clear canvas
    this.state.ctx.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);

    //draw asteroids on minimap
    Asteroids.forEach(asteroid => {
      //TODO: correct edges transition
       this.drawOnMinimap(asteroid.position,'#b00c1f', asteroid.radius);
    });

    //draw ship on minimap
    Ship.forEach(ship => {
      //TODO: correct edges transition
        this.drawOnMinimap(ship.position, '#424bf5', ship.radius);
    });

  }

  //draw circle on minimap
  drawCircle = (x, y, colour, radius) => {
    this.state.ctx.save();
    this.state.ctx.strokeStyle = colour;
    this.state.ctx.fillStyle = colour;
    this.state.ctx.lineWidth = 1;
    this.state.ctx.beginPath();
    this.state.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.state.ctx.fill();
    this.state.ctx.stroke();
    this.state.ctx.restore();
  }

  //called once
  calcCenteringFactor = (shipPos) => {
    this.centeringFactor.x = this.state.ctx.canvas.width/2 - shipPos.x/10;
    this.centeringFactor.y = this.state.ctx.canvas.height/2 - shipPos.y/10;
  }

  drawOnMinimap = (currPos, colour, radiusRaw) => {

    //object radius
    let radius = radiusRaw/10;

    //object position
    let xPos = currPos.x / 10 + this.centeringFactor.x;
    let yPos = currPos.y / 10 + this.centeringFactor.y;

    // Minimap edges
    if(xPos >= this.state.ctx.canvas.width + radius) {
      xPos = xPos - this.state.ctx.canvas.width - radius*2;
    }
    if(yPos >= this.state.ctx.canvas.height + radius) {
      yPos = yPos - this.state.ctx.canvas.height - radius*2;
    }
   
    //draw circles on minimap
    this.drawCircle(xPos, yPos, colour, radius);
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