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
import { update } from 'tar';

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
  
    User: {
      unreadCount: (parent) => parent.unreadCount || 0
    },
    Message: {
      unreadCount: (parent) => parent.unreadCount || 0
    },
    Post: {
      commentCount: async (parent, args, { models }) => {
        if (Array.isArray(parent.comments)) {
          return parent.comments.length;
        }
        return await models.Comment.countDocuments({ post: parent._id });
      }
    },

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
      async getMessages(parent, args, { models }) {
        const messages = await models.Message.find({}).sort({createdAt: -1, updatedAt: -1});
        return messages;
      },
      async getMyListUsersChats(parent, args, { models, user }) {
        try {
          if (!user) {
            throw new GraphQLError('You must be signed in', { extensions: { code: 'UNAUTHENTICATED' } });
          }

          // load current user
          const currentUser = await models.User.findById(user.id);
          if (!currentUser) {
            throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
          }

          // If API client passed addressee pair explicitly (legacy behavior) handle safely
          if (args?.addressee && Array.isArray(args.addressee) && args.addressee.length === 2) {
            const [aStr, bStr] = args.addressee.map(id => String(id));
            const [aId, bId] = args.addressee.map(id => new mongoose.Types.ObjectId(id));
            const messages = await models.Message.find({
              $or: [
                { addressee: aStr, user: bId },
                { addressee: bStr, user: aId }
              ]
            })
            .populate('user', 'name avatar')
            .sort({ createdAt: 1, updatedAt: 1 });

            return messages;
          }

          // Default: return family members with last message in chat with current user
          const familyIds = Array.isArray(currentUser.family) ? currentUser.family : [];
          if (familyIds.length === 0) return [];

          const familyUsers = await models.User.find({ _id: { $in: familyIds } }).select('_id name avatar');

          const chats = await Promise.all(familyUsers.map(async (fam) => {
            const lastMessageDoc = await models.Message.findOne({
              $or: [
                { addressee: String(fam._id), user: currentUser._id },
                { addressee: String(currentUser._id), user: fam._id }
              ]
            })
            .sort({ createdAt: -1 })
            .populate('user', '_id name avatar');

            let lastMessage = null;
            let unreadCount = 0;
            if (lastMessageDoc) {
              // compute unread count for messages sent *to* current user from this family member
              unreadCount = await models.Message.countDocuments({
                addressee: String(currentUser._id),
                user: fam._id,
                read: false
              });
              lastMessage = {
                _id: lastMessageDoc._id,
                text: lastMessageDoc.text,
                file: lastMessageDoc.file || null,
                createdAt: lastMessageDoc.createdAt,
                author: lastMessageDoc.user ? { _id: lastMessageDoc.user._id, name: lastMessageDoc.user.name, avatar: lastMessageDoc.user.avatar || null } : null,
                unreadCount
              };
            }

            return {
              _id: fam._id,
              name: fam.name,
              avatar: fam.avatar || null,
              lastVisit: fam.lastVisit || new Date(),
              lastMessage
            };
          }));

          // sort by most recent lastMessage (newest first)
          chats.sort((a, b) => {
            const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return tb - ta;
          });

          return chats;
        } catch (err) {
          console.error('getMyListUsersChats error:', err);
          throw new GraphQLError('Error fetching chat users', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
      },



        async getUserMessages(parent, args, { models, user }) {
    if (!args.addressee || !Array.isArray(args.addressee) || args.addressee.length < 2) {
        throw new GraphQLError('Addressee must be an array of two user IDs', {
            extensions: { code: 'BAD_USER_INPUT' },
        });
    }
    
    // Convert both IDs to ObjectId for user field comparison
    const [userAId, userBId] = args.addressee.map(id => new mongoose.Types.ObjectId(id));
    const [userAStr, userBStr] = args.addressee.map(id => String(id)); // Keep as strings for addressee field
    
    // mark incoming messages as read for current user
    if (user && user.id) {
      const otherId = args.addressee.find(id => String(id) !== String(user.id));
      if (otherId) {
        await models.Message.updateMany(
          { addressee: String(user.id), user: new mongoose.Types.ObjectId(otherId), read: false },
          { $set: { read: true } }
        );
      }
    }

    const messages = await models.Message.find({
        $or: [
            { addressee: userAStr, user: userBId },
            { addressee: userBStr, user: userAId }
        ]
    })
    .populate('user', 'name avatar') // include avatar
    .sort({ createdAt: 1, updatedAt: 1 });
    
    // Add userLike field for each message if user is authenticated
    if (user && user.id) {
      const userId = new mongoose.Types.ObjectId(user.id);
      return messages.map(msg => {
        const msgObj = msg.toObject ? msg.toObject() : msg;
        const userLiked = msgObj.likes?.some(l => String(l.user) === user.id);
        const userDisliked = msgObj.dislikes?.some(l => String(l.user) === user.id);
        msgObj.userLike = userLiked ? 'like' : userDisliked ? 'dislike' : null;
        return msgObj;
      });
    }
    
    return messages;
},
      async getMessage(parent, args, { models }) {
        const message = await models.Message.findById(args._id);
        if (!message) {
          throw new GraphQLError('Message not found', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        } else {
          return message; 
        }
      },
      async getComments(parent, args, { models }) {
        const postcom = new mongoose.Types.ObjectId(args.post);
        const comments = await models.Comment.find({"post": postcom});
        return comments;
      },
      async getCommentCount(parent, args, { models }) {
        const postcom = new mongoose.Types.ObjectId(args.post);
        return await models.Comment.countDocuments({ post: postcom });
      },
      async getUnreadMessagesCount(parent, args, { models, user }) {
        if (!user) {
          throw new GraphQLError('You must be signed in', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        return await models.Message.countDocuments({ addressee: String(user.id), read: false });
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
  
      postFeed: async (parent, { qualifier, limit, cursor }, { models}) => {

        let hasNextPage = false;
        let totalQuery = {}

        if (cursor, qualifier) {
          totalQuery = { $or: [{author: qualifier}, {category: qualifier}], _id: { $lt: cursor } };
        }

        if(cursor && !qualifier){
          totalQuery = { _id: { $lt: cursor } };
        }
        
        if (!cursor && qualifier) {
          totalQuery = { $or: [{author: qualifier}, {category: qualifier}] };
        }

        let posts = await models.Post.find(totalQuery)
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

        try {
          const username = await models.User.create({
            name,
            email,
            password: hashed
          });

          // Create user folders
          const userFolder = path.join(process.cwd(), 'api', 'uploads', 'users', String(username._id));
          const subfolders = ['avatars', 'imgmessages', 'imgposts', 'arts'];
          
          // Create main user folder
          fs.mkdirSync(userFolder, { recursive: true });
          
          // Create subfolders
          subfolders.forEach(folder => {
            fs.mkdirSync(path.join(userFolder, folder), { recursive: true });
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
        // update last visit time
        username.lastVisit = new Date();
        await username.save();
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

      deleteComment: async (parent, { _id }, { models, user }) => {
        
        // if not a user, throw an Authentication Error
        if (!user) {
          throw new AuthenticationError('You must be signed in to delete a note');
        }
  
        // find the note
        const comm = await models.Comment.findById(_id);
        
        // if the note owner and current user don't match, throw a forbidden error
        if (comm && String(comm.author) !== user.id) {

          throw new GraphQLError("You don't have permissions to delete the note", {
            extensions: {
              code: 'FORBIDDEN',
              myExtension: "foo",
            },
          });
        }
  
        try {
          // if everything checks out, remove the note
          await comm.deleteOne();
          return true;
        } catch (err) {
          // if there's an error along the way, return false
          return false;
        }
      },
      deleteMessage: async (parent, { _id }, { models, user }) => {
        // if not a user, throw an Authentication Error
        if (!user) {  
          throw new AuthenticationError('You must be signed in to delete a message');
        }
        // find the message
        const message = await models.Message.findById(_id);
        // if the message owner and current user don't match, throw a forbidden error
        if (message && String(message.user) !== user.id) {
          throw new GraphQLError("You don't have permissions to delete the message", { 
            extensions: {
              code: 'FORBIDDEN',
              myExtension: "foo",
            }, 
          });
        }
        try {
          // if everything checks out, remove the message
          if (message.file) {
            var name = message.file.split("/").pop();
            var pth = "./imgmessages/" + name;
            fs.unlinkSync(pth, 'Content_For_Writing');
          }
          await message.deleteOne();
          return true;
        } catch (err) {
          // if there's an error along the way, return false
          return false;
        }
      },

      deleteImagesInMessage: async (parent, { _id, imageIndex }, { models, user }) => {
        // if not a user, throw an Authentication Error
        if (!user) {
          throw new AuthenticationError('You must be signed in to delete a message');
        }
        // find the message
        const message = await models.Message.findById(_id);
        // if the message owner and current user don't match, throw a forbidden error
        if (message && String(message.user) !== user.id) {
          throw new GraphQLError("You don't have permissions to delete the message", {
            extensions: {
              code: 'FORBIDDEN',
              myExtension: "foo",
            },
          });
        }
        try {
          // if everything checks out, remove the image file and clear the field
          if (message.file) {
            const fileUrls = message.file.split('|').filter(url => url.trim());
            
            // If imageIndex is provided, delete only that image
            if (imageIndex !== undefined && imageIndex !== null && imageIndex >= 0 && imageIndex < fileUrls.length) {
              const urlToDelete = fileUrls[imageIndex];
              const name = urlToDelete.split("/").pop();
              const pth = "./imgmessages/" + name;
              try {
                if (fs.existsSync(pth)) {
                  fs.unlinkSync(pth);
                }
              } catch (fileErr) {
                console.error('Error deleting file:', fileErr);
              }
              
              // Remove the deleted image from the array
              fileUrls.splice(imageIndex, 1);
              
              // Update the message with remaining images
              const updatedMessage = await models.Message.findByIdAndUpdate(
                _id,
                { $set: { file: fileUrls.length > 0 ? fileUrls.join('|') : null } },
                { new: true }
              );
              return updatedMessage;
            } else {
              // If no index or invalid index, delete all images (old behavior)
              for (const url of fileUrls) {
                const name = url.split("/").pop();
                const pth = "./imgmessages/" + name;
                try {
                  if (fs.existsSync(pth)) {
                    fs.unlinkSync(pth);
                  }
                } catch (fileErr) {
                  console.error('Error deleting file:', fileErr);
                }
              }
              const updatedMessage = await models.Message.findByIdAndUpdate(
                _id,
                { $set: { file: null } },
                { new: true }
              );
              return updatedMessage;
            }
          }
          return message;
        } catch (err) {
          // if there's an error along the way, throw error
          throw new GraphQLError('Failed to delete image', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
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
      },

    createMessage: async (_, args, { models, user }) => {
      if (!user) {
        throw new AuthenticationError(
          'You must be signed in to create a message'
        );
      }
      
      // Convert addressee string to ObjectId
      let addresseeId;
      try {
        addresseeId = new mongoose.Types.ObjectId(args.addressee);
      } catch (err) {
        throw new GraphQLError('Invalid recipient ID', {
            extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const newMessage = new models.Message({
        text: args.text,
        file: args.file,
        addressee: addresseeId.toString(), // Store as string but ensure it's valid
        likesCount: 0,
        user: new mongoose.Types.ObjectId(user.id)
      });
      const createMessage = await newMessage.save();

      const author = await models.User.findById(
        new mongoose.Types.ObjectId(user.id)
      );

      const recipient = await models.User.findById(addresseeId);
      
       if (!recipient) {
        throw new GraphQLError('Recipient not found', {
            extensions: { code: 'NOT_FOUND' },
        });
       }
       
       const senderIdObj = new mongoose.Types.ObjectId(user.id);
       if (!recipient.family.some(id => id.equals(senderIdObj))) {
        recipient.family.push(senderIdObj);
        await recipient.save();
       }

      author.messages.push(newMessage.id);
      if(!author.family.some(id => id.equals(addresseeId))) {
        author.family.addToSet(addresseeId);
      }
      await author.save();
      return createMessage;
    },
    updateUser: async (_, { name, email, telephone, avatar }, { models, user }) => {
      if (!user) {
        throw new GraphQLError('You must be signed in to update profile', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      try {
        // Ensure we only update the current authenticated user
        const currentUserId = user.id;
        if (!currentUserId) {
          throw new GraphQLError('User ID not found in authentication context', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }

        const updated = await models.User.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(currentUserId) },
          { 
            $set: { 
              ...(name !== undefined && name ? { name } : {}), 
              ...(email !== undefined && email ? { email } : {}), 
              ...(telephone !== undefined && telephone ? { telephone } : {}), 
              ...(avatar !== undefined && avatar ? { avatar } : {})
            } 
          },
          { new: true }
        );

        if (!updated) {
          throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
        }

        console.log(`User ${currentUserId} updated`, { name, email, telephone, avatar: avatar ? 'yes' : 'no' });
        return updated;
      } catch (err) {
        console.error('updateUser error:', err);
        throw new GraphQLError('Failed to update user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    updateMessage: async (_, { _id, text, file }, { models, user }) => {
      // if not a user, throw an Authentication Error
      if (!user) {
        throw new AuthenticationError('You must be signed in to update a message');
      }
      // find the message
      const message = await models.Message.findById(_id);
      // if the message owner and current user don't match, throw a forbidden error
      if (message && String(message.user) !== user.id) {
        throw new GraphQLError("You don't have permissions to update the message", {
          extensions: {
            code: 'FORBIDDEN',
            myExtension: "foo",
          },
        });
      }
      // Update the message in the db and return the updated message
      return await models.Message.findOneAndUpdate(
        {
          _id: _id
        },
        {
          $set: {
            text,
            file
          }
        },
        {
          new: true
        }
      );
    },
    clearChat: async (_, { addressee }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be signed in to clear a chat');
      }
      
      try {
        const currentUserId = user.id;
        const currentUserIdStr = String(currentUserId);
        const addresseeStr = String(addressee);
        
        // Delete all messages between the two users
        const messages = await models.Message.find({
          $or: [
            { user: new mongoose.Types.ObjectId(currentUserId), addressee: addresseeStr },
            { user: new mongoose.Types.ObjectId(addressee), addressee: currentUserIdStr }
          ]
        });
        
        // Delete image files if they exist
        for (const message of messages) {
          if (message.file) {
            try {
              const name = message.file.split("/").pop();
              const pth = "./imgmessages/" + name;
              if (fs.existsSync(pth)) {
                fs.unlinkSync(pth);
              }
            } catch (fileErr) {
              console.error('Error deleting message file:', fileErr);
            }
          }
        }
        
        // Delete all messages
        const result = await models.Message.deleteMany({
          $or: [
            { user: new mongoose.Types.ObjectId(currentUserId), addressee: addresseeStr },
            { user: new mongoose.Types.ObjectId(addressee), addressee: currentUserIdStr }
          ]
        });
        
        return result.deletedCount > 0;
      } catch (err) {
        console.error('Clear chat error:', err);
        throw new GraphQLError('Failed to clear chat', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    toggleLike: async (_, { targetId, type, likeType }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be signed in to like');
      }

      try {
        const userId = new mongoose.Types.ObjectId(user.id);
        let result;

        if (type === 'message') {
          const message = await models.Message.findById(targetId);
          if (!message) {
            throw new GraphQLError('Message not found', { extensions: { code: 'NOT_FOUND' } });
          }

          // Check if user already liked/disliked
          const userLiked = message.likes?.some(l => String(l.user) === user.id);
          const userDisliked = message.dislikes?.some(l => String(l.user) === user.id);

          if (likeType === 'like') {
            if (userLiked) {
              // Remove like
              message.likes = message.likes.filter(l => String(l.user) !== user.id);
              message.likesCount = Math.max(0, message.likesCount - 1);
            } else {
              // Add like and remove dislike if exists
              if (userDisliked) {
                message.dislikes = message.dislikes.filter(l => String(l.user) !== user.id);
                message.dislikesCount = Math.max(0, message.dislikesCount - 1);
              }
              message.likes.push({ user: userId });
              message.likesCount += 1;
            }
          } else if (likeType === 'dislike') {
            if (userDisliked) {
              // Remove dislike
              message.dislikes = message.dislikes.filter(l => String(l.user) !== user.id);
              message.dislikesCount = Math.max(0, message.dislikesCount - 1);
            } else {
              // Add dislike and remove like if exists
              if (userLiked) {
                message.likes = message.likes.filter(l => String(l.user) !== user.id);
                message.likesCount = Math.max(0, message.likesCount - 1);
              }
              message.dislikes.push({ user: userId });
              message.dislikesCount += 1;
            }
          }

          await message.save();

          const currentUserLike = message.likes?.some(l => String(l.user) === user.id) ? 'like' : 
                                 message.dislikes?.some(l => String(l.user) === user.id) ? 'dislike' : null;

          return {
            _id: targetId,
            likesCount: message.likesCount,
            dislikesCount: message.dislikesCount,
            userLike: currentUserLike
          };
        } else if (type === 'post') {
          const post = await models.Post.findById(targetId);
          if (!post) {
            throw new GraphQLError('Post not found', { extensions: { code: 'NOT_FOUND' } });
          }

          const userLiked = post.likes?.some(l => String(l.user) === user.id);
          const userDisliked = post.dislikes?.some(l => String(l.user) === user.id);

          if (likeType === 'like') {
            if (userLiked) {
              post.likes = post.likes.filter(l => String(l.user) !== user.id);
              post.likesCount = Math.max(0, post.likesCount - 1);
            } else {
              if (userDisliked) {
                post.dislikes = post.dislikes.filter(l => String(l.user) !== user.id);
                post.dislikesCount = Math.max(0, post.dislikesCount - 1);
              }
              post.likes.push({ user: userId });
              post.likesCount += 1;
            }
          } else if (likeType === 'dislike') {
            if (userDisliked) {
              post.dislikes = post.dislikes.filter(l => String(l.user) !== user.id);
              post.dislikesCount = Math.max(0, post.dislikesCount - 1);
            } else {
              if (userLiked) {
                post.likes = post.likes.filter(l => String(l.user) !== user.id);
                post.likesCount = Math.max(0, post.likesCount - 1);
              }
              post.dislikes.push({ user: userId });
              post.dislikesCount += 1;
            }
          }

          await post.save();

          const currentUserLike = post.likes?.some(l => String(l.user) === user.id) ? 'like' : 
                                 post.dislikes?.some(l => String(l.user) === user.id) ? 'dislike' : null;

          return {
            _id: targetId,
            likesCount: post.likesCount,
            dislikesCount: post.dislikesCount,
            userLike: currentUserLike
          };
        } else if (type === 'comment') {
          const comment = await models.Comment.findById(targetId);
          if (!comment) {
            throw new GraphQLError('Comment not found', { extensions: { code: 'NOT_FOUND' } });
          }

          const userLiked = comment.likes?.some(l => String(l.user) === user.id);
          const userDisliked = comment.dislikes?.some(l => String(l.user) === user.id);

          if (likeType === 'like') {
            if (userLiked) {
              comment.likes = comment.likes.filter(l => String(l.user) !== user.id);
              comment.likesCount = Math.max(0, comment.likesCount - 1);
            } else {
              if (userDisliked) {
                comment.dislikes = comment.dislikes.filter(l => String(l.user) !== user.id);
                comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
              }
              comment.likes.push({ user: userId });
              comment.likesCount += 1;
            }
          } else if (likeType === 'dislike') {
            if (userDisliked) {
              comment.dislikes = comment.dislikes.filter(l => String(l.user) !== user.id);
              comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
            } else {
              if (userLiked) {
                comment.likes = comment.likes.filter(l => String(l.user) !== user.id);
                comment.likesCount = Math.max(0, comment.likesCount - 1);
              }
              comment.dislikes.push({ user: userId });
              comment.dislikesCount += 1;
            }
          }

          await comment.save();

          const currentUserLike = comment.likes?.some(l => String(l.user) === user.id) ? 'like' : 
                                 comment.dislikes?.some(l => String(l.user) === user.id) ? 'dislike' : null;

          return {
            _id: targetId,
            likesCount: comment.likesCount,
            dislikesCount: comment.dislikesCount,
            userLike: currentUserLike
          };
        }

        throw new GraphQLError('Invalid type', { extensions: { code: 'INVALID_ARGUMENT' } });
      } catch (err) {
        console.error('Toggle like error:', err);
        throw new GraphQLError('Failed to toggle like', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    deleteAvatar: async (_, args, { models, user }) => {
      if (!user) {
        throw new GraphQLError('You must be signed in to delete avatar', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      try {
        const currentUserId = user.id;
        const userDoc = await models.User.findById(currentUserId);

        if (userDoc && userDoc.avatar) {
          const filename = userDoc.avatar.split('/').pop();
          const filePath = path.join('./avatars', filename);

          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted avatar file for user ${currentUserId}: ${filename}`);
            }
          } catch (fileErr) {
            console.error(`Failed to delete avatar file for user ${currentUserId}:`, fileErr);
          }

          // Update only the current user's avatar to null
          await models.User.findByIdAndUpdate(
            currentUserId, 
            { $set: { avatar: null } },
            { new: true }
          );
          console.log(`Avatar field cleared for user ${currentUserId}`);
          return true;
        }

        return true;
      } catch (err) {
        console.error('deleteAvatar error:', err);
        throw new GraphQLError('Failed to delete avatar', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    deleteUserfromMyListUsersChats: async (_, { userId }, { models, user }) => {
      if (!user) {
        throw new GraphQLError('You must be signed in to delete user from chats', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      try {
        // Remove userId from current user's family
        await models.User.findByIdAndUpdate(
          user.id,
          { $pull: { family: userId } },
          { new: true }
        );

        // Delete all messages between current user and userId
        await models.Message.deleteMany({
          $or: [
            { user: user.id, addressee: userId },
            { user: userId, addressee: user.id }
          ]
        });

        return { _id: userId, name: 'Deleted' };
      } catch (err) {
        console.error('deleteUserfromMyListUsersChats error:', err);
        throw new GraphQLError('Failed to delete user from chats', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    }
  },

  User: {
      async posts(parent, args, { models }) {
        return await models.Post.find({ author: parent._id}).sort({createdAt: -1, updatedAt: -1});
      },
  
      async comments(parent) {
        return await models.Comment.find({ author: parent._id }).sort({createdAt: -1, updatedAt: -1});
      },
      async messages(parent, args, { models }) {
        return await models.Message.find({ user: parent._id }).sort({createdAt: -1, updatedAt: -1});
      },
      family: async (parent, args, { models }) => {
        // parent.family is an array of user IDs
        if (!parent.family || parent.family.length === 0) return [];
        return await models.User.find({ _id: { $in: parent.family } });
      },
      lastMessage: async (parent, args, { models }) => {
        if (!parent.lastMessage) return null;
        return await models.Message.findById(parent.lastMessage);
      },
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
        return await models.Comment.find({ post: parent._id }).sort({createdAt: -1, updatedAt: -1});
      }
    },
  
    Comment: {
      async post(parent) {
        return await models.Post.findById(parent.post);
      },
  
      async author(parent) {
        return await models.User.findById(parent.author);
      }
    },
    Message: {
      author: async (parent, args, { models }) => {
        // parent.user is the ObjectId reference to the user
        return await models.User.findById(parent.user);
      }
    },
  };
const DB_HOST = process.env.DB_HOST;

mongoose.connect(DB_HOST);
const app = express();

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

// ensure upload directories exist to avoid multer errors
const ensureDir = (dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`created directory: ${dir}`);
    }
  } catch (err) {
    console.error(`failed to create directory ${dir}:`, err);
  }
};

// create all expected storage dirs
['uploads', 'imgposts', 'imgmessages', 'avatars'].forEach(ensureDir);

const storageMessage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imgmessages');
  },
  filename: (req, file, cb) => {
    // sanitize and normalize original filename
    let name = path.basename(file.originalname);
    // replace any backslashes or slashes with underscores
    name = name.replace(/[\\/]/g, '_');
    // attempt latin1 -> utf8 conversion for garbled names
    try {
      name = Buffer.from(name, 'latin1').toString('utf8');
    } catch (e) {}
    console.log('saving file as', name);
    cb(null, name);
  }
});

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

const uploadMessage = multer({ storage: storageMessage });

// Avatar storage configuration
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'avatars');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[\\/]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.use('/uploads', express.static('uploads'));

app.use('/imgposts', express.static('imgposts'));

app.use('/imgmessages', express.static('imgmessages'));

app.use('/avatars', express.static('avatars'));

// Upload avatar endpoint - requires authentication
app.post('/uploadavatar', uploadAvatar.single('avatar'), (req, res) => {
  try {
    const token = req.headers.authorization || '';
    const user = getUser(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const filename = encodeURIComponent(req.file.filename);
    const avatarUrl = `${protocol}://${host}/avatars/${filename}`;
    
    console.log(`Avatar upload for user ${user.id}: ${filename}`);
    res.json({ url: avatarUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/uploadmessage', uploadMessage.single('file'), (req, res) => {
  // return URL that matches the static route for message images
  const host = req.get('host');
  const protocol = req.protocol;
  const filename = encodeURIComponent(req.file.filename || req.file.originalname);
  res.json({
    url: `${protocol}://${host}/imgmessages/${filename}`,
  });
  console.log('uploaded message file', req.file);
});

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
  console.log(`🚀 Server ready at http://api.ichor.by/graphql`);
