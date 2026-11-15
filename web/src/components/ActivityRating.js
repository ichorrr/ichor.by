import React from 'react';
import { gql, useQuery } from '@apollo/client';

const USER_ACTIVITY_RANK = gql`
  query UserActivityRank($userId: ID!) {
    getUserActivityRank(userId: $userId) {
      score
      globalRank
      globalTotal
      friendsRank
      friendsTotal
      friendsAverage
      globalAverage
      features {
        id
        title
        description
        requiredScore
        unlocked
      }
    }
  }
`;

const ActivityRating = ({ userId }) => {
  const { data, loading, error } = useQuery(USER_ACTIVITY_RANK, {
    variables: { userId },
    skip: !userId
  });
  const rating = data?.getUserActivityRank;

  if (!userId) return null;
  if (loading) return <section aria-busy="true"><h2>Рейтинг активности</h2><p>Загружаем рейтинг…</p></section>;
  if (error) return <section role="alert"><h2>Рейтинг активности</h2><p>Не удалось загрузить рейтинг: {error.message}</p></section>;
  if (!rating) return null;

  const chartMaximum = Math.max(rating.score, rating.friendsAverage, rating.globalAverage, 1);
  const bars = [
    { label: 'Вы', value: rating.score, color: '#159dc3' },
    { label: 'Среднее среди друзей', value: rating.friendsAverage, color: '#72b7a1' },
    { label: 'Среднее по приложению', value: rating.globalAverage, color: '#a8a2cc' }
  ];

  return (
    <section className="activity-rating" aria-labelledby={`activity-title-${userId}`}>
      <header className="activity-rating__header">
        <div>
          <p className="activity-rating__eyebrow">Ваш прогресс</p>
          <h2 id={`activity-title-${userId}`}>Рейтинг активности</h2>
        </div>
        <p className="activity-rating__score"><strong>{rating.score}</strong><span>баллов</span></p>
      </header>
      <div className="activity-rating__ranks">
        <div className="activity-rating__rank">
          <span>Среди друзей</span>
          <strong>{rating.friendsRank} <small>из {rating.friendsTotal}</small></strong>
        </div>
        <div className="activity-rating__rank">
          <span>Среди пользователей</span>
          <strong>{rating.globalRank} <small>из {rating.globalTotal}</small></strong>
        </div>
      </div>
      <div className="activity-rating__comparison" role="img" aria-label={`Сравнение рейтинга: у пользователя ${rating.score} баллов, среднее среди друзей ${rating.friendsAverage}, среднее по приложению ${rating.globalAverage}`}>
        {bars.map(bar => (
          <div key={bar.label} className="activity-rating__bar-row">
            <span className="activity-rating__bar-label">{bar.label}</span>
            <div className="activity-rating__bar-track">
              <div className="activity-rating__bar-fill" style={{ width: `${Math.max(bar.value ? 3 : 0, (bar.value / chartMaximum) * 100)}%`, backgroundColor: bar.color }} />
            </div>
            <strong className="activity-rating__bar-value">{bar.value}</strong>
          </div>
        ))}
      </div>
      <details className="activity-rating__details">
        <summary>Как начисляются баллы</summary>
        <p>10 баллов за опубликованную запись, 2 за комментарий, 4 за реакцию другого пользователя на запись или комментарий (с учётом лимитов), 1 за каждые 100 просмотров (до 100 баллов за просмотры). Собственные реакции не учитываются.</p>
      </details>
      <h3 className="activity-rating__features-title">Возможности</h3>
      <ul className="activity-rating__features">
        {rating.features.map(feature => (
          <li key={feature.id} className={`activity-rating__feature ${feature.unlocked ? 'is-unlocked' : 'is-locked'}`}>
            <strong className="activity-rating__feature-name">{feature.title}</strong>
            <span className="activity-rating__feature-status">
              {feature.unlocked ? 'Доступно' : `Нужно ${feature.requiredScore} баллов`}
            </span>
            <div className="activity-rating__feature-description">{feature.description}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ActivityRating;
