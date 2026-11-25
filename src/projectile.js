
// 탄환 
export function makeProjectile(x, y, angle, speed, enemy, damage) {
  return {
    x, y,
    vx: Math.cos(angle) * speed,  // 가로 속도
    vy: Math.sin(angle) * speed,  // 세로 속도
    damage,
    enemy,

    r: enemy ? 5 : 3,        
    life: 3.5,   // 지속시간 
  };
}

// 탄환 위치갱신
export function updateProjectile(bullet, dt, blocks) {
  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
  bullet.life -= dt;
}