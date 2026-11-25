// Browser entry: canvas, input, and the game loop.
const MAX_DT = 0.05; // seconds

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

// Contract #5: filled here, read by updatePlayer (Member 1)
const input = {
  keys: new Set(), // KeyboardEvent.code values held right now, e.g. 'KeyW'
  aim: { x: canvas.width / 2, y: canvas.height / 2 },
  firing: false,
};

// Convert screen (CSS) pixels to canvas pixels, in case the canvas is scaled
function updateAim(event) {
  const rect = canvas.getBoundingClientRect();
  input.aim.x = (event.clientX - rect.left) * (canvas.width / rect.width);
  input.aim.y = (event.clientY - rect.top) * (canvas.height / rect.height);
}

canvas.addEventListener('pointermove', updateAim);
canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return; // left button only
  updateAim(event);
  input.firing = true;
});
// On window, not canvas: releasing outside the canvas must also stop firing
window.addEventListener('pointerup', () => { input.firing = false; });
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('keydown', (event) => input.keys.add(event.code));
window.addEventListener('keyup', (event) => input.keys.delete(event.code));
// Alt+Tab while holding a key means keyup never arrives; clear everything
window.addEventListener('blur', () => {
  input.keys.clear();
  input.firing = false;
});

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