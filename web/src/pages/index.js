import React, { useEffect } from 'react';

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

import Home from './home';
import PostPage from './posts';
import CatsPage from './cats';
import CatPage from './cat';
import SignUp from './signup';
import SignIn from './signin';
import GetUser from './user';
import MyProf from './myprofile';
import Settings from './settings';
import NewPost from './new';
import EditPost from './edit';
import ArtPost from './arts';
import About from './about';
import ChatPage from './chat';
import TagPage from './tag';
import AdminPage from './admin';
import ForgotPassword from './forgot-password';
import ResetPassword from './reset-password';

const RouteSeoGuard = () => {
  const location = useLocation();

  useEffect(() => {
    const noIndexPaths = [
      '/signin',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/new',
      '/edit',
      '/myprofile',
      '/myposts',
      '/settings',
      '/admin',
      '/chat',
      '/discussions',
      '/group-chat',
    ];
    const shouldNoIndex = noIndexPaths.some(path => location.pathname === path || location.pathname.startsWith(`${path}/`))
      || location.pathname === '/tag'
      || location.pathname.startsWith('/tag/')
      || /(?:^|&)(?:page|p)=/.test(location.search.slice(1));

    let robots = document.head.querySelector('meta[name="robots"]');
    if (shouldNoIndex) {
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex, follow';
      document.head.querySelector('link[rel="canonical"]')?.remove();
    } else if (robots) {
      robots.remove();
    }
  }, [location.pathname, location.search]);

  return null;
};

const Pages = () => {
  return (
    <BrowserRouter>
      <Layout>
      <RouteSeoGuard />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/myposts" element={< MyProf />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage type="chat" />} />
        <Route path="/discussions" element={<ChatPage />} />
        <Route path="/group-chat/:id" element={<ChatPage type="chat" />} />
        <Route exact path="/users/:id" element={< GetUser type="user" />} />
        <Route path="/arts" element={< ArtPost type="arts" />} />
        <Route exact path="/cats/:id" element={ < CatPage type="cat" />} />
        <Route path="/posts/:id" element={< PostPage type="posts"/>}  />
        <Route path="/cats" element={< CatsPage />} />
        <Route path="/cats/:cname/post/:id" element={< PostPage />} />
        <Route path="/users/:uname/post/:id" element={< PostPage />} />
        <Route path="/signup" element={< SignUp />} />
        <Route path="/signin" element={< SignIn type="signin"/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new" element={<NewPost />} />
        <Route path="/myprofile" element={<MyProf />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/tag/:tag" element={<TagPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/edit/:id" element={ < EditPost /> } />
      </Routes>
      </Layout>
    </BrowserRouter>
  );
};


export default Pages;
