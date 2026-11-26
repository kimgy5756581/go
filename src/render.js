// Draw order only (common rules section 3, Member 4).
// Each owner draws their own things. Until Member 1's drawPlayer exists,
// the player is a simple circle drawn here.
import { WIDTH, HEIGHT } from './game.js';
import { drawRoom } from './rooms.js';
import { drawEnemy } from './enemy.js';
import { drawBoss } from './boss.js';

const COLORS = {
  bullet: '#f2c14e',
  enemyBullet: '#e86a6a',
  player: '#f3e9d2',
};

export function drawGame(ctx, game) {
  // 1. Room (floor, walls, exit, log, items). The room draws its own
  // things; render.js only sets the order (common rules section 3).
  drawRoom(ctx, { roomIndex: game.roomIndex, cleared: game.cleared, logsFound: [], items: game.items }, game.seconds);

  // 2. Enemies and the boss.
  for (const enemy of game.enemies) drawEnemy(ctx, enemy, game.seconds);
  if (game.boss) drawBoss(ctx, game.boss, game.seconds);

  // 3. Bullets: player shots in gold, enemy shots in red.
  for (const bullet of game.bullets) {
    ctx.fillStyle = bullet.enemy ? COLORS.enemyBullet : COLORS.bullet;
    fillCircle(ctx, bullet.x, bullet.y, bullet.r);
  }

  // 4. Player (temporary circle until drawPlayer arrives; blinks while invincible).
  const { player } = game;
  if (!(player.invincible > 0 && Math.floor(game.seconds * 10) % 2 === 0)) {
    ctx.fillStyle = COLORS.player;
    fillCircle(ctx, player.x, player.y, player.r);
  }

  // 5. Boss health bar, above the play area.
  if (game.boss && game.boss.hp > 0) {
    const barWidth = 300;
    const x = (WIDTH - barWidth) / 2;
    ctx.fillStyle = 'rgba(243, 233, 210, 0.25)';
    ctx.fillRect(x, 12, barWidth, 10);
    ctx.fillStyle = '#dd769e';
    ctx.fillRect(x, 12, barWidth * Math.max(0, game.boss.hp / game.boss.maxHp), 10);
  }

  // 6. Message (game over / victory / room cleared).
  if (game.message) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.message, WIDTH / 2, HEIGHT / 2);
    ctx.textAlign = 'left';
  }
}

function fillCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
