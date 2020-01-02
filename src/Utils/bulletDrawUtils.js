export function drawNormalBullet(context, position, rotation, color) {
  context.save();
  context.translate(position.x, position.y);
  context.rotate((rotation * Math.PI) / 180);
  context.fillStyle = color;
  context.lineWidth = 0.5;
  context.beginPath();
  context.arc(0, 0, 2, 0, 2 * Math.PI);
  context.closePath();
  context.fill();
  context.restore();
}

export function drawDoubledBullet(context, position, rotation, color) {
  context.save();
  context.translate(position.x, position.y);
  context.rotate((rotation * Math.PI) / 180);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, 20);
  context.lineWidth = 1;
  context.strokeStyle = color;
  context.stroke();
  context.restore();
}
