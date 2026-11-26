import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { makeProjectile } from '../src/projectile.js';

// Same shape main.js fills (#5). The aim points straight right of the start position.
function makeInput(overrides = {}) {
  return { keys: new Set(), aim: { x: 500, y: 270 }, firing: false, ...overrides };
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
