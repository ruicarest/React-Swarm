import { asteroidVertices, randomNumBetween } from "../Utils/utils";
import Particle from "./Particle";

export default class Asteroid {
  constructor(args) {
    this.position = args.position;
    this.velocity = {
      x: randomNumBetween(-1, 1),
      y: randomNumBetween(-1, 1)
      // x: 0,
      // y: 0,
    };
    this.vertices = asteroidVertices(8, args.size);
    this.rotation = 0;
    this.rotationSpeed = randomNumBetween(-1, 1);
    this.radius = args.size;
    //this.score = (80/this.radius)*5;
    this.create = args.create;
    this.addScore = args.addScore;

    this.type = "asteroid";

    this.toughness = Math.floor(args.size / 10);
    this.HP = args.size;
    this.visible = true;
    this.T_lastHit = 0;
  }

  updatePosition(offset) {
    this.position.x += offset.x;
    this.position.y += offset.y;
  }

  destroy() {
    this.delete = true;

    //explode
    for (let i = 0; i < this.radius; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(2 * this.radius, 4 * this.radius),
        size: randomNumBetween(1, 3),
        position: {
          x:
            randomNumBetween(-this.radius / 2, this.radius / 2) +
            this.position.x,
          y:
            randomNumBetween(-this.radius / 2, this.radius / 2) +
            this.position.y
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        },
        create: this.create.bind(this)
      });
      this.create(particle, "particles");
    }

    //create children asteroids
    if (this.radius > 20) {
      for (let i = 2; i > 0; i--) {
        let asteroid = new Asteroid({
          size: this.radius / 2,
          position: {
            x:
              randomNumBetween(-this.radius / 2, this.radius / 2) +
              this.position.x,
            y:
              randomNumBetween(-this.radius / 2, this.radius / 2) +
              this.position.y
          },
          create: this.create.bind(this)
        });
        this.create(asteroid, "asteroids");
      }
    }
  }

  hit(damage) {
    if (Date.now() - this.T_lastHit > 10) {
      this.HP -= damage;
      this.T_lastHit = Date.now();
    }
    if (this.HP <= 0) {
      this.destroy();
    }
  }

  remove() {
    this.delete = true;
  }

  render(state) {
    if (state.game.reload == true) {
      this.remove();
      return;
    }

    // Move
    this.position.x += this.velocity.x - state.ship.velocity.x;
    this.position.y += this.velocity.y - state.ship.velocity.y;

    // Rotation
    this.rotation += this.rotationSpeed;
    if (this.rotation >= 360) {
      this.rotation -= 360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

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

    // Draw
    const context = state.game.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate((this.rotation * Math.PI) / 180);
    context.strokeStyle = "#FFF";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, -this.radius);
    for (let i = 1; i < this.vertices.length; i++) {
      context.lineTo(this.vertices[i].x, this.vertices[i].y);
    }
    context.closePath();
    context.stroke();
    context.restore();
  }
}
