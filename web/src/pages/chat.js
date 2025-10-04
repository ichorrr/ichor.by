import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Messages from '../components/Messages';
import { useQuery} from '@apollo/client';

import { GET_ME } from '../gql/query';


const ChatPage = () => {
  let  { id } = useParams();
  const navigate = useNavigate();

    const { loading, error, data } = useQuery(GET_ME, {
      onError: (error) => {
        console.error("Error fetching user data:", error);
        navigate('/login');
      }
    });

    if (loading) return <p>Loading...</p>;
    if (error) {
      console.error("Error fetching user data:", error);
      return <p>Error: {error.message}</p>;
    }

  return (
    <>
      <Messages mem={id} myId={data.me._id} />
    </>
  )};

export default ChatPage;
