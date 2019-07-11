import { rotatePoint, randomNumBetween } from './utils';
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