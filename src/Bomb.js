export default class Bomb {
    constructor(args) {
        this.position = {
            x: args.position.x,
            y: args.position.y
        };

        this.shipInertia = {
            x: args.velocity.x,
            y: args.velocity.y
        };

        this.radius = args.size;
        this.inertia = 0.95;

        //this.action = args.action;

        this.type = "bullet";
        this.toughness = args.damage;
        this.exploded = false;
        //this.color = args.color;
        this.color = "#537aed";
        this.T_shot = Date.now();
        this.T_toExplode = 1000;
        this.T_shockwave = 4000;
    }

    destroy(){

    };

    hit(){
        this.exploded = true;
    };

    render(state) {

        // Move
        this.position.x -= state.shipVelocity.x - this.shipInertia.x * this.inertia;
        this.position.y -= state.shipVelocity.y - this.shipInertia.y * this.inertia;

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

        if (Date.now() - this.T_shot > this.T_shockwave){
            this.delete = true;
        }

        if(this.exploded || Date.now() - this.T_shot > this.T_toExplode ) {
            //increase shockwave radius
            this.shipInertia = {x: 0, y: 0};
            this.radius++;
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