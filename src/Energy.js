export default class Energy {
    constructor(args) {
        this.position = args.position;

        this.radius = args.size;

        this.addEnergy = args.addEnergy;

        this.type = "pickable";

    }

    destroy(){
      this.delete = true;

      this.addEnergy();
    }

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

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.strokeStyle = '#901aeb';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, this.radius, 0, Math.PI * 2);
    context.closePath();
    context.stroke();
    context.restore();
  }
}