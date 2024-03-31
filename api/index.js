import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLError } from 'graphql';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { typeDefs } from './schema/index.js';
import bcrypt from 'bcrypt';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';
import { GraphQLScalarType, Kind } from 'graphql';
import models from './models/index.js';
import 'dotenv/config'
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import multer from 'multer';
import fs from 'fs';

import mongoose from 'mongoose';

const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
      if (value instanceof Date) {
        return value.getTime(); // Convert outgoing Date to integer for JSON
      }
      throw Error('GraphQL Date Scalar serializer expected a `Date` object');
    },
    parseValue(value) {
      if (typeof value === 'number') {
        return new Date(value); // Convert incoming integer to Date
      }
      throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        // Convert hard-coded AST string to integer and then to Date
        return new Date(parseInt(ast.value, 10));
      }
      // Invalid hard-coded value (not an integer)
      return null;
    },
  });

const resolvers = {
    Date: dateScalar,
  
    Query: {
      async getUsers() {
        const users = await models.User.find({});
        return users;
      },
      async getUser(parent, args, { models }) {
        return await models.User.findById(args._id);
      },


      async me(parent, args, { models, user }) {

        return await models.User.findById(user.id);
      },


      async getCats() {
        const cats = await models.Cat.find({});
        return cats;
      },
  
      async getPosts() {
        return await models.Post.find().limit(100).sort({createdAt: -1, updatedAt: -1});
      },
  
      async getComments() {
        const comments = await models.Comment.find({});
        return comments;
      },
      async getPost(parent, args, { models }) {
        const post = await models.Post.findOneAndUpdate(
          {
            _id: args._id
          },
          { $inc: { viewsCount: 1 } },
          { returnDocument: 'true' }
        );
        return post;
      },
      async getCat(parent, args, { models }) {
        const cat = await models.Cat.findById(args._id);
        return cat;
      },
  
      postFirst: async () => {
              let pos = await models.Post.findOne({ scriptUrl: true}).sort({createdAt: -1, updatedAt: -1});
              return pos;
          },
  
      postFeed: async (parent, { cursor }, { models }) => {
        const limit = 3;
        let hasNextPage = false;
        let cursorQuery = {};
  
        if (cursor) {
          cursorQuery = { _id: { $lt: cursor } };
        }
  
        let posts = await models.Post.find(cursorQuery)
          .sort({ _id: -1 })
          .limit(limit + 1);
  
        if (posts.length > limit) {
          hasNextPage = true;
          posts = posts.slice(0, -1);
        }
  
        const newCursor = posts[posts.length - 1]._id;
  
        return {
          posts,
          cursor: newCursor,
          hasNextPage
        };
      },
  },

    Mutation: {
      signUp: async (parent, { name, email, password }, { models }) => {
        // normalize email address
        email = email.trim().toLowerCase();
        // hash the password
        const hashed = await bcrypt.hash(password, 10);
        // create the gravatar url
        const avatar = gravatar(email);
        try {
          const username = await models.User.create({
            name,
            email,
            avatar,
            password: hashed
          });
  
          // create and return the json web token
          return jwt.sign({ id: username._id }, process.env.JWT_SECRET);
        } catch (err) {
          // if there's a problem creating the account, throw an error
          throw new Error('Error creating account');
        }
      },
  
      signIn: async (parent, { name, email, password }, { models }) => {
        if (email) {
          // normalize email address
          email = email.trim().toLowerCase();
        }
        const username = await models.User.findOne({
          $or: [{ email }, { name }]
        });
        // if no user is found, throw an authentication error
        if (!username) {
          throw new AuthenticationError('Error signing in');
        }
        // if the passwords don't match, throw an authentication error
        const valid = await bcrypt.compare(password, username.password);
        if (!valid) {
          throw new AuthenticationError('Error signing in');
        }
        // create and return the json web token
        return jwt.sign({ id: username._id }, process.env.JWT_SECRET);
      },
      async createCat(_, { catname }) {
        const newCat = new models.Cat({ catname });
        const createdCat = await newCat.save();
        return createdCat;
      },
  
      deletePost: async (parent, { _id }, { models, user }) => {
        
        // if not a user, throw an Authentication Error
        if (!user) {
          throw new AuthenticationError('You must be signed in to delete a note');
        }
  
        // find the note
        const note = await models.Post.findById(_id);
        
        // if the note owner and current user don't match, throw a forbidden error
        if (note && String(note.author) !== user.id) {

          throw new GraphQLError("You don't have permissions to delete the note", {
            extensions: {
              code: 'FORBIDDEN',
              myExtension: "foo",
            },
          });
        }
  
        try {
          // if everything checks out, remove the note
          
          if (note.imageUrl) {
            var name = note.imageUrl.split("/").pop();
            var pth = "./uploads/" + name;
            fs.unlinkSync(pth, 'Content_For_Writing');
          }
          if (note.imageUrl2) {
          var name2 = note.imageUrl2.split("/").pop();
          var pth2 = "./imgposts/" + name2;
          fs.unlinkSync(pth2, 'Content_For_Writing');
          }
          if (note.imageUrl3) {
          var name3 = note.imageUrl3.split("/").pop();
          var pth3 = "./imgposts/" + name3;
          fs.unlinkSync(pth3, 'Content_For_Writing');
          }
          if (note.iconPost) {
            var iname = note.iconPost.split("/").pop();
            var ipth = "./imgposts/" + iname;
            fs.unlinkSync(ipth, 'Content_For_Writing');
            }
  
          await note.deleteOne();
          return true;
        } catch (err) {
          // if there's an error along the way, return false
          return false;
        }
      },
  
      updatePost: async (parent, { iconPost, imageUrl, imageUrl2, imageUrl3, scriptUrl, title, body, body2, body3, _id }, { models, user }) => {
        // if not a user, throw an Authentication Error
        if (!user) {
          throw new AuthenticationError('You must be signed in to update a note');
        }
        // find the note
        const note = await models.Post.findById(_id);
        // if the note owner and current user don't match, throw a forbidden error
        if (note && String(note.author) !== user.id) {
          throw new ForbiddenError(
            "You don't have permissions to update the note"
          );
        }
        // Update the note in the db and return the updated note
        return await models.Post.findOneAndUpdate(
          {
            _id: _id
          },
          {
            $set: {
              title,
              body,
              body2,
              body3,
              iconPost,
              imageUrl,
              imageUrl2,
              imageUrl3,
              scriptUrl
            }
          },
          {
            new: true
          }
        );
      },
  
      createPost: async (parent, args, { models, user }) => {
        if (!user) {
          throw new AuthenticationError('You must be signed in to create a note');
        }
  
        const newPost = await models.Post({
          title: args.title,
          iconPost: args.iconPost,
          imageUrl: args.imageUrl,
          imageUrl2: args.imageUrl2,
          imageUrl3: args.imageUrl3,
          scriptUrl: args.scriptUrl,
          body: args.body,
          body2: args.body2,
          body3: args.body3,
          category: args.category,
          author: new mongoose.Types.ObjectId(user.id)
        });
  
        const createPost = await newPost.save();
  
        const cat = await models.Cat.findById(
          new mongoose.Types.ObjectId(args.category)
        );
        const author = await models.User.findById(
          new mongoose.Types.ObjectId(user.id)
        );
  
        author.posts.push(newPost.id);
        cat.posts.push(newPost.id);
  
        await author.save();
        await cat.save();
  
        return createPost;
      },
  
      createComment: async (_, args, { models, user }) => {
        if (!user) {
          throw new AuthenticationError(
            'You must be signed in to create a comments'
          );
        }
  
        const newComment = new models.Comment({
          text: args.text,
          post: args.post,
          author: new mongoose.Types.ObjectId(user.id)
        });
  
        const createComment = await newComment.save();
  
        const post = await models.Post.findById(
          new mongoose.Types.ObjectId(args.post)
        );
        const author = await models.User.findById(
          new mongoose.Types.ObjectId(user.id)
        );
  
        author.comments.push(newComment.id);
        post.comments.push(newComment.id);
  
        await author.save();
        await post.save();
  
        return createComment;
      }
    },
  
    User: {
      async posts(parent, args, { models }) {
        return await models.Post.find({ author: parent._id}).sort({createdAt: -1, updatedAt: -1});
      },
  
      async comments(parent) {
        return await models.Comment.find({ user: parent._id });
      }
    },
  
    Cat: {
      async posts(parent) {
        return await models.Post.find({ category: parent._id }).sort({createdAt: -1, updatedAt: -1});
      }
    },
  
    Post: {
      async author(post, args, { models }) {
        return await models.User.findById(post.author);
      },
      async category(parent) {
        return await models.Cat.findById(parent.category);
      },
      async comments(parent) {
        return await models.Comment.find({ post: parent._id });
      }
    },
  
    Comment: {
      async post(parent) {
        return await models.Post.findById(parent.post);
      },
  
      async author(parent) {
        return await models.User.findById(parent.user);
      }
    }
  };
const DB_HOST = process.env.DB_HOST;


const app = express();
mongoose.connect(DB_HOST);
const httpServer = http.createServer(app);
// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
      frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
    },
  },
}));
// CORS middleware

app.use(cors());

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
});

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imgposts')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
});

const storage3 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imgposts')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
});

const istorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imgposts')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, file.originalname)
  }
});

const upload = multer({storage: storage});

const upload2 = multer({ storage: storage2 });

const upload3 = multer({ storage: storage3 });

const upload4 = multer({ storage: istorage });

app.use('/uploads', express.static('uploads'));

app.use('/imgposts', express.static('imgposts'));

app.post('/upload', upload.single('imageUrl'), (req, res) => {
  res.json({
    url: `https://api.ichor.by/uploads/${req.file.originalname}`,
  })
  console.log(req.file)
})

app.post('/upload2', upload2.single('imageUrl2'), (req, res) => {
  res.json({
    url: `https://api.ichor.by/imgposts/${req.file.originalname}`,
  })
  console.log(req.file)
})

app.post('/upload3', upload3.single('imageUrl3'), (req, res) => {
  res.json({
    url: `https://api.ichor.by/imgposts/${req.file.originalname}`,
  })
  console.log(req.file)
})

app.post('/upload4', upload3.single('iconPost'), (req, res) => {
  res.json({
    url: `https://api.ichor.by/imgposts/${req.file.originalname}`,
  })
  console.log(req.file)
})

app.use(express.static("/"));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "/", "index.html"));
// });

  function getUser(token) {
    if (token) {
        try {
            // return the user information from the token
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // if there's a problem with the token, throw an error
            throw new Error('Session invalid');
        }
    }
}

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  
  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      listen: { port: 4000 },
      context: async ({ req }) => {
        // get the user token from the headers
        const token = req.headers.authorization || '';
        // try to retrieve a user with the token
        const user = getUser(token);
    
        console.log(user);
 
        return { models, user };
      },
    }),
  );

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at https://api.ichor.by/graphql`);
