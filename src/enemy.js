import { blocked } from './logic.js';
import { makeProjectile } from './projectile.js';

// assets/enemy/chaser_front_idle_1.png: front idle sprite.
const sprite = typeof Image === 'function' ? new Image() : null;
if (sprite) sprite.src = new URL('../assets/enemy/chaser_front_idle_1.png', import.meta.url).href;

const CHASER = { radius: 14, hp: 40, speed: 90 };
const SHOOTER = { radius: 13, hp: 40, interval: 1.4, speed: 215, damage: 10 };

export function createEnemy(kind, x, y, room) {
  if (kind !== 'chaser' && kind !== 'shooter') {
    throw new RangeError(`Unsupported enemy kind: ${kind}`);
  }
  const isShooter = kind === 'shooter';
  const stats = isShooter ? SHOOTER : CHASER;
  return { kind, x, y, r: stats.radius, hp: stats.hp, cooldown: isShooter ? SHOOTER.interval : 0, flash: 0 };
}

export function updateEnemy(enemy, player, blocks, dt) {
  if (enemy.hp <= 0) return null;

  enemy.flash = Math.max(0, enemy.flash - dt);
  if (enemy.kind === 'shooter') {
    enemy.cooldown = Math.max(0, enemy.cooldown - dt);
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    if (enemy.cooldown > 0 || (dx === 0 && dy === 0)) return null;

    enemy.cooldown = SHOOTER.interval;
    return makeProjectile(enemy.x, enemy.y, Math.atan2(dy, dx), SHOOTER.speed, true, SHOOTER.damage);
  }

  // Substeps limit how far the enemy can move between collision checks.
  const steps = Math.max(1, Math.ceil(CHASER.speed * dt / (enemy.r / 2)));
  const stepDistance = CHASER.speed * dt / steps;
  for (let step = 0; step < steps; step++) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    if (distance === 0) break;

    const move = Math.min(stepDistance, distance) / distance;
    const nextX = enemy.x + dx * move;
    const nextY = enemy.y + dy * move;
    if (!blocked(nextX, enemy.y, enemy.r, blocks)) enemy.x = nextX;
    if (!blocked(enemy.x, nextY, enemy.r, blocks)) enemy.y = nextY;
  }
  return null;
}

export function enemyContact(enemy, player) {
  return enemy.hp > 0 &&
    Math.hypot(enemy.x - player.x, enemy.y - player.y) <= enemy.r + player.r;
}

export function enemyProjectileHit(bullet, player) {
  return bullet.enemy === true && bullet.life > 0 &&
    Math.hypot(bullet.x - player.x, bullet.y - player.y) <= bullet.r + player.r;
}

export function drawEnemy(ctx, enemy, seconds) {
  if (enemy.hp <= 0) return;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  if (enemy.kind === 'shooter') {
    ctx.fillStyle = enemy.flash > 0 ? '#fff5d8' : '#8ad3f2';
    ctx.beginPath();
    ctx.moveTo(0, -enemy.r);
    ctx.quadraticCurveTo(enemy.r * 2, enemy.r, 0, enemy.r);
    ctx.quadraticCurveTo(-enemy.r * 2, enemy.r, 0, -enemy.r);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (sprite?.complete && sprite.naturalWidth > 0) {
    const width = enemy.r * 3;
    const height = width * sprite.naturalHeight / sprite.naturalWidth;
    ctx.imageSmoothingEnabled = false;
    if (enemy.flash > 0) ctx.filter = 'brightness(1.7)';
    ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
    ctx.restore();
    return;
  }
  ctx.fillStyle = enemy.flash > 0 ? '#fff5d8' : '#62683b';
  ctx.beginPath();
  ctx.arc(0, 3, enemy.r - 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = enemy.flash > 0 ? '#fff5d8' : '#a7bb55';
  ctx.beginPath();
  ctx.ellipse(-5, -8, 8, 4, Math.PI / 4, 0, Math.PI * 2);
  ctx.ellipse(5, -9, 8, 4, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
