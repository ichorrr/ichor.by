import React, { useState, useEffect } from 'react';
import { Link, NavLink, useParams, useNavigate, withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useMutation, useApolloClient, gql } from '@apollo/client';
import { GET_ME } from '../gql/query';
import ButtonAsLink from './ButtonAsLink';
import CatsPage from '../pages/cats';

const IS_LOGGED_IN = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

 const tkn = {
   isLoggedIn: !!localStorage.getItem('token')
 };

const Navigation = () => {
const navigate = useNavigate();
const [isAct, setAct] = useState("");

function li_uprises() {
  var uprs = document.getElementById("nav").querySelectorAll('li:not(.sub-mobile-menu li)');
    let y = 4;
     for(y = 0; y < uprs.length; y++) {
     var upr = uprs[y];
     (upr.classList.contains("uppr" + [y]) === true) ?
       upr.classList.remove("uppr" + [y]) :
       upr.classList.add("uppr" + [y]);
   }
}

const handleToggle = () => {
    li_uprises();
    setAct(!isAct);
  };

const { data, loading, error } = useQuery(GET_ME);
if (loading) return <p>Loading...</p>;
console.log(data)
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
						<p>application development</p>
						</span>
          </NavLink>
          </li>
          <li>
            <NavLink  to="/about" style={({ isActive }) => ({

                })}>About</NavLink>
          </li>
          {tkn.isLoggedIn && (
            <>
            <li>
              <NavLink to="/myposts" style={({ isActive }) => ({

                  })}>My posts</NavLink>
            </li>
            <li>
              <NavLink to="/new" style={({ isActive }) => ({

                  })}>New +</NavLink>
            </li>
            </>
          )}
          <li className="hvsubmenu">
            <Link className="actv" to="#" >Cats ></Link>
            <span>
              <ul className="submenu">
                  <CatsPage />
              </ul>
              </span>
          </li>
          {tkn.isLoggedIn ? (
          <li className="log-out"
          onClick={event => {
            event.preventDefault();
                // remove the token
                localStorage.removeItem('token');
                // clear the application's cache
                window.location.replace('/');
              }}
            >
          LogOut ({data.me.name})
          </li>
          ) : (
            <>
          <li>
              <Link to="/signup">Sign Up</Link>
          </li>
          <li>
              <Link to="/signin">Sign In</Link>
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
        				    <span>section</span>
                </div>

                <nav>
                    <ul className={`dropdown-content ${isAct ? "show" : "hide"}`} id="nav">
                        <li onClick={handleToggle}><NavLink to="/about" title="about"
                        style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >About</NavLink></li>
                        {tkn.isLoggedIn && (
                          <>
                        <li onClick={handleToggle}><NavLink to="/myposts" title="my posts"
                        style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >My posts</NavLink></li>
                        <li onClick={handleToggle}><NavLink to="/new" title="new"
                        style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >New +</NavLink></li>
                        </>)}
                        <li id="cats"><NavLink to="#" title="categories" >Cats ></NavLink>
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
                        LogOut ({data.me.name})
                        </li>
                        ) : (
                          <>
                        <li className="margintop"  onClick={handleToggle}>
                            <NavLink to="/signup"
                            style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >Sign Up</NavLink>
                        </li>
                        <li onClick={handleToggle}>
                            <NavLink to="/signin"
                            style={({ isActive }) => { return { color: isActive ? "#159dc3" : "", }; }} >Sign In</NavLink>
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
