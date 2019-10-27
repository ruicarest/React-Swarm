import React, { Component } from 'react';
import Ship from './Ship';
import { Minimap } from './Minimap';
import Asteroid from './Asteroid';
import Pickable from './Pickable';
import Enemy from './Enemy';
import { maps } from './configs/maps.json';
import { randomNumBetweenExcluding, randomNumBetween } from './utils';
/* import { Background }from './Background'; */

const CFGS = {
  TILE_SIZE: 64,
};

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
  SPACE: 32,
  Q: 81
};

export class Swarm extends Component {
  constructor() {
    super();

    this.currentMap = 0;

    this.MAP = maps[this.currentMap];

    this.state = {
      context: null,
      keys: {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        space: 0,
        mine: 0
      },
      map: {
        width: CFGS.TILE_SIZE * this.MAP.width,
        height: CFGS.TILE_SIZE * this.MAP.height,
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      currentMap: this.currentMap,
      currentScore: 0,
      inGame: false,
      reload: false,
      asteroidCount: this.MAP.asteroids,
      energyCount: this.MAP.energy,
      EZTCount: this.MAP.EZT,
      currentLevelEnemies: this.MAP.enemies,
      currentStage: 0,
      minimapScale: 10,
      ship: {
        position: {
          x: 0,
          y: 0
        },
        velocity: {
          x: 0,
          y: 0
        },
        HP: 0
      }
    }

    this.bullets = [];
    this.enemyBullets = [];
    this.ship = [];
    this.asteroids = [];
    this.particles = [];
    this.energy = [];
    this.EZT = [];
    this.enemies = [];
  }

  handleResize(value, e) {
    this.setState({
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleKeys(value, e) {
    let keys = this.state.keys;
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;
    if (e.keyCode === KEY.Q) keys.mine = value;
    this.setState({
      keys: keys
    });
  }

  componentDidMount() {
    window.addEventListener('keyup', this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize', this.handleResize.bind(this, false));

    const context = this.refs.gameWindow.getContext('2d');
    this.setState({ context: context });

    this.startGame();
    requestAnimationFrame(() => { this.update() });
  }

  componentDidUpdate(){
  }

  startGame() {

    //first ship
    if(!this.ship[0]) {
      // Make ship
      let ship = new Ship({
        position: {
          x: this.state.screen.width / 2,
          y: this.state.screen.height / 2,
        },
        create: this.createObject.bind(this),
        onDie: this.gameOver.bind(this),
        updateShipState: this.updateShipState.bind(this),
        currentMap: this.state.currentMap
      });
      this.createObject(ship, 'ship');
    }
    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.state.asteroidCount);

    // Make energy
    this.energy = [];
    this.generateEnergy(this.state.energyCount);

    this.EZT = [];
    this.generateEZT(this.state.EZTCount);

    // Make enemies
    this.enemies = [];
    this.state.currentLevelEnemies.map( (enemyType, index) => 
      this.generateEnemies(enemyType, index)
    );

    this.setState({
      inGame: true,
      currentScore: 0,
      reload: false,
    });
  }

  gameOver() {
    this.setState({
      inGame: false,
    });
  }

  //load next map on maps array
  loadNextMap(next = -1) {

    //load next map
    if(next == -1) {
      if(this.currentMap + 1 == maps.length) {
        this.currentMap = 0;
      } else {
        this.currentMap ++;
      }
    }
    //load specific map
    else {
      this.currentMap = next;
    }

    this.MAP = maps[this.currentMap];

    this.setState({
      map: {
        width: CFGS.TILE_SIZE * this.MAP.width,
        height: CFGS.TILE_SIZE * this.MAP.height,
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      currentMap: this.currentMap,
      currentScore: 0,
      inGame: false,
      asteroidCount: this.MAP.asteroids,
      energyCount: this.MAP.energy,
      EZTCount: this.MAP.EZT,
      currentLevelEnemies: this.MAP.enemies,
      currentStage: 0,
      minimapScale: 10,
      reload: true,
    });

    this.startGame();
  }

  generateAsteroids(howMany) {
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

  generateEnergy(howMany) {
    for (let i = 0; i < howMany; i++) {
      let energy = new Pickable({
        size: 20,
        position: {
          x: randomNumBetweenExcluding(0, this.state.map.width, this.ship[0].position.x - 150, this.ship[0].position.x + 150),
          y: randomNumBetweenExcluding(0, this.state.map.height, this.ship[0].position.y - 150, this.ship[0].position.y + 150),
        },
        action: () => {
          this.ship[0].addEnergy(25);
        },
        color: '#901aeb'
      });
      this.createObject(energy, 'energy');
    }
  }

  generateEZT(howMany) {
    for (let i = 0; i < howMany; i++) {
      let EZT = new Pickable({
        size: 20,
        color: '#34deeb',
        position: {
          x: randomNumBetweenExcluding(0, this.state.map.width, this.ship[0].position.x - 150, this.ship[0].position.x + 150),
          y: randomNumBetweenExcluding(0, this.state.map.height, this.ship[0].position.y - 150, this.ship[0].position.y + 150),
        },
        action: () => {
          this.setState({
            currentScore: this.state.currentScore + 1,
          });
          ;
        }
      });
      this.createObject(EZT, 'EZT');
    }
  }

  generateEnemies(howMany, type) {
    for (let i = 0; i < howMany; i++) {
      let enemy = new Enemy({
        position: {
          x: randomNumBetweenExcluding(0, this.state.map.width, this.ship[0].position.x - 150, this.ship[0].position.x + 150),
          y: randomNumBetweenExcluding(0, this.state.map.height, this.ship[0].position.y - 150, this.ship[0].position.y + 150),
        },
        rotation: randomNumBetween(0, 360),
        create: this.createObject.bind(this),
        typeEnemy: type,
      });
      this.createObject(enemy, 'enemies');
    }
  }

  createObject(item, group) {
    this[group].push(item);
  }

  updateObjects(items, group) {
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      } else {
        items[index].render(this.state);
      }
      index++;
    }
  }

  //TODO: IMPROVE THIS
  updateShipState(newVelocity, newPosition, currentHP = 0) {
    this.setState({
      ship: {
        velocity: newVelocity,
        position: newPosition,
        HP: currentHP
      }
    });
  }

  addScore(points) {
    if (this.state.inGame) {
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
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.globalAlpha = 0.8;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    //TODO: only check colissions if in game
    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.bullets, this.enemies);
    this.checkCollisionsWith(this.enemyBullets, this.asteroids);
    this.checkCollisionsWith(this.enemyBullets, this.bullets);
    this.checkCollisionsWith(this.ship, this.asteroids);
    this.checkCollisionsWith(this.ship, this.energy);
    this.checkCollisionsWith(this.ship, this.enemyBullets);
    this.checkCollisionsWith(this.ship, this.EZT);

    // Remove or render
    this.updateObjects(this.ship, 'ship');
    this.updateObjects(this.bullets, 'bullets');
    this.updateObjects(this.enemyBullets, 'enemyBullets');
    this.updateObjects(this.particles, 'particles');
    this.updateObjects(this.energy, 'energy');
    this.updateObjects(this.EZT, 'EZT');
    this.updateObjects(this.enemies, 'enemies');
    this.updateObjects(this.asteroids, 'asteroids');

    //Win conditions
    if(this.state.inGame && this.state.currentScore == this.state.EZTCount) {
      if(this.asteroids.length == 0) {
        //load next level
        this.loadNextMap();
      }
      //remove current objects
      else {
        this.setState({
          reload: true,
        });
      }
    }

    context.restore();

    // Next frame
    requestAnimationFrame(() => { this.update() });
  }

  checkCollisionsWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for (a; a > -1; --a) {
      b = items2.length - 1;
      for (b; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];

        const collision = this.checkCollision(item1, item2);
        if (collision.happened) {
          item1.hit(item2.toughness, collision.angle);
          item2.hit(item1.toughness, collision.angle);
        }
      }
    }
  }

  checkCollision(obj1, obj2) {
    let hitAngle = 0;

    var vx = obj1.position.x - obj2.position.x;
    var vy = obj2.position.y - obj1.position.y; //TODO: study this swap

    //length squared (avoid sqrt usage)
    var length = vx * vx + vy * vy;

    if (obj1.type == "ship") {
      hitAngle = Math.atan2(vx, vy);
    }

    //length^2 <= (object radius)^2
    return ({ happened: length <= Math.pow(obj1.radius - 2 + obj2.radius - 2, 2), angle: hitAngle });
  }

  render() {
    let endgame;

    //get Ship HP
    const shipHP = this.state.inGame ? this.ship[0].HP : 0;
    const EZT = this.state.inGame ? this.state.currentScore : 0;
    const currentLevel = this.state.currentMap;

    if (!this.state.inGame) {
      endgame = ( 
        <span className="endgame">
          <p>Game over</p>
          {/* TODO: set css for this */}
          <button
            onClick={this.loadNextMap.bind(this, this.state.currentMap)}>
            Restart Level {currentLevel + 1}
          </button>
          <br></br>
          <button
            onClick={this.loadNextMap.bind(this, 0)}>
            New Game
          </button>
        </span>
      )
    }

    return (
      <div key={"app"}>
        <span className="UI">
          <span className="controls">
            Use [A][S][W][D] or [←][↑][↓][→] to MOVE <br />
            Use [SPACE] to SHOOT & [Q] to MINE <br />
            LEVEL {currentLevel + 1}
            </span>
          <span className="stats">
            {shipHP} HP <br />
            {EZT} EZT
            </span>
          {endgame}
        </span>

        <canvas className="gameWindow" ref="gameWindow"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />

{/*         <div key={"backgrounddiv"} >
            <Background key={"Background12345"}{...this.state}
            ></Background>
        </div> */}

        <div key={"minimapdiv"} >
          <Minimap key={"Minimap"} {...this.state}
            Ship={this.ship}
            Asteroids={this.asteroids}
            Energy={this.energy}
            Enemies={this.enemies}
            EZT={this.EZT}
          ></Minimap>
        </div>

      </div>
    );
  }
}


