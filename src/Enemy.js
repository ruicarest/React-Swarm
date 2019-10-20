import { rotatePoint, randomNumBetween } from './utils';
import Particle from './Particle';
import Bullet from './Bullet';
import {enemiesTypes} from './configs/enemiesTypes.json';

export default class Enemy {
  constructor(args) {

    this.stats = enemiesTypes[args.typeEnemy];

    this.position = args.position;
    this.velocity = {
      x: 0,
      y: 0
    }

    this.type = "enemy";
    this.rotation = args.rotation;

    this.rotationSpeed = this.stats.rotationSpeed;
    this.acceleration = 4;
    this.inertia = 0.99;
    this.radius = this.stats.radius;
    this.sight = this.stats.sight;
    //Timers
    this.T_lastShot = 0;
    this.T_lastHit = 0;

    this.create = args.create;

    this.gettingHit = false;
    this.toughness = this.stats.toughness;
    this.HP = this.stats.HP;
    this.color = this.stats.color;
  }

  destroy() {
    this.delete = true;

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: randomNumBetween(-this.radius / 4, this.radius / 4) + this.position.x,
          y: randomNumBetween(-this.radius / 4, this.radius / 4) + this.position.y
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
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
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }

  addEnergy(amount) {
    this.HP += amount;
  }

  render(state) {
    const shipPos = state.ship.position;

    //calc x and y distance to player ship
    let dx = this.position.x - shipPos.x;
    let dy = this.position.y - shipPos.y;

    //calc distance to ship
    const distance = Math.sqrt(dx * dx + dy * dy);

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

    //player ship on sight
    if (distance < this.sight && state.ship.HP > 0) {

      if (this.rotation > angle) {
        if (lookingAtAngle < (angle - this.rotation)) {
          this.rotate('RIGHT');
        }
        else {
          this.rotate('LEFT');
        }
      }
      else {
        if (lookingAtAngle < (angle - this.rotation)) {
          this.rotate('LEFT');
        }
        else {
          this.rotate('RIGHT');
        }
      }

      //TODO: fix enemy velocity
      this.velocity.x = - Math.sin(-this.rotation * Math.PI / 180) * this.acceleration;
      this.velocity.y = - Math.cos(-this.rotation * Math.PI / 180) * this.acceleration;

      //stop on certain range
      if (distance < 200) {
        this.velocity = { x: 0, y: 0 };
      }

      //shoot if ready && if looking at player
      if (Date.now() - this.T_lastShot > 1000 && 360 - lookingAtAngle < 10 ) {
        const bullet = new Bullet({
          ship: this,
          damage: 10,
          create: this.create.bind(this)
        });
        this.create(bullet, 'enemyBullets');
        this.T_lastShot = Date.now();
      }
    }
    else {
      //TODO: fix enemy velocity
      this.velocity.x = - Math.sin(-this.rotation * Math.PI / 180) * this.acceleration;
      this.velocity.y = - Math.cos(-this.rotation * Math.PI / 180) * this.acceleration;
    }

    // Move
    this.position.x += this.velocity.x - state.ship.velocity.x;
    this.position.y += this.velocity.y - state.ship.velocity.y;

    // Screen edges
    if (this.position.x > state.map.width + this.radius) {
      this.position.x = -this.radius;
    }
    else if (this.position.x < -this.radius) {
      this.position.x = state.map.width + this.radius;
    }
    if (this.position.y > state.map.height + this.radius) {
      this.position.y = -this.radius;
    }
    else if (this.position.y < -this.radius) {
      this.position.y = state.map.height + this.radius;
    }

    if (this.gettingHit && Date.now() - this.T_lastHit > 100) {
      this.gettingHit = false;
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.strokeStyle = this.color;
    context.fillStyle = '#000000';
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
      context.arc(0, 0, this.radius + 5, 0, 360);
      context.strokeStyle = '#fcad03';
      context.stroke();
    }
    context.restore();
  }
}