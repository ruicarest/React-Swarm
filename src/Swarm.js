import React, { Component } from 'react';
import Asteroid from './Asteroid';
import { randomNumBetweenExcluding } from './utils';

const KEY = {
    LEFT:  37,
    RIGHT: 39,
    UP: 38,
    A: 65,
    D: 68,
    W: 87,
    SPACE: 32
  };

export class Swarm extends Component {
    constructor() {
        super();
        
        this.state = {
            testVar: 0,
            context: null,
            keys : {
              left  : 0,
              right : 0,
              up    : 0,
              down  : 0,
              space : 0,
            },
            screen:  {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1,
            },
            currentScore: 0,
            inGame: false,
            asteroidCount: 2,
        }

        this.ship = [];
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
    }

    handleResize(value, e){
        this.setState({
          screen : {
            width: window.innerWidth,
            height: window.innerHeight,
            ratio: window.devicePixelRatio || 1,
          }
        });
      }

    handleKeys(value, e){
        let keys = this.state.keys;
        if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
        if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
        if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
        if(e.keyCode === KEY.SPACE) keys.space = value;
        this.setState({
          keys : keys
        });
      }

    componentDidMount() {
    
        window.addEventListener('keyup',   this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
        window.addEventListener('resize',  this.handleResize.bind(this, false));

        const context = this.refs.canvas.getContext('2d');
        this.setState({ context: context });
        this.startGame();
        requestAnimationFrame(() => {this.update()});

        console.log("Rui - Mounted!");

    }

    startGame() {
        this.setState({
        inGame: true,
        currentScore: 0,
        });
    
        // Make asteroids
        this.asteroids = [];
        this.generateAsteroids(this.state.asteroidCount)
    }

    generateAsteroids(howMany){
        let asteroids = [];
        let ship = this.ship[0];
        for (let i = 0; i < howMany; i++) {
          let asteroid = new Asteroid({
            size: 80,
            position: {
              x: randomNumBetweenExcluding(0, this.state.screen.width, 0, 10),
              y: randomNumBetweenExcluding(0, this.state.screen.height, 0, 10),
            },
            create: this.createObject.bind(this),
            addScore: this.addScore.bind(this)
          });
          this.createObject(asteroid, 'asteroids');
        }
      }

      createObject(item, group){
        this[group].push(item);
      }

      updateObjects(items, group){
        let index = 0;
        for (let item of items) {
          if (item.delete) {
            this[group].splice(index, 1);
          }else{
            items[index].render(this.state);
          }
          index++;
        }
      }

      addScore(points){
        if(this.state.inGame){
          this.setState({
            currentScore: this.state.currentScore + points,
          });
        }
      }

    update() {
        const context = this.state.context;
    
        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);
    
        // Motion trail
        context.fillStyle = '#000';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;
       
        // Remove or render
        this.updateObjects(this.asteroids, 'asteroids')
    
        context.restore();
    
        // Next frame
        requestAnimationFrame(() => {this.update()});
    }

    render() {
        return (
            <div>
                <span className="controls">
                Use [A][S][W][D] or [←][↑][↓][→] to MOVE<br/>
                Use [SPACE] to SHOOT
                </span>
                <canvas ref="canvas"
                    width={this.state.screen.width * this.state.screen.ratio}
                    height={this.state.screen.height * this.state.screen.ratio}
                />
            </div>
            );
    }

}