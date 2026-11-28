import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS, playMusic, stopMusic, setMusicEnabled, isMusicEnabled } from '../src/music.js';

test('곡은 5개: 봄·여름·가을·겨울·보스', () => {
  assert.deepEqual(Object.keys(TRACKS), ['spring', 'summer', 'autumn', 'winter', 'boss']);
  for (const src of Object.values(TRACKS)) {
    assert.ok(src.startsWith('assets/music/') && src.endsWith('.mp3'), src);
  }
});

test('Node에는 Audio가 없어도 재생·정지·켜기가 에러 없이 조용히 넘어간다', () => {
  assert.equal(isMusicEnabled(), false); // 기본값 OFF
  assert.doesNotThrow(() => playMusic('spring'));
  setMusicEnabled(true);
  assert.equal(isMusicEnabled(), true);
  assert.doesNotThrow(() => playMusic('spring'));
  assert.doesNotThrow(() => playMusic('boss'));
  assert.doesNotThrow(() => stopMusic());
  setMusicEnabled(false);
  assert.equal(isMusicEnabled(), false);
  assert.doesNotThrow(() => playMusic('spring')); // 꺼진 상태면 아무것도 안 한다
});

test('없는 musicId도 에러가 안 난다', () => {
  setMusicEnabled(true);
  assert.doesNotThrow(() => playMusic('nope'));
  setMusicEnabled(false);
});
