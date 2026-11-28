// rooms.js — 3번(방·아이템·브금) 소유. 방 데이터와 그리기.
// 계약(공통 규칙 2.3절·2.4절): ROOM_LAYOUTS, roomBlocks, spawnPosition, drawRoom.
// 방 데이터 모양은 3번이 정한다(2.4절). 계약의 기본 4개 필드(name, season, blocks, musicId)에
// exit / spawn / log / itemSpots / enemyCount를 더했다. game.js는 이 모양만 읽는다.

// 화면 960x540. 플레이 영역(벽 안쪽): x 40~920, y 48~492.
export const PLAY_AREA = { x: 40, y: 48, w: 880, h: 444 };

// 방 순서: 스토리 순서대로 고정. 봄 → 여름 → 가을 → 겨울 → 보스(계절의 나무).
// 기록은 1·3·5번 방에 1개씩, 총 3개. 위치는 여기서 정하고 텍스트는 story.js(4번)가 맡는다.
export const ROOM_LAYOUTS = [
  {
    name: 'Garden in Bloom',
    season: 'spring',
    musicId: 'spring',
    enemyCount: 9,
    // 왼쪽 입구. createPlayer() 시작 위치(110, 270)와 같다.
    spawn: { x: 110, y: 270 },
    // 오른쪽 벽의 문. 적을 모두 정화하면 열린다.
    exit: { x: 884, y: 230, w: 36, h: 80 },
    // 스승의 기록 1번. 텍스트는 story.js.
    log: { id: 1, x: 820, y: 110 },
    // 고정 아이템 자리 2곳. 나머지 1종은 적 처치 드롭으로 나온다.
    itemSpots: [
      { id: 'repair-kit', x: 480, y: 110 },
      { id: 'power-cell', x: 480, y: 430 },
    ],
    // 수제 맵. [x, y, w, h] — 꽃밭 4곳 + 가운데 연못 + 낮은 화단 2곳.
    // 왼쪽 세로 길(x 40~170)은 입구에서 시작하는 통로라 비워 둔다.
    blocks: [
      [180, 90, 140, 60], // 왼쪽 위 꽃밭
      [640, 90, 140, 60], // 오른쪽 위 꽃밭
      [430, 220, 100, 100], // 가운데 연못
      [180, 390, 140, 60], // 왼쪽 아래 울타리
      [640, 390, 140, 60], // 오른쪽 아래 울타리
      [340, 250, 40, 40], // 낮은 화단(왼쪽 엄폐물)
      [580, 250, 40, 40], // 낮은 화단(오른쪽 엄폐물)
    ],
  },
  // TODO: 2~5번 방은 각 방 이슈에서 채운다. 이름·계절·브금·적 수만 먼저 정해 둔다.
  { name: 'Waterlight Greenhouse', season: 'summer', musicId: 'summer', enemyCount: 11, spawn: { x: 110, y: 270 }, exit: { x: 884, y: 230, w: 36, h: 80 }, log: null, itemSpots: [], blocks: [] },
  { name: 'Fallen Leaf Forest', season: 'autumn', musicId: 'autumn', enemyCount: 13, spawn: { x: 110, y: 270 }, exit: { x: 884, y: 230, w: 36, h: 80 }, log: { id: 2, x: 820, y: 110 }, itemSpots: [], blocks: [] },
  { name: 'Frozen Courtyard', season: 'winter', musicId: 'winter', enemyCount: 15, spawn: { x: 110, y: 270 }, exit: { x: 884, y: 230, w: 36, h: 80 }, log: null, itemSpots: [], blocks: [] },
  { name: 'The Season Tree', season: 'boss', musicId: 'boss', enemyCount: 0, spawn: { x: 110, y: 270 }, exit: null, log: { id: 3, x: 820, y: 110 }, itemSpots: [], blocks: [] },
];

export function roomLayout(layoutIndex) {
  const layout = ROOM_LAYOUTS[layoutIndex];
  if (!layout) throw new Error(`unknown room layout: ${layoutIndex}`);
  return layout;
}

// layoutIndex번 방의 장애물을 block[]({x, y, w, h})로 돌려준다.
// bossRoom이 true면 보스 방 레이아웃(인덱스 4)을 쓴다.
export function roomBlocks(layoutIndex, bossRoom = false) {
  const index = bossRoom ? ROOM_LAYOUTS.length - 1 : layoutIndex;
  return roomLayout(index).blocks.map(([x, y, w, h]) => ({ x, y, w, h }));
}

// 적 출현 위치를 뽑는다. 조건(2.3절): 플레이어와 230 이상 떨어지고,
// 벽·장애물과 겹치지 않을 것. 100번 시도 후에는 가장 먼 예비 위치를 반환한다.
// random: [0, 1)을 돌려주는 함수. 테스트에서 고정 시드를 넣으면 결정적으로 돈다.
export function spawnPosition(random, player, blocks) {
  const MARGIN = 16; // 적 반지름 여유
  const MIN_DIST = 230;
  let best = null;
  let bestDist = -1;
  for (let i = 0; i < 100; i++) {
    const x = PLAY_AREA.x + MARGIN + random() * (PLAY_AREA.w - MARGIN * 2);
    const y = PLAY_AREA.y + MARGIN + random() * (PLAY_AREA.h - MARGIN * 2);
    const dist = Math.hypot(x - player.x, y - player.y);
    const insideBlock = blocks.some(
      (b) =>
        x > b.x - MARGIN && x < b.x + b.w + MARGIN &&
        y > b.y - MARGIN && y < b.y + b.h + MARGIN,
    );
    if (!insideBlock && dist > bestDist) {
      best = { x, y };
      bestDist = dist;
      if (dist >= MIN_DIST) return best;
    }
  }
  return best;
}

// 방 그리기: 바닥·장애물·출구·기록 조각·아이템. render.js의 drawGame이 방부터 부른다.
// game: { roomIndex, cleared, logsFound, items } — items가 없으면 안 그린다.
// 색상은 컨셉 시트 16색 팔레트 HEX가 확정되면 그때 교체한다(임시 색상).
export function drawRoom(ctx, game = {}, seconds = 0) {
  const layout = roomLayout(game.roomIndex ?? 0);

  // 바닥: 정원 잔디
  ctx.fillStyle = '#2e4d2f';
  ctx.fillRect(0, 0, 960, 540);

  // 플레이 영역 테두리(돌담)
  ctx.fillStyle = '#5a5348';
  ctx.fillRect(PLAY_AREA.x - 8, PLAY_AREA.y - 8, PLAY_AREA.w + 16, 8);
  ctx.fillRect(PLAY_AREA.x - 8, PLAY_AREA.y + PLAY_AREA.h, PLAY_AREA.w + 16, 8);
  ctx.fillRect(PLAY_AREA.x - 8, PLAY_AREA.y - 8, 8, PLAY_AREA.h + 16);
  ctx.fillRect(PLAY_AREA.x + PLAY_AREA.w, PLAY_AREA.y - 8, 8, PLAY_AREA.h + 16);

  // 장애물: 꽃밭(짙은 초록 + 꽃 점), 연못(파랑)
  for (const [x, y, w, h] of layout.blocks) {
    const isPond = w === 100 && h === 100;
    ctx.fillStyle = isPond ? '#3d7a8c' : '#3a6b35';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = isPond ? '#7fc4d6' : '#e8a2c0';
    // 장식 점 3개. 위치는 블록 안에서 고정(깜빡이지 않게).
    ctx.fillRect(x + 12, y + 12, 6, 6);
    ctx.fillRect(x + w - 18, y + h - 18, 6, 6);
    ctx.fillRect(x + w / 2 - 3, y + h / 2 - 3, 6, 6);
  }

  // 출구: 방을 비우면 빛난다.
  if (layout.exit) {
    const open = game.cleared === true;
    const pulse = 0.6 + 0.4 * Math.sin(seconds * 3);
    ctx.fillStyle = open ? `rgba(255, 230, 150, ${pulse})` : '#8a7a4a';
    ctx.fillRect(layout.exit.x, layout.exit.y, layout.exit.w, layout.exit.h);
  }

  // 스승의 기록 조각: 아직 읽지 않았을 때만 보인다.
  if (layout.log && !(game.logsFound || []).includes(layout.log.id)) {
    const pulse = 0.6 + 0.4 * Math.sin(seconds * 2);
    ctx.fillStyle = `rgba(255, 245, 200, ${pulse})`;
    ctx.fillRect(layout.log.x - 8, layout.log.y - 11, 16, 22);
  }

  // 아이템: 아직 바닥에 있는 것만 그린다. 먹은 자리는 표시도 남기지 않는다.
  // render.js가 game.items를 넘긴다. items가 없으면(예: 오래된 호출) 안 그린다.
  for (const item of game.items || []) {
    if (item.taken) continue;
    ctx.fillStyle = item.id === 'repair-kit' ? '#7ddc8a' : '#ffd94d';
    ctx.fillRect(item.x - 6, item.y - 6, 12, 12);
  }
}
