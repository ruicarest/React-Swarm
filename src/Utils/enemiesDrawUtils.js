export function drawMiniShip(state) {
  // Draw
  const context = state.game.context;
  context.save();
  context.translate(this.position.x, this.position.y);
  context.rotate((this.rotation * Math.PI) / 180);
  context.strokeStyle = this.color;
  context.fillStyle = "#000000";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, -15); //point
  context.lineTo(5, 5); //right wing
  context.lineTo(5, 7);
  context.lineTo(-5, 7);
  context.lineTo(-5, 5); //left wing */
  context.closePath();
  context.fill();
  context.stroke();

  //draw Energy Shield
  if (this.gettingHit) {
    context.beginPath();
    //TODO: change shield size with distance
    context.arc(0, 0, this.radius + 5, 0, 360);
    context.strokeStyle = "#fcad03";
    context.stroke();
  }
  context.restore();
}

export function drawBigShip(state) {
  // Draw
  const context = state.game.context;
  context.save();
  context.translate(this.position.x, this.position.y);
  context.rotate((this.rotation * Math.PI) / 180);
  context.strokeStyle = this.color;
  context.fillStyle = "#000000";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, -25);
  context.lineTo(20, 20);
  context.lineTo(5, 7);
  context.lineTo(-5, 7);
  context.lineTo(-20, 20);
  context.closePath();
  context.fill();
  context.stroke();

  //draw Energy Shield
  if (this.gettingHit) {
    context.beginPath();
    //TODO: change shield size with distance
    context.arc(0, 0, this.radius + 5, 0, 360);
    context.strokeStyle = "#fcad03";
    context.stroke();
  }
  context.restore();
}

export function drawMediumShip(state) {
  // Draw
  const context = state.game.context;
  context.save();
  context.translate(this.position.x, this.position.y);
  context.rotate((this.rotation * Math.PI) / 180);
  context.strokeStyle = this.color;
  context.fillStyle = "#000000";
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
  if (this.gettingHit) {
    context.beginPath();
    //TODO: change shield size with distance
    context.arc(0, 0, this.radius + 5, 0, 360);
    context.strokeStyle = "#fcad03";
    context.stroke();
  }
  context.restore();
}
