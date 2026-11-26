// Start screen and HUD (Member 4).
// Reads game data and shows it. It never changes numbers itself (common rules 2.5).
export function createUI(game) {
  const titleScreen = document.querySelector('#title-screen');
  const startButton = document.querySelector('#start-button');
  const hud = document.querySelector('#hud');
  const hpText = document.querySelector('#hp-text');
  const hpFill = document.querySelector('#hp-fill');
  const scoreText = document.querySelector('#score-text');

  startButton.addEventListener('click', () => game.start());

  // Last values written to the page, so the DOM is only touched when something changes.
  const shown = { state: null, hp: null, maxHp: null, score: null };

  function update() {
    if (game.state !== shown.state) {
      // The title screen shows only before the first start. Once the run
      // begins, the HUD stays visible through game over and victory.
      titleScreen.hidden = game.state !== 'title';
      hud.hidden = game.state === 'title';
      shown.state = game.state;
    }

    const { hp, maxHp } = game.player;
    if (hp !== shown.hp || maxHp !== shown.maxHp) {
      hpText.textContent = `${Math.ceil(hp)} / ${maxHp}`;
      hpFill.style.width = `${Math.max(0, (hp / maxHp) * 100)}%`;
      shown.hp = hp;
      shown.maxHp = maxHp;
    }

    if (game.score !== shown.score) {
      scoreText.textContent = String(game.score);
      shown.score = game.score;
    }
  }

  return { update };
}
