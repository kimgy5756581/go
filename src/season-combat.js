import { blocked } from './logic.js';
import { makeProjectile } from './projectile.js';
import { createEnemy, drawEnemy, updateEnemy } from './enemy.js';
import { createBoss, drawBoss, updateBoss } from './boss.js';
import { LOADOUTS } from './season-loadouts.js';

export function createRoomEnemy(season, index, x, y, room) {
  const group = LOADOUTS[season]?.groups.find(group => index < group.until);
  if (!group) return createEnemy('chaser', x, y, room);
  const { role, hp, radius } = group;
  return { kind: role, x, y, r: radius, hp, flash: 0, cooldown: 0.5 + (index % 5) * 0.23,
    phase: 'ready', angle: 0, profile: group };
}

export function createRoomBoss(season) {
  if (season === 'spring') return createBoss();
  const profile = LOADOUTS[season]?.boss;
  if (!profile) return null;
  return { kind: 'boss', x: 500, y: 270, r: 42, hp: profile.hp, maxHp: profile.hp,
    flash: 0, cooldown: profile.interval, phase: 'ready', angle: 0, volley: 0, profile };
}

// Small, axis-separated steps let pursuing enemies slide and stop charges at walls.
function move(entity, angle, distance, blocks, stopOnBlock = false) {
  const steps = Math.max(1, Math.ceil(distance / (entity.r / 2)));
  const dx = Math.cos(angle) * distance / steps;
  const dy = Math.sin(angle) * distance / steps;
  for (let i = 0; i < steps; i++) {
    const x = entity.x + dx;
    const y = entity.y + dy;
    if (stopOnBlock && blocked(x, y, entity.r, blocks)) return false;
    if (!blocked(x, entity.y, entity.r, blocks)) entity.x = x;
    if (!blocked(entity.x, y, entity.r, blocks)) entity.y = y;
  }
  return true;
}

function aim(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

function shoot(entity, angle) {
  const p = entity.profile;
  const shot = makeProjectile(entity.x, entity.y, angle, p.bulletSpeed, true, p.damage);
  const offset = entity.r + shot.r;
  shot.x += Math.cos(angle) * offset;
  shot.y += Math.sin(angle) * offset;
  return shot;
}

function startWarning(entity, player) {
  entity.angle = aim(entity, player);
  entity.phase = 'warning';
  entity.cooldown = entity.profile.warning;
}

function charge(entity, player, blocks, dt) {
  const p = entity.profile;
  if (entity.phase === 'charging') {
    const travelTime = Math.min(dt, entity.cooldown);
    const clear = move(entity, entity.angle, p.speed * travelTime, blocks, true);
    entity.cooldown -= travelTime;
    if (clear && entity.cooldown > 0) return;
    entity.phase = 'recovery';
    entity.cooldown = p.interval;
    return;
  }
  entity.cooldown -= dt;
  if (entity.cooldown > 0) return;
  if (entity.phase === 'warning') {
    entity.phase = 'charging';
    entity.cooldown = p.duration;
  } else {
    startWarning(entity, player);
  }
}

export function updateRoomEnemy(enemy, player, blocks, dt) {
  if (!enemy.profile) {
    updateEnemy(enemy, player, blocks, dt);
    return [];
  }
  if (enemy.hp <= 0) return [];
  const p = enemy.profile;
  enemy.flash = Math.max(0, enemy.flash - dt);
  if (p.role === 'chaser') {
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    move(enemy, aim(enemy, player), Math.min(distance, p.speed * dt), blocks);
    return [];
  }
  if (p.role === 'assassin') {
    charge(enemy, player, blocks, dt);
    return [];
  }
  enemy.cooldown -= dt;
  if (enemy.cooldown > 0) return [];
  if (enemy.phase !== 'warning') {
    startWarning(enemy, player);
    return [];
  }
  enemy.phase = 'ready';
  enemy.cooldown = p.interval;
  return Array.from({ length: p.shots }, (_, i) =>
    shoot(enemy, enemy.angle + (i - (p.shots - 1) / 2) * p.spread));
}

export function updateRoomBoss(boss, player, blocks, dt) {
  if (!boss.profile) return updateBoss(boss, dt);
  if (boss.hp <= 0) return [];
  const p = boss.profile;
  boss.flash = Math.max(0, boss.flash - dt);
  if (p.pattern === 'charge') {
    charge(boss, player, blocks, dt);
    return [];
  }
  boss.cooldown -= dt;
  if (boss.cooldown > 0) return [];
  if (boss.phase !== 'warning') {
    startWarning(boss, player);
    return [];
  }
  boss.phase = 'ready';
  boss.cooldown = p.interval - p.warning;
  const radial = p.pattern === 'radial';
  const count = radial && boss.hp <= boss.maxHp / 2 ? p.shots + 4 : p.shots;
  const spacing = radial ? 2 * Math.PI / count : p.spread;
  const start = radial ? (boss.volley % 2) * spacing / 2 : boss.angle - spacing * (count - 1) / 2;
  boss.volley++;
  return Array.from({ length: count }, (_, i) => shoot(boss, start + i * spacing));
}

export function drawRoomEnemy(ctx, entity, seconds) {
  if (!entity.profile || entity.profile === LOADOUTS.spring.groups[0]) return drawEnemy(ctx, entity, seconds);
  drawSeasonMonster(ctx, entity);
}

export function drawRoomBoss(ctx, entity, seconds) {
  if (!entity.profile) return drawBoss(ctx, entity, seconds);
  drawSeasonMonster(ctx, entity);
}

function drawSeasonMonster(ctx, entity) {
  if (entity.hp <= 0) return;
  const { x, y, r, profile } = entity;
  ctx.save();
  if (entity.phase === 'warning' && (profile.role === 'assassin' || profile.pattern === 'charge')) {
    ctx.strokeStyle = '#ff8070';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const range = profile.speed * profile.duration;
    ctx.lineTo(x + Math.cos(entity.angle) * range, y + Math.sin(entity.angle) * range);
    ctx.stroke();
  }
  ctx.translate(x, y);
  ctx.fillStyle = entity.flash > 0 ? '#fff5d8' : profile.color;
  ctx.strokeStyle = '#162127';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (profile.role === 'assassin' || profile.pattern === 'charge') {
    ctx.rotate(entity.angle + Math.PI / 2);
    ctx.moveTo(0, -r);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(0, r * 0.4);
    ctx.lineTo(-r, r * 0.7);
    ctx.closePath();
  } else if (profile.role === 'mage') {
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
  if (profile.role === 'mage' || profile.pattern) {
    ctx.fillStyle = entity.phase === 'warning' ? '#fff5bf' : '#203038';
    ctx.beginPath();
    ctx.arc(0, -r * 0.28, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
