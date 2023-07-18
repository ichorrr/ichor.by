import React from 'react';
import loadable from "@loadable/component";

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { GET_POSTS, GET_NOTES } from '../gql/query';
import Layout from '../components/Layout';

import Home from './home';
import PostPage from './posts';
import CatsPage from './cats';
import CatPage from './cat';
import SignUp from './signup';
import SignIn from './signin';
import GetUser from './user';
import MyPosts from './myposts';
import NewPost from './new';
import EditPost from './edit';
import ArtPost from './arts';

const Pages = () => {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS);
  if (loading) return <p>loading...</p>;
  if (error) return <p>error...</p>;

let dnss = data.getPosts[1]._id;

  return (
    <BrowserRouter>
      <Layout>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/myposts" element={< MyPosts />} />
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
        <Route path="/edit/:id" element={ < EditPost /> } />
      </Routes>
      </Layout>
    </BrowserRouter>
  );
};


export default Pages;
