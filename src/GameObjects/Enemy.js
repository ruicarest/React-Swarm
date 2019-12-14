import { rotatePoint, randomNumBetween } from "../utils";
import { drawMiniShip, drawBigShip, drawMediumShip } from "../enemiesDrawUtils";
import Particle from "./Particle";
import Bullet from "./Bullet";
import { enemiesTypes } from "../configs/enemiesTypes.json";

export default class Enemy {
  constructor(args) {
    this.stats = enemiesTypes[args.typeEnemy];

    this.position = args.position;
    this.velocity = {
      x: 0,
      y: 0
    };

    this.type = "enemy";
    this.rotation = args.rotation;

    this.rotationSpeed = this.stats.rotationSpeed;
    this.acceleration = this.stats.acceleration;
    this.inertia = 0.99;
    this.radius = this.stats.radius;
    this.sight = this.stats.sight;
    //Timers
    this.T_lastShot = 0;
    this.T_lastHit = 0;
    this.damage = this.stats.damage;
    this.create = args.create;

    this.visible = true;

    this.gettingHit = false;
    this.toughness = this.stats.toughness;
    this.HP = this.stats.HP;
    this.color = this.stats.color;

    if (this.stats.type == 1) {
      this.draw = drawMiniShip.bind(this);
    } else if (this.stats.type == 2) {
      this.draw = drawMediumShip.bind(this);
    } else if (this.stats.type == 3) {
      this.draw = drawBigShip.bind(this);
    }
  }

  remove() {
    this.delete = true;
  }

  destroy() {
    this.delete = true;

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x:
            randomNumBetween(-this.radius / 4, this.radius / 4) +
            this.position.x,
          y:
            randomNumBetween(-this.radius / 4, this.radius / 4) +
            this.position.y
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, "particles");
    }
  }

  hit(damage) {
    if (Date.now() - this.T_lastHit > 100) {
      this.HP -= damage;
      this.T_lastHit = Date.now();
      this.gettingHit = true;
    }
    if (this.HP <= 0) {
      this.destroy();
    }
  }

  rotate(dir) {
    if (dir == "LEFT") {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == "RIGHT") {
      this.rotation += this.rotationSpeed;
    }
  }

  addEnergy(amount) {
    this.HP += amount;
  }

  render(state) {
    if (state.reload == true) {
      this.remove();
      return;
    }

    const shipPos = state.ship.position;

    //calc x and y distance to player ship
    let dx = this.position.x - shipPos.x;
    let dy = this.position.y - shipPos.y;

    //calc distance to ship
    const distance = Math.sqrt(dx * dx + dy * dy);

    //player ship on sight
    if (distance < this.sight && state.ship.HP > 0) {
      //angle to player ship
      let angle = Math.floor(Math.atan2(dy, dx) * (180 / Math.PI) - 90);

      //handle angle limits
      if (angle < 0) {
        angle = 360 + angle;
      }
      if (this.rotation >= 360) {
        this.rotation -= 360;
      }
      if (this.rotation < 0) {
        this.rotation += 360;
      }

      //if around 360 then is looking at player
      let lookingAtAngle = 360 - Math.abs(this.rotation - angle);

      if (this.rotation > angle) {
        if (lookingAtAngle < angle - this.rotation) {
          this.rotate("RIGHT");
        } else {
          this.rotate("LEFT");
        }
      } else {
        if (lookingAtAngle < angle - this.rotation) {
          this.rotate("LEFT");
        } else {
          this.rotate("RIGHT");
        }
      }

      //TODO: fix enemy velocity
      this.velocity.x =
        -Math.sin((-this.rotation * Math.PI) / 180) * this.acceleration;
      this.velocity.y =
        -Math.cos((-this.rotation * Math.PI) / 180) * this.acceleration;

      //stop on certain range
      if (distance < 200) {
        this.velocity = { x: 0, y: 0 };
      }

      //shoot if ready && if looking at player
      if (Date.now() - this.T_lastShot > 1000 && 360 - lookingAtAngle < 10) {
        const bullet = new Bullet({
          ship: this,
          damage: this.damage,
          create: this.create.bind(this)
        });
        this.create(bullet, "enemyBullets");
        this.T_lastShot = Date.now();
      }
    } else {
      //TODO: fix enemy velocity
      this.velocity.x =
        -Math.sin((-this.rotation * Math.PI) / 180) * this.acceleration;
      this.velocity.y =
        -Math.cos((-this.rotation * Math.PI) / 180) * this.acceleration;
    }

    // Move
    this.position.x += this.velocity.x - state.ship.velocity.x;
    this.position.y += this.velocity.y - state.ship.velocity.y;

    // Screen edges
    if (this.position.x > state.map.width + this.radius) {
      this.position.x = -this.radius;
    } else if (this.position.x < -this.radius) {
      this.position.x = state.map.width + this.radius;
    }
    if (this.position.y > state.map.height + this.radius) {
      this.position.y = -this.radius;
    } else if (this.position.y < -this.radius) {
      this.position.y = state.map.height + this.radius;
    }

    if (
      this.position.x < 0 ||
      this.position.x > state.screen.width ||
      this.position.y < 0 ||
      this.position.y > state.screen.height
    ) {
      this.visible = false;
    } else {
      this.visible = true;
    }

    if (this.gettingHit && Date.now() - this.T_lastHit > 100) {
      this.gettingHit = false;
    }

    // Draw
    this.draw(state);
  }
}
