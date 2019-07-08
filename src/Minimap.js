import React, { Component } from 'react';

export class Minimap extends Component {

  state = {};

  componentDidMount = () => {
    //get minimap canvas context
    this.state.ctx = this.refs.minimap.getContext('2d');
  }

  componentDidUpdate = () => {
    const { Asteroids , Ship } = this.props;

    //clear canvas
    this.state.ctx.clearRect(0, 0, this.state.ctx.canvas.width, this.state.ctx.canvas.height);

    //draw asteroids on minimap
    Asteroids.forEach(asteroid => {
      //TODO: correct minimap scale
       this.createCircle(asteroid.position.x/10, asteroid.position.y/10);
    });


  }

  //draw circle on minimap
  createCircle = (x, y) => {
    this.state.ctx.save();
    this.state.ctx.strokeStyle = '#ffffff';
    this.state.ctx.fillStyle = '#000000';
    this.state.ctx.lineWidth = 2;
    this.state.ctx.beginPath();
    this.state.ctx.arc(x, y, 5, 0, 2 * Math.PI);
    this.state.ctx.fill();
    this.state.ctx.stroke();
    this.state.ctx.restore();
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