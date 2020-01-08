import React, { Component } from "react";
import Ship from "../../GameObjects/Ship";
import { Minimap } from "../Minimap/Minimap";
import Asteroid from "../../GameObjects/Asteroid";
import Pickable from "../../GameObjects/Pickable";
import Enemy from "../../GameObjects/Enemy";
import { maps } from "../../Configs/maps.json";
import { randomNumBetweenExcluding, randomNumBetween } from "../../Utils/utils";
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

//check if running on mobile browser
window.mobilecheck = function() {
  var check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

export class Swarm extends Component {
  constructor() {
    super();

    this.currentMap = 0;

    this.MAP = maps[this.currentMap];

    this.isMobileBrowser = window.mobilecheck();

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
      mouse: {
        active: true,
        position: {
          x: 0,
          y: 0
        }
      },
      joypad: {
        on: false,
        moving: false,
        basePosition: {
          x: -1,
          y: -1
        },
        stickPosition: {
          x: -1,
          y: -1
        },
        stickClickPosition: {
          x: -1,
          y: -1,
          on: false
        },
        angle: -1
      },
      map: {
        width: CFGS.TILE_SIZE * this.MAP.width,
        height: CFGS.TILE_SIZE * this.MAP.height
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight || 1
      },
      currentMap: this.currentMap,
      currentScore: 0,
      inGame: false,
      reload: false,
      asteroidCount: this.MAP.asteroids,
      energyCount: this.MAP.energy,
      EZTCount: this.MAP.EZT,
      currentLevelEnemies: this.MAP.enemies,
      bulletPacks: this.MAP.Bullets,
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
      },
      nearestEZT: {
        distance: 10000000,
        ang: 0
      }
    };

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
      x: this.refs.gameWindow.clientWidth / 2 - this.state.screen.width / 2,
      y: this.refs.gameWindow.clientHeight / 2 - this.state.screen.height / 2
    };

    this.updateObjectsPosition(offset);

    this.setState({
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

  handleJoystick(padAngle) {
    this.setState(prevState => ({
      joypad: {
        ...prevState.joypad,
        angle: padAngle
      }
    }));
  }

  findMouseMosition(e) {
    this.setState({
      mouse: {
        active: true,
        position: {
          x: e.clientX,
          y: e.clientY
        }
      }
    });
  }

  componentDidMount() {
    //handle key events
    window.addEventListener("keyup", this.handleKeys.bind(this, false));
    window.addEventListener("keydown", this.handleKeys.bind(this, true));
    window.addEventListener("resize", this.handleResize.bind(this, false));

    //handle touch events
    this.refs.gameWindow.addEventListener(
      "touchmove",
      function(e) {
        if (this.state.screen.width > e.touches[0].clientX * 2) {
          this.setState((prevState, props) => ({
            joypad: {
              ...prevState.joypad,
              moving: true,
              stickPosition: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
              }
            }
          }));
        }
      }.bind(this),
      false
    );
    this.refs.gameWindow.addEventListener(
      "touchstart",
      function(e) {
        const leftClick =
          this.state.screen.width >
          e.touches[e.changedTouches[0].identifier].clientX * 2;

        /*         const rightClick =
          this.state.screen.width <
          e.touches[e.changedTouches[0].identifier].clientX * 2; */

        //if (this.state.joypad.on != true) {
        if (leftClick) {
          this.setState((prevState, props) => ({
            joypad: {
              ...prevState.joypad,
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
          }));
        } else {
          this.setState((prevState, props) => ({
            joypad: {
              ...prevState.joypad,
              stickClickPosition: {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                on: true
              }
            }
          }));
        }
      }.bind(this),
      false
    );
    this.refs.gameWindow.addEventListener(
      "touchend",
      function(e) {
        const leftClick =
          this.state.screen.width > e.changedTouches[0].clientX * 2;

        /*         const rightClick =
          this.state.screen.width < e.changedTouches[0].clientX * 2; */

        if (leftClick) {
          this.setState((prevState, props) => ({
            joypad: {
              ...prevState.joypad,
              on: false,
              moving: false,
              basePosition: {
                x: 0,
                y: 0
              }
            }
          }));
        } else {
          this.setState((prevState, props) => ({
            joypad: {
              ...prevState.joypad,
              stickClickPosition: {
                x: 0,
                y: 0,
                on: false
              }
            }
          }));
        }
      }.bind(this),
      false
    );

    //handle mouse events
    this.refs.gameWindow.addEventListener(
      "mousemove",
      function(e) {
        this.setState({
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

    this.setState({ context: this.refs.gameWindow.getContext("2d") });

    this.startGame();

    requestAnimationFrame(() => {
      this.update();
    });
  }

  componentDidUpdate() {}

  startGame() {
    //first ship
    if (!this.ship[0]) {
      // Make ship
      let ship = new Ship({
        position: {
          x: this.state.screen.width / 2,
          y: this.state.screen.height / 2
        },
        create: this.createObject.bind(this),
        onDie: this.gameOver.bind(this),
        updateShipState: this.updateShipState.bind(this),
        currentMap: this.state.currentMap
      });
      this.createObject(ship, "ship");
    }
    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.state.asteroidCount);

    // Make energy
    this.energy = [];
    this.generateEnergy(this.state.energyCount);

    // Make bulletPacks
    this.generateBullets(
      0, //TODO: include mines in bulletTypes
      3,
      this.state.bulletPacks[0], //mines
      "#537aed"
    );
    this.generateBullets(
      bulletTypes.laser,
      20,
      this.state.bulletPacks[bulletTypes.laser],
      bulletTypes.types[bulletTypes.laser].color
    );
    this.generateBullets(
      bulletTypes.doubled,
      10,
      this.state.bulletPacks[bulletTypes.doubled],
      bulletTypes.types[bulletTypes.doubled].color
    );

    this.EZT = [];
    this.generateEZT(this.state.EZTCount);

    // Make enemies
    this.enemies = [];
    this.state.currentLevelEnemies.map((enemyType, index) =>
      this.generateEnemies(enemyType, index)
    );

    this.setState({
      inGame: true,
      currentScore: 0,
      reload: false
    });
  }

  gameOver() {
    this.setState({
      inGame: false
    });
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

    this.setState({
      map: {
        width: CFGS.TILE_SIZE * this.MAP.width,
        height: CFGS.TILE_SIZE * this.MAP.height
      },
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight || 1
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
      nearestEZT: {
        distance: 10000000,
        ang: 0
      }
    });

    this.startGame();
  }

  generateAsteroids(howMany) {
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: Math.floor(randomNumBetween(30, 80)),
        position: {
          x: randomNumBetweenExcluding(
            0,
            this.state.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.map.height,
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
            this.state.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.map.height,
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
            this.state.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.map.height,
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
            this.state.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.map.height,
            this.ship[0].position.y - 150,
            this.ship[0].position.y + 150
          )
        },
        action: () => {
          this.setState({
            currentScore: this.state.currentScore + 1
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
            this.state.map.width,
            this.ship[0].position.x - 150,
            this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            this.state.map.height,
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
        currentScore: this.state.currentScore + points
      });
    }
  }

  drawMouse() {
    const context = this.state.context;
    context.save();
    context.translate(this.state.mouse.position.x, this.state.mouse.position.y);
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
    const context = this.state.context;

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = "rgba(0,0,0,0.5)";
    context.globalAlpha = 1;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
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
    if (this.state.inGame && this.state.currentScore == this.state.EZTCount) {
      if (this.asteroids.length == 0) {
        //load next level
        this.loadNextMap();
      }
      //remove current objects
      else {
        this.setState({
          reload: true
        });
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
            this.setState({
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
        this.state.map.width - obj2.position.x + obj1.position.x
          ? -(obj2.position.x - obj1.position.x)
          : this.state.map.width - obj2.position.x + obj1.position.x;
    } else {
      var vx =
        obj1.position.x - obj2.position.x <
        this.state.map.width - obj1.position.x + obj2.position.x
          ? obj1.position.x - obj2.position.x
          : this.state.map.width - obj1.position.x + obj2.position.x;
    }
    //TODO: CHANGE THIS TO ANOTHER PLACE, complexity added it is only related to EZT compass
    if (obj1.position.y < obj2.position.y) {
      var vy =
        obj2.position.y - obj1.position.x <
        this.state.map.height - obj2.position.y + obj1.position.y
          ? obj2.position.y - obj1.position.y
          : -(this.state.map.height - obj2.position.y + obj1.position.y);
    } else {
      var vy =
        obj1.position.y - obj2.position.y <
        this.state.map.height - obj1.position.y + obj2.position.y
          ? -(obj1.position.y - obj2.position.y)
          : this.state.map.height - obj1.position.y + obj2.position.y;
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
    const shipHP = this.state.inGame ? this.ship[0].HP : 0;
    const shipMaxHP = this.state.inGame ? this.ship[0].maxHP : 1;
    const EZT = this.state.inGame ? this.state.currentScore : 0;
    const currentLevel = this.state.currentMap;

    if (!this.state.inGame) {
      endgame = (
        <span className="endgame">
          <p>Game over</p>
          {/* TODO: set css for this */}
          <button onClick={this.loadNextMap.bind(this, this.state.currentMap)}>
            Restart Level {currentLevel + 1}
          </button>
          <br></br>
          <button onClick={this.loadNextMap.bind(this, 0)}>New Game</button>
        </span>
      );
    }

    messageBox = <MessageBox key={"MessageBox"}></MessageBox>;

    if (!this.isMobileBrowser) {
      minimap = (
        <Minimap
          key={"Minimap"}
          {...this.state}
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
          {...this.state}
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
            {EZT}/{this.state.EZTCount} EZT
          </span>
          {endgame}
        </span>

        <div id={"messageboxdiv"}> {messageBox}</div>

        <canvas
          className="gameWindow"
          ref="gameWindow"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />

        {/*         <div key={"backgrounddiv"} >
            <Background key={"Background12345"}{...this.state}
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
