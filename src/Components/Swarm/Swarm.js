import React, { Component } from "react";

import { Minimap } from "../Minimap/Minimap";

import { maps } from "../../Configs/maps.json";
import { checkIfRunningOnMobileDevice } from "../../Utils/utils";
import { Background } from "../Background/Background";
import { VirtualJoystick } from "../VirtualJoyStick/VirtualJoystick";

import "./Swarm.css";
import MessageBox from "../MessageBox/MessageBox";
import InputManager from "../../Managers/InputManager";
import SceneManager from "../../Managers/SceneManager";

import _ from "lodash";

const CFGS = {
  TILE_SIZE: 64
};

export default class Swarm extends Component {
  constructor() {
    super();

    this.currentMap = 0;
    this.MAP = maps[this.currentMap];

    this.isMobileBrowser = checkIfRunningOnMobileDevice();

    this.InputManager = new InputManager(this);
    this.SceneManager = new SceneManager(this);
    this.bullets = [];
    this.enemyBullets = [];
    this.ship = [];
    this.asteroids = [];
    this.particles = [];
    this.energy = [];
    this.EZT = [];
    this.enemies = [];
  }

  componentDidMount() {
    this.InputManager.init();
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
    if (!this.props.game.inGame && this.props.game.ready) {
      this.startGame();
    }
  }

  startGame() {
    this.SceneManager.init();

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
        ammo: this.MAP.ammo,
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
        reload: false,
        currentMap: this.currentMap,
        ready: true
      },
      nearestEZT: {
        distance: 10000000,
        ang: 0
      }
    });
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
        item.render(this.props);
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

    if (this.props.game.reload == true) {
      this.loadNextMap();
    }

    //Win conditions
    if (this.props.game.inGame) {
      if (
        this.props.map.mission === "pick" &&
        this.props.game.currentScore === this.props.map.ezt
      ) {
        this.props.updateGroup("game", { reload: true });
      } else if (this.props.map.mission == "kill" && this.enemies.length == 0) {
        this.props.updateGroup("game", { reload: true });
      } else if (this.props.map.mission == "bonus") {
        this.props.updateGroup("game", { reload: true });
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
    const shipHP = this.props.game.inGame ? this.ship[0].HP : 0;
    const shipMaxHP = this.props.game.inGame ? this.ship[0].maxHP : 1;
    const EZT = this.props.game.inGame ? this.props.game.currentScore : 0;
    const currentLevel = this.props.game.currentMap;

    if (!this.props.game.inGame) {
      endgame = (
        <span className="endgame">
          <p>Game over</p>
          {/* TODO: set css for this */}
          <button
            onClick={this.loadNextMap.bind(this, this.props.game.currentMap)}
          >
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
          message={this.props.map.description}
          mission={this.props.map.mission}
        ></MessageBox>
      );
    }

    if (!this.isMobileBrowser) {
      if (this.props.game.ready) {
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
      }
      controls = (
        <span className="controls">
          Use [A][S][W][D] or [←][↑][↓][→] to MOVE <br />
          Use [SPACE] to SHOOT & [Q] to MINE <br />
          LEVEL {currentLevel + 1}
        </span>
      );
    } else if (this.isMobileBrowser) {
      joystick = (
        <VirtualJoystick
          key={"VirtualJoystick"}
          {...this.props}
          handleJoystick={padAngle =>
            this.InputManager.handleJoystick(padAngle)
          }
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
            {EZT}/{this.props.map.ezt} EZT
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
