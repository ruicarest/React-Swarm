import { rotatePoint, randomNumBetween } from "../Utils/utils";
import Particle from "./Particle";
import Bullet from "./Bullet";
import Mine from "./Mine";
import bulletTypes from "../Configs/bulletTypes.json";

export default class Ship {
  constructor(args) {
    let { onDie, create, updateShipState, currentMap, position } = args;

    this.position = position;
    this.velocity = {
      x: 0,
      y: 0
    };
    this.visible = true;

    this.type = "ship";
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 20;

    //Timers
    this.T_lastShot = 0;
    this.T_lastMineDrop = 0;
    this.T_lastHit = 0;

    this.create = create;
    this.onDie = onDie;
    this.updateShipState = updateShipState;

    this.maxHP = 100;

    this.gettingHit = false;
    this.hitAngle = 0;
    //Stats
    this.toughness = 10;
    this.HP = 100;
    this.currentBulletType = bulletTypes.normal;

    //map
    this.currentMap = currentMap;

    //mouse
    this.mouseLastPosition = {
      x: 0,
      y: 0
    };

    this.bullets = [3, 0, 0];
  }

  updatePosition(offset) {
    this.position.x += offset.x;
    this.position.y += offset.y;
  }

  destroy() {
    this.delete = true;
    this.onDie();

    //stop moving
    this.updateShipState({ x: 0, y: 0 }, { x: 0, y: 0 });

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

  hit(damage, angle) {
    if (damage == 0) {
      return 0;
    }
    this.hitAngle = angle;

    if (Date.now() - this.T_lastHit > 10) {
      this.HP -= damage;
      this.T_lastHit = Date.now();
      this.gettingHit = true;
    }
    if (this.HP <= 0) {
      this.HP = 0;
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
    if (this.HP > this.maxHP) this.HP = this.maxHP;
  }

  addBullets(type, amount) {
    this.bullets[type] += amount;
    this.currentBulletType =
      this.currentBulletType < type ? type : this.currentBulletType;
  }

  accelerate() {
    this.velocity.x -= Math.sin((-this.rotation * Math.PI) / 180) * this.speed;
    this.velocity.y -= Math.cos((-this.rotation * Math.PI) / 180) * this.speed;

    //engine particles
    let posDelta = rotatePoint(
      { x: 0, y: -10 },
      { x: 0, y: 0 },
      ((this.rotation - 180) * Math.PI) / 180
    );
    const particle = new Particle({
      lifeSpan: randomNumBetween(20, 40),
      size: randomNumBetween(1, 3),
      position: {
        x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
      },
      velocity: {
        x: posDelta.x / randomNumBetween(3, 5),
        y: posDelta.y / randomNumBetween(3, 5)
      }
    });
    this.create(particle, "particles");
  }

  resetStats() {
    this.velocity = {
      x: 0,
      y: 0
    };

    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.99;
    this.radius = 20;

    //Timers
    this.T_lastShot = 0;
    this.T_lastMineDrop = 0;
    this.T_lastHit = 0;

    this.gettingHit = false;
    this.hitAngle = 0;
    this.toughness = 10;
    this.HP = 100;

    this.updateShipState({ x: 0, y: 0 }, { x: 0, y: 0 });
  }

  render(state) {
    if (state.currentMap != this.currentMap) {
      this.resetStats();
      this.currentMap = state.currentMap;
    }
    if (state.inGame == false) {
      this.resetStats();
      return;
    }

    //get current time
    const timeNow = Date.now();

    //Controls using KEYBOARD
    if (state.keys.up) {
      this.accelerate();
    }
    if (state.keys.left) {
      this.rotate("LEFT");
    }
    if (state.keys.right) {
      this.rotate("RIGHT");
    }
    //Controls using MOUSE
    if (
      this.mouseLastPosition.x != state.mouse.position.x ||
      this.mouseLastPosition.y != state.mouse.position.y
    ) {
      const vx = state.mouse.position.x - this.position.x;
      const vy = this.position.y - state.mouse.position.y;
      const lookAtMouseAngle = (Math.atan2(vx, vy) * 180) / Math.PI;
      this.rotation = lookAtMouseAngle;

      this.mouseLastPosition.x = state.mouse.position.x;
      this.mouseLastPosition.y = state.mouse.position.y;
    }
    //Controls using JOYPAD
    if (state.joypad.on && state.joypad.moving) {
      this.rotation = state.joypad.angle;
      this.accelerate();
    }

    //Drop mine
    if (state.keys.mine && timeNow - this.T_lastMineDrop > 500) {
      if (this.bullets[0] > 0) {
        const mine = new Mine({
          position: this.position,
          velocity: this.velocity,
          create: this.create.bind(this),
          size: 10,
          damage: 200
        });
        this.create(mine, "bullets");
        this.bullets[0]--;
        this.T_lastMineDrop = timeNow;
      }
    }
    //Shoot
    if (
      (state.keys.space || state.joypad.stickClickPosition.on) &&
      timeNow - this.T_lastShot > 300
    ) {
      //check bullets availability (skip position 0 - reserved for mines)
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        if (i > 0 && this.bullets[i] > 0) {
          this.currentBulletType = i;
          this.bullets[i]--;
          break;
        } else if (i == 0) {
          this.currentBulletType = bulletTypes.normal;
        } else {
          this.currentBulletType =
            this.currentBulletType > 0 ? this.currentBulletType-- : 0;
        }
      }
      const bullet = new Bullet({
        ship: this,
        bulletType: this.currentBulletType,
        create: this.create.bind(this),
        isMainShip: true
      });
      this.create(bullet, "bullets");
      this.T_lastShot = timeNow;
    }

    this.updateShipState(this.velocity, this.position, this.HP);

    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Rotation
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    if (this.gettingHit && timeNow - this.T_lastHit > 100) {
      this.gettingHit = false;
      this.hitAngle = 0;
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.strokeStyle = "#ffffff";
    context.fillStyle = "#000000";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -15);
    context.lineTo(10, 10);
    context.lineTo(5, 7);
    context.lineTo(-5, 7);
    context.lineTo(-10, 10);
    context.closePath();
    context.fill();
    context.stroke();

    //draw Energy Shield
    if (this.gettingHit) {
      context.beginPath();
      //TODO: change shield size with distance
      context.arc(
        0,
        0,
        50,
        this.hitAngle - (this.rotation * Math.PI) / 180,
        Math.PI + this.hitAngle - (this.rotation * Math.PI) / 180
      );
      context.strokeStyle = "#901aeb";
      context.stroke();
    }

    //draw EZT Indicator
    context.beginPath();
    context.arc(
      0,
      0,
      55,
      Math.PI * 0.45 + state.nearestEZT.ang - (this.rotation * Math.PI) / 180,
      Math.PI -
        Math.PI * 0.45 +
        state.nearestEZT.ang -
        (this.rotation * Math.PI) / 180
    );
    context.strokeStyle = "#34deeb";
    context.stroke();

    context.restore();
  }
}
