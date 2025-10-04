import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_MESSAGES } from '../gql/query';


const Messages = props => {

const { loading, error, data } = useQuery(GET_USER_MESSAGES, {
  variables: { addressee: [`${props.mem}`, `${props.myId}`] }
});

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;

console.log('props.mem:', props.mem);
  console.log('All author IDs:', data.getUserMessages.map(msg => msg.author && msg.author._id));


const authorMessages = data.getUserMessages.filter(
  msg =>
    msg.author &&
    String(msg.author._id).trim() === String(props.mem).trim()
);
// Get the author's name (from the first matching message, if any)
  const authorName = authorMessages.length > 0 ? authorMessages[0].author.name : 'Not found';

    return (
        <>
        <div className='list-users'></div>      
        <div className='messages-block'>
            <h2>{authorName}</h2>
            {data.getUserMessages.map(({ _id, text, createdAt, author }) => (
                <div key={_id} className='message-block'>
                    <div>
                        <span className='author-message'>{author.name}</span>
                        <span>{new Date(createdAt).toLocaleString()}</span>
                    </div>
                    <p>{text}</p>
                </div>
            ))}
        </div>
        </>
    );
}

export default Messages;