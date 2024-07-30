import { gql } from '@apollo/client';

const GET_CATS = gql`
  query getCats {
    getCats {
      _id
      catname
      posts {
        title
        author{
          name
        }
      }
    }
  }
`;

const GET_CAT = gql`
  query getCat($id: ID!) {
    getCat(_id: $id) {
      _id
      catname
      posts {
        _id
        iconPost
        title
        createdAt
        viewsCount
        author{
          _id
          name
        }
      }
    }
  }
`;

const GET_USER = gql`
  query getUser($id: ID!) {
    getUser(_id: $id) {
      _id
      name
      posts {
        _id
        title
        viewsCount
        createdAt
        body
        category{
          _id
          catname
        }
      }
    }
  }
`;

const GET_NOTES = gql`
  query postFeed($cursor: String, $limit: Int!) {
    postFeed(cursor: $cursor, limit: $limit) {
      cursor
      hasNextPage
      posts {
        _id
        title
        iconPost
        imageUrl
        imageUrl2
        imageUrl3
        scriptUrl
        createdAt
        category {
          _id
          catname
        }
        viewsCount
        body
        body2
        body3
        author {
          _id
          name
        }
      }
    }
  }
`;

const GET_MY_POST = gql`
  query me {
    me {
      _id
      name
      email
      posts {
        _id
        title
        iconPost
        imageUrl2
        imageUrl3
        createdAt
        viewsCount
        category {
          _id
          catname
        }

      }
    }
  }
`;

const GET_FIRST_POST = gql`
  query postFirst {
    postFirst {
      title
      scriptUrl
      viewsCount
      category {
        catname
      }
      author {
        name
      }
    }
  }
`;

const GET_ME = gql`
  query me {
    me {
      _id
      name
    }
  }
`;

const GET_POST = gql`
  query getPost($id: ID!) {
    getPost(_id: $id) {
      _id
      title
      iconPost
      imageUrl
      imageUrl2
      imageUrl3
      scriptUrl
      createdAt
      updatedAt
      viewsCount
      category {
        _id
        catname
      }
      body
      body2
      body3
      author {
        _id
        name
        email
      }
    }
  }
`;

const GET_POSTS = gql`
  query getPosts {
    getPosts {
      _id
      title
      iconPost
      imageUrl
      imageUrl2
      imageUrl3
      scriptUrl
      createdAt
      updatedAt
      viewsCount
      category {
        _id
        catname
      }
      body
      body2
      body3
      author {
        _id
        name
        email
      }
    }
  }
`;

const IS_LOGGED_IN = gql`
  query isLoggedIn {
    isLoggedIn @client
  }
`;

export {
  GET_CATS,
  GET_CAT,
  GET_NOTES,
  GET_USER,
  GET_POSTS,
  GET_POST,
  GET_MY_POST,
  GET_ME,
  IS_LOGGED_IN
};
