export const LOADOUTS = {
  spring: { groups: [
    { until: 6, role: 'chaser', hp: 40, radius: 14, speed: 90, color: '#80af64', damage: 10 },
    { until: 8, role: 'mage', hp: 36, radius: 13, warning: 0.55, interval: 2.5, shots: 1, spread: 0, bulletSpeed: 155, damage: 8, color: '#ec9fba' },
    { until: 9, role: 'assassin', hp: 30, radius: 12, warning: 0.55, interval: 2.3, speed: 240, duration: 0.42, damage: 12, color: '#96bc52' },
  ] },
  summer: { groups: [
    { until: 6, role: 'chaser', hp: 48, radius: 14, speed: 103, damage: 11, color: '#a3c858' },
    { until: 9, role: 'mage', hp: 42, radius: 13, warning: 0.48, interval: 2.1, shots: 2, spread: 0.2, bulletSpeed: 185, damage: 10, color: '#54c5c7' },
    { until: 11, role: 'assassin', hp: 36, radius: 12, warning: 0.46, interval: 2, speed: 300, duration: 0.46, damage: 13, color: '#62d6c7' },
  ], boss: { pattern: 'fan', hp: 360, interval: 1.85, warning: 0.5, shots: 3, spread: 0.27, bulletSpeed: 225, damage: 16, color: '#d9b94f' } },
  autumn: { groups: [
    { until: 6, role: 'chaser', hp: 72, radius: 15, speed: 97, damage: 13, color: '#ba7b43' },
    { until: 9, role: 'mage', hp: 54, radius: 13, warning: 0.44, interval: 1.8, shots: 3, spread: 0.23, bulletSpeed: 205, damage: 12, color: '#e2a24d' },
    { until: 13, role: 'assassin', hp: 46, radius: 12, warning: 0.42, interval: 1.75, speed: 360, duration: 0.5, damage: 16, color: '#ef7b38' },
  ], boss: { pattern: 'charge', hp: 560, interval: 1.35, warning: 0.62, speed: 520, duration: 0.74, damage: 26, color: '#db9551' } },
  winter: { groups: [
    { until: 6, role: 'chaser', hp: 80, radius: 15, speed: 118, damage: 15, color: '#abcce4' },
    { until: 10, role: 'mage', hp: 62, radius: 13, warning: 0.4, interval: 1.6, shots: 1, spread: 0, bulletSpeed: 290, damage: 15, color: '#72c9f4' },
    { until: 15, role: 'assassin', hp: 56, radius: 12, warning: 0.36, interval: 1.55, speed: 415, duration: 0.51, damage: 19, color: '#d5efff' },
  ], boss: { pattern: 'radial', hp: 900, interval: 2.1, warning: 0.48, shots: 12, bulletSpeed: 250, damage: 21, color: '#87b4e2' } },
};
