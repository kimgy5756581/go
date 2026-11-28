// items.js — 3번(방·아이템·브금) 소유. 아이템 3종 고정(2.3절).
// 아이템은 줍는 방식이다(선택지 3개 중 1개 고르기가 아니다).
// 수치는 이 파일에만 둔다(2.5절). 다른 파일에서 같은 수치를 복사하지 않는다.

export const ITEMS = [
  {
    id: 'repair-kit',
    name: 'Repair Kit',
    label: '+40 HP',
    text: 'Heals 40 HP.',
    apply(player) {
      if (player.hp >= player.maxHp) return false; // 이미 가득 차면 효과 없음
      player.hp = Math.min(player.maxHp, player.hp + 40);
      return true;
    },
  },
  {
    id: 'power-cell',
    name: 'Power Cell',
    label: '+8 damage',
    text: 'Shots deal 8 more damage.',
    apply(player) {
      player.damage += 8;
      return true;
    },
  },
  {
    id: 'rapid-core',
    name: 'Rapid Core',
    label: 'Fire interval x0.8',
    text: 'Shoots faster. Fire interval x0.8 (min 0.1s).',
    apply(player) {
      player.fireInterval = Math.max(0.1, player.fireInterval * 0.8);
      return true;
    },
  },
];

// id의 아이템 효과를 player에게 적용한다. 없는 id면 false.
export function applyItem(player, id) {
  const item = ITEMS.find((it) => it.id === id);
  if (!item) return false;
  return item.apply(player);
}
