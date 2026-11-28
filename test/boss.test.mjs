import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoss, updateBoss } from '../src/boss.js';

test('the boss starts with 240 HP and an opening delay', () => {
  const boss = createBoss();
  assert.equal(boss.kind, 'boss');
  assert.equal(boss.hp, 240);
  assert.equal(boss.maxHp, boss.hp);
  assert.deepEqual(updateBoss(boss, 0.5), []);
});

test('the boss fires 8 evenly spaced hostile shots and offsets its next volley', () => {
  const boss = createBoss();
  const first = updateBoss(boss, 2);
  assert.equal(first.length, 8);
  for (const [index, shot] of first.entries()) {
    const angle = index * Math.PI / 4;
    assert.equal(shot.enemy, true);
    assert.ok(shot.damage > 0 && shot.life > 0);
    assert.ok(Math.abs(Math.hypot(shot.x - boss.x, shot.y - boss.y) - (boss.r + shot.r)) < 1e-8);
    assert.ok(Math.abs(shot.vx / 185 - Math.cos(angle)) < 1e-8);
    assert.ok(Math.abs(shot.vy / 185 - Math.sin(angle)) < 1e-8);
  }
  assert.deepEqual(updateBoss(boss, 0.5), []);
  const second = updateBoss(boss, 2);
  assert.equal(second.length, 8);
  assert.ok(Math.abs(Math.atan2(second[0].vy, second[0].vx) - Math.PI / 8) < 1e-8);
});

test('a dead boss stops firing and a living boss clears its hit flash', () => {
  const boss = createBoss();
  boss.flash = 0.2;
  updateBoss(boss, 0.3);
  assert.equal(boss.flash, 0);
  boss.hp = 0;
  assert.deepEqual(updateBoss(boss, 10), []);
});
