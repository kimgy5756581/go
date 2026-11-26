// assets/boss/boss_front_idle_1.png: front idle sprite.
const sprite = typeof Image === 'function' ? new Image() : null;
if (sprite) sprite.src = new URL('../assets/boss/boss_front_idle_1.png', import.meta.url).href;

const MAX_HP = 240;
const VOLLEY_SIZE = 8;
const VOLLEY_INTERVAL = 1.7;
const SHOT_SPEED = 185;
const SHOT_DAMAGE = 14;

export function createBoss() {
  return { kind: 'boss', x: 740, y: 270, r: 48, hp: MAX_HP, maxHp: MAX_HP,
    cooldown: VOLLEY_INTERVAL, flash: 0, volley: 0 };
}

export function updateBoss(boss, dt) {
  if (boss.hp <= 0) return [];

  boss.flash = Math.max(0, boss.flash - dt);
  boss.cooldown = Math.max(0, boss.cooldown - dt);
  if (boss.cooldown > 0) return [];

  boss.cooldown = VOLLEY_INTERVAL;
  const spacing = (2 * Math.PI) / VOLLEY_SIZE;
  const offset = (boss.volley % 2) * spacing / 2;
  boss.volley += 1;

  return Array.from({ length: VOLLEY_SIZE }, (_, index) => {
    const angle = offset + index * spacing;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const r = 5;
    return { x: boss.x + dx * (boss.r + r), y: boss.y + dy * (boss.r + r),
      vx: dx * SHOT_SPEED, vy: dy * SHOT_SPEED, enemy: true, damage: SHOT_DAMAGE, r, life: 3.5 };
  });
}

export function drawBoss(ctx, boss, seconds) {
  if (boss.hp <= 0) return;

  ctx.save();
  ctx.translate(boss.x, boss.y);
  if (sprite?.complete && sprite.naturalWidth > 0) {
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

  const colors = ['#f4b8cc', '#dd769e', '#f6ced9', '#e78baa'];
  for (let index = 0; index < colors.length; index++) {
    const angle = index * Math.PI / 2 - Math.PI / 4;
    ctx.fillStyle = boss.flash > 0 ? '#fff5d8' : colors[index];
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 20, Math.sin(angle) * 20 - 7, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
