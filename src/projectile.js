
// projectile
export function makeProjectile(x, y, angle, speed, enemy, damage) {
  return {
    x, y,
    vx: Math.cos(angle) * speed,  // Horizontal sepped
    vy: Math.sin(angle) * speed,  // Vertical speed
    damage,
    enemy,

    r: enemy ? 5 : 3,        
    life: 3.5,   // Remaining time
  };
}

// Update projectile position
export function updateProjectile(bullet, dt, blocks) {
  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
  bullet.life -= dt;
}