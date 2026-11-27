export const LOADOUTS = {
  spring: { groups: [
    { until: 6, role: 'chaser', hp: 40, radius: 14, speed: 90, color: '#80af64', damage: 10 },
    { until: 8, role: 'mage', hp: 36, radius: 13, warning: 0.55, interval: 2.5, shots: 1, spread: 0, bulletSpeed: 155, damage: 8, color: '#ec9fba' },
    { until: 9, role: 'assassin', dashCooldown: 7, hp: 30, radius: 12, warning: 0.55, interval: 2.3, speed: 240, duration: 0.42, damage: 12, color: '#96bc52' },
  ] },
  summer: { groups: [
    { until: 6, role: 'chaser', hp: 48, radius: 14, speed: 103, damage: 11, color: '#a3c858' },
    { until: 9, role: 'mage', hp: 42, radius: 13, warning: 0.48, interval: 2.1, shots: 2, spread: 0.2, bulletSpeed: 185, damage: 10, color: '#54c5c7' },
    { until: 11, role: 'assassin', dashCooldown: 6.5, hp: 36, radius: 12, warning: 0.46, interval: 2, speed: 300, duration: 0.46, damage: 13, color: '#62d6c7' },
  ], boss: { pattern: 'fan', hp: 360, interval: 1.85, warning: 0.5, shots: 3, spread: 0.27, bulletSpeed: 225, damage: 16, color: '#d9b94f' } },
};
