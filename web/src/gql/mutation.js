import { gql } from '@apollo/client';

const EDIT_POST = gql`
  mutation updatePost($id: String!, $imageUrl: String, $imageUrl2: String, $scriptUrl: Boolean, $title: String!, $body: String!, $body2: String) {
    updatePost(_id: $id, imageUrl: $imageUrl, imageUrl2: $imageUrl2, scriptUrl: $scriptUrl, title: $title, body: $body, body2: $body2) {
      _id
        title
        imageUrl
        imageUrl2
        scriptUrl
        createdAt
        category{
          _id
          catname
        }
        body
        body2
        author {
          _id
          name
        }
        comments{
          text
        }
      }
    }`;

    const DELETE_POST = gql`
      mutation deletePost($id: String!) {
        deletePost(_id: $id)
      }
    `;
    export {
      EDIT_POST,
      DELETE_POST
    };
