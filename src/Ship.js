import { rotatePoint, randomNumBetween } from './utils';
import Particle from './Particle';
import Bullet from './Bullet';

export default class Ship {
    constructor(args) {
      this.position = args.position;
      this.velocity = {
        x: 0,
        y: 0
      }
      this.rotation = 0;
      this.rotationSpeed = 6;
      this.speed = 0.15;
      this.inertia = 0.99;
      this.radius = 20;

      this.lastShot = 0;

      this.create = args.create;
      this.updateVelocity = args.updateVelocity;
    }

    destroy() {
      this.delete = true;

      this.onDie();
  
      // Explode
      for (let i = 0; i < 60; i++) {
        const particle = new Particle({
          lifeSpan: randomNumBetween(60, 100),
          size: randomNumBetween(1, 4),
          position: {
            x: randomNumBetween(-this.radius/4, this.radius/4) + this.position.x,
            y: randomNumBetween(-this.radius/4, this.radius/4) + this.position.y
          },
          velocity: {
            x: randomNumBetween(-1.5, 1.5),
            y: randomNumBetween(-1.5, 1.5)
          }
        });
        this.create(particle, 'particles');
      }
    }

    rotate(dir){
        if (dir == 'LEFT') {
          this.rotation -= this.rotationSpeed;
        }
        if (dir == 'RIGHT') {
          this.rotation += this.rotationSpeed;
        }
      }

      accelerate(val){
        this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * this.speed;
        this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * this.speed;

        //engine particles
        let posDelta = rotatePoint(
          {x:0, y:-10}, 
          {x:0,y:0}, 
          (this.rotation-180) * Math.PI / 180
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
        this.create(particle, 'particles');
      }

      render(state){
        // Controls
        if(state.keys.up){
          this.accelerate(1);
        }
        if(state.keys.left){
          this.rotate('LEFT');
        }
        if(state.keys.right){
          this.rotate('RIGHT');
        }
        if(state.keys.space && Date.now() - this.lastShot > 300){
          const bullet = new Bullet({ship: this});
          this.create(bullet, 'bullets');
          this.lastShot = Date.now();
        }

        this.updateVelocity(this.velocity);

        this.velocity.x *= this.inertia;
        this.velocity.y *= this.inertia;
    
        // Rotation
        if (this.rotation >= 360) {
          this.rotation -= 360;
        }
        if (this.rotation < 0) {
          this.rotation += 360;
        }

        // Draw
        const context = state.context;
        context.save();
        //TODO: ship shoud not move on window resize
        //context.translate(state.screen.width/2, state.screen.height/2);
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation * Math.PI / 180);
        context.strokeStyle = '#ffffff';
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
        context.restore();
      }

}