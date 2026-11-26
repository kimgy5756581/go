// music.js — 3번(방·아이템·브금) 소유. 방별 브금.
// #7 결정: mp3 파일 방식. 이유 3가지:
//  1. server.js가 이미 .mp3를 audio/mpeg으로 서빙한다.
//  2. Suno Pro로 방 분위기에 맞는 실제 곡을 만들 수 있다(합성 전자음보다 낫다).
//  3. 방이 바뀔 때 game.js가 playMusic(room.musicId)를 부르는 연결점(7절)은 그대로다.
// 곡 파일이 아직 없어도 게임이 멈추지 않는다. 없는 파일은 경고만 남기고 조용히 넘어간다.
// 기본값은 소리 OFF(7절). 시작 화면의 소리 버튼이 setMusicEnabled(true)를 부른다.

// 방별 곡. 파일은 assets/music/에 둔다. 파일명은 musicId와 같다.
export const TRACKS = {
  spring: 'assets/music/spring.mp3',
  summer: 'assets/music/summer.mp3',
  autumn: 'assets/music/autumn.mp3',
  winter: 'assets/music/winter.mp3',
  boss: 'assets/music/boss.mp3',
};

// Suno로 만들 5곡의 방향. 곡을 만들 때 이 메모를 프롬프트에 붙인다.
// spring: 잔잔하고 피어나는 느낌. 어쿠스틱 기타 + 플루트, 90 BPM, 따뜻하고 밝게.
// summer: 따뜻하고 물빛 느낌. 마림바 + 잔잔한 신스 패드, 100 BPM, 시원하게.
// autumn: 낙엽 지는 쓸쓸함. 현악기 + 피아노, 80 BPM, 조금 애잔하게.
// winter: 차갑고 고요함. 피아노 + 종소리, 70 BPM, 여백이 많게.
// boss: 네 계절이 뒤엉킨 긴장감. 드럼 + 불협화음 현악기, 130 BPM, 몰아치게.
export const TRACK_NOTES = {
  spring: 'Gentle and blooming. Acoustic guitar and flute, 90 BPM, warm and bright.',
  summer: 'Warm and watery. Marimba and soft synth pads, 100 BPM, cool and flowing.',
  autumn: 'Falling leaves, bittersweet. Strings and piano, 80 BPM, wistful.',
  winter: 'Cold and still. Piano and bells, 70 BPM, lots of space.',
  boss: 'Four seasons colliding. Driving drums and dissonant strings, 130 BPM, tense.',
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
