import React, { Component } from 'react';
import Ship from './Ship';
import {Minimap} from './Minimap';
import Asteroid from './Asteroid';
import { randomNumBetweenExcluding, randomNumBetween } from './utils';

const KEY = {
    LEFT:  37,
    RIGHT: 39,
    UP: 38,
    A: 65,
    D: 68,
    W: 87,
    SPACE: 32
  };

const MAP = {
    width: 40,
    height: 24,
    asteroids: 32,
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
            map : {
              width: 64 * MAP.width,
              height: 64 * MAP.height,
            },
            screen:  {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1,
            },
            currentScore: 0,
            inGame: false,
            asteroidCount: MAP.asteroids,
            shipVelocity: {
                x: 0,
                y: 0,
            },
            minimapScale: 10,
        }

        this.bullets = [];
        this.ship = [];
        this.asteroids = [];
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

        const context = this.refs.gameWindow.getContext('2d');
        this.setState({ context: context });
        this.startGame();
        requestAnimationFrame(() => {this.update()});

    }

    startGame() {
    
        // Make ship
        let ship = new Ship({
            position: {
                x: this.state.screen.width/2,
                y: this.state.screen.height/2,
            },
            create: this.createObject.bind(this),
            onDie: this.gameOver.bind(this),
            updateVelocity: this.updateShipVelocity.bind(this)
        });

        this.createObject(ship, 'ship');

        // Make asteroids
        this.asteroids = [];
        this.generateAsteroids(this.state.asteroidCount)

        this.setState({
          inGame: true,
          currentScore: 0,
      });
    }

    gameOver(){
      this.setState({
        inGame: false,
      });
    }

    generateAsteroids(howMany){
        for (let i = 0; i < howMany; i++) {
          let asteroid = new Asteroid({
            size: Math.floor(randomNumBetween(30, 80)),
            position: {
              x: randomNumBetweenExcluding(0, this.state.map.width, 0, 10),
              y: randomNumBetweenExcluding(0, this.state.map.height, 0, 10),
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
      
      // Check for colisions
      this.checkCollisionsWith(this.bullets, this.asteroids);
      this.checkCollisionsWith(this.ship, this.asteroids);

      // Remove or render
      this.updateObjects(this.asteroids, 'asteroids');
      this.updateObjects(this.ship, 'ship');
      this.updateObjects(this.bullets, 'bullets');
      this.updateObjects(this.particles, 'particles');

      context.restore();

      // Next frame
      requestAnimationFrame(() => {this.update()});
    }

    //TODO: apply weapon damage on asteroida
    checkCollisionsWith(items1, items2) {
      var a = items1.length - 1;
      var b;
      for(a; a > -1; --a){
        b = items2.length - 1;
        for(b; b > -1; --b){
          var item1 = items1[a];
          var item2 = items2[b];
          if(this.checkCollision(item1, item2)){
            item1.destroy();
            item2.destroy();
          }
        }
      }
    }

    checkCollision(obj1, obj2){
      var vx = obj1.position.x - obj2.position.x;
      var vy = obj1.position.y - obj2.position.y;

      //length squared (avoid sqrt usage)
      var length = vx * vx + vy * vy;
      
      //length^2 <= (object radius)^2
      return (length <= Math.pow(obj1.radius + obj2.radius, 2));
    }

    DisplayShipHP () {

      if(props.state) {
        const inGame = this.state.inGame;
        if (inGame) {
          return <span> 5 HP</span>;
        }
      }

      return <span> 0 HP </span>;
    }

    render() {
      let endgame;

      //get Ship HP
      let shipHP = this.state.inGame ? this.ship[0].HP : 0;

      if(!this.state.inGame){
        endgame = (
          <span className="endgame">
            <p>Game over!</p>
            <button
              onClick={ this.startGame.bind(this) }>
              Restart
            </button>
          </span>
        )
      }

        return (
            <div key={"app"}>
              <span className="UI">
                <span className="controls">
                  Use [A][S][W][D] or [←][↑][↓][→] to MOVE <br/>
                  Use [SPACE] to SHOOT
                </span>
                <span className="stats">
                  {shipHP} HP
                </span>
                { endgame }
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


