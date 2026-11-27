// music.js — 3번(방·아이템·브금) 소유. 방별 브금.
// 8개 방마다 곡 하나씩. 파일은 assets/music/에 둔다. 파일명은 musicId와 같다.
//   spring-mob.mp3, spring-boss.mp3, summer-mob.mp3, summer-boss.mp3,
//   autumn-mob.mp3, autumn-boss.mp3, winter-mob.mp3, winter-boss.mp3
// 곡 파일이 아직 없어도 게임이 멈추지 않는다. 없는 파일은 경고만 남기고 조용히 넘어간다.
// 기본값은 소리 OFF. M 키가 setMusicEnabled(true)를 부른다 (main.js).
// game.js는 방이 바뀔 때(loadRoom) playMusic(layout.musicId)를 부른다.

// 방별 곡. 파일은 assets/music/에 둔다. 파일명은 musicId와 같다.
export const TRACKS = {
  'spring-mob': 'assets/music/spring-mob.mp3',
  'spring-boss': 'assets/music/spring-boss.mp3',
  'summer-mob': 'assets/music/summer-mob.mp3',
  'summer-boss': 'assets/music/summer-boss.mp3',
  'autumn-mob': 'assets/music/autumn-mob.mp3',
  'autumn-boss': 'assets/music/autumn-boss.mp3',
  'winter-mob': 'assets/music/winter-mob.mp3',
  'winter-boss': 'assets/music/winter-boss.mp3',
};

// Gemini로 만들 8곡의 방향. 곡을 만들 때 이 메모를 프롬프트에 붙인다.
// (잡몹존은 잔잔하게, 보스방은 같은 계절 모티브를 더 웅장하게.)
export const TRACK_NOTES = {
  'spring-mob': 'Gentle and blooming. Soft piano and flute over light strings, 100 BPM, hopeful and fresh.',
  'spring-boss': 'Boss battle in a flower shrine. Full strings and driving drums, petal motif, 130 BPM, majestic and tense.',
  'summer-mob': 'Bright summer day in a glass greenhouse. Shimmering marimba and synth arpeggios, 115 BPM, warm and flowing.',
  'summer-boss': 'Boss battle under a blazing sun. Bold brass and pounding drums, 135 BPM, majestic and overwhelming.',
  'autumn-mob': 'Wistful autumn forest. Acoustic guitar and woodwinds, 95 BPM, mellow and nostalgic.',
  'autumn-boss': 'Boss battle in a hollow of amber leaves. Low strings and deep drums, 130 BPM, dark and dramatic.',
  'winter-mob': 'Cold, quiet winter courtyard. Music box and glockenspiel over soft pads, 85 BPM, crystalline and lonely.',
  'winter-boss': 'Final boss battle in a silent ice hall. Epic orchestra and choir-like pads, 140 BPM, the grandest track.',
};

let enabled = false; // 기본값 OFF
let current = null; // 지금 재생 중인 Audio
let currentId = null;

function hasAudio() {
  return typeof Audio !== 'undefined';
}

// musicId 곡을 재생한다. 같은 곡이 이미 돌고 있으면 아무것도 안 한다.
// game.js가 방이 바뀔 때 부르는 유일한 연결점이다.
export function playMusic(musicId) {
  if (!enabled || !hasAudio()) return;
  if (musicId === currentId && current) return;
  stopMusic();
  const src = TRACKS[musicId];
  if (!src) {
    console.warn(`[music] unknown musicId: ${musicId}`);
    return;
  }
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.5;
  audio.addEventListener('error', () => {
    console.warn(`[music] cannot load track: ${src}`);
  });
  current = audio;
  currentId = musicId;
  audio.play().catch(() => {
    // 자동 재생 정책(사용자 동작 전 재생 금지)에 걸리면 조용히 넘어간다.
    console.warn('[music] playback blocked until user interaction');
  });
}

export function stopMusic() {
  if (current) {
    current.pause();
    current = null;
    currentId = null;
  }
}

// 소리 켜기/끄기. 끄면 지금 곡도 바로 멈춘다.
export function setMusicEnabled(on) {
  enabled = Boolean(on);
  if (!enabled) stopMusic();
}

export function isMusicEnabled() {
  return enabled;
}
