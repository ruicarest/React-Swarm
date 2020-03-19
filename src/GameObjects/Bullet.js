import { rotatePoint, randomNumBetween } from "../Utils/utils";
import Particle from "./Particle";
import ammoTypes from "../Configs/ammoTypes.json";
import * as bulletDrawUtils from "../Utils/bulletDrawUtils.js";

export default class Bullet {
  constructor(args) {
    let { ship, bulletType, create, damage, isMainShip } = args;

    //general stats
    this.rotation = ship.rotation;
    this.create = create;
    this.isMainShip = isMainShip ? isMainShip : false;
    this.type = "bullet";
    this.visible = true;
    this.delete = false;
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
      x: posDelta.x * ammoTypes.types[bulletType].velocity,
      y: posDelta.y * ammoTypes.types[bulletType].velocity
    };
    //bullet type stats
    this.toughness = damage ? damage : ammoTypes.types[bulletType].toughness;
    this.color = ammoTypes.types[bulletType].color;
    this.radius = ammoTypes.types[bulletType].radio;
    this.bulletType = bulletType;

    if (this.bulletType == ammoTypes.doubled) {
      this.drawBullet = bulletDrawUtils.drawDoubledBullet;
    } else if (this.bulletType == ammoTypes.laser) {
      this.drawBullet = bulletDrawUtils.drawLaserBullet;
    } else {
      this.drawBullet = bulletDrawUtils.drawNormalBullet;
    }
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
    if (state.game.reload == true) {
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
    this.drawBullet(
      state.game.context,
      this.position,
      this.rotation,
      this.color
    );
  }
}
