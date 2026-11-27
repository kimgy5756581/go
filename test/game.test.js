import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { makeProjectile } from '../src/projectile.js';

// Same shape main.js fills (#5). The aim points straight right of the start position.
function makeInput(overrides = {}) {
  return { keys: new Set(), aim: { x: 500, y: 270 }, firing: false, ...overrides };
}

// Deterministic random for tests, so enemy spawns don't depend on luck.
function seededRandom(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('a new game waits on the title screen', () => {
  const game = new Game();
  assert.equal(game.state, 'title');
});

test('start() switches to playing with a fresh run', () => {
  const game = new Game();
  game.score = 50;
  game.player.hp = 10; // damaged, so the test can see whether start() restores it
  game.bullets.push(makeProjectile(480, 270, 0, 0, false, 20));

  game.start();

  assert.equal(game.state, 'playing');
  assert.equal(game.score, 0);
  assert.equal(game.bullets.length, 0);
  assert.equal(game.player.hp, game.player.maxHp);
});

test('nothing moves or fires on the title screen', () => {
  const game = new Game();
  const { x, y } = game.player;

  game.update(0.1, makeInput({ keys: new Set(['KeyD']), firing: true }));

  assert.equal(game.player.x, x);
  assert.equal(game.player.y, y);
  assert.equal(game.bullets.length, 0);
});

test('holding fire while playing adds a bullet', () => {
  const game = new Game();
  game.start();

  game.update(0.016, makeInput({ firing: true }));

  assert.equal(game.bullets.length, 1);
});

test('a bullet whose life runs out is removed', () => {
  const game = new Game();
  game.start();
  const bullet = makeProjectile(480, 270, 0, 0, false, 20); // standing still
  bullet.life = 0.01;
  game.bullets.push(bullet);

  game.update(0.05, makeInput());

  assert.equal(game.bullets.length, 0);
});

test('a bullet that leaves the screen is removed', () => {
  const game = new Game();
  game.start();
  game.bullets.push(makeProjectile(950, 270, 0, 520, false, 20)); // flying right

  game.update(0.05, makeInput()); // moves 26 px, past the right edge

  assert.equal(game.bullets.length, 0);
});

test('start() loads the first room with 9 enemies', () => {
  const game = new Game(seededRandom());
  game.start();

  assert.equal(game.roomIndex, 0);
  assert.equal(game.enemies.length, 9);
  assert.equal(game.boss, null);
});

test('clearing a room and touching the exit moves to the next room', () => {
  const game = new Game(seededRandom());
  game.start();
  game.enemies = []; // room cleared
  game.player.x = 900; // inside the exit (884-920, 230-310)
  game.player.y = 270;

  game.update(0.016, makeInput());

  assert.equal(game.roomIndex, 1); // spring boss room: no chasers, boss waits
  assert.equal(game.enemies.length, 0);
  assert.equal(game.boss.hp, 240);
  assert.equal(game.player.x, 110); // back at the next room's entrance
});

test('defeating the spring boss opens the exit to the summer mob zone', () => {
  const game = new Game(seededRandom());
  game.start();
  game.loadRoom(1);
  game.boss.hp = 20; // one shot kills
  game.bullets.push(makeProjectile(game.boss.x, game.boss.y, 0, 0, false, 20));

  game.update(0.016, makeInput());

  assert.equal(game.state, 'playing'); // mid-game boss: no victory yet
  assert.equal(game.cleared, true);
  game.player.x = 900;
  game.player.y = 270;
  game.update(0.016, makeInput());
  assert.equal(game.roomIndex, 2);
  assert.equal(game.enemies.length, 11);
});

test('the spring and winter boss rooms spawn distinct bosses', () => {
  const game = new Game(seededRandom());
  game.loadRoom(1);

  assert.equal(game.boss.hp, 240);
  assert.equal(game.boss.maxHp, 240);
  assert.equal(game.enemies.length, 0);

  // TODO: the winter boss is not made yet.
  game.loadRoom(7);
  assert.equal(game.boss.hp, 900);
  assert.equal(game.enemies.length, 0);
});

test('defeating a chaser scores 100', () => {
  const game = new Game(seededRandom());
  game.start();
  const enemy = game.enemies[0];
  enemy.hp = 20; // one shot kills
  game.bullets.push(makeProjectile(enemy.x, enemy.y, 0, 0, false, 20));

  game.update(0.016, makeInput());

  assert.equal(game.score, 100);
  assert.equal(game.enemies.length, 8);
});

test('the boss fires a volley after 1.7 seconds', () => {
  const game = new Game(seededRandom());
  game.start();
  game.loadRoom(1);

  game.update(1.7, makeInput());

  const enemyShots = game.bullets.filter((b) => b.enemy);
  assert.equal(enemyShots.length, 8);
});

test('an enemy bullet hurts the player', () => {
  const game = new Game(seededRandom());
  game.start();
  game.enemies = []; // no chasers to interfere
  game.bullets.push(makeProjectile(game.player.x, game.player.y, 0, 0, true, 14));

  game.update(0.016, makeInput());

  assert.equal(game.player.hp, 86);
  assert.equal(game.bullets.length, 0);
});

test('defeating the winter boss wins the run', () => {
  const game = new Game(seededRandom());
  game.start();
  game.loadRoom(7);
  game.boss.hp = 0;
  game.update(0, makeInput());
  assert.equal(game.state, 'victory');
});

test('game over on 0 HP, and R restarts', () => {
  const game = new Game(seededRandom());
  game.start();
  game.player.hp = 5;
  game.enemies = [];
  game.bullets.push(makeProjectile(game.player.x, game.player.y, 0, 0, true, 14));

  game.update(0.016, makeInput());

  assert.equal(game.state, 'over');
  assert.equal(game.message, 'Game Over — press R to restart');

  game.update(0.016, makeInput({ keys: new Set(['KeyR']) }));

  assert.equal(game.state, 'playing');
  assert.equal(game.player.hp, 100);
  assert.equal(game.roomIndex, 0);
});
