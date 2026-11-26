import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPlayer, updatePlayer } from '../src/player.js';
import { roomBlocks } from '../src/rooms.js';
import { blocked } from '../src/logic.js';

function input(keys, firing = false) {
  return { keys: new Set(keys), firing, aim: { x: 0, y: 0 } };
}

test('updatePlayer: 장애물을 통과하지 않는다 — 연못 앞에서 멈춘다', () => {
  const blocks = roomBlocks(0);
  const player = createPlayer();
  // 연못 [430, 220, 100, 100] 왼쪽에서 오른쪽으로 걷는다. y=270은 연못 가운데 높이.
  player.x = 400;
  player.y = 270;
  for (let i = 0; i < 120; i++) {
    updatePlayer(player, input(['KeyD']), blocks, 1 / 60);
    assert.equal(blocked(player.x, player.y, player.r, blocks), false,
      `player entered a block at (${player.x}, ${player.y})`);
  }
  // 연못 왼쪽 경계(430)에서 반지름만큼 멈춘다.
  assert.ok(player.x <= 430 - player.r + 0.001, `player.x = ${player.x}`);
  assert.ok(player.x > 400, 'player did not move');
});

test('updatePlayer: 벽을 따라 미끄러진다 — 세로 벽에 붙어 아래로 계속 간다', () => {
  // 플레이 영역을 위아래로 가로지르는 세로 벽. 돌아갈 수 없다.
  const blocks = [{ x: 430, y: 48, w: 40, h: 444 }];
  const player = createPlayer();
  player.x = 400;
  player.y = 270;
  for (let i = 0; i < 120; i++) {
    // 오른쪽+아래 대각선으로 걷는다.
    updatePlayer(player, input(['KeyD', 'KeyS']), blocks, 1 / 60);
    assert.equal(blocked(player.x, player.y, player.r, blocks), false,
      `player entered a block at (${player.x}, ${player.y})`);
  }
  // x는 벽(430)에서 반지름만큼 멈추고, y는 아래로 미끄러져 계속 간다.
  assert.ok(player.x <= 430 - player.r + 0.001, `player.x = ${player.x}`);
  assert.ok(player.y > 400, `player.y = ${player.y}`);
});

test('updatePlayer: 장애물이 없으면 자유롭게 움직인다', () => {
  const player = createPlayer();
  updatePlayer(player, input(['KeyD']), [], 1);
  assert.equal(player.x, 110 + 185);
  assert.equal(player.y, 270);
});

test('updatePlayer: 플레이 영역 밖으로 나가지 않는다', () => {
  const player = createPlayer();
  player.x = 900;
  player.y = 270;
  for (let i = 0; i < 60; i++) {
    updatePlayer(player, input(['KeyD']), [], 1 / 60);
  }
  assert.ok(player.x <= 920 - player.r, `player.x = ${player.x}`);
});
