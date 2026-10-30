import React from 'react';

const Loader = () => (
  <div className="app-loader" role="status" aria-live="polite" aria-label="Загрузка сайта">
    <div className="app-loader__content">
      <span className="app-loader__spinner" aria-hidden="true" />
      <span className="app-loader__brand">ichor.by</span>
      <span className="app-loader__message">Загружаем ленту</span>
    </div>
  </div>
);

export default Loader;
