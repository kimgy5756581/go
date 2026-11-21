
// 탄환 
export function makeBullet(x, y, angle, speed, damage) {
  return {
    x, y,
    vx: Math.cos(angle) * speed,  // 가로 속도
    vy: Math.sin(angle) * speed,  // 세로 속도
    damage,
    r: 3,        
    life: 3.5,   // 지속시간 
  };
}

// 탄환 위치갱신
export function updateBullet(bullet, dt) {
  bullet.x += bullet.vx * dt;
  bullet.y += bullet.vy * dt;
  bullet.life -= dt;
}