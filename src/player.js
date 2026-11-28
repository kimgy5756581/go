import { makeProjectile } from './projectile.js';
// Play area (inside the walls). Temporary values; move to logic.js blocked() once it exists.
const PLAY_AREA = { left: 40, right: 920, top: 48, bottom: 492 };
const FRAME_SIZE = 48;
const STEP_SECONDS = 0.13;
const SIDE_POSE_SECONDS = 0.09;
const SIDE_LEG_START = 40;

// Columns in sua.png: down, up, left, right.
const DIRECTION = { down: 0, up: 1, left: 2, right: 3 };

const playerSprite = typeof Image === 'undefined' ? null : new Image();

if (playerSprite) {
  playerSprite.src = new URL('../assets/player/sua.png', import.meta.url).href;
}
export function createPlayer() {
  return { x: 110, y: 270, r: 12, hp: 100, maxHp: 100, speed: 185,  
    damage: 20, fireInterval: 0.3, cooldown: 0, invincible: 0, facing: DIRECTION.down, walkTime: 0 };
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

  if (len > 0) {
    if (dx !== 0) {
      player.facing = dx < 0 ? DIRECTION.left : DIRECTION.right;
    } else {
      player.facing = dy < 0 ? DIRECTION.up : DIRECTION.down;
    }
    player.walkTime += dt;
  } else {
    player.walkTime = 0;
  }

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

export function drawPlayer(ctx, player, seconds = 0) {
  if (player.invincible > 0 && Math.floor(seconds * 10) % 2 === 0) {
    return;
  }

  ctx.save();

  if (playerSprite?.complete && playerSprite.naturalWidth > 0) {
    const column = player.facing;
    const sideways = column === DIRECTION.left || column === DIRECTION.right;
    let row = 0;

    // Row 0 is idle. Side directions use four walk poses instead of two.
    if (player.walkTime > 0) {
      const poseSeconds = sideways ? SIDE_POSE_SECONDS : STEP_SECONDS;
      const poseCount = sideways ? 4 : 2;
      row = 1 + Math.floor(player.walkTime / poseSeconds) % poseCount;
    }

    ctx.imageSmoothingEnabled = false;
    const sourceX = column * FRAME_SIZE;
    const sourceY = row * FRAME_SIZE;
    const x = Math.round(player.x - FRAME_SIZE / 2);
    const y = Math.round(player.y + player.r - FRAME_SIZE);

    if (sideways && row % 2 === 1) {
      // Lower the upper body on contact poses while keeping the feet planted.
      const upperHeight = SIDE_LEG_START - 1;
      ctx.drawImage(playerSprite, sourceX, sourceY, FRAME_SIZE, upperHeight,
        x, y + 1, FRAME_SIZE, upperHeight);
      const legHeight = FRAME_SIZE - SIDE_LEG_START;
      ctx.drawImage(playerSprite, sourceX, sourceY + SIDE_LEG_START, FRAME_SIZE, legHeight,
        x, y + SIDE_LEG_START, FRAME_SIZE, legHeight);
    } else {
      ctx.drawImage(playerSprite, sourceX, sourceY, FRAME_SIZE, FRAME_SIZE,
        x, y, FRAME_SIZE, FRAME_SIZE);
    }
  } else {
    ctx.fillStyle = '#f3e9d2';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
