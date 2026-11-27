import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBoss, createFinalBoss, updateBoss } from '../src/boss.js';

test('Tree of Seasons starts at 900 HP and fires 12 shots every 2.1 seconds', () => {
  const boss = createFinalBoss();
  assert.equal(boss.kind, 'boss');
  assert.equal(boss.hp, 900);
  assert.equal(boss.maxHp, 900);
  assert.equal(updateBoss(boss, 2).length, 0);
  const shots = updateBoss(boss, 0.11);
  assert.equal(shots.length, 12);
  shots.forEach((shot, index) => {
    const angle = index * Math.PI / 6;
    assert.equal(shot.enemy, true);
    assert.ok(Math.abs(shot.vx - 185 * Math.cos(angle)) < 1e-8);
    assert.ok(Math.abs(shot.vy - 185 * Math.sin(angle)) < 1e-8);
    assert.ok(Math.abs(Math.hypot(shot.x - boss.x, shot.y - boss.y) - (boss.r + shot.r)) < 1e-8);
  });
  assert.equal(updateBoss(boss, 2).length, 0);
  const next = updateBoss(boss, 0.11);
  assert.equal(next.length, 12);
  assert.ok(Math.abs(Math.atan2(next[0].vy, next[0].vx) - Math.PI / 12) < 1e-8);
  boss.hp = 0;
  assert.equal(updateBoss(boss, 10).length, 0);
});

test('the existing spring boss keeps its own health and volley pattern', () => {
  const boss = createBoss();
  assert.equal(boss.hp, 240);
  assert.equal(updateBoss(boss, 1.7).length, 8);
});
