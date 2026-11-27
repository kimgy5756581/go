import { makeProjectile } from './projectile.js';

// assets/boss/boss_front_idle_1.png: front idle sprite.
const sprite = typeof Image === 'function' ? new Image() : null;
if (sprite) sprite.src = new URL('../assets/boss/boss_front_idle_1.png', import.meta.url).href;

const SPRING = { hp: 240, count: 8, interval: 1.7, x: 740 };
const FINAL = { hp: 900, count: 12, interval: 2.1, x: 650 };
// Keep the public boss entity fields identical for both encounters.
const finalBosses = new WeakSet();
const SHOT_SPEED = 185;
const SHOT_DAMAGE = 14;

function makeBoss(profile) {
  return { kind: 'boss', x: profile.x, y: 270, r: 48, hp: profile.hp, maxHp: profile.hp,
    cooldown: profile.interval, flash: 0, volley: 0 };
}

export function createBoss() {
  return makeBoss(SPRING);
}

export function createFinalBoss() {
  const boss = makeBoss(FINAL);
  finalBosses.add(boss);
  return boss;
}

export function updateBoss(boss, dt) {
  if (boss.hp <= 0) return [];

  boss.flash = Math.max(0, boss.flash - dt);
  boss.cooldown = Math.max(0, boss.cooldown - dt);
  if (boss.cooldown > 0) return [];

  const profile = finalBosses.has(boss) ? FINAL : SPRING;
  boss.cooldown = profile.interval;
  const spacing = (2 * Math.PI) / profile.count;
  const offset = (boss.volley % 2) * spacing / 2;
  boss.volley += 1;

  return Array.from({ length: profile.count }, (_, index) => {
    const angle = offset + index * spacing;
    const shot = makeProjectile(boss.x, boss.y, angle, SHOT_SPEED, true, SHOT_DAMAGE);
    const distance = boss.r + shot.r;
    shot.x += Math.cos(angle) * distance;
    shot.y += Math.sin(angle) * distance;
    return shot;
  });
}

export function drawBoss(ctx, boss, seconds) {
  if (boss.hp <= 0) return;

  ctx.save();
  ctx.translate(boss.x, boss.y);
  if (!finalBosses.has(boss) && sprite?.complete && sprite.naturalWidth > 0) {
    const width = boss.r * 2.5;
    const height = width * sprite.naturalHeight / sprite.naturalWidth;
    ctx.imageSmoothingEnabled = false;
    if (boss.flash > 0) ctx.filter = 'brightness(1.7)';
    ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#69442d';
  ctx.fillRect(-10, 2, 20, boss.r - 5);

  const colors = finalBosses.has(boss)
    ? ['#de91a9', '#72b273', '#d89151', '#98cfe5']
    : ['#f4b8cc', '#dd769e', '#f6ced9', '#e78baa'];
  for (let index = 0; index < colors.length; index++) {
    const angle = index * Math.PI / 2 - Math.PI / 4;
    ctx.fillStyle = boss.flash > 0 ? '#fff5d8' : colors[index];
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 20, Math.sin(angle) * 20 - 7, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
