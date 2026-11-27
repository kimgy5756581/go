import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game.js';
import { blocked } from '../src/logic.js';
import { updateRoomBoss, updateRoomEnemy } from '../src/season-combat.js';

test('autumn encounter loads each enemy role and a boss in clear space', () => {
  const game = new Game();
  game.loadRoom(4);
  assert.equal(game.enemies.length, 13);
  assert.equal(new Set(game.enemies.map(e => e.kind)).size, 3);
  for (const e of game.enemies) assert.equal(blocked(e.x,e.y,e.r,game.blocks), false);
  game.loadRoom(5);
  const b = game.boss;
  assert.equal(b.hp, 560);
  assert.equal(blocked(b.x,b.y,b.r,game.blocks), false);
  assert.deepEqual(updateRoomBoss(b, game.player, game.blocks, b.cooldown), []);
  assert.equal(b.phase,'warning');
  const shots=updateRoomBoss(b, game.player, game.blocks, b.cooldown);
  assert.equal(shots.length, 0);
  assert.equal(b.phase,'charging');
  const x=b.x; updateRoomBoss(b,game.player,game.blocks,0.05); assert.ok(b.x<x);
  b.hp=0;
  assert.deepEqual(updateRoomBoss(b,game.player,game.blocks,10),[]);
});

test('autumn mage fires from a fixed position after warning and assassin charges', () => {
  const game = new Game();
  game.loadRoom(4);
  const mage = game.enemies.find(e => e.kind === 'mage');
  const assassin = game.enemies.find(e => e.kind === 'assassin');
  const player = {x: 450, y: 270};
  mage.x=500; mage.y=270;
  assert.deepEqual(updateRoomEnemy(mage,player,[],mage.cooldown),[]);
  const shots=updateRoomEnemy(mage,player,[],mage.cooldown);
  assert.equal(shots.length, 3);
  assert.ok(shots.every(shot=>shot.enemy && shot.vx<0));
  assert.equal(mage.x,500);
  assassin.x=500; assassin.y=270;
  updateRoomEnemy(assassin,player,[],assassin.cooldown);
  assert.equal(assassin.phase,'warning');
  updateRoomEnemy(assassin,player,[],assassin.cooldown);
  updateRoomEnemy(assassin,player,[],0.05);
  assert.ok(assassin.x<500);
});
