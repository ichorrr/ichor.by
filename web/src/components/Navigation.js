import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, withRouter } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { GET_ME } from '../gql/query';
import CatsPage from '../pages/cats';


 const tkn = {
   isLoggedIn: !!localStorage.getItem('token')
 };

const Navigation = () => {
const navigate = useNavigate();
const [isAct, setAct] = useState(false);
const [isMenuOpen, setIsMenuOpen] = useState(false);

function li_uprises() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const uprs = nav.querySelectorAll(':scope > li');
  uprs.forEach((upr, idx) => {
    upr.classList.toggle('uppr' + idx);
  });
}

const handleToggle = () => {
    li_uprises();
    setAct(!isAct);
  };
const logout = () => {
  localStorage.removeItem('token');
  window.location.replace('/');
};
const { data, loading, error } = useQuery(GET_ME);
if (loading) return <p>Загрузка...</p>;

return (
    <div id="ahead">
    <div className="top_head">
      <nav>
        <ul>
          <li className="logotype">
          <NavLink to="/" onClick={() => {
            isAct && handleToggle()
          }} >
            <svg width="44" height="44" viewBox="0 0 65 59">
            <path className="als-1" d="M30,56.966a27.72,27.72,0,1,1,27.712-27.72A27.716,27.716,0,0,1,30,56.966ZM30,8.392A20.853,20.853,0,1,0,50.848,29.246,20.85,20.85,0,0,0,30,8.392Z"/>
            <path className="als-2" d="M48.348,30.068H48.106l0.134,0.385h-36.4l0.134-.385H11.652c-0.012-.273-0.021-0.546-0.021-0.822a18.369,18.369,0,1,1,36.737,0C48.369,29.522,48.36,29.8,48.348,30.068ZM30,16.747a12.5,12.5,0,0,0-11.646,7.97H41.646A12.5,12.5,0,0,0,30,16.747Zm0,25A12.5,12.5,0,0,0,42.036,32.6h6.022a18.365,18.365,0,0,1-36.115,0h6.022A12.5,12.5,0,0,0,30,41.744Z"/>
            </svg>
            <span>ichor.by
						<p>разработка сайтов, приложений</p>
						</span>
          </NavLink>
          </li>
          <li>
            <NavLink  to="/about" style={({ isActive }) => ({

                })}>О себе</NavLink>
          </li>
          {tkn.isLoggedIn && (
            <>
            <li>
              <NavLink to="/myposts" style={({ isActive }) => ({

                  })}>Мои записи</NavLink>
            </li>
            <li>
              <NavLink to="/new" style={({ isActive }) => ({

                  })}>Создать +</NavLink>
            </li>
            </>
          )}
          <li className="hvsubmenu">
            <Link className="actv" to="#" >Разделы</Link>
            <span>
              <ul className="submenu">
                  <CatsPage />
              </ul>
              </span>
          </li>
          {tkn.isLoggedIn ? (
          <>
                        <li className="log-out" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                           <div className="user-info">
                            
                            <img className="avatar" src={data.me.avatar}  />
                            <div className='me-name'>{data.me.name}</div>
                            
                            </div>
                            {isMenuOpen && (
                              <div className="popup-menu">
                                <ul className="popup-list">
                                  <li>
                                    <NavLink to="/myprofile" onClick={() => setIsMenuOpen(false)} className="popup-link">
                                      Профиль
                                    </NavLink>
                                  </li>
                                  <li>
                                    <Link to="#" onClick={() => { logout(); setIsMenuOpen(false); }} className="popup-link">
                                      Выйти
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            )}
                        </li>
                        
                        </>
          ) : (
            <>
          <li>
              <Link to="/signup">Создать аккаунт</Link>
          </li>
          <li>
              <Link to="/signin">Авторизация</Link>
          </li>
          </>
            )}
        </ul>
      </nav>
    </div>
                <div className="nav-wrap" >
                <div className="menu-icon" onClick={handleToggle} >
        						<svg id="menu_mobile" width="36" height="36" viewBox="0 0 36 36" >
        								<path className={`cls-1 ${isAct ? "anim0" : ""}`} d="M15,16.6V15h9v1.6H15Z" transform="translate(-1 -1)"/>
        								<path className={`cls-2 ${isAct ? "anim1" : ""}`} d="M15,19.8V18.2h9v1.6H15Z" transform="translate(-1 -1)"/>
        								<path className={`cls-3 ${isAct ? "anim2" : ""}`} d="M15,23V21.4h9V23H15Z" transform="translate(-1 -1)"/>
        								<path className="cls-4" d="M19,1A18,18,0,1,1,1,19,18,18,0,0,1,19,1Zm0,4A14,14,0,1,1,5,19,14,14,0,0,1,19,5Z" transform="translate(-1 -1)"/>
        						</svg>
        				    <span>Разделы</span>
                </div>

                <nav>
                    <ul className={`dropdown-content ${isAct ? "show" : "hide"}`} id="nav">
                        <li onClick={handleToggle}><NavLink to="/about" title="О проекте"
                        style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >О себе</NavLink></li>
                        {tkn.isLoggedIn && (
                          <>
                        <li onClick={handleToggle}><NavLink to="/myposts" title="Мои публикации"
                        style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >Мои записи</NavLink></li>
                        <li onClick={handleToggle}><NavLink to="/new" title="Создать"
                        style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >Создать +</NavLink></li>
                        </>)}
                        <li id="cats"><NavLink to="#" title="categories" >Разделы</NavLink>
                          <ul className="sub-mobile-menu" onClick={handleToggle}>
                              <CatsPage />
                          </ul>
                        </li>
                        {tkn.isLoggedIn ? (
                        <li className="log-out-mb"
                        onClick={event => {
                          event.preventDefault();
                              // remove the token
                              localStorage.removeItem('token');
                              // clear the application's cache
                              window.location.replace('/');
                            }}
                          >
                        Выйти ({data.me.name})
                        </li>
                        ) : (
                          <>
                        <li className="margintop"  onClick={handleToggle}>
                            <NavLink to="/signup"
                            style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >Создать аккаунт</NavLink>
                        </li>
                        <li onClick={handleToggle}>
                            <NavLink to="/signin"
                            style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >Авторизация</NavLink>
                        </li>
                        </>
                          )}
                    </ul>
                </nav>
</div>
    </div>
  );
};

export default Navigation;
