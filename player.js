export function createPlayer() {
  return { x: 110, y: 270, r: 12, hp: 100, maxHp: 100, speed: 185 };
}
export function updatePlayer(player, input, dt) {
  let dx = 0, dy = 0;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) dx += 1;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft'))  dx -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown'))  dy += 1;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp'))    dy -= 1;

  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;
}