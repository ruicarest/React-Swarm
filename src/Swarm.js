import React, { Component } from 'react';
import Ship from './Ship';
import {Minimap} from './Minimap';
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
            asteroidCount: 5,
            shipVelocity: {
                x: 0,
                y: 0,
            },
        }

        this.ship = [];
        this.asteroids = [];
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

        const context = this.refs.gameWindow.getContext('2d');
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
    
        // Make ship
        let ship = new Ship({
            position: {
                x: this.state.screen.width/2,
                y: this.state.screen.height/2,
            },
            updateVelocity: this.updateShipVelocity.bind(this)
        });

        this.createObject(ship, 'ship');

        // Make asteroids
        this.asteroids = [];
        this.generateAsteroids(this.state.asteroidCount)
    }

    generateAsteroids(howMany){
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

      updateShipVelocity(newVelocity) {
        this.setState({
            shipVelocity : newVelocity
          });
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
      this.updateObjects(this.asteroids, 'asteroids');
      this.updateObjects(this.ship, 'ship');

      // console.log("Distance: " + (this.asteroids[0].position.x - this.ship[0].position.x) + '\n',
      //                             "Velocity.x: " + this.state.shipVelocity.x + '\n',
      //                             "asteroid position: " + this.asteroids[0].position.x + '\n',
      //                             "ship position: " + this.ship[0].position.x + '\n'
      //                             );

      context.restore();

      // Next frame
      requestAnimationFrame(() => {this.update()});
    }

    render() {
        return (
            <div key={"app"}>
                <span className="controls">
                Use [A][S][W][D] or [←][↑][↓][→] to MOVE<br/>
                Use [SPACE] to SHOOT
                </span>
                <canvas className="gameWindow" ref="gameWindow"
                    width={this.state.screen.width * this.state.screen.ratio}
                    height={this.state.screen.height * this.state.screen.ratio}
                />
                <div key={"minimapdiv"} >
                  <Minimap key ={"Minimap"} {...this.state} Ship = {this.ship} Asteroids = {this.asteroids} ></Minimap>
                </div>
            </div>
            );
    }
}