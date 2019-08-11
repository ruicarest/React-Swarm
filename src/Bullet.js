import { rotatePoint, randomNumBetween } from './utils';
import Particle from './Particle';

export default class Bullet {
  constructor(args) {
    let posDelta = rotatePoint(
      { x: 0, y: -20 },
      { x: 0, y: 0 },
      args.ship.rotation * Math.PI / 180
    );
    this.position = {
      x: args.ship.position.x + posDelta.x,
      y: args.ship.position.y + posDelta.y
    };
    this.rotation = args.ship.rotation;
    this.velocity = {
      x: posDelta.x / 4,
      y: posDelta.y / 4
    };

    this.create = args.create;
    this.radius = 1;

    this.type = "bullet";
    this.isMainShip = args.isMainShip;
    this.toughness = args.damage;
  }

  //leaving map borders
  remove() {
    this.delete = true;
  }

  //onCollision
  destroy() {
    this.delete = true;

    // Explode
    for (let i = 0; i < 10; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(20, 50),
        size: randomNumBetween(0.5, 1),
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

  hit() {
    this.destroy();
  };

  render(state) {

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (!this.isMainShip) {
      this.position.x -= state.ship.velocity.x;
      this.position.y -= state.ship.velocity.y;
    }

    // check edges
    if (this.position.x < 0
      || this.position.y < 0
      || this.position.x > state.screen.width
      || this.position.y > state.screen.height) {
      this.remove();
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.fillStyle = '#FFF';
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(0, 0, 2, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
