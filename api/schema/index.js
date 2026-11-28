export const typeDefs = `#graphql

scalar Date

type User {
  _id: ID!
  name: String!
  email: String
  avatar: String
  bio: String
  telephone: String
  lastVisit: Date
  createdAt: Date
  family: [User]
  chatUsers: [User!]!
  messages: [Message]
  posts: [Post!]!
  comments: [Comment!]!
  cursor: String!
  hasNextPage: Boolean!
  lastMessage: Message
  unreadCount: Int      # number of unread messages in the chat; computed server-side
  isAdmin: Boolean
  isDeleted: Boolean
  privacy: PrivacySettings
}

type PrivacySettings {
  showEmail: Boolean!
  showTelephone: Boolean!
  allowDirectMessages: Boolean!
  allowGroupInvites: Boolean!
}

type ActivityFeature {
  id: String!
  title: String!
  description: String!
  requiredScore: Int!
  unlocked: Boolean!
}

type UserActivityRank {
  score: Int!
  globalRank: Int!
  globalTotal: Int!
  friendsRank: Int!
  friendsTotal: Int!
  friendsAverage: Int!
  globalAverage: Int!
  features: [ActivityFeature!]!
}

type Game {
  _id: ID!
  chat: ID!
  type: String!
  players: [User!]!
  botOpponent: Boolean!
  botWinner: Boolean!
  pointsEarned: Int!
  status: String!
  board: [String!]!
  battleship: BattleshipView
  turn: ID
  winner: ID
  falseStarts: [ID!]!
  startedAt: Date!
  botRespondsAt: Date
  finishedAt: Date
  createdAt: Date!
}

type BattleshipView {
  ownBoard: [String!]!
  opponentBoard: [String!]!
}

type Chat {
  _id: ID!
  type: String
  title: String
  topic: String
  category: String
  post: Post
  owner: User
  participants: [User!]!
  messages: [Message!]!
  createdAt: Date
  updatedAt: Date
}

type ExternalSource {
  icon: String
  url: String
}

input ExternalSourceInput {
  icon: String
  url: String
}

enum UserDeletionMode {
  CONTENT
  USER_DATA
}

type Post {
  _id: ID!
  iconPost: String
  imageUrl: String
  imageUrl2: String
  imageUrl3: String
  imageUrl4: String
  scriptUrl: Boolean
  externalSource: ExternalSource
  tags: [String]
  title: String!
  createdAt: Date!
  updatedAt: Date!
  category: Cat
  viewsCount: Int
  status: String
  moderationNote: String
  body: String!
  body2: String
  body3: String
  body4: String
  author: User!
  comments: [Comment!]!
  commentCount: Int    # quick access to number of comments
  likesCount: Int!
  dislikesCount: Int!
  userLike: String     # 'like', 'dislike', or null
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
  post: Post
  author: User
  likesCount: Int!
  dislikesCount: Int!
  userLike: String     # 'like', 'dislike', or null
}

type Message {
  _id: ID!
  text: String
  createdAt: Date!
  updatedAt: Date!
  file: String
  read: Boolean        # whether recipient has seen it
  unreadCount: Int      # number of unread messages in this conversation (computed by resolver)
  likesCount: Int!
  dislikesCount: Int!
  userLike: String     # 'like', 'dislike', or null
  author: User!
  addressee: String
  chat: Chat
  }

type postFeed {
  posts: [Post!]
  cursor: String!
  hasNextPage: Boolean!
}

type LikeResponse {
  _id: ID!
  likesCount: Int!
  dislikesCount: Int!
  userLike: String
}

type Mutation {
  signIn(email: String!, password: String!): String!
  signUp(name: String!, email: String!, password: String!): String!
  deleteUsers(userIds: [ID!]!, mode: UserDeletionMode!): Int!
  deleteMyAccount: Boolean!
  requestPasswordReset(email: String!): String!
  resetPassword(token: String!, password: String!): String!
  changePassword(currentPassword: String!, newPassword: String!): Boolean!
  createCat(catname: String!): Cat!
  createPost(title: String!, iconPost: String, imageUrl: String, imageUrl2: String, imageUrl3: String, imageUrl4: String, scriptUrl: Boolean, externalSource: ExternalSourceInput, tags: [String], category: String!, body: String!, body2: String, body3: String, body4: String): Post!
  moderatePost(postId: String!, decision: String!, reason: String): Post
  deletePost(_id: String!): Boolean!
  updatePost(_id: String!, title: String!, iconPost: String, imageUrl: String, imageUrl2: String, imageUrl3: String, imageUrl4: String, scriptUrl: Boolean, externalSource: ExternalSourceInput, tags: [String], category: String, body: String!, body2: String, body3: String, body4: String): Post!
  createComment(text: String!, post: String!): Comment!
  deleteComment(_id: String!): Boolean!
  createMessage(text: String, file: String, addressee: String, chatId: ID): Message!
  joinArticleDiscussion(postId: ID!): Chat!
  createTopicChat(title: String!, topic: String!, invitees: [ID!]!): Chat!
  respondToChatInvitation(chatId: ID!, accept: Boolean!): Chat!
  updatePrivacySettings(showEmail: Boolean!, showTelephone: Boolean!, allowDirectMessages: Boolean!, allowGroupInvites: Boolean!): User!
  startGame(chatId: ID!, type: String!, opponentId: ID, playWithBot: Boolean = false): Game!
  makeGameMove(gameId: ID!, cell: Int!): Game!
  playReactionGame(gameId: ID!): Game!
  deleteMessage(_id: String!): Boolean!
  updateMessage(_id: String!, text: String!, file: String, addressee: String): Message!
  updateUser(name: String, email: String, telephone: String, avatar: String, bio: String): User!
  deleteAvatar: Boolean!
  deleteUserfromMyListUsersChats(userId: ID!): User!
  deleteImagesInMessage(_id: String!, imageIndex: Int): Message!
  clearChat(addressee: String!): Boolean!
  toggleLike(targetId: String!, type: String!, likeType: String!): LikeResponse!
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
  postFeed(cursor: String, limit: Int, qualifier: String, tag: String): postFeed
  getPendingPosts: [Post!]!
  postFirst: Post!
  getMessages: [Message!]!
  getMessage(_id: ID!): Message
  getMyListUsersChats: [User!]!
  getMyGroupChats: [Chat!]!
  getMyChatInvitations: [Chat!]!
  getGroupChat(_id: ID!): Chat
  getUserActivityRank(userId: ID!): UserActivityRank!
  getChatGames(chatId: ID!): [Game!]!
  getUserMessages(addressee: [String!], users: [ID!]): [Message!]!
  getUnreadMessagesCount: Int!
  getCommentCount(post: String!): Int!
  mesFeed(cursor: String, limit: Int): [Message!]!
  getUserByEmail(email: String!): User
  getUserByName(name: String!): User
  getUserById(id: ID!): User
  getUserByTelephone(telephone: String!): User
}
`;