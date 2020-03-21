import ammoTypes from "../Configs/ammoTypes.json";
import { randomNumBetweenExcluding, randomNumBetween } from "../Utils/utils";
import Ship from "../GameObjects/Ship";
import Asteroid from "../GameObjects/Asteroid";
import Pickable from "../GameObjects/Pickable";
import Enemy from "../GameObjects/Enemy";

export default function SceneManager(that) {
  const _this = that;

  function init() {
    //first ship
    if (!_this.ship[0]) {
      // Make ship
      let ship = new Ship({
        position: {
          x: _this.props.screen.width / 2,
          y: _this.props.screen.height / 2
        },
        create: _this.createObject.bind(_this),
        onDie: _this.gameOver.bind(_this),
        updateShipState: _this.updateShipState.bind(_this),
        currentMap: _this.props.game.currentMap
      });
      _this.createObject(ship, "ship");
    }
    // Make asteroids
    _this.asteroids = [];
    generateAsteroids(_this.props.map.asteroids);

    // Make energy
    _this.energy = [];
    generateEnergy(_this.props.map.energy);

    // Make ammo packs
    generateAmmo(
      0, //TODO: include mines in ammoTypes
      3,
      _this.props.map.ammo[0], //mines
      "#537aed"
    );
    generateAmmo(
      ammoTypes.laser,
      20,
      _this.props.map.ammo[ammoTypes.laser],
      ammoTypes.types[ammoTypes.laser].color
    );
    generateAmmo(
      ammoTypes.doubled,
      10,
      _this.props.map.ammo[ammoTypes.doubled],
      ammoTypes.types[ammoTypes.doubled].color
    );

    _this.EZT = [];
    generateEZT(_this.props.map.ezt);

    // Make enemies
    _this.enemies = [];
    _this.props.map.enemies.map((enemyType, index) =>
      generateEnemies(enemyType, index)
    );
  }

  function generateAsteroids(howMany) {
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: Math.floor(randomNumBetween(30, 80)),
        position: {
          x: randomNumBetweenExcluding(
            0,
            _this.props.map.width,
            _this.ship[0].position.x - 150,
            _this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            _this.props.map.height,
            _this.ship[0].position.y - 150,
            _this.ship[0].position.y + 150
          )
        },
        create: _this.createObject.bind(_this),
        addScore: _this.addScore.bind(_this)
      });
      _this.createObject(asteroid, "asteroids");
    }
  }

  function generateAmmo(type, amount, howMany, ammoColor) {
    for (let i = 0; i < howMany; i++) {
      let ammo = new Pickable({
        size: 10,
        position: {
          x: randomNumBetweenExcluding(
            0,
            _this.props.map.width,
            _this.ship[0].position.x - 150,
            _this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            _this.props.map.height,
            _this.ship[0].position.y - 150,
            _this.ship[0].position.y + 150
          )
        },
        action: () => {
          _this.ship[0].addAmmo(type, amount);
        },
        color: ammoColor
      });
      _this.createObject(ammo, "energy");
    }
  }

  function generateEnergy(howMany) {
    for (let i = 0; i < howMany; i++) {
      let energy = new Pickable({
        size: 20,
        position: {
          x: randomNumBetweenExcluding(
            0,
            _this.props.map.width,
            _this.ship[0].position.x - 150,
            _this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            _this.props.map.height,
            _this.ship[0].position.y - 150,
            _this.ship[0].position.y + 150
          )
        },
        action: () => {
          _this.ship[0].addEnergy(25);
        },
        color: "#901aeb"
      });
      _this.createObject(energy, "energy");
    }
  }

  function generateEZT(howMany) {
    for (let i = 0; i < howMany; i++) {
      let EZT = new Pickable({
        size: 20,
        color: "#34deeb",
        position: {
          x: randomNumBetweenExcluding(
            0,
            _this.props.map.width,
            _this.ship[0].position.x - 150,
            _this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            _this.props.map.height,
            _this.ship[0].position.y - 150,
            _this.ship[0].position.y + 150
          )
        },
        action: () => {
          _this.props.updateGroup("game", {
            currentScore: _this.props.game.currentScore + 1
          });
        }
      });
      _this.createObject(EZT, "EZT");
    }
  }

  function generateEnemies(howMany, type) {
    for (let i = 0; i < howMany; i++) {
      let enemy = new Enemy({
        position: {
          x: randomNumBetweenExcluding(
            0,
            _this.props.map.width,
            _this.ship[0].position.x - 150,
            _this.ship[0].position.x + 150
          ),
          y: randomNumBetweenExcluding(
            0,
            _this.props.map.height,
            _this.ship[0].position.y - 150,
            _this.ship[0].position.y + 150
          )
        },
        rotation: randomNumBetween(0, 360),
        create: _this.createObject.bind(_this),
        typeEnemy: type
      });
      _this.createObject(enemy, "enemies");
    }
  }

  return {
    init: init
  };
}
