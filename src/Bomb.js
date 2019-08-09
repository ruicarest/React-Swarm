export default class Bomb {
    constructor(args) {
        this.position = {
            x: args.position.x,
            y: args.position.y
        };

        this.radius = args.size;

        //this.action = args.action;

        this.type = "bullet";
        this.toughness = args.damage;

        //this.color = args.color;
        this.color = "#537aed";
        this.T_lastShot = Date.now();
        this.T_shockwave = 2000;
    }

    destroy(){

    };

    hit(){

    };

    render(state) {

    // Move
    this.position.x -= state.shipVelocity.x;
    this.position.y -= state.shipVelocity.y;

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

    if (Date.now() - this.T_lastShot > this.T_shockwave){
        this.delete = true;
    }

    //increase shockwave radius
    this.radius++;

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