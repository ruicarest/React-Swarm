import { rotatePoint, randomNumBetween } from './utils';
import Particle from './Particle';
import Bullet from './Bullet';

export default class Enemy {
    constructor(args) {
      this.position = args.position;
      this.velocity = {
        x: 0,
        y: 0
      }

      this.type = "enemy";
      this.rotation = 0;
      this.rotationSpeed = 6;
      this.acceleration = 4;
      this.inertia = 0.99;
      this.radius = 20;
      this.sight = 500;
      //Timers
      this.T_lastShot = 0;
      this.T_lastHit = 0;

      this.create = args.create;

      this.gettingHit = false;
      this.toughness = 10;
      this.HP = 20;
    }

    destroy() {
      this.delete = true;
  
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

    hit(damage) {

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

      addEnergy(amount) {
        this.HP += amount;
      }

      accelerate(val){
        this.velocity.x += Math.sin(-this.rotation*Math.PI/180) * this.acceleration;
        this.velocity.y += Math.cos(-this.rotation*Math.PI/180) * this.acceleration;

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

      //TODO: remove args and use state instead (part3)
      render(state){
        const shipPos = state.ship.position;

        //calc distance to player ship
        let dx = this.position.x-shipPos.x;
        let dy = this.position.y-shipPos.y;

        //distance to ship
        const distance = Math.sqrt(dx*dx + dy*dy);

        //angle to ship
        let angle = Math.floor(Math.atan2(dy, dx) * (180/Math.PI) - 90);

        //handle angle limits
        if(angle < 0) {
            angle = 360 + angle;
        }
        if (this.rotation >= 360) {
            this.rotation -= 360;
        }
        if (this.rotation < 0) {
            this.rotation += 360;
        }

        if(distance < this.sight) {

            if(this.rotation > angle) {
                if(((360 - Math.abs(this.rotation - angle)) < (angle - this.rotation))) {
                    this.rotate('RIGHT');
                }
                else {
                    this.rotate('LEFT');
                }
            } 
            else {
                if(((360 - Math.abs(this.rotation - angle)) < (angle - this.rotation))) {
                    this.rotate('LEFT');
                }
                else {
                    this.rotate('RIGHT');
                }
            }

            //TODO: fix enemy velocity
            this.velocity.x = - Math.sin(-this.rotation*Math.PI/180) * this.acceleration;
            this.velocity.y = - Math.cos(-this.rotation*Math.PI/180) * this.acceleration;

            if(distance < 200) {
                this.velocity = {x:0, y:0};
            }

            if(Date.now() - this.T_lastShot > 1000){
                const bullet = new Bullet({
                  ship: this, 
                  damage: 10,
                  create:this.create.bind(this)
                });
                this.create(bullet, 'enemyBullets');
                this.T_lastShot = Date.now();
              }
        }

        // Move
        this.position.x += this.velocity.x - state.ship.velocity.x;
        this.position.y += this.velocity.y - state.ship.velocity.y;

        // Screen edges
        if(this.position.x > state.map.width + this.radius) {
            this.position.x = -this.radius;
        }
        else if(this.position.x < -this.radius) { 
            this.position.x = state.map.width + this.radius;
        }
        if(this.position.y > state.map.height + this.radius) {
            this.position.y = -this.radius;
        }
        else if(this.position.y < -this.radius) {
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
        context.strokeStyle = '#ff0000';
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
          context.arc(0, 0, this.radius + 5, 0, 360);
          context.strokeStyle = '#fcad03';
          context.stroke();
        }
        context.restore();
      }
}