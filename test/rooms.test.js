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

test('방 목록: 계절마다 잡몹존 1개 + 보스방 1개씩 4계절(8개). 겨울 보스방이 마지막', () => {
  assert.equal(ROOM_LAYOUTS.length, 8);
  const spring = ROOM_LAYOUTS[0];
  assert.equal(spring.name, 'Garden in Bloom');
  assert.equal(spring.season, 'spring');
  assert.equal(spring.musicId, 'spring');
  assert.equal(spring.enemyCount, 9);
  // 잡몹존 적 수: 봄 9, 여름 11, 가을 13, 겨울 15. 보스방 4곳은 적이 없다.
  assert.deepEqual([0, 2, 4, 6].map((i) => ROOM_LAYOUTS[i].enemyCount), [9, 11, 13, 15]);
  assert.deepEqual([1, 3, 5, 7].map((i) => ROOM_LAYOUTS[i].enemyCount), [0, 0, 0, 0]);
  // 보스방 4곳은 적이 없고, 봄 보스방에만 봄 보스가 있다.
  assert.deepEqual(
    ROOM_LAYOUTS.map((l) => l.boss),
    [null, 'spring', null, null, null, null, null, null],
  );
  assert.equal(ROOM_LAYOUTS[7].name, 'Silent Ice Hall');
});

test('모든 방 장애물: 전부 플레이 영역 안에 있고 서로 겹치지 않는다', () => {
  for (let i = 0; i < ROOM_LAYOUTS.length; i++) {
    const blocks = roomBlocks(i);
    for (const b of blocks) {
      assert.ok(b.w > 0 && b.h > 0, `room ${i}: bad block ${JSON.stringify(b)}`);
      assert.ok(insidePlayArea(b), `room ${i}: block outside play area: ${JSON.stringify(b)}`);
    }
    for (let a = 0; a < blocks.length; a++) {
      for (let c = a + 1; c < blocks.length; c++) {
        assert.ok(!overlaps(blocks[a], blocks[c]),
          `room ${i}: blocks overlap: ${a} and ${c}`);
      }
    }
  }
});

test('모든 방 시작 위치·출구·기록·아이템 자리: 영역 안에 있고 장애물과 안 겹친다', () => {
  for (let i = 0; i < ROOM_LAYOUTS.length; i++) {
    const layout = ROOM_LAYOUTS[i];
    const blocks = roomBlocks(i);
    const points = [
      { ...layout.spawn, w: 24, h: 24 },
      ...(layout.exit ? [{ ...layout.exit }] : []),
      ...(layout.log
        ? [{ x: layout.log.x - 8, y: layout.log.y - 11, w: 16, h: 22 }]
        : []),
      ...layout.itemSpots.map((s) => ({ x: s.x - 5, y: s.y - 5, w: 10, h: 10 })),
    ];
    for (const p of points) {
      assert.ok(insidePlayArea(p), `room ${i}: point outside play area: ${JSON.stringify(p)}`);
      for (const b of blocks) {
        assert.ok(!overlaps(p, b), `room ${i}: point overlaps block: ${JSON.stringify(p)}`);
      }
    }
  }
});

test('봄 보스 출현 자리(740, 270)는 1번 방 장애물과 안 겹친다', () => {
  const boss = { x: 740 - 48, y: 270 - 48, w: 96, h: 96 };
  for (const b of roomBlocks(1)) {
    assert.ok(!overlaps(boss, b), `boss spawn overlaps block: ${JSON.stringify(b)}`);
  }
});

test('roomBlocks: 보스 방은 마지막 인덱스, 모르는 인덱스는 에러', () => {
  assert.deepEqual(roomBlocks(0, true), roomBlocks(ROOM_LAYOUTS.length - 1));
  assert.ok(roomBlocks(ROOM_LAYOUTS.length - 1).length > 0);
  assert.throws(() => roomBlocks(99), /unknown room layout/);
  assert.equal(roomLayout(0).season, 'spring');
});

test('spawnPosition: 모든 방에서 플레이어와 230 이상 떨어지고 장애물 안에 안 들어간다', () => {
  const player = { x: 110, y: 270 };
  for (let i = 0; i < ROOM_LAYOUTS.length; i++) {
    const blocks = roomBlocks(i);
    for (let n = 0; n < 50; n++) {
      const pos = spawnPosition(mulberry32(i * 100 + n + 1), player, blocks);
      assert.ok(pos, `room ${i}: spawnPosition returned null`);
      assert.ok(Math.hypot(pos.x - player.x, pos.y - player.y) >= 230,
        `room ${i}: too close: ${JSON.stringify(pos)}`);
      for (const b of blocks) {
        const inside = pos.x > b.x - 16 && pos.x < b.x + b.w + 16 &&
          pos.y > b.y - 16 && pos.y < b.y + b.h + 16;
        assert.ok(!inside, `room ${i}: spawn inside block: ${JSON.stringify(pos)}`);
      }
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

test('drawRoom: 모든 방을 가짜 캔버스로 그려도 에러가 안 나고 바닥을 칠한다', () => {
  for (let i = 0; i < ROOM_LAYOUTS.length; i++) {
    let fillRectCalls = 0;
    const ctx = { fillStyle: '', fillRect() { fillRectCalls++; } };
    drawRoom(ctx, { roomIndex: i, cleared: false, logsFound: [] }, 0);
    assert.ok(fillRectCalls > 0, `room ${i}: drawRoom drew nothing`);
    // 방을 비운 상태에서도, 기록을 이미 읽은 상태에서도 그려진다.
    drawRoom(ctx, { roomIndex: i, cleared: true, logsFound: [1, 2, 3] }, 1.5);
  }
});

test('drawRoom: 먹은 아이템은 안 그리고, 안 먹은 아이템만 그린다', () => {
  const rects = [];
  const ctx = { fillStyle: '', fillRect(x, y, w, h) { rects.push([x, y, w, h]); } };
  const items = [
    { id: 'repair-kit', x: 480, y: 110, taken: false },
    { id: 'power-cell', x: 480, y: 430, taken: true },
    { id: 'rapid-core', x: 480, y: 160, taken: false },
  ];
  drawRoom(ctx, { roomIndex: 0, cleared: false, logsFound: [], items }, 0);
  // 안 먹은 수리 키트(480, 110)는 12x12로 그려진다.
  assert.ok(rects.some(([x, y, w, h]) => x === 474 && y === 104 && w === 12 && h === 12),
    'untaken item not drawn');
  // 안 먹은 신속 코어(480, 160)도 그려진다.
  assert.ok(rects.some(([x, y, w, h]) => x === 474 && y === 154 && w === 12 && h === 12),
    'untaken rapid-core not drawn');
  // 먹은 파워 셀(480, 430) 자리에는 아무것도 그려지지 않는다.
  assert.ok(!rects.some(([x, y]) => x === 474 && y === 424),
    'taken item still drawn');
});
