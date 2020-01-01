import { rotatePoint, randomNumBetween } from "../Utils/utils";
import Particle from "./Particle";
import bulletTypes from "../configs/bulletTypes.json";

export default class Bullet {
  constructor(args) {
    let { ship, bulletType, create, damage, isMainShip } = args;

    //general stats
    this.rotation = ship.rotation;
    this.create = create;
    this.isMainShip = isMainShip ? isMainShip : false;
    this.type = "bullet";
    this.visible = true;
    //bullet position in front of the ship
    let posDelta = rotatePoint(
      { x: 0, y: -20 },
      { x: 0, y: 0 },
      (this.rotation * Math.PI) / 180
    );
    //bullet position in space
    this.position = {
      x: ship.position.x + posDelta.x,
      y: ship.position.y + posDelta.y
    };
    //bullet velocity in space
    this.velocity = {
      x: posDelta.x * bulletTypes.types[bulletType].velocity,
      y: posDelta.y * bulletTypes.types[bulletType].velocity
    };
    //bullet type stats
    this.toughness = damage ? damage : bulletTypes.types[bulletType].toughness;
    this.color = bulletTypes.types[bulletType].color;
    this.radius = bulletTypes.types[bulletType].radio;
  }

  updatePosition(offset) {
    this.position.x += offset.x;
    this.position.y += offset.y;
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

  hit() {
    this.destroy();
  }

  render(state) {
    if (state.reload == true) {
      this.remove();
      return;
    }
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (!this.isMainShip) {
      this.position.x -= state.ship.velocity.x;
      this.position.y -= state.ship.velocity.y;
    }

    // check edges
    if (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x > state.screen.width ||
      this.position.y > state.screen.height
    ) {
      this.remove();
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.fillStyle = "#FFF";
    context.lineWidth = 0.5;
    context.beginPath();
    context.arc(0, 0, 2, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
