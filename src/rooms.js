// rooms.js — 3번(방·아이템·브금) 소유. 방 데이터와 그리기.
// 계약(공통 규칙 2.3절·2.4절): ROOM_LAYOUTS, roomBlocks, spawnPosition, drawRoom.
// 방 데이터 모양은 3번이 정한다(2.4절). 계약의 기본 4개 필드(name, season, blocks, musicId)에
// exit / spawn / log / itemSpots / enemyCount / boss를 더했다. game.js는 이 모양만 읽는다.
// blocks는 [x, y, w, h, kind?] — kind가 없으면 계절 기본 장애물 색상을 쓴다.

// 화면 960x540. 플레이 영역(벽 안쪽): x 40~920, y 48~492.
export const PLAY_AREA = { x: 40, y: 48, w: 880, h: 444 };

// 방 순서: 스토리 순서대로 고정. 계절마다 잡몹존 1개 + 보스방 1개씩, 2개씩 4계절 = 총 8개 방.
// 겨울 보스방이 마지막 방이다. 최종 보스(계절의 나무) 방은 따로 두지 않기로 했다.
// 봄 보스(Blossom Guardian)만 만들어져 있고, 여름·가을·겨울 보스는 아직 없어서
// 3·5·7번 보스방은 장애물+배경만 있고 보스는 비워 둔다. 겨울 보스가 만들어지기 전까지
// 8번 방은 임시 출구로 승리한다(아래 exit 주석 참고).
// 기록은 1·5·8번 방에 1개씩, 총 3개. 위치는 여기서 정하고 텍스트는 story.js(4번)가 맡는다.
export const ROOM_LAYOUTS = [
  {
    name: 'Garden in Bloom',
    season: 'spring',
    musicId: 'spring',
    enemyCount: 9,
    boss: null,
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
    // 수제 맵. [x, y, w, h, kind?] — 꽃밭 4곳 + 가운데 연못 + 낮은 화단 2곳.
    // 왼쪽 세로 길(x 40~170)은 입구에서 시작하는 통로라 비워 둔다.
    blocks: [
      [180, 90, 140, 60, 'flower'], // 왼쪽 위 꽃밭
      [640, 90, 140, 60, 'flower'], // 오른쪽 위 꽃밭
      [430, 220, 100, 100, 'pond'], // 가운데 연못
      [180, 390, 140, 60, 'flower'], // 왼쪽 아래 울타리
      [640, 390, 140, 60, 'flower'], // 오른쪽 아래 울타리
      [340, 250, 40, 40, 'flower'], // 낮은 화단(왼쪽 엄폐물)
      [580, 250, 40, 40, 'flower'], // 낮은 화단(오른쪽 엄폐물)
    ],
  },
  {
    name: 'Blossom Shrine',
    season: 'spring',
    musicId: 'boss',
    enemyCount: 0,
    boss: 'spring', // Blossom Guardian(240 HP). game.js가 createBoss()를 둔다.
    spawn: { x: 110, y: 270 },
    exit: { x: 884, y: 230, w: 36, h: 80 },
    log: null,
    itemSpots: [],
    // 보스 결투장. 네 모서리 꽃밭 + 가운데 엄폐물 2개. 보스 출현 자리(740, 270) 주변은 비워 둔다.
    blocks: [
      [180, 90, 140, 60, 'flower'], // 왼쪽 위 꽃밭
      [640, 90, 140, 60, 'flower'], // 오른쪽 위 꽃밭
      [180, 390, 140, 60, 'flower'], // 왼쪽 아래 꽃밭
      [640, 390, 140, 60, 'flower'], // 오른쪽 아래 꽃밭
      [340, 250, 40, 40, 'flower'], // 왼쪽 엄폐물
      [580, 250, 40, 40, 'flower'], // 오른쪽 엄폐물
    ],
  },
  {
    name: 'Waterlight Greenhouse',
    season: 'summer',
    musicId: 'summer',
    enemyCount: 11,
    boss: null,
    spawn: { x: 110, y: 270 },
    exit: { x: 884, y: 230, w: 36, h: 80 },
    log: null,
    // 신속 코어 첫 등장 자리. 수리 키트와 함께.
    itemSpots: [
      { id: 'rapid-core', x: 480, y: 160 },
      { id: 'repair-kit', x: 480, y: 350 },
    ],
    // 물빛 온실. 위·아래 긴 수로 + 가운데 분수 + 화분 2개.
    // 가운데 띠(y 130~410에서 분수 제외)가 이동 통로다.
    blocks: [
      [180, 90, 600, 40, 'water'], // 위 수로
      [180, 410, 600, 40, 'water'], // 아래 수로
      [430, 220, 100, 100, 'pond'], // 가운데 분수
      [250, 250, 50, 50, 'planter'], // 왼쪽 화분
      [660, 250, 50, 50, 'planter'], // 오른쪽 화분
    ],
  },
  {
    name: 'Sunlit Greenhouse',
    season: 'summer',
    musicId: 'boss',
    enemyCount: 0,
    boss: null, // 여름 보스는 아직 없음. 보스 자리(가운데)는 비워 둔다.
    spawn: { x: 110, y: 270 },
    exit: { x: 884, y: 230, w: 36, h: 80 },
    log: null,
    itemSpots: [],
    // 빈 보스방. 좌·우 세로 수로 + 위·아래 화분. 가운데는 미래 보스 자리라 비워 둔다.
    blocks: [
      [180, 90, 60, 300, 'water'], // 왼쪽 세로 수로
      [720, 90, 60, 300, 'water'], // 오른쪽 세로 수로
      [400, 90, 160, 50, 'planter'], // 위 화분
      [400, 400, 160, 50, 'planter'], // 아래 화분
    ],
  },
  {
    name: 'Fallen Leaf Forest',
    season: 'autumn',
    musicId: 'autumn',
    enemyCount: 13,
    boss: null,
    spawn: { x: 110, y: 270 },
    exit: { x: 884, y: 230, w: 36, h: 80 },
    // 스승의 기록 2번. 텍스트는 story.js.
    log: { id: 2, x: 820, y: 110 },
    itemSpots: [
      { id: 'power-cell', x: 480, y: 110 },
      { id: 'repair-kit', x: 480, y: 430 },
    ],
    // 낙엽 숲. 나무 6그루를 지그재그로 + 가운데 쓰러진 통나무.
    blocks: [
      [220, 100, 60, 60, 'tree'], // 왼쪽 위 나무
      [480, 150, 60, 60, 'tree'], // 가운데 위 나무
      [700, 120, 60, 60, 'tree'], // 오른쪽 위 나무
      [260, 340, 60, 60, 'tree'], // 왼쪽 아래 나무
      [520, 360, 60, 60, 'tree'], // 가운데 아래 나무
      [720, 350, 60, 60, 'tree'], // 오른쪽 아래 나무
      [380, 250, 120, 40, 'log'], // 가운데 쓰러진 통나무
    ],
  },
  {
    name: 'Amber Hollow',
    season: 'autumn',
    musicId: 'boss',
    enemyCount: 0,
    boss: null, // 가을 보스는 아직 없음. 가운데는 비워 둔다.
    spawn: { x: 110, y: 270 },
    exit: { x: 884, y: 230, w: 36, h: 80 },
    log: null,
    itemSpots: [],
    // 빈 보스방. 네 모서리 나무 + 위·아래 낙엽 더미. 가운데가 결투장이다.
    blocks: [
      [180, 90, 60, 60, 'tree'], // 왼쪽 위 나무
      [720, 90, 60, 60, 'tree'], // 오른쪽 위 나무
      [180, 390, 60, 60, 'tree'], // 왼쪽 아래 나무
      [720, 390, 60, 60, 'tree'], // 오른쪽 아래 나무
      [430, 90, 100, 40, 'leaf'], // 위 낙엽 더미
      [430, 410, 100, 40, 'leaf'], // 아래 낙엽 더미
    ],
  },
  {
    name: 'Frozen Courtyard',
    season: 'winter',
    musicId: 'winter',
    enemyCount: 15,
    boss: null,
    spawn: { x: 110, y: 270 },
    exit: { x: 884, y: 230, w: 36, h: 80 },
    log: null,
    itemSpots: [
      { id: 'rapid-core', x: 480, y: 110 },
      { id: 'power-cell', x: 480, y: 430 },
    ],
    // 얼어붙은 안뜰. 얼음 기둥 4개 + 가운데 얼음 연못 + 눈더미 2개.
    blocks: [
      [250, 120, 50, 50, 'ice'], // 왼쪽 위 얼음 기둥
      [650, 120, 50, 50, 'ice'], // 오른쪽 위 얼음 기둥
      [250, 370, 50, 50, 'ice'], // 왼쪽 아래 얼음 기둥
      [650, 370, 50, 50, 'ice'], // 오른쪽 아래 얼음 기둥
      [410, 220, 140, 100, 'pond'], // 가운데 얼음 연못
      [350, 90, 60, 40, 'ice'], // 위 눈더미
      [550, 410, 60, 40, 'ice'], // 아래 눈더미
    ],
  },
  {
    name: 'Silent Ice Hall',
    season: 'winter',
    musicId: 'boss',
    enemyCount: 0,
    boss: null, // 겨울 보스는 아직 없음. 가운데는 비워 둔다.
    spawn: { x: 110, y: 270 },
    // TODO: 임시 출구. 겨울 보스가 만들어지면 출구를 없애고 승리 조건을 보스 처치로 바꾼다.
    exit: { x: 884, y: 230, w: 36, h: 80 },
    // 스승의 기록 3번. 텍스트는 story.js.
    log: { id: 3, x: 820, y: 110 },
    itemSpots: [],
    // 빈 보스방. 위·아래 얼음 벽 4개 + 좌·우 기둥 2개. 가운데가 결투장이다.
    blocks: [
      [180, 90, 200, 40, 'ice'], // 왼쪽 위 얼음 벽
      [580, 90, 200, 40, 'ice'], // 오른쪽 위 얼음 벽
      [180, 410, 200, 40, 'ice'], // 왼쪽 아래 얼음 벽
      [580, 410, 200, 40, 'ice'], // 오른쪽 아래 얼음 벽
      [200, 230, 40, 80, 'ice'], // 왼쪽 기둥
      [720, 230, 40, 80, 'ice'], // 오른쪽 기둥
    ],
  },
];

export function roomLayout(layoutIndex) {
  const layout = ROOM_LAYOUTS[layoutIndex];
  if (!layout) throw new Error(`unknown room layout: ${layoutIndex}`);
  return layout;
}

// layoutIndex번 방의 장애물을 block[]({x, y, w, h, kind})로 돌려준다.
// bossRoom이 true면 최종 보스 방 레이아웃(마지막 인덱스)을 쓴다.
export function roomBlocks(layoutIndex, bossRoom = false) {
  const index = bossRoom ? ROOM_LAYOUTS.length - 1 : layoutIndex;
  return roomLayout(index).blocks.map(([x, y, w, h, kind]) => ({ x, y, w, h, kind }));
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

// 계절별 색상. [채움색, 장식 점 색]. 보스방은 같은 계절을 어둡게 쓴다.
const SEASON_STYLE = {
  spring: {
    floor: '#2e4d2f', bossFloor: '#243d26',
    block: { flower: ['#3a6b35', '#e8a2c0'], pond: ['#3d7a8c', '#7fc4d6'] },
    defaultBlock: ['#3a6b35', '#e8a2c0'],
  },
  summer: {
    floor: '#27604c', bossFloor: '#1f4c3d',
    block: {
      water: ['#2e7f8f', '#a8e0ea'],
      pond: ['#3d7a8c', '#7fc4d6'],
      planter: ['#3f7a3a', '#ffd94d'],
    },
    defaultBlock: ['#3f7a3a', '#ffd94d'],
  },
  autumn: {
    floor: '#4a3823', bossFloor: '#3a2c1c',
    block: {
      tree: ['#5d4426', '#e8862e'],
      log: ['#6b4a2a', '#d8a05a'],
      leaf: ['#7a5a28', '#e8a13c'],
    },
    defaultBlock: ['#5d4426', '#e8862e'],
  },
  winter: {
    floor: '#33465e', bossFloor: '#28394d',
    block: { ice: ['#7fb2d9', '#eaf4fb'], pond: ['#a8c8e0', '#ffffff'] },
    defaultBlock: ['#7fb2d9', '#eaf4fb'],
  },
};

const ITEM_COLOR = {
  'repair-kit': '#7ddc8a',
  'power-cell': '#ffd94d',
  'rapid-core': '#6fd6ff',
};

// 방 그리기: 바닥·장애물·출구·기록 조각·아이템. render.js의 drawGame이 방부터 부른다.
// game: { roomIndex, cleared, logsFound, items } — items가 없으면 안 그린다.
export function drawRoom(ctx, game = {}, seconds = 0) {
  const layout = roomLayout(game.roomIndex ?? 0);
  const style = SEASON_STYLE[layout.season];

  // 바닥: 계절별 색. 보스방(적 0마리)은 같은 계절을 어둡게 쓴다.
  ctx.fillStyle = layout.enemyCount === 0 ? style.bossFloor : style.floor;
  ctx.fillRect(0, 0, 960, 540);

  // 플레이 영역 테두리(돌담)
  ctx.fillStyle = '#5a5348';
  ctx.fillRect(PLAY_AREA.x - 8, PLAY_AREA.y - 8, PLAY_AREA.w + 16, 8);
  ctx.fillRect(PLAY_AREA.x - 8, PLAY_AREA.y + PLAY_AREA.h, PLAY_AREA.w + 16, 8);
  ctx.fillRect(PLAY_AREA.x - 8, PLAY_AREA.y - 8, 8, PLAY_AREA.h + 16);
  ctx.fillRect(PLAY_AREA.x + PLAY_AREA.w, PLAY_AREA.y - 8, 8, PLAY_AREA.h + 16);

  // 장애물: 종류별 색 + 장식 점 3개. 위치는 블록 안에서 고정(깜빡이지 않게).
  for (const [x, y, w, h, kind] of layout.blocks) {
    const [fill, dot] = style.block[kind] || style.defaultBlock;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = dot;
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
    ctx.fillStyle = ITEM_COLOR[item.id] || '#ffd94d';
    ctx.fillRect(item.x - 6, item.y - 6, 12, 12);
  }
}
