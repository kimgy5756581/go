// Browser entry: canvas and the game loop.
const MAX_DT = 0.05; // seconds

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

let previous = performance.now();

function frame(now) {
  // max(0, …): the first rAF timestamp can be slightly earlier than `previous`
  const dt = Math.min(MAX_DT, Math.max(0, (now - previous) / 1000));
  previous = now;

  ctx.fillStyle = '#1b2430';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);