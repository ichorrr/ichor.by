export const typeDefs = `#graphql
scalar Date

type User {
  _id: ID!
  name: String!
  email: String!
  avatar: String
  posts: [Post!]!
  comments: [Comment!]!
}

type Post {
  _id: ID!
  iconPost: String
  imageUrl: String
  imageUrl2: String
  imageUrl3: String
  scriptUrl: Boolean
  title: String!
  createdAt: Date!
  updatedAt: Date!
  category: Cat!
  viewsCount: String!
  body: String!
  body2: String
  body3: String
  author: User!
  comments: [Comment!]!
}

type Cat {
  _id: ID!
  catname: String!
  posts: [Post!]!
}

type Comment {
  _id: ID!
  text: String!
  createdAt: Date!
  updatedAt: Date!
  post: Post!
  author: User!
}

type postFeed {
  posts: [Post!]!
  cursor: String!
  hasNextPage: Boolean!
}

type Mutation {
  signIn(email: String!, password: String!): String!
  signUp(name: String!, email: String!, password: String!): String!

  createCat(catname: String!): Cat!
  createPost(title: String!, iconPost: String, imageUrl: String, imageUrl2: String, imageUrl3: String, scriptUrl: Boolean, category: String!, body: String!, body2: String, body3: String): Post!
  deletePost(_id: String!): Boolean!
  updatePost(_id: String!, title: String!, iconPost: String, imageUrl: String, imageUrl2: String, imageUrl3: String, scriptUrl: Boolean, body: String!, body2: String, body3: String): Post!
  createComment(text: String!, post: String!): Comment!
}

type Query {
  isLoggedIn: Boolean!
  getUsers: [User!]!
  getUser(_id: ID!): User
  me: User
  getCats: [Cat!]!
  getPosts: [Post!]!
  getComments: [Comment!]!
  getPost(_id: ID!): Post!
  getCat(_id: ID!): Cat!
  postFeed(cursor: String): postFeed
  postFirst: Post!
}
`;