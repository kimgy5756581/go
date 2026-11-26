import { makeProjectile } from './projectile.js';
// Play area (inside the walls). Temporary values; move to logic.js blocked() once it exists.
const PLAY_AREA = { left: 40, right: 920, top: 48, bottom: 492 };

export function createPlayer() {
  return { x: 110, y: 270, r: 12, hp: 100, maxHp: 100, speed: 185,  
    damage: 20, fireInterval: 0.3, cooldown: 0, invincible: 0 };
}
export function updatePlayer(player, input, blocks, dt) {
  let dx = 0, dy = 0;
  if (input.keys.has('KeyD') || input.keys.has('ArrowRight')) dx += 1;
  if (input.keys.has('KeyA') || input.keys.has('ArrowLeft'))  dx -= 1;
  if (input.keys.has('KeyS') || input.keys.has('ArrowDown'))  dy += 1;
  if (input.keys.has('KeyW') || input.keys.has('ArrowUp'))    dy -= 1;
  // Normalize so diagonal speed equals straight speed

  const len = Math.hypot(dx, dy);       
  if (len > 0) { dx /= len; dy /= len; } 

  player.x += dx * player.speed * dt;
  player.y += dy * player.speed * dt;
  
 // Keep the player inside the play area (the circle's edge stops at the wall)
  player.x = Math.min(PLAY_AREA.right - player.r, Math.max(PLAY_AREA.left + player.r, player.x));
  player.y = Math.min(PLAY_AREA.bottom - player.r, Math.max(PLAY_AREA.top + player.r, player.y));

  // Count down invincibility
  player.invincible = Math.max(0, player.invincible - dt);
  // Fire
  player.cooldown -= dt;
  if (input.firing && player.cooldown <= 0) {
    player.cooldown = player.fireInterval;
    const angle = Math.atan2(input.aim.y - player.y, input.aim.x - player.x);
    return makeProjectile(player.x, player.y, angle, 520, false, player.damage);
  }
 
  return null; // Vo shot this frame
}