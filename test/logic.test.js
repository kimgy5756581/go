import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PLAY_AREA, blocked, resolveCircle } from '../src/logic.js';
import { roomBlocks } from '../src/rooms.js';

test('blocked: 빈 공간은 false, 벽에 닿으면 true', () => {
  const blocks = roomBlocks(0);
  assert.equal(blocked(480, 150, 12, blocks), false); // 꽃밭과 연못 사이 빈 공간
  assert.equal(blocked(45, 270, 12, blocks), true); // 왼쪽 벽
  assert.equal(blocked(915, 270, 12, blocks), true); // 오른쪽 벽
  assert.equal(blocked(480, 55, 12, blocks), true); // 위쪽 벽
  assert.equal(blocked(480, 485, 12, blocks), true); // 아래쪽 벽
});

test('blocked: 장애물에 겹치면 true, 경계에 닿으면 false', () => {
  const blocks = roomBlocks(0);
  // 가운데 연못 [430, 220, 100, 100]: 중심은 겹침, 바깥 경계는 안 닿음
  assert.equal(blocked(480, 270, 12, blocks), true);
  assert.equal(blocked(430 - 12, 270, 12, blocks), false);
  assert.equal(blocked(430 - 11, 270, 12, blocks), true);
});

test('resolveCircle: 장애물에 겹친 원을 밖으로 밀어낸다', () => {
  const blocks = roomBlocks(0);
  const entity = { x: 480, y: 270, r: 12 }; // 연못 한가운데
  assert.equal(blocked(entity.x, entity.y, entity.r, blocks), true);
  assert.equal(resolveCircle(entity, blocks), true);
  assert.equal(blocked(entity.x, entity.y, entity.r, blocks), false);
});

test('resolveCircle: 벽 밖으로 나간 원을 플레이 영역 안으로 돌려놓는다', () => {
  const blocks = roomBlocks(0);
  const entity = { x: 20, y: 270, r: 12 };
  assert.equal(resolveCircle(entity, blocks), true);
  assert.equal(entity.x, PLAY_AREA.x + entity.r);
  assert.equal(blocked(entity.x, entity.y, entity.r, blocks), false);
});

test('resolveCircle: 빈 공간에서는 움직이지 않고 false', () => {
  const blocks = roomBlocks(0);
  const entity = { x: 480, y: 150, r: 12 };
  assert.equal(resolveCircle(entity, blocks), false);
  assert.equal(entity.x, 480);
  assert.equal(entity.y, 150);
});
