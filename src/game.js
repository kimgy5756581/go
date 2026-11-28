// Game state and per-frame updates (Member 4).
// No DOM access here, so everything in this file can be tested with node --test.
//
// Wires together the four members' code: rooms (#3), chaser + boss (#2),
// items (#3), and the game loop (#4). The shooter enemy is not in main yet
// (its PR was closed unmerged), so only the chaser spawns for now.
// Music is not wired in: no mp3 files exist yet.
import { createPlayer, updatePlayer } from './player.js';
import { updateProjectile } from './projectile.js';
import { createEnemy, updateEnemy, enemyContact } from './enemy.js';
import { createBoss, updateBoss } from './boss.js';
import { ROOM_LAYOUTS, roomBlocks, spawnPosition } from './rooms.js';
import { applyItem } from './items.js';

export const WIDTH = 960;
export const HEIGHT = 540;
export const CONTACT_DAMAGE = 10;
export const HIT_INVINCIBLE = 0.85;
export const SCORE_CHASER = 100;
export const SCORE_BOSS = 1000;
const BOSS_ROOM_INDEX = ROOM_LAYOUTS.length - 1;

export class Game {
  // random: a function returning [0, 1). Tests pass a fixed one so spawns
  // are deterministic; the game uses Math.random by default.
  constructor(random = Math.random) {
    this.random = random;
    this.state = 'title'; // 'title' | 'playing' | 'over' | 'victory'
    this.seconds = 0;
    this.reset();
  }

  // A fresh run: new player, first room, score back to 0.
  reset() {
    this.player = createPlayer();
    this.bullets = [];
    this.score = 0;
    this.over = false;
    this.cleared = false;
    this.message = '';
    this.loadRoom(0);
  }

  // Set up one room: walls, enemies, items, and the boss in the last room.
  // The player keeps HP and upgrades across rooms; only the position resets.
  loadRoom(index) {
    const layout = ROOM_LAYOUTS[index];
    this.roomIndex = index;
    this.blocks = roomBlocks(index);
    this.player.x = layout.spawn.x;
    this.player.y = layout.spawn.y;
    this.enemies = [];
    for (let i = 0; i < layout.enemyCount; i++) {
      const pos = spawnPosition(this.random, this.player, this.blocks);
      this.enemies.push(createEnemy('chaser', pos.x, pos.y, index));
    }
    this.items = layout.itemSpots.map((spot) => ({ ...spot, taken: false }));
    this.boss = index === BOSS_ROOM_INDEX ? createBoss() : null;
    this.bullets = [];
    this.cleared = false;
  }

  start() {
    this.reset();
    this.state = 'playing';
  }

  // input is the object main.js fills: { keys, aim, firing } (#5)
  update(dt, input) {
    // After game over or victory, R starts a fresh run.
    if (this.state === 'over' || this.state === 'victory') {
      if (input.keys.has('KeyR')) this.start();
      return;
    }
    if (this.state !== 'playing') return;
    this.seconds += dt;

    // 1. Player move + shoot. updatePlayer returns a new bullet or null.
    const shot = updatePlayer(this.player, input, this.blocks, dt);
    if (shot) this.bullets.push(shot);

    // 2. Bullets move; drop the ones that expire or leave the screen.
    for (const bullet of this.bullets) updateProjectile(bullet, dt, this.blocks);
    this.bullets = this.bullets.filter(isAlive);

    // 3. The boss fires its volley; the shots join the same bullet list.
    if (this.boss) {
      const volley = updateBoss(this.boss, dt);
      for (const shot of volley) this.bullets.push(shot);
    }

    // 4. Player bullets hit enemies and the boss.
    for (const bullet of this.bullets) {
      if (bullet.enemy) continue;
      for (const enemy of this.enemies) {
        if (enemy.hp > 0 && hits(bullet, enemy)) {
          enemy.hp -= bullet.damage;
          enemy.flash = 0.15;
          bullet.life = 0;
          if (enemy.hp <= 0) this.score += SCORE_CHASER;
          break;
        }
      }
      if (bullet.life > 0 && this.boss && this.boss.hp > 0 && hits(bullet, this.boss)) {
        this.boss.hp -= bullet.damage;
        this.boss.flash = 0.15;
        bullet.life = 0;
        if (this.boss.hp <= 0) this.score += SCORE_BOSS;
      }
    }
    this.bullets = this.bullets.filter((b) => b.life > 0);
    this.enemies = this.enemies.filter((e) => e.hp > 0);

    // 5. Enemies chase; contact hurts the player (once per invincible window).
    for (const enemy of this.enemies) updateEnemy(enemy, this.player, this.blocks, dt);
    if (this.player.invincible <= 0) {
      for (const enemy of this.enemies) {
        if (enemyContact(enemy, this.player)) {
          this.hurtPlayer(CONTACT_DAMAGE);
          break;
        }
      }
      if (this.player.invincible <= 0 && this.boss && this.boss.hp > 0 &&
          hits(this.boss, this.player)) {
        this.hurtPlayer(CONTACT_DAMAGE);
      }
    }

    // 6. Enemy bullets hit the player.
    if (this.player.invincible <= 0) {
      for (const bullet of this.bullets) {
        if (bullet.enemy && hits(bullet, this.player)) {
          this.hurtPlayer(bullet.damage);
          bullet.life = 0;
          break;
        }
      }
      this.bullets = this.bullets.filter((b) => b.life > 0);
    }

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.state = 'over';
      this.over = true;
      this.message = 'Game Over — press R to restart';
      return;
    }

    // 7. Item pickups (fixed spots from rooms.js).
    for (const item of this.items) {
      if (item.taken) continue;
      if (Math.hypot(item.x - this.player.x, item.y - this.player.y) <= this.player.r + 10) {
        if (applyItem(this.player, item.id)) item.taken = true;
      }
    }

    // 8. Room cleared: no enemies left and the boss (if any) defeated.
    if (this.enemies.length === 0 && (!this.boss || this.boss.hp <= 0)) {
      this.cleared = true;
    }

    // 9. Boss defeated in the last room: the run is won.
    if (this.boss && this.boss.hp <= 0) {
      this.state = 'victory';
      this.message = 'The seasons return! Press R to play again';
      return;
    }

    // 10. Touching the open exit moves to the next room.
    if (this.cleared) {
      const exit = ROOM_LAYOUTS[this.roomIndex].exit;
      if (exit && touchesExit(this.player, exit)) {
        this.loadRoom(this.roomIndex + 1);
      }
    }
  }

  hurtPlayer(damage) {
    this.player.hp -= damage;
    this.player.invincible = HIT_INVINCIBLE;
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

// Two circles overlap (a bullet and an enemy, or the boss and the player).
function hits(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r;
}

// The player stands inside the exit rectangle.
function touchesExit(player, exit) {
  return (
    player.x + player.r > exit.x &&
    player.x - player.r < exit.x + exit.w &&
    player.y + player.r > exit.y &&
    player.y - player.r < exit.y + exit.h
  );
}
