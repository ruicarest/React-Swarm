import React, { Component } from 'react';
import Ship from './Ship';
import {Minimap} from './Minimap';
import {Background} from './Background';
import Asteroid from './Asteroid';
import Energy from './Energy';
import Enemy from './Enemy';
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
    energy: 10,
    enemies: 1
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
            energyCount: MAP.energy,
            enemiesCount: MAP.enemies,
            shipVelocity: {
                x: 0,
                y: 0,
            },
            minimapScale: 10,
        }

        this.bullets = [];
        this.enemyBullets = [];
        this.ship = [];
        this.asteroids = [];
        this.particles = [];
        this.energy = [];
        this.enemies = [];
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
        this.generateAsteroids(this.state.asteroidCount);

        // Make energy
        this.energy = [];
        this.generateEnergy(this.state.energyCount);

        // Make enemies
        this.enemies = [];
        this.generateEnemies(this.state.enemiesCount);

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

    addEnergy() {
      this.ship[0].addEnergy(25);
    }

    generateAsteroids(howMany){
        for (let i = 0; i < howMany; i++) {
          let asteroid = new Asteroid({
            size: Math.floor(randomNumBetween(30, 80)),
            position: {
              x: randomNumBetweenExcluding(0, this.state.map.width, this.ship[0].position.x - 150, this.ship[0].position.x + 150),
              y: randomNumBetweenExcluding(0, this.state.map.height, this.ship[0].position.y - 150, this.ship[0].position.y + 150),
            },
            create: this.createObject.bind(this),
            addScore: this.addScore.bind(this)
          });
          this.createObject(asteroid, 'asteroids');
        }
      }

      generateEnergy(howMany){
        for (let i = 0; i < howMany; i++) {
          let energy = new Energy({
            size: 20,
            position: {
              x: randomNumBetweenExcluding(0, this.state.map.width, this.ship[0].position.x - 150, this.ship[0].position.x + 150),
              y: randomNumBetweenExcluding(0, this.state.map.height, this.ship[0].position.y - 150, this.ship[0].position.y + 150),
            },
            addEnergy: this.addEnergy.bind(this)
          });
          this.createObject(energy, 'energy');
        }
      }

      generateEnemies(howMany){
        for (let i = 0; i < howMany; i++) {
          let enemy = new Enemy({
          position: {
            x: randomNumBetweenExcluding(0, this.state.map.width, this.ship[0].position.x - 150, this.ship[0].position.x + 150),
            y: randomNumBetweenExcluding(0, this.state.map.height, this.ship[0].position.y - 150, this.ship[0].position.y + 150),
          },
          create: this.createObject.bind(this),
          });
          this.createObject(enemy, 'enemies');
        }
      }

      createObject(item, group){
        this[group].push(item);
      }

      //TODO: remove args and use state instead (part1)
      updateObjects(items, group, args = null){
        let index = 0;
        for (let item of items) {
          if (item.delete) {
            this[group].splice(index, 1);
          }else{
            items[index].render(this.state, args);
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
      context.globalAlpha = 0.8;
      context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
      context.globalAlpha = 1;
      
      // Check for colisions
      this.checkCollisionsWith(this.bullets, this.asteroids);
      this.checkCollisionsWith(this.bullets, this.enemies);
      this.checkCollisionsWith(this.ship, this.asteroids);
      this.checkCollisionsWith(this.ship, this.energy);
      this.checkCollisionsWith(this.ship, this.enemyBullets);

      // Remove or render
      this.updateObjects(this.asteroids, 'asteroids');
      this.updateObjects(this.ship, 'ship');
      this.updateObjects(this.bullets, 'bullets');
      this.updateObjects(this.enemyBullets, 'enemyBullets');
      this.updateObjects(this.particles, 'particles');
      this.updateObjects(this.energy, 'energy');

      //TODO: remove args and use state instead (part2)
      if(this.state.inGame) {
        this.updateObjects(this.enemies, 'enemies', this.ship[0].position);
      }

      context.restore();

      // Next frame
      requestAnimationFrame(() => {this.update()});
    }

    //TODO: apply weapon damage on asteroids
    checkCollisionsWith(items1, items2) {
      var a = items1.length - 1;
      var b;
      for(a; a > -1; --a){
        b = items2.length - 1;
        for(b; b > -1; --b){
          var item1 = items1[a];
          var item2 = items2[b];

          //TODO: review item type, go enum!
          const collision = this.checkCollision(item1, item2);
          if(collision.happened) {
            if(item1.type === "ship") {
                if(item2.type === "asteroid") {
                  item1.hit(item2.toughness, collision.angle);
                }
                else if(item2.type === "pickable") {
                  item2.destroy();
                }
                else if(item2.type === "bullet") {
                  item1.hit(item2.toughness, collision.angle);
                  item2.destroy();
                }
            }
            else {
              item1.destroy();
            }
            item2.hit(item1.toughness);
          }
        }
      }
    }

    checkCollision(obj1, obj2){
      let hitAngle = 0;

      var vx = obj1.position.x - obj2.position.x;
      var vy = obj2.position.y - obj1.position.y; //TODO: study this swap

      //length squared (avoid sqrt usage)
      var length = vx * vx + vy * vy;
      
      if(obj1.type == "ship") {
        hitAngle = Math.atan2(vx, vy);
      }

      //length^2 <= (object radius)^2
      return ({happened: length <= Math.pow(obj1.radius + obj2.radius, 2), angle: hitAngle});
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
              <div key={"backgrounddiv"} >
                <Background key ={"Background"}></Background>
              </div>
              <div key={"minimapdiv"} >
                <Minimap key ={"Minimap"} {...this.state} Ship = {this.ship} Asteroids = {this.asteroids} Energy = {this.energy} ></Minimap>
              </div>

            </div>
            );
    }
}


