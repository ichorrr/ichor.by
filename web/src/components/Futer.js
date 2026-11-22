import React from 'react';
import { Link } from 'react-router-dom';

const Futer = () =>  {

return (
    <div className='futer-block'>
        <h3>© 2020—2026 ichor.by</h3>
        <nav aria-label="Информация о приложении" className="futer-links">
          <Link to="/app-info">Карта приложения</Link>
          <Link to="/app-info#requisites">Реквизиты</Link>
          <Link to="/app-info#contacts">Контакты</Link>
        </nav>
        <p><span>info@ichor.by</span></p>

    </div>
)
};

export default Futer;

