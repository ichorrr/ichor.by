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
