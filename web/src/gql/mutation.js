import { gql } from '@apollo/client';

const EDIT_POST = gql`
  mutation updatePost(
      $id: String!, 
      $iconPost: String,
      $imageUrl: String, 
      $imageUrl2: String, 
      $imageUrl3: String,
      $scriptUrl: Boolean, 
      $title: String!, 
      $body: String!, 
      $body2: String, 
      $body3: String
    ) {
    updatePost(
        _id: $id,
        iconPost: $iconPost,
        imageUrl: $imageUrl, 
        imageUrl2: $imageUrl2, 
        imageUrl3: $imageUrl3, 
        scriptUrl: $scriptUrl, 
        title: $title, 
        body: $body, 
        body2: $body2, 
        body3: $body3
      ) {
      _id
        title
        iconPost
        imageUrl
        imageUrl2
        imageUrl3
        scriptUrl
        createdAt
        category{
          _id
          catname
        }
        body
        body2
        body3
        author {
          _id
          name
        }
        comments{
          text
        }
      }
    }`;

const CREATE_MESSAGE = gql`
  mutation createMessage($text: String!, $author: ID!, $addressee: ID!) {
    createMessage(text: $text, author: $author, addressee: $addressee) {
      _id
      text
      createdAt
      author {
        _id
        name
      }
      addressee {
        _id
        name
      }
    }
  }
`;

    const DELETE_POST = gql`
      mutation deletePost($id: String!) {
        deletePost(_id: $id)
      }
    `;

    const DELETE_COMM = gql`
    mutation deleteComment($id: String!) {
      deleteComment(_id: $id)
    }
  `;

  const DELETE_MESSAGE = gql`
    mutation deleteMessage($id: String!) {
      deleteMessage(_id: $id)
    }
  `;

    export {
      EDIT_POST,
      DELETE_POST,
      DELETE_COMM,
      CREATE_MESSAGE,
      DELETE_MESSAGE
    };
