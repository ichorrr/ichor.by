import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const AppInfo = () => {
  useEffect(() => {
    document.title = 'Карта приложения, реквизиты и контакты — ICHOR.BY';
  }, []);

  return (
    <div className="app-info-page">
      <h1>Карта приложения</h1>
      <nav aria-label="Карта сайта">
        <ul>
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/cats">Разделы</Link></li>
          <li><Link to="/arts">Материалы</Link></li>
          <li><Link to="/about">О проекте</Link></li>
          <li><Link to="/signin">Авторизация</Link></li>
        </ul>
      </nav>

      <section id="requisites">
        <h2>Реквизиты</h2>
        <p>Сайт: ichor.by</p>
        <p>Юридические реквизиты проекта уточняются в процессе оформления статуса владельца.</p>
      </section>

      <section id="contacts">
        <h2>Контакты</h2>
        <p>Email: <a href="mailto:info@ichor.by">info@ichor.by</a></p>
      </section>
    </div>
  );
};

export default AppInfo;
