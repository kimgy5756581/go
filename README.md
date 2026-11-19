# Seasons Out of Order

> When someone refused to let spring end, every season lost its way.

A 2D top-down shooter where Ria, the season manager, purifies four broken areas (spring, summer, autumn, winter) and revives the Tree of Seasons, which cannot fall asleep. A fresh implementation using the LAST SIGNAL prototype as a reference.

## Current status

Proposal-stage initial setup. There is no runnable game code yet. The skeleton will be built up week by week.

## How to run (planned)

- Node.js 20 or later
- Run `node server.js`, then open http://localhost:3000 (after the skeleton is implemented)

## Controls (planned)

WASD to move, mouse to aim, click to shoot, E to interact, P to pause.

## Roles

| Member | Responsibility |
| --- | --- |
| Member 1 — Player & combat | Movement, aiming, shooting, health, bullet collision |
| Member 2 — Enemies & boss | Chaser, shooter, boss patterns, attack hit detection |
| Member 3 — Rooms, items & music | Hand-made maps, spawn positions, items, per-room music |
| Member 4 — Progression, UI, records & story | State transitions, UI, saves, screen integration, story |

## Collaboration rules

Issue → branch → PR → review → merge. The shared rules (file ownership, interface contract) will be added to this repo once the team finalizes them.

## Scope

Core: 5 rooms (4 seasons + boss), 2 enemy types + 1 boss, 3 item types, 3 teacher's records, best-record saving. Out of scope: dash, charging enemies, combo, inventory, online rankings, procedural dungeon generation.
