// Game state and per-frame updates (Member 4).
// No DOM access here, so everything in this file can be tested with node --test.
import { createPlayer, updatePlayer } from './player.js';
import { updateProjectile } from './projectile.js';

export const WIDTH = 960;
export const HEIGHT = 540;

export class Game {
  constructor() {
    this.state = 'title'; // 'title' | 'playing' for now (#4, #5)
    this.reset();
  }

  // A fresh run: new player, no bullets, score back to 0.
  reset() {
    this.player = createPlayer();
    this.bullets = [];
    this.score = 0;
    this.blocks = []; // walls arrive with Member 3's room; empty until then (#5)
  }

  start() {
    this.reset();
    this.state = 'playing';
  }

  // input is the object main.js fills: { keys, aim, firing } (#5)
  update(dt, input) {
    if (this.state !== 'playing') return;

    const shot = updatePlayer(this.player, input, this.blocks, dt);
    if (shot) this.bullets.push(shot);

    for (const bullet of this.bullets) updateProjectile(bullet, dt, this.blocks);
    this.bullets = this.bullets.filter(isAlive);
  }
}

// A bullet stays while it has life left and is still on screen.
function isAlive(bullet) {
  return (
    bullet.life > 0 &&
    bullet.x > -bullet.r && bullet.x < WIDTH + bullet.r &&
    bullet.y > -bullet.r && bullet.y < HEIGHT + bullet.r
  );
}
