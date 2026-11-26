import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, applyItem } from '../src/items.js';

test('아이템은 3종 고정이다', () => {
  assert.deepEqual(ITEMS.map((it) => it.id), ['repair-kit', 'power-cell', 'rapid-core']);
});

test('수리 키트: 체력 40 회복, 최대 체력을 안 넘는다', () => {
  const player = { hp: 50, maxHp: 100, damage: 20, fireInterval: 0.3 };
  assert.equal(applyItem(player, 'repair-kit'), true);
  assert.equal(player.hp, 90);
  assert.equal(applyItem(player, 'repair-kit'), true);
  assert.equal(player.hp, 100); // 130이 아니라 100에서 멈춘다
});

test('수리 키트: 체력이 이미 가득 차면 효과 없고 false', () => {
  const player = { hp: 100, maxHp: 100, damage: 20, fireInterval: 0.3 };
  assert.equal(applyItem(player, 'repair-kit'), false);
  assert.equal(player.hp, 100);
});

test('파워 셀: 공격력 +8', () => {
  const player = { hp: 100, maxHp: 100, damage: 20, fireInterval: 0.3 };
  assert.equal(applyItem(player, 'power-cell'), true);
  assert.equal(player.damage, 28);
});

test('신속 코어: 발사 간격 x0.8, 최소 0.1초에서 멈춘다', () => {
  const player = { hp: 100, maxHp: 100, damage: 20, fireInterval: 0.3 };
  assert.equal(applyItem(player, 'rapid-core'), true);
  assert.equal(player.fireInterval, 0.24);
  player.fireInterval = 0.12;
  applyItem(player, 'rapid-core');
  assert.equal(player.fireInterval, 0.1); // 0.096이 아니라 0.1에서 멈춘다
});

test('없는 아이템 id면 false', () => {
  const player = { hp: 50, maxHp: 100, damage: 20, fireInterval: 0.3 };
  assert.equal(applyItem(player, 'nope'), false);
  assert.equal(player.hp, 50);
});
