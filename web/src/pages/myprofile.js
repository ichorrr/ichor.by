import React, {useEffect} from 'react';
import { useQuery } from '@apollo/client';
import { GET_MY_POST } from '../gql/query';
import MyPosts from '../components/MyPosts';

const MyProf = () => {

  useEffect(() => {
    document.title = 'MY PROFILE - ICHOR.BY';
  });

  const { loading, error, data, fetchMore } = useQuery( GET_MY_POST,
    {refetchQueries: [{query: GET_MY_POST }]} );
  
    if (loading) return <p>loading...</p>;
    if (error) return <p>error...</p>;

    const myposts = data.me;
  return (
  <>
        <MyPosts posts={myposts} />
  </>
  )};

export default MyProf;
