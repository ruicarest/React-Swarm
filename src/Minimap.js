import React, { Component } from 'react';

export class Minimap extends Component {

  state = {};          //component state
  centeringFactor = {  //ship center position correction factor
    x: 0,
    y: 0
  };
  firstUpdate = false; // first update flag 
  scale = null;        //minimap scale

  componentDidMount = () => {
    //load minimapScale
    this.scale = this.props.minimapScale;
    //get minimap canvas context
    this.state.ctx = this.refs.minimap.getContext('2d');
    //calc canvas size
    this.state.ctx.canvas.width = this.props.map.width / this.scale;
    this.state.ctx.canvas.height = this.props.map.height / this.scale;
  }

  componentDidUpdate = () => {
    const { Asteroids, Ship, Energy, Enemies, EZT } = this.props;

    //TODO: move this from here please!
    if (this.firstUpdate == false) {
      //calc ship centering factor
      this.calcCenteringFactor(Ship[0].position);
      this.firstUpdate = true;
    }
    //clear canvas
    this.state.ctx.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);

    //draw asteroids on minimap
    Asteroids.forEach(asteroid => {
      this.drawOnMinimap(asteroid.position, '#ffffff', asteroid.radius);
    });

    //draw ship on minimap
    Ship.forEach(ship => {
      this.drawOnMinimap(ship.position, '#f2aab4', ship.radius);
    });

    //draw energy on minimap
    Energy.forEach(energy => {
      this.drawOnMinimap(energy.position, energy.color, energy.radius);
    });

    //draw enemies on minimap
    Enemies.forEach(enemy => {
      this.drawOnMinimap(enemy.position, '#FF0000', enemy.radius);
    });

    //draw ezt on minimap
    EZT.forEach(ezt => {
      this.drawOnMinimap(ezt.position, ezt.color, ezt.radius);
    });
  }

  //draw circle on minimap
  drawCircle = (x, y, colour, radius) => {
    this.state.ctx.save();
    this.state.ctx.globalAlpha = 0.8;
    this.state.ctx.strokeStyle = colour;
    this.state.ctx.lineWidth = 1;
    this.state.ctx.beginPath();
    this.state.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.state.ctx.fill();
    this.state.ctx.stroke();
    this.state.ctx.restore();
  }

  //called once
  calcCenteringFactor = (shipPos) => {
    this.centeringFactor.x = this.state.ctx.canvas.width / 2 - shipPos.x / this.scale;
    this.centeringFactor.y = this.state.ctx.canvas.height / 2 - shipPos.y / this.scale;
  }

  drawOnMinimap = (currPos, colour, radiusRaw) => {

    //object radius
    let radius = radiusRaw / this.scale;

    //object position
    let xPos = currPos.x / this.scale + this.centeringFactor.x;
    let yPos = currPos.y / this.scale + this.centeringFactor.y;

    // Minimap edges
    if (xPos >= this.state.ctx.canvas.width + radius) {
      xPos = xPos - this.state.ctx.canvas.width - radius * 2;
    }
    if (yPos >= this.state.ctx.canvas.height + radius) {
      yPos = yPos - this.state.ctx.canvas.height - radius * 2;
    }

    //draw circles on minimap
    this.drawCircle(xPos, yPos, colour, radius);
  }

  update = () => {

  }

  render = () => {
    return (
      <div>
        <canvas className="minimap" ref="minimap" />
      </div>
    );
  }

}