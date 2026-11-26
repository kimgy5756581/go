import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnemy, enemyProjectileHit, updateEnemy } from '../src/enemy.js';

test('the shooter stays in place and fires toward the current player on cooldown', () => {
  const shooter = createEnemy('shooter', 300, 220, 1);
  const player = { x: 420, y: 220, r: 12 };
  assert.ok(shooter.r <= 16);
  assert.equal(updateEnemy(shooter, player, [], 0.5), null);
  player.x = 300;
  player.y = 360;
  const shot = updateEnemy(shooter, player, [], 1);
  assert.equal(shot.enemy, true);
  assert.ok(Math.abs(shot.vx) < 1e-8);
  assert.ok(shot.vy > 0 && shot.damage > 0);
  assert.deepEqual([shooter.x, shooter.y], [300, 220]);
  assert.equal(updateEnemy(shooter, player, [], 0.5), null);
});

test('shooters cannot fire while dead or at an undefined aim angle', () => {
  const shooter = createEnemy('shooter', 300, 220, 1);
  const player = { x: 300, y: 220 };
  assert.equal(updateEnemy(shooter, player, [], 2), null);
  player.x += 50;
  shooter.hp = 0;
  assert.equal(updateEnemy(shooter, player, [], 2), null);
});

test('only live hostile projectiles that touch the player count as hits', () => {
  const player = { x: 300, y: 220, r: 12 };
  const shot = { x: 317, y: 220, r: 5, life: 1, enemy: true };
  assert.equal(enemyProjectileHit(shot, player), true);
  assert.equal(enemyProjectileHit({ ...shot, x: 318 }, player), false);
  assert.equal(enemyProjectileHit({ ...shot, enemy: false }, player), false);
  assert.equal(enemyProjectileHit({ ...shot, life: 0 }, player), false);
});
