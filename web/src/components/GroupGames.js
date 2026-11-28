import React, { useEffect, useRef, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

const GROUP_GAMES = gql`
  query GroupGames($chatId: ID!) {
    getChatGames(chatId: $chatId) {
      _id
      type
      status
      board
      turn
      winner
      falseStarts
      startedAt
      botOpponent
      botWinner
      botRespondsAt
      pointsEarned
      battleship {
        ownBoard
        opponentBoard
      }
      players { _id name }
      createdAt
    }
  }
`;

const MY_RATING = gql`
  query MyGameRating($userId: ID!) {
    getUserActivityRank(userId: $userId) {
      score
    }
  }
`;

const START_GAME = gql`
  mutation StartGame($chatId: ID!, $type: String!, $opponentId: ID, $playWithBot: Boolean!) {
    startGame(chatId: $chatId, type: $type, opponentId: $opponentId, playWithBot: $playWithBot) {
      _id
    }
  }
`;

const MAKE_MOVE = gql`
  mutation MakeGameMove($gameId: ID!, $cell: Int!) {
    makeGameMove(gameId: $gameId, cell: $cell) { _id }
  }
`;

const PLAY_REACTION = gql`
  mutation PlayReactionGame($gameId: ID!) {
    playReactionGame(gameId: $gameId) { _id }
  }
`;

const getCompletedGamesKey = games => games
  .filter(game => game.status === 'completed')
  .map(game => game._id)
  .sort()
  .join('|');

const GroupGames = ({ chatId, participants, myId, isAdmin = false }) => {
  const [opponentId, setOpponentId] = useState('');
  const [gameType, setGameType] = useState('tic_tac_toe');
  const [actionError, setActionError] = useState('');
  const [now, setNow] = useState(Date.now());
  const opponents = participants.filter(player => player._id !== myId);
  const { data: ratingData, loading: ratingLoading, error: ratingError, refetch: refetchRating } = useQuery(MY_RATING, {
    variables: { userId: myId },
    skip: !myId
  });
  const { data, error, refetch } = useQuery(GROUP_GAMES, {
    variables: { chatId },
    pollInterval: 3000
  });
  const [startGame, { loading: starting }] = useMutation(START_GAME, {
    onCompleted: () => { setActionError(''); refetch(); },
    onError: mutationError => setActionError(mutationError.message)
  });
  const [makeMove, { loading: moving }] = useMutation(MAKE_MOVE, {
    onCompleted: () => { setActionError(''); refetch(); },
    onError: mutationError => setActionError(mutationError.message)
  });
  const [playReaction, { loading: reacting }] = useMutation(PLAY_REACTION, {
    onCompleted: () => { setActionError(''); refetch(); },
    onError: mutationError => setActionError(mutationError.message)
  });
  const lastCompletedGamesKey = useRef('');

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const score = ratingData?.getUserActivityRank?.score || 0;
  const games = data?.getChatGames || [];
  useEffect(() => {
    const currentKey = getCompletedGamesKey(games);
    if (currentKey !== lastCompletedGamesKey.current) {
      lastCompletedGamesKey.current = currentKey;
      if (currentKey) refetchRating();
    }
  }, [games, refetchRating]);
  const formatPlayer = playerId => {
    const index = participants.findIndex(player => player._id === playerId);
    return index >= 0 ? participants[index].name : 'Игрок';
  };
  const submitStart = event => {
    event.preventDefault();
    if (!opponentId || (!isAdmin && score < 300)) return;
    const playWithBot = opponentId === 'bot';
    startGame({
      variables: {
        chatId,
        opponentId: playWithBot ? null : opponentId,
        playWithBot,
        type: gameType
      }
    });
  };

  return (
    <section className="group-games" style={{ border: '1px solid #d6e5ea', borderRadius: 8, padding: 12, margin: '16px 0' }}>
      <h2>Игры в чате</h2>
      {ratingLoading ? <p>Проверяем доступ по рейтингу…</p> : ratingError ? (
        <p role="alert">Не удалось проверить рейтинг: {ratingError.message}</p>
      ) : !isAdmin && score < 100 ? (
        <p>Игры откроются при рейтинге 100 баллов. Сейчас: {score}.</p>
      ) : (
        <>
          <p>
            {isAdmin
              ? 'Администратору доступны все игры и создание игровых комнат независимо от рейтинга.'
              : 'Можно сыграть с участником этого чата. Для создания комнаты нужно 300 баллов у инициатора и 100 у соперника.'}
          </p>
          {opponents.length === 0 && <p>Можно сыграть с ботом или пригласить участника чата.</p>}
          <form onSubmit={submitStart} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <select aria-label="Соперник" required value={opponentId} onChange={event => setOpponentId(event.target.value)}>
              <option value="">Выберите соперника</option>
              <option value="bot">Играть с ботом</option>
              {opponents.map(player => <option key={player._id} value={player._id}>{player.name}</option>)}
            </select>
            <select aria-label="Игра" value={gameType} onChange={event => setGameType(event.target.value)}>
              <option value="tic_tac_toe">Крестики-нолики</option>
              <option value="reaction">Гонка реакции</option>
              <option value="battleship">Морской бой</option>
            </select>
            <button type="submit" disabled={!opponentId || (!isAdmin && score < 300) || starting}>
              {!isAdmin && score < 300 ? `Создать игру (от 300; у вас ${score})` : 'Создать игру'}
            </button>
          </form>
        </>
      )}
      {actionError && <p role="alert">{actionError}</p>}
      {error && <p role="alert">Не удалось загрузить игры: {error.message}</p>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {games.map(game => {
          const ownFalseStart = game.falseStarts.includes(myId);
          const reactionReadyAt = new Date(game.startedAt).getTime();
          const reactionReady = now >= reactionReadyAt;
          const gameWinner = game.winner ? formatPlayer(game.winner) : null;
          const canFire = game.status === 'active' && game.turn === myId && !moving;
          return (
            <article key={game._id} style={{ borderTop: '1px solid #ddd', paddingTop: 12 }}>
              <h3>{game.type === 'tic_tac_toe' ? 'Крестики-нолики' : game.type === 'battleship' ? 'Морской бой' : 'Гонка реакции'}</h3>
              <p>{game.players.map(player => player.name).join(' — ')}</p>
              {game.type === 'tic_tac_toe' ? (
                <>
                  {game.status === 'completed'
                    ? <p>{game.botWinner ? 'Победил бот' : gameWinner ? `Победил(а): ${gameWinner}` : 'Ничья'}</p>
                    : <p>{game.turn === myId ? 'Ваш ход' : `Ход: ${formatPlayer(game.turn)}`}</p>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 54px)', gap: 4 }}>
                    {game.board.map((value, cell) => (
                      <button
                        key={cell}
                        type="button"
                        aria-label={`Клетка ${cell + 1}${value ? `: ${value}` : ''}`}
                        disabled={game.status !== 'active' || game.turn !== myId || Boolean(value) || moving}
                        onClick={() => makeMove({ variables: { gameId: game._id, cell } })}
                        style={{ height: 54, fontSize: 24 }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </>
              ) : game.type === 'battleship' ? (
                game.battleship ? (
                  <>
                    <p>
                      {game.status === 'completed'
                        ? (game.botWinner ? 'Победил бот' : gameWinner ? `Победил(а): ${gameWinner}` : 'Партия завершена')
                        : game.turn === myId ? 'Ваш ход: стреляйте по полю соперника.' : `Ход: ${formatPlayer(game.turn)}`}
                    </p>
                    <p>Ваш флот</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 2, width: '100%', maxWidth: 258, marginBottom: 8 }}>
                      {game.battleship.ownBoard.map((value, cell) => (
                        <button
                          key={cell}
                          type="button"
                          disabled
                          aria-label={`Ваше поле, ряд ${Math.floor(cell / 10) + 1}, столбец ${cell % 10 + 1}: ${value || 'вода'}`}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            minWidth: 0,
                            padding: 0,
                            border: '1px solid #aac2cc',
                            background: value === 'hit' ? '#e46b6b' : value === 'miss' ? '#dcecf2' : value === 'ship' ? '#74aac0' : '#fff',
                            opacity: 1
                          }}
                        >
                          {value === 'hit' ? '×' : value === 'miss' ? '·' : value === 'ship' ? '■' : ''}
                        </button>
                      ))}
                    </div>
                    <p>Поле соперника</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 2, width: '100%', maxWidth: 258 }}>
                      {game.battleship.opponentBoard.map((value, cell) => (
                        <button
                          key={cell}
                          type="button"
                          disabled={!canFire || Boolean(value)}
                          aria-label={`Поле соперника, ряд ${Math.floor(cell / 10) + 1}, столбец ${cell % 10 + 1}: ${value === 'hit' ? 'попадание' : value === 'miss' ? 'промах' : 'неизвестно'}`}
                          onClick={() => makeMove({ variables: { gameId: game._id, cell } })}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            minWidth: 0,
                            padding: 0,
                            border: '1px solid #aac2cc',
                            cursor: canFire && !value ? 'pointer' : 'default',
                            background: value === 'hit' ? '#e46b6b' : value === 'miss' ? '#dcecf2' : '#fff',
                            opacity: 1
                          }}
                        >
                          {value === 'hit' ? '×' : value === 'miss' ? '·' : ''}
                        </button>
                      ))}
                    </div>
                  </>
                ) : <p>Игровое поле доступно только участникам партии.</p>
              ) : (
                <>
                  <p>
                    {game.status === 'completed'
                      ? (game.botWinner ? 'Бот успел первым.' : gameWinner ? `Победил(а): ${gameWinner}` : 'Раунд завершён')
                      : ownFalseStart
                        ? 'Фальстарт — в этом раунде победить уже нельзя.'
                        : reactionReady
                          ? game.botOpponent && now >= new Date(game.botRespondsAt).getTime()
                            ? 'Бот успел первым.'
                            : 'Жмите!'
                          : 'Приготовьтесь…'}
                  </p>
                  {game.status === 'active' && !ownFalseStart && (
                    <button
                      type="button"
                      disabled={!reactionReady || reacting || (game.botOpponent && now >= new Date(game.botRespondsAt).getTime())}
                      onClick={() => playReaction({ variables: { gameId: game._id } })}
                      style={{ minWidth: 140, minHeight: 60, fontSize: 20 }}
                    >
                      ЖМИ!
                    </button>
                  )}
                  {game.falseStarts.length > 0 && <p>Фальстартов: {game.falseStarts.length}</p>}
                </>
              )}
              {game.status === 'completed' && game.pointsEarned > 0 && (
                <p>За игру начислено {game.pointsEarned} баллов.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default GroupGames;
