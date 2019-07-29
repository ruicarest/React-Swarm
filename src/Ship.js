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

      this.type = "ship";
      this.rotation = 0;
      this.rotationSpeed = 6;
      this.speed = 0.15;
      this.inertia = 0.99;
      this.radius = 20;

      //Timers
      this.T_lastShot = 0;
      this.T_lastHit = 0;

      this.create = args.create;
      this.onDie = args.onDie;
      this.updateVelocity = args.updateVelocity;

      this.gettingHit = false;
      this.hitAngle = 0;
      this.toughness = 10;
      this.HP = 100;
    }

    destroy() {
      this.delete = true;
      this.onDie();

      //stop moving
      this.updateVelocity({x: 0, y: 0});
  
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

    hit(damage, angle) {

      this.hitAngle = angle;

      if(Date.now() - this.T_lastHit > 100){
        this.HP -= damage;
        this.T_lastHit = Date.now();
        this.gettingHit = true;
      }
      if(this.HP <= 0 ) {
        this.destroy();
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
        if(state.keys.space && Date.now() - this.T_lastShot > 300){
          const bullet = new Bullet({ship: this, damage: 10});
          this.create(bullet, 'bullets');
          this.T_lastShot = Date.now();
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

        if (this.gettingHit && Date.now() - this.T_lastHit > 100) {
          this.gettingHit = false;
          this.hitAngle = 0;
        }

        // Draw
        const context = state.context;
        context.save();
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
        
        //draw Energy Shield
        if(this.gettingHit) {
          context.beginPath();
          //TODO: change shield size with distance
          context.arc(0, 0, 50, this.hitAngle - this.rotation * Math.PI / 180, Math.PI + this.hitAngle - this.rotation * Math.PI / 180);
          context.strokeStyle = '#901aeb';
          context.stroke();
        }
        context.restore();
      }
}