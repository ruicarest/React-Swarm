import Particle from './Particle';
import { randomNumBetween } from './utils';

export default class Mine {
    constructor(args) {
        this.position = {
            x: args.position.x,
            y: args.position.y
        };

        this.shipInertia = {
            x: args.velocity.x,
            y: args.velocity.y
        };

        this.create = args.create;

        this.radius = args.size;
        this.inertia = 0.99;

        this.type = "bullet";
        this.toughness = args.damage;
        this.exploded = false;
        //this.color = args.color;
        this.color = "#537aed";
        this.T_shot = Date.now();
        this.T_explode = 0;
        this.T_toExplode = 1500;
        this.T_shockwave = 3000;
    }

    destroy(){

    };

    hit(){
        this.explode();
    };

    explode() {
        this.exploded = true;
        
        //explode!
        if(this.T_explode == 0) {
            //set explode timestamp
            this.T_explode = Date.now();

            //exploding particles
            for (let i = 0; i < 10; i++) {
                const particle = new Particle({
                    lifeSpan: randomNumBetween(40, 70),
                    size: randomNumBetween(1, 1.5),
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
    };

    render(state) {

        // Move
        this.position.x -= state.shipVelocity.x - this.shipInertia.x;
        this.position.y -= state.shipVelocity.y - this.shipInertia.y;

        this.shipInertia.x *=  this.inertia;
        this.shipInertia.y *=  this.inertia;

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

        //explode mine
        if(this.exploded || Date.now() - this.T_shot > this.T_toExplode ) {
            //TODO: fix inertia to decrease velocity over time
            this.shipInertia = {x: 0, y: 0};
            //increase shockwave radius
            this.radius++;
            //explode!
            this.explode();
        }

        //delete mine
        if (this.exploded && Date.now() - this.T_explode > this.T_shockwave){
            this.delete = true;
        }

        // Draw
        const context = state.context;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.strokeStyle = this.color;
        context.lineWidth = 2 - this.radius/100;
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        context.closePath();
        context.stroke();
        context.restore();
    }
}