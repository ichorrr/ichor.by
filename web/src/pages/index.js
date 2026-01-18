import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../gql/query';
import Layout from '../components/Layout';
import Loader from '../components/Loader';

import Home from './home';
import PostPage from './posts';
import CatsPage from './cats';
import CatPage from './cat';
import SignUp from './signup';
import SignIn from './signin';
import GetUser from './user';
import MyProf from './myprofile';
import NewPost from './new';
import EditPost from './edit';
import ArtPost from './arts';
import About from './about';
import ChatPage from './chat';

const Pages = () => {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS);
  if (loading) return <div><Loader /></div>;
  if (error) return <p>error...</p>;

let dnss = data.getPosts[1]._id;

  return (
    <BrowserRouter>
      <Layout>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/myposts" element={< MyProf />} />
        <Route path="/chat/:id" element={<ChatPage type="chat" />} />
        <Route exact path="/users/:id" element={< GetUser type="user" />} />
        <Route path="/arts" element={< ArtPost type="arts" />} />
        <Route exact path="/cats/:id" element={ < CatPage type="cat" />} />
        <Route path="/posts/:id" element={< PostPage type="posts"/>}  />
        <Route path="/cats" element={< CatsPage />} />
        <Route path="/cats/:cname/post/:id" element={< PostPage />} />
        <Route path="/users/:uname/post/:id" element={< PostPage />} />
        <Route path="/signup" element={< SignUp />} />
        <Route path="/signin" element={< SignIn type="signin"/>} />
        <Route path="/new" element={<NewPost />} />
        <Route path="/myprofile" element={<MyProf />} />
        <Route path="/about" element={<About />} />
        <Route path="/edit/:id" element={ < EditPost /> } />
      </Routes>
      </Layout>
    </BrowserRouter>
  );
};


export default Pages;
