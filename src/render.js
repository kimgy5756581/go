// Draw order only (common rules section 3, Member 4).
// Each owner draws their own things. Until Member 1's drawPlayer and
// Member 3's drawRoom exist, this file draws simple stand-ins.
import { WIDTH, HEIGHT } from './game.js';

const COLORS = {
  background: '#1b2430', // stand-in for the room floor
  bullet: '#f2c14e',
  player: '#f3e9d2',
};

export function drawGame(ctx, game) {
  // 1. Room (temporary: plain background until drawRoom arrives)
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Bullets
  ctx.fillStyle = COLORS.bullet;
  for (const bullet of game.bullets) fillCircle(ctx, bullet.x, bullet.y, bullet.r);

  // 3. Player (temporary circle until drawPlayer arrives)
  const { player } = game;
  ctx.fillStyle = COLORS.player;
  fillCircle(ctx, player.x, player.y, player.r);
}

function fillCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
