import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_LAYOUTS, PLAY_AREA, roomLayout, roomBlocks, spawnPosition, drawRoom } from '../src/rooms.js';

// 고정 시드 난수. 같은 시드면 같은 수열이 나온다.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function insidePlayArea(rect) {
  return (
    rect.x >= PLAY_AREA.x && rect.y >= PLAY_AREA.y &&
    rect.x + rect.w <= PLAY_AREA.x + PLAY_AREA.w &&
    rect.y + rect.h <= PLAY_AREA.y + PLAY_AREA.h
  );
}

test('봄 방 레이아웃: 이름·계절·브금·적 수가 정해져 있다', () => {
  assert.equal(ROOM_LAYOUTS.length, 5);
  const spring = ROOM_LAYOUTS[0];
  assert.equal(spring.name, 'Garden in Bloom');
  assert.equal(spring.season, 'spring');
  assert.equal(spring.musicId, 'spring');
  assert.equal(spring.enemyCount, 9);
});

test('봄 방 장애물: 전부 플레이 영역 안에 있고 서로 겹치지 않는다', () => {
  const blocks = roomBlocks(0);
  assert.ok(blocks.length > 0);
  for (const b of blocks) {
    assert.ok(b.w > 0 && b.h > 0);
    assert.ok(insidePlayArea(b), `block outside play area: ${JSON.stringify(b)}`);
  }
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      assert.ok(!overlaps(blocks[i], blocks[j]), `blocks overlap: ${i} and ${j}`);
    }
  }
});

test('봄 방 시작 위치·출구·기록·아이템 자리: 영역 안에 있고 장애물과 안 겹친다', () => {
  const spring = ROOM_LAYOUTS[0];
  const blocks = roomBlocks(0);
  const points = [
    { ...spring.spawn, w: 24, h: 24 },
    { ...spring.exit },
    { x: spring.log.x - 8, y: spring.log.y - 11, w: 16, h: 22 },
    ...spring.itemSpots.map((s) => ({ x: s.x - 5, y: s.y - 5, w: 10, h: 10 })),
  ];
  for (const p of points) {
    assert.ok(insidePlayArea(p), `point outside play area: ${JSON.stringify(p)}`);
    for (const b of blocks) {
      assert.ok(!overlaps(p, b), `point overlaps block: ${JSON.stringify(p)}`);
    }
  }
});

test('roomBlocks: 보스 방은 인덱스 4, 모르는 인덱스는 에러', () => {
  assert.deepEqual(roomBlocks(4, true), []);
  assert.throws(() => roomBlocks(99), /unknown room layout/);
  assert.equal(roomLayout(0).season, 'spring');
});

test('spawnPosition: 플레이어와 230 이상 떨어지고 장애물 안에 안 들어간다', () => {
  const player = { x: 110, y: 270 };
  const blocks = roomBlocks(0);
  for (let n = 0; n < 200; n++) {
    const pos = spawnPosition(mulberry32(n + 1), player, blocks);
    assert.ok(pos, 'spawnPosition returned null');
    assert.ok(Math.hypot(pos.x - player.x, pos.y - player.y) >= 230,
      `too close: ${JSON.stringify(pos)}`);
    for (const b of blocks) {
      const inside = pos.x > b.x - 16 && pos.x < b.x + b.w + 16 &&
        pos.y > b.y - 16 && pos.y < b.y + b.h + 16;
      assert.ok(!inside, `spawn inside block: ${JSON.stringify(pos)}`);
    }
  }
});

test('spawnPosition: 같은 시드면 같은 위치가 나온다', () => {
  const player = { x: 110, y: 270 };
  const blocks = roomBlocks(0);
  const a = spawnPosition(mulberry32(42), player, blocks);
  const b = spawnPosition(mulberry32(42), player, blocks);
  assert.deepEqual(a, b);
});

test('drawRoom: 가짜 캔버스로 그려도 에러가 안 나고 바닥을 칠한다', () => {
  let fillRectCalls = 0;
  const ctx = { fillStyle: '', fillRect() { fillRectCalls++; } };
  drawRoom(ctx, { roomIndex: 0, cleared: false, logsFound: [] }, 0);
  assert.ok(fillRectCalls > 0, 'drawRoom drew nothing');
  // 방을 비운 상태에서도, 기록을 이미 읽은 상태에서도 그려진다.
  drawRoom(ctx, { roomIndex: 0, cleared: true, logsFound: [1] }, 1.5);
});
