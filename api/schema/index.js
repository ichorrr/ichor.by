export const typeDefs = `#graphql

scalar Date

type User {
  _id: ID!
  name: String!
  email: String!
  avatar: String
  telephone: String
  family: [User]
  chatUsers: [User!]!
  messages: [Message]
  posts: [Post!]!
  comments: [Comment!]!
  cursor: String!
  hasNextPage: Boolean!
  lastMessage: Message
  isAdmin: Boolean
}

type Chat {
  _id: ID!
  participants: [User!]!
  messages: [Message!]!
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

type Message {
  _id: ID!
  text: String!
  createdAt: Date!
  updatedAt: Date!
  file: String
  likesCount: Int!
  author: User!
  addressee: String!
  chat: Chat
  }

type postFeed {
  posts: [Post!]
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
  deleteComment(_id: String!): Boolean!
  createMessage(text: String!, file: String, addressee: String!): Message!
  deleteMessage(_id: String!): Boolean!
  updateMessage(_id: String!, text: String!, file: String, addressee: String): Message!
  deleteUserfromMyListUsersChats(userId: ID!): User!
}

type Query {
  isLoggedIn: Boolean!
  getUsers: [User!]!
  getUser(_id: ID!): User
  me(cursor: String): User
  getCats: [Cat!]!
  getPosts: [Post!]!
  getComments(post: String!): [Comment!]!
  getPost(_id: ID!): Post!
  getCat(_id: ID!): Cat!
  postFeed(cursor: String, limit: Int, qualifier: String): postFeed
  postFirst: Post!
  getMessages: [Message!]!
  getMessage(_id: ID!): Message
  getMyListUsersChats: [User!]!
  getUserMessages(addressee: [String!], users: [ID!]): [Message!]!
  mesFeed(cursor: String, limit: Int): [Message!]!
  getUserByEmail(email: String!): User
  getUserByName(name: String!): User
  getUserById(id: ID!): User
  getUserByTelephone(telephone: String!): User
}
`;