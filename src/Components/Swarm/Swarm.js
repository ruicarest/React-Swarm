import React, { Component } from "react";
import Ship from "../../GameObjects/Ship";
import { Minimap } from "../Minimap/Minimap";
import Asteroid from "../../GameObjects/Asteroid";
import Pickable from "../../GameObjects/Pickable";
import Enemy from "../../GameObjects/Enemy";
import { maps } from "../../Configs/maps.json";
import {
  randomNumBetweenExcluding,
  randomNumBetween,
  checkIfRunningOnMobileDevice
} from "../../Utils/utils";
import { Background } from "../Background/Background";
import { VirtualJoystick } from "../VirtualJoyStick/VirtualJoystick";
import bulletTypes from "../../Configs/bulletTypes.json";
import "./Swarm.css";
import MessageBox from "../MessageBox/MessageBox";

const CFGS = {
  TILE_SIZE: 64
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

export default class Swarm extends Component {
  constructor() {
    super();

    this.currentMap = 0;

    this.MAP = maps[this.currentMap];

    this.isMobileBrowser = checkIfRunningOnMobileDevice();

    this.bullets = [];
    this.enemyBullets = [];
    this.ship = [];
    this.asteroids = [];
    this.particles = [];
    this.energy = [];
    this.EZT = [];
    this.enemies = [];

    this.handleJoystick = this.handleJoystick.bind(this);
  }

  handleResize(value, e) {
    let offset = {
      x: this.refs.gameWindow.clientWidth / 2 - this.props.screen.width / 2,
      y: this.refs.gameWindow.clientHeight / 2 - this.props.screen.height / 2
    };

    this.updateObjectsPosition(offset);

    this.props.updateState({
      screen: {
        width: this.refs.gameWindow.clientWidth,
        height: this.refs.gameWindow.clientHeight,
        ratio:
          this.refs.gameWindow.clientWidth /
            this.refs.gameWindow.clientHeight || 1
      }
    });
  }

  handleKeys(value, e) {
    let keys = this.props.keys;
    if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
    if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
    if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
    if (e.keyCode === KEY.SPACE) keys.space = value;
    if (e.keyCode === KEY.Q) keys.mine = value;

    this.props.updateState({ keys: keys });
  }

  handleJoystick(padAngle) {
    this.props.updateState({
      joypad: {
        ...this.props.joypad,
        angle: padAngle
      }
    });
  }

  componentDidMount() {
    //handle window resize
    window.addEventListener("resize", this.handleResize.bind(this, false));

    if (!this.isMobileBrowser) {
      //handle key events
      window.addEventListener("keyup", this.handleKeys.bind(this, false));
      window.addEventListener("keydown", this.handleKeys.bind(this, true));

      //handle mouse events
      this.refs.gameWindow.addEventListener(
        "mousemove",
        function(e) {
          this.props.updateState({
            mouse: {
              active: true,
              position: {
                x: e.clientX,
                y: e.clientY
              }
            }
          });
        }.bind(this),
        false
      );
    } else {
      //handle touch events
      this.refs.gameWindow.addEventListener(
        "touchmove",
        function(e) {
          if (this.props.screen.width > e.touches[0].clientX * 2) {
            this.props.updateState({
              joypad: {
                ...this.props.joypad,
                moving: true,
                stickPosition: {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY
                }
              }
            });
          }
        }.bind(this),
        false
      );
      this.refs.gameWindow.addEventListener(
        "touchstart",
        function(e) {
          const leftClick =
            this.props.screen.width >
            e.touches[e.changedTouches[0].identifier].clientX * 2;

          if (leftClick) {
            this.props.updateState({
              joypad: {
                ...this.props.joypad,
                on: true,
                basePosition: {
                  x: e.touches[e.changedTouches[0].identifier].clientX,
                  y: e.touches[e.changedTouches[0].identifier].clientY
                },
                stickPosition: {
                  x: e.touches[e.changedTouches[0].identifier].clientX,
                  y: e.touches[e.changedTouches[0].identifier].clientY
                }
              }
            });
          } else {
            this.props.updateState({
              joypad: {
                ...this.props.joypad,
                stickClickPosition: {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                  on: true
                }
              }
            });
          }
        }.bind(this),
        false
      );
      this.refs.gameWindow.addEventListener(
        "touchend",
        function(e) {
          const leftClick =
            this.props.screen.width > e.changedTouches[0].clientX * 2;

          /*         const rightClick =
          this.props.screen.width < e.changedTouches[0].clientX * 2; */

          if (leftClick) {
            this.props.updateState({
              joypad: {
                ...this.props.joypad,
                on: false,
                moving: false,
                basePosition: {
                  x: 0,
                  y: 0
                }
              }
            });
          } else {
            this.props.updateState({
              joypad: {
                ...this.props.joypad,
                stickClickPosition: {
                  x: 0,
                  y: 0,
                  on: false
                }
              }
            });
          }
        }.bind(this),
        false
      );
    }

    this.props.updateGroup("game", {
      context: this.refs.gameWindow.getContext("2d")
    });

    //load first map
    this.loadNextMap(0);

    requestAnimationFrame(() => {
      this.update();
    });
  }

  componentDidUpdate() {
    console.log("updated!");
    if (!this.props.game.inGame && this.props.game.ready) {
      console.log("start game");
      this.startGame();
    }
  }

  startGame() {
    //first ship
    if (!this.ship[0]) {
      // Make ship
      console.log(this.props.screen);
      let ship = new Ship({
        position: {
          x: this.props.screen.width / 2,
          y: this.props.screen.height / 2
        },
        create: this.createObject.bind(this),
        onDie: this.gameOver.bind(this),
        updateShipState: this.updateShipState.bind(this),
        currentMap: this.props.game.currentMap
      });
      this.createObject(ship, "ship");
    }
    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.props.asteroidCount);

    // Make energy
    this.energy = [];
    this.generateEnergy(this.props.energyCount);

    // Make bulletPacks
    this.generateBullets(
      0, //TODO: include mines in bulletTypes
      3,
      this.props.map.bullets[0], //mines
      "#537aed"
    );
    this.generateBullets(
      bulletTypes.laser,
      20,
      this.props.map.bullets[bulletTypes.laser],
      bulletTypes.types[bulletTypes.laser].color
    );
    this.generateBullets(
      bulletTypes.doubled,
      10,
      this.props.map.bullets[bulletTypes.doubled],
      bulletTypes.types[bulletTypes.doubled].color
    );

    this.EZT = [];
    this.generateEZT(this.props.EZTCount);

    // Make enemies
    this.enemies = [];
    this.props.map.enemies.map((enemyType, index) =>
      this.generateEnemies(enemyType, index)
    );

    this.props.updateGroup("game", {
      inGame: true,
      currentScore: 0,
      reload: false
    });
  }

  gameOver() {
    this.props.updateGroup("game", { inGame: false, ready: false });
  }

  //load next map on maps array
  loadNextMap(next = -1) {
    //load next map
    if (next == -1) {
      if (this.currentMap + 1 == maps.length) {
        this.currentMap = 0;
      } else {
        this.currentMap++;
      }
    }
    //load specific map
    else {
      this.currentMap = next;
    }

    this.MAP = maps[this.currentMap];

    this.props.updateState({
      map: {
        width: CFGS.TILE_SIZE * this.MAP.width,
        height: CFGS.TILE_SIZE * this.MAP.height,
        asteroids: this.MAP.asteroids,
        energy: this.MAP.energy,
        ezt: this.MAP.ezt,
        mission: this.MAP.mission,
        description: this.MAP.description,
        enemies: this.MAP.enemies,
        bullets: 0,
        minimapScale: 10
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight || 1
      },
      game: {
        currentScore: 0,
        inGame: false,
        reload: true,
        currentMap: this.currentMap,
        ready: true
      },
      nearestEZT: {
        distance: 10000000,
        ang: 0
      }
    });
  }

  generateAsteroids(howMany) {
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: Math.floor(randomNumBetween(30, 80)),
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.props.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.props.map.height,
            this.ship[0].position.y - 150,
            this.ship[0].position.y + 150
          )
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this)
      });
      this.createObject(asteroid, "asteroids");
    }
  }

  generateBullets(type, amount, howMany, bulletColor) {
    for (let i = 0; i < howMany; i++) {
      let energy = new Pickable({
        size: 10,
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.props.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.props.map.height,
            this.ship[0].position.y - 150,
            this.ship[0].position.y + 150
          )
        },
        action: () => {
          this.ship[0].addBullets(type, amount);
        },
        color: bulletColor
      });
      this.createObject(energy, "energy");
    }
  }

  generateEnergy(howMany) {
    for (let i = 0; i < howMany; i++) {
      let energy = new Pickable({
        size: 20,
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.props.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.props.map.height,
            this.ship[0].position.y - 150,
            this.ship[0].position.y + 150
          )
        },
        action: () => {
          this.ship[0].addEnergy(25);
        },
        color: "#901aeb"
      });
      this.createObject(energy, "energy");
    }
  }

  generateEZT(howMany) {
    for (let i = 0; i < howMany; i++) {
      let EZT = new Pickable({
        size: 20,
        color: "#34deeb",
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.props.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.props.map.height,
            this.ship[0].position.y - 150,
            this.ship[0].position.y + 150
          )
        },
        action: () => {
          this.props.updateGroup("game", {
            currentScore: this.props.currentScore + 1
          });
        }
      });
      this.createObject(EZT, "EZT");
    }
  }

  generateEnemies(howMany, type) {
    for (let i = 0; i < howMany; i++) {
      let enemy = new Enemy({
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.props.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.props.map.height,
            this.ship[0].position.y - 150,
            this.ship[0].position.y + 150
          )
        },
        rotation: randomNumBetween(0, 360),
        create: this.createObject.bind(this),
        typeEnemy: type
      });
      this.createObject(enemy, "enemies");
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
        items[index].render(this.props);
      }
      index++;
    }
  }

  //TODO: IMPROVE THIS BEING CALLED EVERYFRAME
  updateShipState(newVelocity, newPosition, currentHP = 0) {
    this.props.updateGroup("ship", {
      velocity: newVelocity,
      position: newPosition,
      HP: currentHP
    });
  }

  addScore(points) {
    if (this.props.inGame) {
      this.props.updateGroup("game", {
        currentScore: this.props.currentScore + points
      });
    }
  }

  drawMouse() {
    const context = this.props.game.context;
    context.save();
    context.translate(this.props.mouse.position.x, this.props.mouse.position.y);
    context.beginPath();
    context.arc(0, 0, 2, 0, 360);
    context.strokeStyle = "#fcad03";
    context.stroke();
    context.restore();
  }

  updateObjectsPosition(offset) {
    this.updateObjectPosition(this.ship, offset);
    this.updateObjectPosition(this.bullets, offset);
    this.updateObjectPosition(this.enemyBullets, offset);
    this.updateObjectPosition(this.particles, offset);
    this.updateObjectPosition(this.energy, offset);
    this.updateObjectPosition(this.EZT, offset);
    this.updateObjectPosition(this.enemies, offset);
    this.updateObjectPosition(this.asteroids, offset);
  }

  updateObjectPosition(items, offset) {
    let index = 0;
    for (let item of items) {
      items[index].updatePosition(offset);
      index++;
    }
  }

  update() {
    const context = this.props.game.context;

    if (!context) {
      console.log("no context");
      return;
    }

    context.save();
    context.scale(this.props.screen.ratio, this.props.screen.ratio);

    // Motion trail
    context.fillStyle = "rgba(0,0,0,0.5)";
    context.globalAlpha = 1;
    context.fillRect(0, 0, this.props.screen.width, this.props.screen.height);
    context.globalAlpha = 0.8;

    this.drawMouse();

    //TODO: only check colissions if in game
    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.bullets, this.enemies);
    this.checkCollisionsWith(this.enemyBullets, this.asteroids);
    this.checkCollisionsWith(this.enemyBullets, this.bullets);
    this.checkCollisionsWith(this.ship, this.asteroids);
    this.checkCollisionsWith(this.ship, this.energy);
    this.checkCollisionsWith(this.ship, this.enemyBullets);
    this.checkCollisionsWithEZT(this.ship, this.EZT);

    // Remove or render
    this.updateObjects(this.ship, "ship");
    this.updateObjects(this.bullets, "bullets");
    this.updateObjects(this.enemyBullets, "enemyBullets");
    this.updateObjects(this.particles, "particles");
    this.updateObjects(this.energy, "energy");
    this.updateObjects(this.EZT, "EZT");
    this.updateObjects(this.enemies, "enemies");
    this.updateObjects(this.asteroids, "asteroids");

    //Win conditions
    if (this.props.inGame) {
      if (
        this.props.mission == "pick" &&
        this.props.currentScore == this.props.EZTCount
      ) {
        // if (this.asteroids.length == 0) {
        //   console.log("load next map!");
        //   //load next level

        // }
        //remove current objects
        this.props.updateGroup("game", { reload: true });
        this.loadNextMap();
      } else if (this.props.mission == "kill" && this.enemies.length == 0) {
        this.props.updateGroup("game", { reload: true });
        this.loadNextMap();
      } else if (this.props.mission == "bonus") {
        this.props.updateGroup("game", { reload: true });
        this.loadNextMap();
      }
    }

    context.restore();

    // Next frame
    requestAnimationFrame(() => {
      this.update();
    });
  }

  checkCollisionsWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for (a; a > -1; --a) {
      b = items2.length - 1;
      for (b; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];

        if (item1.visible == false || item2.visible == false) {
          continue;
        }

        const collision = this.checkCollision(item1, item2);
        if (collision.happened) {
          item1.hit(item2.toughness, collision.angle);
          item2.hit(item1.toughness, collision.angle);
        }
      }
    }
  }

  //SHIP and EZT
  checkCollisionsWithEZT(items1, items2) {
    var a = items1.length - 1;
    var b;
    var minDistance = 10000000;
    for (a; a > -1; --a) {
      b = items2.length - 1;
      for (b; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];

        const collision = this.checkCollision(item1, item2);
        if (collision.happened) {
          item1.hit(item2.toughness, collision.angle);
          item2.hit(item1.toughness, collision.angle);
        } else {
          if (minDistance > collision.distance) {
            this.props.updateState({
              nearestEZT: {
                distance: collision.distance,
                ang: collision.angle
              }
            });
            //udpate min distance
            minDistance = collision.distance;
          }
        }
      }
    }
  }

  checkCollision(obj1, obj2) {
    let hitAngle = 0;

    //TODO: CHANGE THIS TO ANOTHER PLACE, complexity added it is only related to EZT compass
    if (obj1.position.x < obj2.position.x) {
      var vx =
        obj2.position.x - obj1.position.x <
        this.props.map.width - obj2.position.x + obj1.position.x
          ? -(obj2.position.x - obj1.position.x)
          : this.props.map.width - obj2.position.x + obj1.position.x;
    } else {
      var vx =
        obj1.position.x - obj2.position.x <
        this.props.map.width - obj1.position.x + obj2.position.x
          ? obj1.position.x - obj2.position.x
          : this.props.map.width - obj1.position.x + obj2.position.x;
    }
    //TODO: CHANGE THIS TO ANOTHER PLACE, complexity added it is only related to EZT compass
    if (obj1.position.y < obj2.position.y) {
      var vy =
        obj2.position.y - obj1.position.x <
        this.props.map.height - obj2.position.y + obj1.position.y
          ? obj2.position.y - obj1.position.y
          : -(this.props.map.height - obj2.position.y + obj1.position.y);
    } else {
      var vy =
        obj1.position.y - obj2.position.y <
        this.props.map.height - obj1.position.y + obj2.position.y
          ? -(obj1.position.y - obj2.position.y)
          : this.props.map.height - obj1.position.y + obj2.position.y;
    }

    //TODO: GET THIS BACK, older version not considering EZT compass
    //var vx = obj1.position.x - obj2.position.x;
    //var vy = obj2.position.y - obj1.position.y; //TODO: study this swap

    //length squared (avoid sqrt usage)
    var length = vx * vx + vy * vy;

    if (obj1.type == "ship") {
      hitAngle = Math.atan2(vx, vy);
    }

    //length^2 <= (object radius)^2
    return {
      happened: length <= Math.pow(obj1.radius - 2 + obj2.radius - 2, 2),
      angle: hitAngle,
      distance: length
    };
  }

  render() {
    let endgame, minimap, joystick, controls, messageBox;

    //get Ship HP
    const shipHP = this.props.inGame ? this.ship[0].HP : 0;
    const shipMaxHP = this.props.inGame ? this.ship[0].maxHP : 1;
    const EZT = this.props.inGame ? this.props.currentScore : 0;
    const currentLevel = this.props.currentMap;

    if (!this.props.inGame) {
      endgame = (
        <span className="endgame">
          <p>Game over</p>
          {/* TODO: set css for this */}
          <button onClick={this.loadNextMap.bind(this, this.props.currentMap)}>
            Restart Level {currentLevel + 1}
          </button>
          <br></br>
          <button onClick={this.loadNextMap.bind(this, 0)}>New Game</button>
        </span>
      );
    } else {
      messageBox = (
        <MessageBox
          key={"MessageBox"}
          message={this.props.missionDescription}
          {...this.props}
        ></MessageBox>
      );
    }

    if (!this.isMobileBrowser && this.props.game.ready) {
      minimap = (
        <Minimap
          key={"Minimap"}
          {...this.props}
          Ship={this.ship}
          Asteroids={this.asteroids}
          Energy={this.energy}
          Enemies={this.enemies}
          EZT={this.EZT}
        ></Minimap>
      );

      controls = (
        <span className="controls">
          Use [A][S][W][D] or [←][↑][↓][→] to MOVE <br />
          Use [SPACE] to SHOOT & [Q] to MINE <br />
          LEVEL {currentLevel + 1}
        </span>
      );
    } else {
      joystick = (
        <VirtualJoystick
          key={"VirtualJoystick"}
          {...this.props}
          handleJoystick={state => this.handleJoystick(state)}
        ></VirtualJoystick>
      );

      controls = (
        <span className="controls">
          Left thumb to move & right to shoot <br />
          LEVEL {currentLevel + 1}
        </span>
      );
    }

    return (
      <div className="app">
        <span className="UI">
          {controls}
          <span className="stats">
            {EZT}/{this.props.EZTCount} EZT
          </span>
          {endgame}
        </span>

        <div id={"messageboxdiv"}> {messageBox}</div>

        <canvas
          className="gameWindow"
          ref="gameWindow"
          width={this.props.screen.width * this.props.screen.ratio}
          height={this.props.screen.height * this.props.screen.ratio}
        />

        {/*         <div key={"backgrounddiv"} >
            <Background key={"Background12345"}{...this.props}
            ></Background>
        </div> */}

        <div key={"minimapdiv"}>{minimap}</div>
        <div
          id="hpBar"
          style={{ width: (shipHP / shipMaxHP) * 100 + "%" }}
        ></div>
        <div key={"virtualjoystickdiv"}>{joystick}</div>
      </div>
    );
  }
}
