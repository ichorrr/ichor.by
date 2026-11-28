export const BATTLESHIP_BOARD_SIZE = 10;
export const BATTLESHIP_SHIP_LENGTHS = [5, 4, 3, 3, 2];

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export const gameOutcome = board => {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every(Boolean) ? 'draw' : null;
};

export const chooseBotMove = board => {
  const minimax = (currentBoard, botTurn, depth) => {
    const outcome = gameOutcome(currentBoard);
    if (outcome === 'O') return 10 - depth;
    if (outcome === 'X') return depth - 10;
    if (outcome === 'draw') return 0;

    const scores = [];
    currentBoard.forEach((cell, index) => {
      if (cell) return;
      const nextBoard = [...currentBoard];
      nextBoard[index] = botTurn ? 'O' : 'X';
      scores.push(minimax(nextBoard, !botTurn, depth + 1));
    });

    return botTurn ? Math.max(...scores) : Math.min(...scores);
  };

  let bestMove = -1;
  let bestScore = -Infinity;
  board.forEach((cell, index) => {
    if (cell) return;
    const nextBoard = [...board];
    nextBoard[index] = 'O';
    const score = minimax(nextBoard, false, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  });
  return bestMove;
};

const samePlayer = (first, second) => String(first ?? '') === String(second ?? '');

const shipPlacements = length => {
  const placements = [];
  for (let row = 0; row < BATTLESHIP_BOARD_SIZE; row += 1) {
    for (let column = 0; column < BATTLESHIP_BOARD_SIZE; column += 1) {
      if (column + length <= BATTLESHIP_BOARD_SIZE) {
        placements.push(Array.from({ length }, (_, offset) => row * BATTLESHIP_BOARD_SIZE + column + offset));
      }
      if (row + length <= BATTLESHIP_BOARD_SIZE) {
        placements.push(Array.from({ length }, (_, offset) => (row + offset) * BATTLESHIP_BOARD_SIZE + column));
      }
    }
  }
  return placements;
};

const shuffled = (items, random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const canPlaceShip = (cells, occupied) => cells.every(cell => {
  const row = Math.floor(cell / BATTLESHIP_BOARD_SIZE);
  const column = cell % BATTLESHIP_BOARD_SIZE;
  for (let adjacentRow = Math.max(0, row - 1); adjacentRow <= Math.min(BATTLESHIP_BOARD_SIZE - 1, row + 1); adjacentRow += 1) {
    for (let adjacentColumn = Math.max(0, column - 1); adjacentColumn <= Math.min(BATTLESHIP_BOARD_SIZE - 1, column + 1); adjacentColumn += 1) {
      if (occupied.has(adjacentRow * BATTLESHIP_BOARD_SIZE + adjacentColumn)) return false;
    }
  }
  return true;
});

export const createBattleshipShipCells = (random = Math.random) => {
  const occupied = new Set();
  const placeShip = shipIndex => {
    if (shipIndex === BATTLESHIP_SHIP_LENGTHS.length) return true;
    const placements = shuffled(shipPlacements(BATTLESHIP_SHIP_LENGTHS[shipIndex]), random);
    for (const cells of placements) {
      if (!canPlaceShip(cells, occupied)) continue;
      cells.forEach(cell => occupied.add(cell));
      if (placeShip(shipIndex + 1)) return true;
      cells.forEach(cell => occupied.delete(cell));
    }
    return false;
  };

  if (!placeShip(0)) throw new Error('Unable to generate a Battleship fleet');
  return [...occupied];
};

export const createBattleshipState = (players, random = Math.random) => ({
  boards: players.map(player => ({
    player: player || null,
    shipCells: createBattleshipShipCells(random)
  })),
  shots: []
});

export const chooseBotBattleshipShot = (shots, random = Math.random) => {
  const availableCells = Array.from(
    { length: BATTLESHIP_BOARD_SIZE ** 2 },
    (_, cell) => cell
  ).filter(cell => !shots.some(shot => !shot.player && shot.cell === cell));
  if (!availableCells.length) return -1;
  return availableCells[Math.floor(random() * availableCells.length)];
};

export const fireBattleshipShot = (state, shooter, target, cell) => {
  const targetBoard = state.boards.find(board => samePlayer(board.player, target));
  if (!targetBoard) throw new Error('Battleship target board not found');
  const hit = targetBoard.shipCells.includes(cell);
  const shots = [...state.shots, { player: shooter || null, cell, hit }];
  const hitCells = new Set(
    shots
      .filter(shot => samePlayer(shot.player, shooter) && shot.hit)
      .map(shot => shot.cell)
  );
  return {
    state: { boards: state.boards, shots },
    hit,
    won: targetBoard.shipCells.every(shipCell => hitCells.has(shipCell))
  };
};

export const getBattleshipView = (state, player) => {
  const ownBoard = state?.boards?.find(board => samePlayer(board.player, player));
  if (!ownBoard) return null;

  const ownCells = Array(BATTLESHIP_BOARD_SIZE ** 2).fill('');
  ownBoard.shipCells.forEach(cell => { ownCells[cell] = 'ship'; });
  const opponentCells = Array(BATTLESHIP_BOARD_SIZE ** 2).fill('');

  state.shots.forEach(shot => {
    const board = samePlayer(shot.player, player) ? opponentCells : ownCells;
    board[shot.cell] = shot.hit ? 'hit' : 'miss';
  });

  return { ownBoard: ownCells, opponentBoard: opponentCells };
};
