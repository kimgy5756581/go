import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnemy, updateEnemy, enemyContact } from '../src/enemy.js';

test('a chaser fits the 16 px spawn clearance and starts at the supplied position', () => {
  const enemy = createEnemy('chaser', 300, 200, 1);
  assert.equal(enemy.kind, 'chaser');
  assert.equal(enemy.x, 300);
  assert.equal(enemy.y, 200);
  assert.ok(enemy.r <= 16);
  assert.ok(enemy.hp > 0);
});

test('a chaser moves the same distance horizontally and diagonally', () => {
  const horizontal = createEnemy('chaser', 300, 200, 1);
  const diagonal = createEnemy('chaser', 300, 200, 1);
  assert.equal(updateEnemy(horizontal, { x: 500, y: 200 }, [], 1), null);
  updateEnemy(diagonal, { x: 500, y: 400 }, [], 1);
  assert.ok(horizontal.x > 300);
  assert.ok(diagonal.x > 300 && diagonal.y > 200);
  assert.ok(Math.abs(horizontal.x - 300 - Math.hypot(diagonal.x - 300, diagonal.y - 200)) < 1e-8);
});

test('a chaser stops at the target without overshooting', () => {
  const enemy = createEnemy('chaser', 300, 200, 1);
  const target = { x: 301, y: 200 };
  updateEnemy(enemy, target, [], 1);
  assert.equal(enemy.x, target.x);
  assert.equal(enemy.y, target.y);
});

test('a chaser cannot cross a thin obstacle even on a long update', () => {
  const enemy = createEnemy('chaser', 300, 270, 1);
  const wall = { x: 340, y: 200, w: 4, h: 140 };
  updateEnemy(enemy, { x: 600, y: 270 }, [wall], 3);
  assert.ok(enemy.x > 300);
  assert.ok(enemy.x + enemy.r <= wall.x);
});

test('a chaser stays inside the room boundary', () => {
  const enemy = createEnemy('chaser', 65, 270, 1);
  updateEnemy(enemy, { x: 0, y: 270 }, [], 1);
  assert.ok(enemy.x - enemy.r >= 40);
});

test('contact includes touching circles and excludes dead chasers', () => {
  const enemy = createEnemy('chaser', 300, 200, 1);
  const player = { x: 300 + enemy.r + 12, y: 200, r: 12 };
  assert.equal(enemyContact(enemy, player), true);
  player.x += 1;
  assert.equal(enemyContact(enemy, player), false);
  player.x = enemy.x;
  enemy.hp = 0;
  assert.equal(enemyContact(enemy, player), false);
  updateEnemy(enemy, { x: 500, y: 200 }, [], 1);
  assert.equal(enemy.x, 300);
});

test('a chaser clears its hit flash as time passes', () => {
  const enemy = createEnemy('chaser', 300, 200, 1);
  enemy.flash = 0.2;
  updateEnemy(enemy, { x: 300, y: 200 }, [], 0.3);
  assert.equal(enemy.flash, 0);
});
