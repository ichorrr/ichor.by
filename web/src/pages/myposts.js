import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { GET_MY_POST } from '../gql/query';
import MyProf from './myprofile.js';

const MyPosts = () => {

  useEffect(() => {
    document.title = 'My Posts - ICHOR.BY';
  });




  return (
    <div>
      <MyProf />

    </div>
  );
};

export default MyPosts;
