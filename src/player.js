import { makeProjectile } from './projectile.js';
import { resolveCircle } from './logic.js';

const FRAME_SIZE = 48;
const STEP_SECONDS = 0.13;
const SIDE_POSE_SECONDS = 0.09;
const SIDE_LEG_START = 40;
const ATTACK_FEET_START = 38;
const ATTACK_POSE_SECONDS = 0.12;
const HIT_POSE_SECONDS = 0.18;

// Columns in sua.png: down, up, left, right.
const DIRECTION = { down: 0, up: 1, left: 2, right: 3 };
// Wand tips in the four 48x48 attack frames.
const WAND_TIP = [
  { x: 24, y: 40 }, { x: 24, y: 11 }, { x: 8, y: 27 }, { x: 39, y: 27 }
];

const playerSprite = typeof Image === 'undefined' ? null : new Image();
const combatSprite = typeof Image === 'undefined' ? null : new Image();

if (playerSprite) {
  playerSprite.src = new URL('../assets/player/sua.png', import.meta.url).href;
  combatSprite.src = new URL('../assets/player/sua-combat.png', import.meta.url).href;
}
export function createPlayer() {
  const maxHp = 100;
  return { x: 110, y: 270, r: 12, hp: maxHp, maxHp, speed: 185,
    damage: 20, fireInterval: 0.3, cooldown: 0, invincible: 0, facing: DIRECTION.down, walkTime: 0,
    attackTime: 0, attackFacing: DIRECTION.down, hitTime: 0, hitFacing: DIRECTION.down,
    lastObservedHp: maxHp };
}

export function showPlayerHitPose(player) {
  player.hitFacing = player.facing;
  player.hitTime = HIT_POSE_SECONDS;
  player.attackTime = 0;
}

export function updatePlayer(player, input, blocks, dt) {
  player.attackTime = Math.max(0, (player.attackTime ?? 0) - dt);
  player.hitTime = Math.max(0, (player.hitTime ?? 0) - dt);

  // The game loop owns damage and invincibility. React to applied HP loss.
  if (player.hp < player.lastObservedHp) {
    showPlayerHitPose(player);
  }
  player.lastObservedHp = player.hp;

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

  // Walls and blocks: push the player out after moving.
  // resolveCircle also clamps to the play area, so the old local clamp is gone.
  resolveCircle(player, blocks || []);

  // Count down invincibility
  player.invincible = Math.max(0, player.invincible - dt);
  // Fire
  player.cooldown -= dt;
  if (input.firing && player.cooldown <= 0) {
    player.cooldown = player.fireInterval;
    const aimX = input.aim.x - player.x;
    const aimY = input.aim.y - player.y;
    const facing = Math.abs(aimX) >= Math.abs(aimY)
      ? (aimX < 0 ? DIRECTION.left : DIRECTION.right)
      : (aimY < 0 ? DIRECTION.up : DIRECTION.down);
    if (player.hitTime === 0) {
      player.attackTime = ATTACK_POSE_SECONDS;
      player.attackFacing = facing;
      if (len === 0) player.facing = player.attackFacing;
    }
    const tip = WAND_TIP[facing];
    const shotX = Math.round(player.x - FRAME_SIZE / 2) + tip.x;
    const shotY = Math.round(player.y + player.r - FRAME_SIZE) + tip.y;
    const angle = Math.atan2(input.aim.y - shotY, input.aim.x - shotX);
    return makeProjectile(shotX, shotY, angle, 520, false, player.damage);
  }
 
  return null; // No shot this frame
}

export function drawPlayer(ctx, player, seconds = 0) {
  const combatReady = combatSprite?.complete && combatSprite.naturalWidth > 0;
  const showingHit = combatReady && player.hitTime > 0;
  if (!showingHit && player.invincible > 0 && Math.floor(seconds * 10) % 2 === 0) {
    return;
  }

  ctx.save();

  if (combatReady && (showingHit || player.attackTime > 0)) {
    const column = showingHit ? player.hitFacing : player.attackFacing;
    const sourceX = column * FRAME_SIZE;
    const x = Math.round(player.x - FRAME_SIZE / 2);
    const y = Math.round(player.y + player.r - FRAME_SIZE);
    ctx.imageSmoothingEnabled = false;
    if (!showingHit && player.walkTime === 0 && playerSprite?.complete && playerSprite.naturalWidth > 0) {
      const feetHeight = FRAME_SIZE - ATTACK_FEET_START;
      ctx.drawImage(combatSprite, sourceX, 0, FRAME_SIZE, ATTACK_FEET_START,
        x, y, FRAME_SIZE, ATTACK_FEET_START);
      ctx.drawImage(playerSprite, sourceX, ATTACK_FEET_START, FRAME_SIZE, feetHeight,
        x, y + ATTACK_FEET_START, FRAME_SIZE, feetHeight);
      // The downward wand crystal extends into the idle-feet crop.
      if (column === DIRECTION.down) {
        ctx.drawImage(combatSprite, sourceX + 22, ATTACK_FEET_START, 4, 4,
          x + 22, y + ATTACK_FEET_START, 4, 4);
      }
    } else {
      ctx.drawImage(combatSprite, sourceX, showingHit ? FRAME_SIZE : 0, FRAME_SIZE, FRAME_SIZE,
        x, y, FRAME_SIZE, FRAME_SIZE);
    }
  } else if (playerSprite?.complete && playerSprite.naturalWidth > 0) {
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
