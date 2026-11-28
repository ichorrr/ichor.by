export const GAME_POINT_REWARDS = Object.freeze({ win: 10, loss: 3, draw: 5 });

export const gamePointsFor = (game, playerId) => {
  if (game.status !== 'completed' || !game.players.some(id => String(id) === String(playerId))) return 0;
  if (game.winner && String(game.winner) === String(playerId)) return GAME_POINT_REWARDS.win;
  return !game.winner && !game.botWinner ? GAME_POINT_REWARDS.draw : GAME_POINT_REWARDS.loss;
};

export const activityScore = ({ approvedPosts, comments, likes, views, gamePoints = 0 }) => (
  (approvedPosts * 10)
  + Math.min(comments * 2, 200)
  + Math.min(likes * 4, 400)
  + Math.min(Math.floor(views / 100), 100)
  + gamePoints
);

export const activityFeatures = (score, isAdmin = false) => [
  {
    id: 'topic_chats',
    title: 'Тематические чаты',
    description: 'Создавать и вести обсуждения с друзьями.',
    requiredScore: 0,
    unlocked: true
  },
  {
    id: 'play_games',
    title: 'Игры в чатах',
    description: 'Играть с другими участниками группового чата.',
    requiredScore: 100,
    unlocked: isAdmin || score >= 100
  },
  {
    id: 'host_games',
    title: 'Создание игровых комнат',
    description: 'Запускать игровые матчи для друзей.',
    requiredScore: 300,
    unlocked: isAdmin || score >= 300
  }
];
