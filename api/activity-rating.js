export const activityScore = ({ approvedPosts, comments, likes, views }) => (
  (approvedPosts * 10)
  + Math.min(comments * 2, 200)
  + Math.min(likes * 4, 400)
  + Math.min(Math.floor(views / 100), 100)
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
