import assert from 'node:assert/strict';
import test from 'node:test';
import { activityScore, gamePointsFor } from './activity-rating.js';
import {
  BATTLESHIP_BOARD_SIZE,
  BATTLESHIP_SHIP_LENGTHS,
  chooseBotBattleshipShot,
  createBattleshipShipCells,
  fireBattleshipShot,
  getBattleshipView
} from './game-logic.js';

test('Battleship fleet contains the expected number of unique cells', () => {
  const shipCells = createBattleshipShipCells(() => 0.5);
  assert.equal(shipCells.length, BATTLESHIP_SHIP_LENGTHS.reduce((sum, length) => sum + length, 0));
  assert.equal(new Set(shipCells).size, shipCells.length);
  assert.ok(shipCells.every(cell => cell >= 0 && cell < BATTLESHIP_BOARD_SIZE ** 2));
});

test('Battleship view reveals own fleet but not the opponent fleet', () => {
  const state = {
    boards: [
      { player: 'player-1', shipCells: [0] },
      { player: 'player-2', shipCells: [99] }
    ],
    shots: [
      { player: 'player-1', cell: 99, hit: true },
      { player: 'player-2', cell: 0, hit: true }
    ]
  };
  const view = getBattleshipView(state, 'player-1');

  assert.equal(view.ownBoard[0], 'hit');
  assert.equal(view.ownBoard[99], '');
  assert.equal(view.opponentBoard[99], 'hit');
  assert.equal(getBattleshipView(state, 'spectator'), null);
});

test('Battleship shot reports a win only after all target ships are hit', () => {
  const state = {
    boards: [
      { player: 'player-1', shipCells: [0] },
      { player: 'player-2', shipCells: [10, 11] }
    ],
    shots: []
  };

  const firstShot = fireBattleshipShot(state, 'player-1', 'player-2', 10);
  assert.equal(firstShot.hit, true);
  assert.equal(firstShot.won, false);

  const finalShot = fireBattleshipShot(firstShot.state, 'player-1', 'player-2', 11);
  assert.equal(finalShot.hit, true);
  assert.equal(finalShot.won, true);
});

test('bot does not repeat one of its previous Battleship shots', () => {
  const cell = chooseBotBattleshipShot([
    { player: 'player-1', cell: 0 },
    { player: null, cell: 1 }
  ], () => 0);
  assert.equal(cell, 0);
});

test('completed games award points according to their result', () => {
  const game = { status: 'completed', players: ['player-1', 'player-2'], winner: 'player-1', botWinner: false };
  assert.equal(gamePointsFor(game, 'player-1'), 10);
  assert.equal(gamePointsFor(game, 'player-2'), 3);
  assert.equal(gamePointsFor({ ...game, winner: null }, 'player-1'), 5);
  assert.equal(gamePointsFor({ ...game, botWinner: true, winner: null }, 'player-1'), 3);
  assert.equal(gamePointsFor({ ...game, status: 'active' }, 'player-1'), 0);
  assert.equal(activityScore({ approvedPosts: 1, comments: 0, likes: 0, views: 0, gamePoints: 10 }), 20);
});
