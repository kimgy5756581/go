// logic.js — Shared helper (common rules section 2.3, issue #5).
// Circle-vs-wall collision for the play area (x 40-920, y 48-492) and blocks.
// The player, bullets, and enemy use one rule instead of local copies.
// Member 2's enemy.js still carries a local blocked(); replacing it is a follow-up.

export const PLAY_AREA = { x: 40, y: 48, w: 880, h: 444 };

// True when a circle at (x, y) with radius r touches a wall or a block.
export function blocked(x, y, r, blocks) {
  if (
    x - r < PLAY_AREA.x ||
    x + r > PLAY_AREA.x + PLAY_AREA.w ||
    y - r < PLAY_AREA.y ||
    y + r > PLAY_AREA.y + PLAY_AREA.h
  ) {
    return true;
  }
  return blocks.some((b) => {
    const nearestX = Math.max(b.x, Math.min(x, b.x + b.w));
    const nearestY = Math.max(b.y, Math.min(y, b.y + b.h));
    return Math.hypot(x - nearestX, y - nearestY) < r;
  });
}

// Push a circle entity out of walls/blocks after it moved.
// Mutates entity.x / entity.y. Returns true when it moved the entity.
export function resolveCircle(entity, blocks) {
  let moved = false;
  // Play area: clamp.
  const minX = PLAY_AREA.x + entity.r;
  const maxX = PLAY_AREA.x + PLAY_AREA.w - entity.r;
  const minY = PLAY_AREA.y + entity.r;
  const maxY = PLAY_AREA.y + PLAY_AREA.h - entity.r;
  if (entity.x < minX) { entity.x = minX; moved = true; }
  if (entity.x > maxX) { entity.x = maxX; moved = true; }
  if (entity.y < minY) { entity.y = minY; moved = true; }
  if (entity.y > maxY) { entity.y = maxY; moved = true; }
  // Blocks: push out along the shortest exit.
  for (const b of blocks) {
    const nearestX = Math.max(b.x, Math.min(entity.x, b.x + b.w));
    const nearestY = Math.max(b.y, Math.min(entity.y, b.y + b.h));
    const dx = entity.x - nearestX;
    const dy = entity.y - nearestY;
    const dist = Math.hypot(dx, dy);
    if (dist < entity.r) {
      if (dist === 0) {
        // Center inside the block: push out the shortest side that stays
        // inside the play area (a block flush with a wall has no exit there).
        const exits = [
          { d: entity.x - b.x, x: b.x - entity.r, y: entity.y },
          { d: b.x + b.w - entity.x, x: b.x + b.w + entity.r, y: entity.y },
          { d: entity.y - b.y, x: entity.x, y: b.y - entity.r },
          { d: b.y + b.h - entity.y, x: entity.x, y: b.y + b.h + entity.r },
        ];
        const inside = exits.filter(
          (e) =>
            e.x - entity.r >= PLAY_AREA.x &&
            e.x + entity.r <= PLAY_AREA.x + PLAY_AREA.w &&
            e.y - entity.r >= PLAY_AREA.y &&
            e.y + entity.r <= PLAY_AREA.y + PLAY_AREA.h,
        );
        const pick = (inside.length > 0 ? inside : exits).sort((a, b) => a.d - b.d)[0];
        entity.x = pick.x;
        entity.y = pick.y;
      } else {
        entity.x = nearestX + (dx / dist) * entity.r;
        entity.y = nearestY + (dy / dist) * entity.r;
      }
      moved = true;
    }
  }
  return moved;
}
