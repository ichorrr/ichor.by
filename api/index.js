import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLError } from 'graphql';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { typeDefs } from './schema/index.js';
import bcrypt from 'bcrypt';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';
import { GraphQLScalarType, Kind } from 'graphql';
import models from './models/index.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { spawn } from 'child_process';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { fileTypeFromFile } from 'file-type';

import mongoose from 'mongoose';
import { update } from 'tar';
import { renderArticleSeoHtml } from './seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname);

const userStorageRoot = userId => path.join(__dirname, 'uploads', 'users', String(userId));
const USER_STORAGE_LIMIT_BYTES = Math.max(1, Number(process.env.USER_STORAGE_LIMIT_MB) || 500) * 1024 * 1024;
const TEMP_UPLOAD_TTL_MS = Math.max(1, Number(process.env.TEMP_UPLOAD_TTL_HOURS) || 24) * 60 * 60 * 1000;
const SAFE_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff']);
const SAFE_VIDEO_MIMES = new Set(['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/3gpp']);
const SAFE_AUDIO_MIMES = new Set(['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac']);
const SAFE_CHAT_MIMES = new Set([...SAFE_IMAGE_MIMES, ...SAFE_VIDEO_MIMES, ...SAFE_AUDIO_MIMES, 'application/pdf']);
const ensureUserStorage = userId => {
  const root = userStorageRoot(userId);
  ['posts', 'chats', 'user'].forEach(folder => fs.mkdirSync(path.join(root, folder), { recursive: true }));
  return root;
};
const getDirectorySize = directory => {
  if (!fs.existsSync(directory)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) total += getDirectorySize(entryPath);
    else if (entry.isFile()) total += fs.statSync(entryPath).size;
  }
  return total;
};
const getUserStorageSize = userId => getDirectorySize(userStorageRoot(userId));
const exceedsUserStorageQuota = (userId, additionalBytes = 0) => getUserStorageSize(userId) + additionalBytes > USER_STORAGE_LIMIT_BYTES;
const cleanupAbandonedUploads = () => {
  const usersDirectory = path.join(__dirname, 'uploads', 'users');
  if (!fs.existsSync(usersDirectory)) return;
  const cutoff = Date.now() - TEMP_UPLOAD_TTL_MS;
  for (const userEntry of fs.readdirSync(usersDirectory, { withFileTypes: true })) {
    if (!userEntry.isDirectory()) continue;
    const temporaryDirectory = path.join(usersDirectory, userEntry.name, 'posts', '.tmp');
    if (!fs.existsSync(temporaryDirectory)) continue;
    for (const fileEntry of fs.readdirSync(temporaryDirectory, { withFileTypes: true })) {
      const filePath = path.join(temporaryDirectory, fileEntry.name);
      try {
        const stats = fs.lstatSync(filePath);
        if (stats.isSymbolicLink()) {
          fs.unlinkSync(filePath);
        } else if (stats.isDirectory()) {
          if (stats.mtimeMs < cutoff) fs.rmSync(filePath, { recursive: true, force: true });
        } else if (stats.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Could not clean abandoned upload ${filePath}:`, error.message);
      }
    }
  }
};
const safeStoredName = name => `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${path.basename(name).replace(/[^\w.\-]/g, '_')}`;
const thumbnailPathFor = filePath => path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.thumb.webp`);
const createMediaThumbnail = async (filePath, mimetype = '') => {
  const thumbnailPath = thumbnailPathFor(filePath);
  try {
    if (mimetype.startsWith('image/')) {
      await sharp(filePath, { animated: false, limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 640, height: 480, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(thumbnailPath);
      return thumbnailPath;
    }
    if (mimetype.startsWith('video/') && ffmpegPath) {
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath, [
          '-hide_banner', '-loglevel', 'error', '-y', '-ss', '1', '-i', filePath,
          '-frames:v', '1', '-vf', 'scale=640:-2', '-f', 'webp', thumbnailPath,
        ], { windowsHide: true });
        let stderr = '';
        ffmpeg.stderr.on('data', chunk => { stderr += chunk.toString(); });
        ffmpeg.on('error', reject);
        ffmpeg.on('close', code => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited ${code}`)));
      });
      return thumbnailPath;
    }
  } catch (error) {
    fs.rmSync(thumbnailPath, { force: true });
    console.warn(`Thumbnail generation failed for ${path.basename(filePath)}:`, error.message);
  }
  return null;
};
const thumbnailUrlFor = url => {
  try {
    const parsed = new URL(String(url));
    const originalName = path.posix.basename(parsed.pathname);
    const thumbnailName = `${path.posix.basename(originalName, path.posix.extname(originalName))}.thumb.webp`;
    parsed.pathname = `${path.posix.dirname(parsed.pathname)}/${encodeURIComponent(thumbnailName)}`;
    return parsed.toString();
  } catch (error) {
    return '';
  }
};
const publicUploadUrl = (req, relativePath) => `${req.get('x-forwarded-proto') || req.protocol}://${req.get('host')}${relativePath}`;
const CHAT_MEDIA_URL_TTL_SECONDS = 15 * 60;
const signChatMediaToken = ({ userId, ownerId, partnerId, fileName, legacy = false }) => {
  const payload = Buffer.from(JSON.stringify({
    userId: String(userId),
    ownerId: String(ownerId || ''),
    partnerId: String(partnerId || ''),
    fileName: String(fileName),
    legacy,
    expiresAt: Math.floor(Date.now() / 1000) + CHAT_MEDIA_URL_TTL_SECONDS,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};
const verifyChatMediaToken = token => {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.userId || decoded.expiresAt < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch (error) {
    return null;
  }
};
const signChatFileUrl = (fileUrl, userId) => {
  if (!fileUrl) return fileUrl;
  return String(fileUrl).split('|').map(url => {
    try {
      const parsed = new URL(url);
      const legacyMatch = parsed.pathname.match(/^\/imgmessages\/([^/]+)$/);
      const privateMatch = parsed.pathname.match(/^\/uploads\/users\/([^/]+)\/chats\/([^/]+)\/([^/]+)$/);
      if (!legacyMatch && !privateMatch) return url;
      if (!userId) return '';
      const decodedFileName = decodeURIComponent((legacyMatch || privateMatch)[legacyMatch ? 1 : 3]);
      const token = signChatMediaToken({
        userId,
        ownerId: privateMatch?.[1],
        partnerId: privateMatch?.[2],
        fileName: decodedFileName,
        legacy: Boolean(legacyMatch),
      });
      parsed.searchParams.set('access_token', token);
      return parsed.toString();
    } catch (error) {
      return url;
    }
  }).join('|');
};
const storedPathFromUrl = url => {
  try {
    const pathname = decodeURIComponent(new URL(String(url), 'http://localhost').pathname).replace(/^\/+/, '');
    const absolutePath = path.resolve(__dirname, pathname);
    const allowedRoots = ['uploads', 'imgposts', 'imgmessages', 'avatars'].map(folder => path.resolve(__dirname, folder));
    return allowedRoots.some(root => absolutePath.startsWith(`${root}${path.sep}`)) ? absolutePath : null;
  } catch (error) {
    return null;
  }
};
const removeUploadedUrl = url => {
  if (!url) return;
  const filePath = storedPathFromUrl(url);
  if (filePath) {
    fs.rmSync(filePath, { force: true });
    fs.rmSync(thumbnailPathFor(filePath), { force: true });
  }
};
const validatePostMedia = fields => {
  for (const [field, value] of Object.entries(fields)) {
    const urls = String(value || '').split('|').filter(Boolean);
    if (!urls.length) continue;
    const videos = urls.filter(url => /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url.split('#')[0]));
    if (videos.length && (videos.length !== 1 || urls.length !== 1)) {
      throw new GraphQLError(`В блоке ${field} можно загрузить либо изображения, либо одно видео.`, { extensions: { code: 'BAD_USER_INPUT' } });
    }
    if (field === 'imageUrl' && urls.length > 1) {
      throw new GraphQLError('В главном блоке можно загрузить только один файл.', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    if (field === 'iconPost' && videos.length) {
      throw new GraphQLError('Для иконки записи разрешены только изображения.', { extensions: { code: 'BAD_USER_INPUT' } });
    }
  }
};
const removeChatFileCopies = (url, userId, addresseeId) => {
  removeUploadedUrl(url);
  if (!url || !userId || !addresseeId) return;
  const filePath = storedPathFromUrl(url);
  if (!filePath) return;
  const filename = path.basename(filePath);
  for (const [ownerId, partnerId] of [[userId, addresseeId], [addresseeId, userId]]) {
    const counterpartPath = path.join(userStorageRoot(ownerId), 'chats', String(partnerId), filename);
    fs.rmSync(counterpartPath, { force: true });
    fs.rmSync(thumbnailPathFor(counterpartPath), { force: true });
  }
};
const moveTempPostFiles = async post => {
  const postFolder = path.join(userStorageRoot(post.author), 'posts', String(post._id));
  fs.mkdirSync(postFolder, { recursive: true });
  let changed = false;
  for (const field of ['imageUrl', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'iconPost']) {
    const urls = String(post[field] || '').split('|').filter(Boolean);
    const movedUrls = urls.map(url => {
      const sourcePath = storedPathFromUrl(url);
      if (!sourcePath || !sourcePath.includes(`${path.sep}.tmp${path.sep}`)) return url;
      const filename = path.basename(sourcePath);
      const destinationPath = path.join(postFolder, filename);
      fs.renameSync(sourcePath, destinationPath);
      const temporaryThumbnailPath = thumbnailPathFor(sourcePath);
      if (fs.existsSync(temporaryThumbnailPath)) {
        fs.renameSync(temporaryThumbnailPath, thumbnailPathFor(destinationPath));
      }
      changed = true;
      const origin = new URL(url, 'https://api.ichor.by').origin;
      return `${origin}/uploads/users/${post.author}/posts/${post._id}/${encodeURIComponent(filename)}`;
    });
    if (movedUrls.length) post[field] = movedUrls.join('|');
  }
  if (changed) await post.save();
};

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{10,128}$/;
const PASSWORD_RULE_MESSAGE = 'Пароль должен содержать 10–128 символов, прописную и строчную буквы, цифру и специальный символ.';
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mailTransport = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    })
  : null;
const hashResetToken = token => crypto.createHash('sha256').update(token).digest('hex');
const sendEmail = async ({ to, subject, text, html }) => {
  if (!mailTransport) {
    console.warn('Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASSWORD in api/.env.');
    return false;
  }
  try {
    await mailTransport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html });
    return true;
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    return false;
  }
};

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
    Query: {
      async getUsers(parent, args, { models, user }) {
        if (!user) {
          throw new GraphQLError('You must be signed in', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        const currentUser = await models.User.findById(user.id).select('isAdmin');
        const users = await models.User.find(currentUser?.isAdmin ? {} : { isDeleted: { $ne: true } });
        return users;
      },
      async getUser(parent, args, { models }) {
        return await models.User.findById(args._id);
      },

      async me(parent, args, { models, user }) {
        return await models.User.findById(user.id);
      },

      async getCats() {
        return await models.Cat.find({});
      },

      async getPosts(parent, args, { models, user }) {
        const isAdmin = Boolean(user && (await models.User.findById(user.id))?.isAdmin);
        const query = isAdmin ? {} : { status: { $ne: 'pending' } };
        return await models.Post.find(query)
          .limit(100)
          .sort({ createdAt: -1, updatedAt: -1 })
          .populate('category')
          .populate('author')
          .populate({ path: 'comments', populate: { path: 'author', select: '_id name' } });
      },
      async getMessages(parent, args, { models, user }) {
        if (!user?.id) throw new GraphQLError('You must be signed in to read chat messages', { extensions: { code: 'UNAUTHENTICATED' } });
        const messages = await models.Message.find({
          $or: [
            { user: new mongoose.Types.ObjectId(user.id) },
            { addressee: String(user.id) },
          ],
        }).sort({ createdAt: -1, updatedAt: -1 });
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
            let unreadCount = await models.Message.countDocuments({
              addressee: String(currentUser._id),
              user: fam._id,
              read: false
            });

            if (lastMessageDoc) {
              lastMessage = {
                _id: lastMessageDoc._id,
                text: lastMessageDoc.text,
                file: lastMessageDoc.file || null,
                user: lastMessageDoc.user?._id || lastMessageDoc.user,
                addressee: lastMessageDoc.addressee,
                createdAt: lastMessageDoc.createdAt,
                author: lastMessageDoc.user ? { _id: lastMessageDoc.user._id, name: lastMessageDoc.user.name, avatar: lastMessageDoc.user.avatar || null } : null,
                unreadCount
              };
            }

            return {
              _id: fam._id,
              name: fam.name,
              avatar: fam.avatar || null,
              lastVisit: fam.lastVisit || null,
              lastMessage,
              unreadCount
            };
          }));

          // debug: log computed chats with unread counts before returning
          try {
            console.log('DEBUG getMyListUsersChats result:', JSON.stringify(chats.map(c => ({ _id: String(c._id), name: c.name, unreadCount: c.unreadCount, lastMessage: { _id: c.lastMessage?._id, unreadCount: c.lastMessage?.unreadCount } })), null, 2));
          } catch (e) {
            console.error('DEBUG stringify error', e);
          }

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
      if (!user?.id) {
        throw new GraphQLError('You must be signed in to read chat messages', { extensions: { code: 'UNAUTHENTICATED' } });
      }
    if (!args.addressee || !Array.isArray(args.addressee) || args.addressee.length < 2) {
        throw new GraphQLError('Addressee must be an array of two user IDs', {
            extensions: { code: 'BAD_USER_INPUT' },
        });
    }
    
    // Convert both IDs to ObjectId for user field comparison
    const requestedIds = args.addressee.map(String);
    if (!requestedIds.includes(String(user.id)) || new Set(requestedIds).size !== 2 || requestedIds.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      throw new GraphQLError('You can only read a chat you participate in', { extensions: { code: 'FORBIDDEN' } });
    }
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
      async getMessage(parent, args, { models, user }) {
        if (!user?.id) throw new GraphQLError('You must be signed in to read a chat message', { extensions: { code: 'UNAUTHENTICATED' } });
        const message = await models.Message.findById(args._id);
        if (!message) {
          throw new GraphQLError('Message not found', {
            extensions: {
              code: 'NOT_FOUND',
            },
          });
        }
        if (String(message.user) !== String(user.id) && String(message.addressee) !== String(user.id)) {
          throw new GraphQLError('You can only read a chat message addressed to you or sent by you', { extensions: { code: 'FORBIDDEN' } });
        }
        return message;
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
      async getPost(parent, args, { models, user }) {
        const currentUser = user ? await models.User.findById(user.id) : null;
        const isAdmin = Boolean(currentUser?.isAdmin);
        const query = isAdmin ? { _id: args._id } : { _id: args._id, status: { $ne: 'pending' } };

        const post = await models.Post.findOneAndUpdate(
          query,
          { $inc: { viewsCount: 1 } },
          { returnDocument: 'true' }
        )
          .populate('category')
          .populate('author')
          .populate({ path: 'comments', populate: { path: 'author', select: '_id name' } });
        return post;
      },
      async getCat(parent, args, { models }) {
        const cat = await models.Cat.findById(args._id);
        return cat;
      },

      async getPendingPosts(parent, args, { models, user }) {
        if (!user) {
          throw new GraphQLError('You must be signed in', { extensions: { code: 'UNAUTHENTICATED' } });
        }

        const currentUser = await models.User.findById(user.id);
        if (!currentUser?.isAdmin) {
          throw new GraphQLError('Only administrators can view pending posts', { extensions: { code: 'FORBIDDEN' } });
        }

        return await models.Post.find({ status: 'pending' })
          .sort({ createdAt: -1 })
          .populate('category')
          .populate('author')
          .populate({ path: 'comments', populate: { path: 'author', select: '_id name' } });
      },
  
      postFirst: async () => {
              let pos = await models.Post.findOne({ scriptUrl: true}).sort({createdAt: -1, updatedAt: -1});
              return pos;
          },
  
      postFeed: async (parent, { qualifier, tag, limit = 100, cursor }, { models, user }) => {

        const currentUser = user ? await models.User.findById(user.id) : null;
        const isAdmin = Boolean(currentUser?.isAdmin);
        const visiblePostQuery = isAdmin ? {} : { status: { $ne: 'pending' } };

        let hasNextPage = false;
        let totalQuery = visiblePostQuery;

        const tagQuery = tag
          ? { tags: { $regex: `^#?${escapeRegex(tag)}$`, $options: 'i' } }
          : null;
        const qualifierQuery = qualifier ? { $or: [{author: qualifier}, {category: qualifier}] } : null;
        const feedFilter = tagQuery || qualifierQuery;

        if (cursor && feedFilter) {
          totalQuery = { ...visiblePostQuery, ...feedFilter, _id: { $lt: cursor } };
        }

        if(cursor && !feedFilter){
          totalQuery = { ...visiblePostQuery, _id: { $lt: cursor } };
        }
        
        if (!cursor && feedFilter) {
          totalQuery = { ...visiblePostQuery, ...feedFilter };
        }

        const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
        let posts = await models.Post.find(totalQuery)
          .sort({ _id: -1 })
          .limit(safeLimit + 1);
  
        if (posts.length > safeLimit) {
          hasNextPage = true;
          posts = posts.slice(0, -1);
        }
  
        const newCursor = posts.length ? posts[posts.length - 1]._id : '';
  
        return {
          posts,
          cursor: newCursor,
          hasNextPage
        };
      },
  },

    Mutation: {
      deleteUsers: async (_, { userIds, mode }, { models, user }) => {
        if (!user) {
          throw new GraphQLError('You must be signed in', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        const currentUser = await models.User.findById(user.id).select('isAdmin');
        if (!currentUser?.isAdmin) {
          throw new GraphQLError('Only administrators can delete users', { extensions: { code: 'FORBIDDEN' } });
        }

        const ids = [...new Set((userIds || []).map(String))].filter(id => id !== String(user.id));
        if (!ids.length) return 0;

        const users = await models.User.find({ _id: { $in: ids } }).select('_id avatar isDeleted');
        const objectIds = users.map(item => item._id);

        if (mode === 'USER_DATA') {
          await models.Post.updateMany({}, {
            $pull: { likes: { user: { $in: objectIds } }, dislikes: { user: { $in: objectIds } } }
          });
          await models.Comment.updateMany({}, {
            $pull: { likes: { user: { $in: objectIds } }, dislikes: { user: { $in: objectIds } } }
          });
          await models.Message.updateMany({}, {
            $pull: { likes: { user: { $in: objectIds } }, dislikes: { user: { $in: objectIds } } }
          });
          await models.User.updateMany({}, { $pull: { family: { $in: objectIds } } });
          await models.Chat.updateMany({}, { $pull: { participants: { $in: objectIds } } });

          for (const deletedUser of users) {
            deletedUser.name = 'Пользователь удален';
            deletedUser.email = `deleted-${deletedUser._id}@invalid.local`;
            deletedUser.password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
            deletedUser.passwordResetTokenHash = undefined;
            deletedUser.passwordResetExpires = undefined;
            deletedUser.telephone = undefined;
            deletedUser.avatar = undefined;
            deletedUser.bio = undefined;
            deletedUser.family = [];
            deletedUser.messages = [];
            deletedUser.posts = [];
            deletedUser.comments = [];
            deletedUser.isAdmin = false;
            deletedUser.isDeleted = true;
            await deletedUser.save();
          }
          return users.length;
        }

        const posts = await models.Post.find({ author: { $in: objectIds } }).select('_id imageUrl imageUrl2 imageUrl3 imageUrl4 iconPost');
        const postIds = posts.map(post => post._id);

        await models.Post.updateMany({}, {
          $pull: { likes: { user: { $in: objectIds } }, dislikes: { user: { $in: objectIds } } }
        });
        await models.Comment.updateMany({}, {
          $pull: { likes: { user: { $in: objectIds } }, dislikes: { user: { $in: objectIds } } }
        });
        await models.Message.updateMany({}, {
          $pull: { likes: { user: { $in: objectIds } }, dislikes: { user: { $in: objectIds } } }
        });
        await models.User.updateMany({}, { $pull: { family: { $in: objectIds } } });
        await models.Chat.deleteMany({ participants: { $in: objectIds } });

        await models.Comment.deleteMany({ $or: [
          { author: { $in: objectIds } },
          { post: { $in: postIds } }
        ] });
        await models.Post.deleteMany({ _id: { $in: postIds } });
        await models.Cat.updateMany({}, { $pull: { posts: { $in: postIds } } });
        const messages = await models.Message.find({ $or: [
          { user: { $in: objectIds } },
          { addressee: { $in: ids } }
        ] }).select('file user addressee');
        for (const message of messages) {
          String(message.file || '').split('|').filter(Boolean).forEach(url => removeChatFileCopies(url, message.user, message.addressee));
        }
        for (const post of posts) {
          [post.imageUrl, post.imageUrl2, post.imageUrl3, post.imageUrl4, post.iconPost]
            .flatMap(value => String(value || '').split('|'))
            .forEach(removeUploadedUrl);
        }
        await models.Message.deleteMany({ _id: { $in: messages.map(message => message._id) } });
        const result = await models.User.deleteMany({ _id: { $in: objectIds } });

        for (const deletedUser of users) {
          removeUploadedUrl(deletedUser.avatar);
          fs.rmSync(userStorageRoot(deletedUser._id), { recursive: true, force: true });
        }
        return result.deletedCount || 0;
      },
      deleteMyAccount: async (_, __, { models, user }) => {
        if (!user) throw new GraphQLError('Необходимо войти в аккаунт.', { extensions: { code: 'UNAUTHENTICATED' } });
        const account = await models.User.findById(user.id);
        if (!account || account.isDeleted) return true;
        const accountId = account._id;
        await models.Post.updateMany({}, { $pull: { likes: { user: accountId }, dislikes: { user: accountId } } });
        await models.Comment.updateMany({}, { $pull: { likes: { user: accountId }, dislikes: { user: accountId } } });
        await models.Message.updateMany({}, { $pull: { likes: { user: accountId }, dislikes: { user: accountId } } });
        await models.User.updateMany({}, { $pull: { family: accountId } });
        await models.Chat.updateMany({}, { $pull: { participants: accountId } });
        account.name = 'Пользователь удален';
        account.email = `deleted-${accountId}@invalid.local`;
        account.password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
        account.passwordResetTokenHash = undefined;
        account.passwordResetExpires = undefined;
        account.telephone = undefined;
        account.avatar = undefined;
        account.bio = undefined;
        account.family = [];
        account.isAdmin = false;
        account.isDeleted = true;
        await account.save();
        return true;
      },
      signUp: async (parent, { name, email, password }, { models }) => {
        // normalize email address
        email = email.trim().toLowerCase();
        if (!PASSWORD_RULE.test(password)) {
          throw new GraphQLError(PASSWORD_RULE_MESSAGE, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new GraphQLError('Укажите корректное имя и адрес электронной почты.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        // hash the password
        const hashed = await bcrypt.hash(password, 10);

        try {
          const username = await models.User.create({
            name,
            email,
            password: hashed
          });

          // Create user folders
          const userFolder = ensureUserStorage(username._id);

          const resetUrl = `${process.env.FRONTEND_URL || 'https://ichor.by'}/reset-password`;
          const emailSent = await sendEmail({
            to: email,
            subject: 'Добро пожаловать на ICHOR.BY',
            text: `Здравствуйте, ${name}!\n\nПоздравляем с регистрацией на сайте ICHOR.BY.\n\nЛогин: ${name}\nПароль: ${password}\n\nДля смены пароля используйте страницу: ${resetUrl}. Если пароль утрачен, запросите там одноразовую ссылку.\n\nБазовые правила:\n1. Уважайте других пользователей и не публикуйте оскорбления, спам и незаконный контент.\n2. Публикуйте только материалы, на которые у вас есть права.\n3. Не передавайте пароль третьим лицам.\n4. Не размещайте персональные данные и подозрительные ссылки.\n5. Администрация может скрыть материалы, нарушающие правила сайта.\n\nС уважением, команда ICHOR.BY`,
            html: `<p>Здравствуйте, <strong>${name}</strong>!</p><p>Поздравляем с регистрацией на сайте ICHOR.BY.</p><p><strong>Логин:</strong> ${name}<br><strong>Пароль:</strong> ${password}</p><p>Для смены пароля откройте <a href="${resetUrl}">страницу восстановления пароля</a> и запросите одноразовую ссылку.</p><p><strong>Базовые правила:</strong></p><ol><li>Уважайте других пользователей; не публикуйте оскорбления и спам.</li><li>Публикуйте только материалы, на которые у вас есть права.</li><li>Не передавайте пароль третьим лицам.</li><li>Не размещайте персональные данные и подозрительные ссылки.</li><li>Администрация может скрыть материалы, нарушающие правила.</li></ol><p>С уважением, команда ICHOR.BY</p>`
          });
          if (!emailSent) {
            await models.User.deleteOne({ _id: username._id });
            fs.rmSync(userFolder, { recursive: true, force: true });
            throw new GraphQLError('Регистрация временно недоступна: письмо не удалось отправить. Попробуйте позже.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
          }
  
          // create and return the json web token
          return jwt.sign({ id: username._id }, process.env.JWT_SECRET);
        } catch (err) {
          if (err instanceof GraphQLError) throw err;
          if (err?.code === 11000) {
            throw new GraphQLError('Пользователь с таким именем или email уже зарегистрирован.', { extensions: { code: 'BAD_USER_INPUT' } });
          }
          // if there's a problem creating the account, throw an error
          throw new Error('Error creating account');
        }
      },

      requestPasswordReset: async (_, { email }, { models }) => {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await models.User.findOne({ email: normalizedEmail }).select('+passwordResetTokenHash +passwordResetExpires');
        // одинаковый ответ не раскрывает наличие аккаунта по адресу
        if (!user) return 'Если аккаунт существует, письмо со ссылкой отправлено.';

        const token = crypto.randomBytes(32).toString('hex');
        user.passwordResetTokenHash = hashResetToken(token);
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        const resetUrl = `${process.env.FRONTEND_URL || 'https://ichor.by'}/reset-password?token=${token}`;
        const emailSent = await sendEmail({
          to: user.email,
          subject: 'Восстановление пароля ICHOR.BY',
          text: `Здравствуйте, ${user.name}!\n\nЧтобы задать новый пароль, перейдите по ссылке (она действует 1 час): ${resetUrl}\n\nЕсли вы не запрашивали восстановление, просто проигнорируйте это письмо.`,
          html: `<p>Здравствуйте, <strong>${user.name}</strong>!</p><p>Чтобы задать новый пароль, перейдите по ссылке. Она действует 1 час:</p><p><a href="${resetUrl}">Восстановить пароль</a></p><p>Если вы не запрашивали восстановление, просто проигнорируйте это письмо.</p>`
        });
        if (!emailSent) {
          user.passwordResetTokenHash = undefined;
          user.passwordResetExpires = undefined;
          await user.save();
          throw new GraphQLError('Сервис отправки писем временно недоступен. Попробуйте позже.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        return 'Если аккаунт существует, письмо со ссылкой отправлено.';
      },

      resetPassword: async (_, { token, password }, { models }) => {
        if (!PASSWORD_RULE.test(password)) {
          throw new GraphQLError(PASSWORD_RULE_MESSAGE, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        const user = await models.User.findOne({
          passwordResetTokenHash: hashResetToken(token),
          passwordResetExpires: { $gt: new Date() }
        }).select('+passwordResetTokenHash +passwordResetExpires');
        if (!user) {
          throw new GraphQLError('Ссылка восстановления недействительна или истекла.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        user.password = await bcrypt.hash(password, 12);
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      },

      changePassword: async (_, { currentPassword, newPassword }, { models, user }) => {
        if (!user) throw new GraphQLError('Необходимо войти в аккаунт.', { extensions: { code: 'UNAUTHENTICATED' } });
        if (!PASSWORD_RULE.test(newPassword)) {
          throw new GraphQLError(PASSWORD_RULE_MESSAGE, { extensions: { code: 'BAD_USER_INPUT' } });
        }
        const currentUser = await models.User.findById(user.id);
        if (!currentUser || !(await bcrypt.compare(currentPassword, currentUser.password))) {
          throw new GraphQLError('Текущий пароль указан неверно.', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        currentUser.password = await bcrypt.hash(newPassword, 12);
        await currentUser.save();
        return true;
      },
  
      signIn: async (parent, { name, email, password }, { models }) => {
        if (email) {
          // normalize email address
          email = email.trim().toLowerCase();
        }
        const username = await models.User.findOne({
          $and: [
            { isDeleted: { $ne: true } },
            { $or: [{ email }, { name }] }
          ]
        });
        // if no user is found, throw an authentication error
        if (!username) {
          throw new GraphQLError('Error signing in', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        // if the passwords don't match, throw an authentication error
        const valid = await bcrypt.compare(password, username.password);
        if (!valid) {
          throw new GraphQLError('Error signing in', { extensions: { code: 'UNAUTHENTICATED' } });
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
          throw new GraphQLError('You must be signed in to delete a post', { extensions: { code: 'UNAUTHENTICATED' } });
        }
  
        // find the post
        const post = await models.Post.findById(_id);
        if (!post) {
          throw new GraphQLError('Post not found', { extensions: { code: 'NOT_FOUND' } });
        }
  
        // if the post owner and current user don't match, throw a forbidden error
        if (String(post.author) !== user.id) {
          throw new GraphQLError("You don't have permissions to delete the post", {
            extensions: {
              code: 'FORBIDDEN',
            },
          });
        }
  
        try {
          fs.rmSync(path.join(userStorageRoot(post.author), 'posts', String(post._id)), { recursive: true, force: true });
          [post.imageUrl, post.imageUrl2, post.imageUrl3, post.imageUrl4, post.iconPost]
            .flatMap(value => String(value || '').split('|'))
            .forEach(removeUploadedUrl);
  
          await models.Comment.deleteMany({ post: post._id });
          await post.deleteOne();
          return true;
        } catch (err) {
          console.error('deletePost error:', err);
          throw new GraphQLError('Error deleting post', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
      },

      deleteComment: async (parent, { _id }, { models, user }) => {
        
        // if not a user, throw an Authentication Error
        if (!user) {
          throw new GraphQLError('You must be signed in to delete a note', { extensions: { code: 'UNAUTHENTICATED' } });
        }
  
        // find the note
        const comm = await models.Comment.findById(_id);
        if (!comm) {
          return false;
        }
        
        // if the note owner and current user don't match, throw a forbidden error
        if (String(comm.author) !== user.id) {
          throw new GraphQLError("You don't have permissions to delete the note", {
            extensions: {
              code: 'FORBIDDEN',
              myExtension: "foo",
            },
          });
        }
  
        try {
          // remove the comment document
          await comm.deleteOne();

          // remove the comment reference from the post
          const post = await models.Post.findById(comm.post);
          if (post) {
            post.comments = post.comments.filter(commentId => String(commentId) !== String(_id));
            if (typeof post.commentCount === 'number') {
              post.commentCount = Math.max(0, post.commentCount - 1);
            }
            await post.save();
          }

          // remove the comment reference from the author
          const author = await models.User.findById(comm.author);
          if (author) {
            author.comments = author.comments.filter(commentId => String(commentId) !== String(_id));
            await author.save();
          }

          return true;
        } catch (err) {
          // if there's an error along the way, return false
          return false;
        }
      },
      deleteMessage: async (parent, { _id }, { models, user }) => {
        // if not a user, throw an Authentication Error
        if (!user) {  
          throw new GraphQLError('You must be signed in to delete a message', { extensions: { code: 'UNAUTHENTICATED' } });
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
          if (message?.file) String(message.file).split('|').filter(Boolean)
            .forEach(url => removeChatFileCopies(url, message.user, message.addressee));
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
          throw new GraphQLError('You must be signed in to delete a message', { extensions: { code: 'UNAUTHENTICATED' } });
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
              removeChatFileCopies(urlToDelete, message.user, message.addressee);
              
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
                removeChatFileCopies(url, message.user, message.addressee);
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
  
      updatePost: async (parent, { iconPost, imageUrl, imageUrl2, imageUrl3, imageUrl4, scriptUrl, externalSource, tags, title, body, body2, body3, body4, category, _id }, { models, user }) => {
        // if not a user, throw an Authentication Error
        if (!user) {
          throw new GraphQLError('You must be signed in to update a note', { extensions: { code: 'UNAUTHENTICATED' } });
        }

        const currentUser = await models.User.findById(user.id);
        const restrictedCategoryIds = [
          '6251ef28413373118838bbdd',
          '6251f1532f7a51343c8ed7df',
        ];

        if (!currentUser?.isAdmin && category && restrictedCategoryIds.includes(category)) {
          throw new GraphQLError('Only administrators can select category Новости or Статьи.', { extensions: { code: 'FORBIDDEN' } });
        }

        // find the note
        const note = await models.Post.findById(_id);
        // if the note owner and current user don't match, throw a forbidden error
        if (note && String(note.author) !== user.id) {
          throw new GraphQLError(
            "You don't have permissions to update the note"
          , { extensions: { code: 'FORBIDDEN' } });
        }
        validatePostMedia({ imageUrl, imageUrl2, imageUrl3, imageUrl4, iconPost });
        const externalSourceValue = externalSource && typeof externalSource === 'object'
          ? externalSource
          : { url: externalSource };

        const updateFields = {
          title,
          body,
          body2,
          body3,
          body4,
          iconPost,
          imageUrl,
          imageUrl2,
          imageUrl3,
          imageUrl4,
          scriptUrl,
          externalSource: externalSourceValue,
          tags,
        };

        // Администраторские записи всегда остаются опубликованными и не попадают в модерацию.
        if (currentUser?.isAdmin) {
          updateFields.status = 'approved';
          updateFields.moderationNote = null;
        }

        if (category) {
          updateFields.category = new mongoose.Types.ObjectId(category);
        }

        const updatedPost = await models.Post.findOneAndUpdate(
          {
            _id: _id
          },
          {
            $set: updateFields
          },
          {
            new: true
          }
        );

        if (category && note && String(note.category) !== String(category)) {
          const oldCat = await models.Cat.findById(note.category);
          const newCat = await models.Cat.findById(category);

          if (oldCat) {
            oldCat.posts = oldCat.posts.filter(id => String(id) !== String(note._id));
            await oldCat.save();
          }

          if (newCat) {
            newCat.posts.push(updatedPost._id);
            await newCat.save();
          }
        }

        return updatedPost;
      },
  
      createPost: async (parent, args, { models, user }) => {
        if (!user) {
          throw new GraphQLError('You must be signed in to create a note', { extensions: { code: 'UNAUTHENTICATED' } });
        }

        const currentUser = await models.User.findById(user.id);
        const restrictedCategoryIds = [
          '6251ef28413373118838bbdd',
          '6251f1532f7a51343c8ed7df',
        ];

        if (!currentUser?.isAdmin && restrictedCategoryIds.includes(args.category)) {
          throw new GraphQLError('Only administrators can select category Новости or Статьи.', { extensions: { code: 'FORBIDDEN' } });
        }
        validatePostMedia(args);
  
        const newPost = await models.Post({
          title: args.title,
          iconPost: args.iconPost,
          imageUrl: args.imageUrl,
          imageUrl2: args.imageUrl2,
          imageUrl3: args.imageUrl3,
          imageUrl4: args.imageUrl4,
          scriptUrl: args.scriptUrl,
          externalSource: args.externalSource && typeof args.externalSource === 'object'
            ? args.externalSource
            : { url: args.externalSource },
          tags: args.tags,
          body: args.body,
          body2: args.body2,
          body3: args.body3,
          body4: args.body4,
          category: new mongoose.Types.ObjectId(args.category),
          author: new mongoose.Types.ObjectId(user.id),
          status: currentUser?.isAdmin ? 'approved' : 'pending'
        });

        const createPost = await newPost.save();
        await moveTempPostFiles(createPost);

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

      moderatePost: async (_, { postId, decision, reason }, { models, user }) => {
        if (!user) {
          throw new GraphQLError('You must be signed in', { extensions: { code: 'UNAUTHENTICATED' } });
        }

        const currentUser = await models.User.findById(user.id);
        if (!currentUser?.isAdmin) {
          throw new GraphQLError('Only administrators can moderate posts', { extensions: { code: 'FORBIDDEN' } });
        }

        const post = await models.Post.findById(postId).populate('author');
        if (!post) {
          throw new GraphQLError('Post not found', { extensions: { code: 'NOT_FOUND' } });
        }

        const normalizedDecision = `${decision || ''}`.trim().toLowerCase();
        const allowedDecisions = ['approve', 'reject'];
        if (!allowedDecisions.includes(normalizedDecision)) {
          throw new GraphQLError('Decision must be approve or reject', { extensions: { code: 'BAD_USER_INPUT' } });
        }

        post.status = normalizedDecision === 'approve' ? 'approved' : 'rejected';
        post.moderationNote = reason || null;
        await post.save();

        if (post.author) {
          const recipientId = String(post.author._id || post.author);
          const adminName = currentUser.name || 'Администратор';
          const template = normalizedDecision === 'approve'
            ? `Здравствуйте! Ваша запись «${post.title}» прошла модерацию и опубликована.`
            : `Здравствуйте! Ваша запись «${post.title}» не прошла модерацию. ${reason ? `Причина: ${reason}` : 'Пожалуйста, проверьте требования к публикации и попробуйте ещё раз.'}`;

          await models.Message.create({
            text: template,
            addressee: recipientId,
            user: currentUser._id,
            read: false
          });

          const recipient = await models.User.findById(recipientId);
          if (recipient) {
            if (!recipient.family.some(id => String(id) === String(currentUser._id))) {
              recipient.family.push(currentUser._id);
              await recipient.save();
            }
            if (!currentUser.family.some(id => String(id) === recipientId)) {
              currentUser.family.push(post.author._id);
              await currentUser.save();
            }
          }
        }

        return post;
      },
  
      createComment: async (_, args, { models, user }) => {
        if (!user) {
          throw new GraphQLError(
            'You must be signed in to create a comments'
          , { extensions: { code: 'UNAUTHENTICATED' } });
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
        throw new GraphQLError(
          'You must be signed in to create a message'
        , { extensions: { code: 'UNAUTHENTICATED' } });
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

         ensureUserStorage(author._id);
         ensureUserStorage(recipient._id);
         fs.mkdirSync(path.join(userStorageRoot(author._id), 'chats', String(recipient._id)), { recursive: true });
         fs.mkdirSync(path.join(userStorageRoot(recipient._id), 'chats', String(author._id)), { recursive: true });
       
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
    updateUser: async (_, { name, email, telephone, avatar, bio }, { models, user }) => {
      if (!user) {
        throw new GraphQLError('You must be signed in to update profile', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      try {
        // Ensure we only update the current authenticated user
        const currentUserId = user.id;
        if (!currentUserId) {
          throw new GraphQLError('User ID not found in authentication context', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }

        const previousUser = avatar ? await models.User.findById(currentUserId).select('avatar') : null;

        const updated = await models.User.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(currentUserId) },
          { 
            $set: { 
              ...(name !== undefined && name ? { name } : {}), 
              ...(email !== undefined && email ? { email } : {}), 
              ...(telephone !== undefined && telephone ? { telephone } : {}), 
              ...(avatar !== undefined && avatar ? { avatar } : {}),
              ...(bio !== undefined ? { bio } : {})
            } 
          },
          { new: true }
        );

        if (!updated) {
          throw new GraphQLError('User not found', { extensions: { code: 'NOT_FOUND' } });
        }

        if (previousUser?.avatar && previousUser.avatar !== updated.avatar) {
          removeUploadedUrl(previousUser.avatar);
        }

        console.log(`User ${currentUserId} updated`, { name, email, telephone, avatar: avatar ? 'yes' : 'no', bio });
        return updated;
      } catch (err) {
        console.error('updateUser error:', err);
        throw new GraphQLError('Failed to update user', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
    updateMessage: async (_, { _id, text, file }, { models, user }) => {
      // if not a user, throw an Authentication Error
      if (!user) {
        throw new GraphQLError('You must be signed in to update a message', { extensions: { code: 'UNAUTHENTICATED' } });
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
        throw new GraphQLError('You must be signed in to clear a chat', { extensions: { code: 'UNAUTHENTICATED' } });
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
            String(message.file).split('|').filter(Boolean)
              .forEach(url => removeChatFileCopies(url, message.user, message.addressee));
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
        throw new GraphQLError('You must be signed in to like', { extensions: { code: 'UNAUTHENTICATED' } });
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
          try {
            removeUploadedUrl(userDoc.avatar);
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
      async messages(parent, args, { models, user }) {
        if (!user?.id || String(parent._id) !== String(user.id)) return [];
        return await models.Message.find({ user: parent._id }).sort({ createdAt: -1, updatedAt: -1 });
      },
      family: async (parent, args, { models }) => {
        // parent.family is an array of user IDs
        if (!parent.family || parent.family.length === 0) return [];
        return await models.User.find({ _id: { $in: parent.family } });
      },
      lastMessage: async (parent, args, { models, user }) => {
        if (!user?.id) return null;
        if (parent.lastMessage && typeof parent.lastMessage === 'object' && parent.lastMessage._id) {
          const message = parent.lastMessage;
          return String(message.user) === String(user.id) || String(message.addressee) === String(user.id)
            ? message
            : null;
        }
        if (String(parent._id) !== String(user.id)) return null;
        if (!parent.lastMessage) return null;
        const message = await models.Message.findById(parent.lastMessage);
        if (!message || (String(message.user) !== String(user.id) && String(message.addressee) !== String(user.id))) return null;
        return message;
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
      },
      async commentCount(parent, args, { models }) {
        if (Array.isArray(parent.comments)) {
          return parent.comments.length;
        }
        return await models.Comment.countDocuments({ post: parent._id });
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
      unreadCount: parent => parent.unreadCount || 0,
      file: (parent, args, { user }) => {
        const isChatMedia = String(parent.file || '').split('|').some(url => /\/imgmessages\/|\/uploads\/users\/[^/]+\/chats\//.test(url));
        if (isChatMedia && (!user?.id || (String(parent.user?._id || parent.user) !== String(user.id) && String(parent.addressee) !== String(user.id)))) {
          return null;
        }
        return signChatFileUrl(parent.file, user?.id);
      },
      author: async (parent, args, { models }) => await models.User.findById(parent.user)
    },
  };
const DB_HOST = process.env.DB_HOST;

mongoose.connect(DB_HOST);
mongoose.connection.once('open', async () => {
  // Older installations may still have the former unique name index.
  try {
    await models.User.collection.dropIndex('name_1');
  } catch (error) {
    if (error.codeName !== 'IndexNotFound') console.warn('Could not remove legacy user name index:', error.message);
  }
});
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

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
}));

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

const abandonedUploadCleanupTimer = setInterval(() => {
  try {
    cleanupAbandonedUploads();
  } catch (error) {
    console.error('Abandoned upload cleanup failed:', error);
  }
}, 60 * 60 * 1000);
abandonedUploadCleanupTimer.unref();
try {
  cleanupAbandonedUploads();
} catch (error) {
  console.error('Initial abandoned upload cleanup failed:', error);
}

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

const setUploadedAssetSecurityHeaders = (res, filePath) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (/\.(svg|svgz|html?|xhtml|xml)$/i.test(filePath)) {
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.setHeader('Content-Disposition', 'attachment');
  }
};

app.use('/imgposts', express.static('imgposts', { setHeaders: setUploadedAssetSecurityHeaders }));

const sendAuthorizedChatMedia = async (req, res, next) => {
  const token = verifyChatMediaToken(req.query.access_token);
  if (!token) return res.status(401).json({ error: 'Ссылка на вложение истекла или недействительна.' });
  let session;
  try {
    session = getUser(req.headers.authorization || '');
  } catch (error) {
    return res.status(401).json({ error: 'Требуется действующая авторизация.' });
  }
  if (!session?.id || String(session.id) !== token.userId) {
    return res.status(403).json({ error: 'Ссылка на вложение выписана для другого пользователя.' });
  }

  const requestedFileName = path.basename(req.params.fileName || '');
  const isThumbnail = requestedFileName.endsWith('.thumb.webp');
  const expectedFileName = isThumbnail
    ? `${path.basename(token.fileName, path.extname(token.fileName))}.thumb.webp`
    : token.fileName;
  if (requestedFileName !== expectedFileName || path.basename(token.fileName) !== token.fileName || /[\\/]/.test(token.fileName)) {
    return res.status(403).json({ error: 'Нет доступа к файлу.' });
  }

  const account = await models.User.findById(token.userId).select('_id isDeleted');
  if (!account || account.isDeleted) return res.status(401).json({ error: 'Аккаунт недоступен.' });

  let originalPath;
  if (token.legacy) {
    if (!req.path.startsWith('/imgmessages/') || req.params.fileName !== token.fileName) {
      return res.status(403).json({ error: 'Нет доступа к файлу.' });
    }
    const legacyPath = `/imgmessages/${encodeURIComponent(token.fileName)}`;
    const message = await models.Message.findOne({
      file: { $regex: `${escapeRegex(legacyPath)}(?:\\||$)` },
      $or: [
        { user: account._id },
        { addressee: String(account._id) },
      ],
    }).select('_id');
    if (!message) return res.status(403).json({ error: 'Нет доступа к файлу.' });
    originalPath = path.resolve(__dirname, 'imgmessages', token.fileName);
  } else {
    if (!req.path.startsWith('/uploads/users/') || token.ownerId !== req.params.ownerId || token.partnerId !== req.params.partnerId) {
      return res.status(403).json({ error: 'Нет доступа к файлу.' });
    }
    if (String(account._id) !== token.ownerId && String(account._id) !== token.partnerId) {
      return res.status(403).json({ error: 'Только участники переписки могут открыть вложение.' });
    }
    if (!mongoose.Types.ObjectId.isValid(token.ownerId) || !mongoose.Types.ObjectId.isValid(token.partnerId)) {
      return res.status(404).json({ error: 'Файл не найден.' });
    }
    const attachmentPath = `/uploads/users/${token.ownerId}/chats/${token.partnerId}/${encodeURIComponent(token.fileName)}`;
    const message = await models.Message.findOne({
      file: { $regex: `${escapeRegex(attachmentPath)}(?:\\||$)` },
      $or: [
        { user: new mongoose.Types.ObjectId(token.ownerId), addressee: token.partnerId },
        { user: new mongoose.Types.ObjectId(token.partnerId), addressee: token.ownerId },
      ],
    }).select('_id');
    if (!message) return res.status(404).json({ error: 'Вложение не найдено в переписке.' });
    originalPath = path.resolve(userStorageRoot(token.ownerId), 'chats', token.partnerId, token.fileName);
  }

  const targetPath = isThumbnail ? thumbnailPathFor(originalPath) : originalPath;
  const expectedDirectory = path.dirname(originalPath);
  if (path.dirname(targetPath) !== expectedDirectory) return res.status(403).json({ error: 'Некорректный путь к файлу.' });
  try {
    if (!fs.lstatSync(targetPath).isFile()) return res.status(404).json({ error: 'Файл не найден.' });
  } catch (error) {
    return res.status(404).json({ error: 'Файл не найден.' });
  }

  const detectedType = await fileTypeFromFile(targetPath);
  const safeInlineMimes = new Set([...SAFE_IMAGE_MIMES, ...SAFE_VIDEO_MIMES, ...SAFE_AUDIO_MIMES]);
  const servedMime = detectedType && SAFE_CHAT_MIMES.has(detectedType.mime) ? detectedType.mime : 'application/octet-stream';

  res.set({
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Type': servedMime,
    'Content-Disposition': safeInlineMimes.has(servedMime) ? 'inline' : 'attachment',
    'Referrer-Policy': 'no-referrer',
  });
  return res.sendFile(targetPath, error => {
    if (error && !res.headersSent) next(error);
  });
};

app.get('/uploads/users/:ownerId/chats/:partnerId/:fileName', (req, res, next) => {
  sendAuthorizedChatMedia(req, res, next).catch(next);
});
app.get('/imgmessages/:fileName', (req, res, next) => {
  sendAuthorizedChatMedia(req, res, next).catch(next);
});

app.get('/uploads/users/:ownerId/posts/.tmp/:fileName', async (req, res, next) => {
  try {
    const session = getUser(req.headers.authorization || '');
    if (!session?.id || String(session.id) !== req.params.ownerId) {
      return res.status(403).json({ error: 'Черновой файл доступен только загрузившему его пользователю.' });
    }
    const account = await models.User.findById(session.id).select('_id isDeleted');
    if (!account || account.isDeleted) return res.status(401).json({ error: 'Аккаунт недоступен.' });
    const fileName = path.basename(req.params.fileName);
    if (fileName !== req.params.fileName || /[\\/]/.test(fileName)) return res.sendStatus(404);
    const filePath = path.resolve(userStorageRoot(account._id), 'posts', '.tmp', fileName);
    try {
      if (!fs.lstatSync(filePath).isFile()) return res.sendStatus(404);
    } catch (error) {
      return res.sendStatus(404);
    }
    res.set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
    return res.sendFile(filePath, error => { if (error && !res.headersSent) next(error); });
  } catch (error) {
    return res.status(401).json({ error: 'Требуется действующая авторизация.' });
  }
});

app.use('/uploads/users/:ownerId/posts/.tmp', (req, res) => res.sendStatus(404));

// Other user uploads (posts, avatars, thumbnails) are public; chat paths above are protected.
app.use('/uploads', express.static('uploads', { setHeaders: setUploadedAssetSecurityHeaders }));

app.use('/avatars', express.static('avatars', { setHeaders: setUploadedAssetSecurityHeaders }));

const authenticateUpload = async (req, res, next) => {
  try {
    const payload = getUser(req.headers.authorization || '');
    if (!payload?.id) return res.status(401).json({ error: 'Требуется авторизация.' });
    const account = await models.User.findById(payload.id).select('_id isDeleted');
    if (!account || account.isDeleted) return res.status(401).json({ error: 'Аккаунт недоступен.' });
    req.uploadUser = account;
    ensureUserStorage(account._id);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен.' });
  }
};

const makeUserUpload = folder => multer.diskStorage({
  destination: (req, file, callback) => {
    const destination = path.join(userStorageRoot(req.uploadUser._id), folder);
    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (req, file, callback) => callback(null, safeStoredName(file.originalname))
});

const userAvatarUpload = multer({ storage: makeUserUpload('user'), limits: { fileSize: 5 * 1024 * 1024, fields: 0, parts: 1 } });
const userMessageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      const destination = path.join(userStorageRoot(req.uploadUser._id), 'chats', String(req.body.addressee || 'unknown'));
      fs.mkdirSync(destination, { recursive: true });
      callback(null, destination);
    },
    filename: (req, file, callback) => callback(null, safeStoredName(file.originalname))
  }),
  limits: { fileSize: 50 * 1024 * 1024, files: 5, fields: 1, fieldSize: 128, parts: 6 }
});
const userPostUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      const destination = path.join(userStorageRoot(req.uploadUser._id), 'posts', '.tmp');
      fs.mkdirSync(destination, { recursive: true });
      callback(null, destination);
    },
    filename: (req, file, callback) => callback(null, safeStoredName(file.originalname))
  }),
  limits: { fileSize: 50 * 1024 * 1024, files: 12, fields: 2, fieldSize: 128, parts: 14 }
});

app.post('/uploadavatar', authenticateUpload, (req, res, next) => userAvatarUpload.single('avatar')(req, res, error => {
  if (error) return next(error);
  return next();
}), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не выбран.' });
  const detectedType = await fileTypeFromFile(req.file.path);
  if (!detectedType || !SAFE_IMAGE_MIMES.has(detectedType.mime)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(415).json({ error: 'Аватар должен быть файлом JPEG, PNG, WebP, GIF или AVIF.' });
  }
  if (exceedsUserStorageQuota(req.uploadUser._id, req.file.size)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(413).json({ error: `Превышена квота хранилища (${Math.round(USER_STORAGE_LIMIT_BYTES / 1024 / 1024)} МБ). Удалите ненужные файлы или обратитесь к администратору.` });
  }
  await createMediaThumbnail(req.file.path, detectedType.mime);
  if (exceedsUserStorageQuota(req.uploadUser._id)) {
    removeUploadedUrl(publicUploadUrl(req, `/uploads/users/${req.uploadUser._id}/user/${encodeURIComponent(req.file.filename)}`));
    return res.status(413).json({ error: `Превышена квота хранилища (${Math.round(USER_STORAGE_LIMIT_BYTES / 1024 / 1024)} МБ).` });
  }
  res.json({ url: publicUploadUrl(req, `/uploads/users/${req.uploadUser._id}/user/${encodeURIComponent(req.file.filename)}`) });
});

app.post('/uploadmessage', authenticateUpload, (req, res, next) => userMessageUpload.single('file')(req, res, error => {
  if (error) return next(error);
  return next();
}), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не выбран.' });
  const detectedType = await fileTypeFromFile(req.file.path);
  if (!detectedType || !SAFE_CHAT_MIMES.has(detectedType.mime)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(415).json({ error: 'Неподдерживаемый тип вложения. Разрешены изображения, видео, аудио и PDF.' });
  }
  const recipientId = String(req.body.addressee || '');
  if (!mongoose.Types.ObjectId.isValid(recipientId)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(400).json({ error: 'Некорректный собеседник.' });
  }
  const recipient = await models.User.findById(recipientId).select('_id isDeleted');
  if (!recipient || recipient.isDeleted) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(404).json({ error: 'Собеседник не найден.' });
  }
  ensureUserStorage(recipient._id);
  if (exceedsUserStorageQuota(req.uploadUser._id, req.file.size) || exceedsUserStorageQuota(recipientId, req.file.size)) {
    fs.rmSync(req.file.path, { force: true });
    return res.status(413).json({ error: `Превышена квота хранилища одного из участников (${Math.round(USER_STORAGE_LIMIT_BYTES / 1024 / 1024)} МБ).` });
  }
  const counterpartFolder = path.join(userStorageRoot(recipientId), 'chats', String(req.uploadUser._id));
  fs.mkdirSync(counterpartFolder, { recursive: true });
  const recipientFilePath = path.join(counterpartFolder, req.file.filename);
  fs.copyFileSync(req.file.path, recipientFilePath);
  const thumbnailPath = await createMediaThumbnail(req.file.path, detectedType.mime);
  if (thumbnailPath) fs.copyFileSync(thumbnailPath, thumbnailPathFor(recipientFilePath));
  if (exceedsUserStorageQuota(req.uploadUser._id) || exceedsUserStorageQuota(recipientId)) {
    removeChatFileCopies(publicUploadUrl(req, `/uploads/users/${req.uploadUser._id}/chats/${recipientId}/${encodeURIComponent(req.file.filename)}`), req.uploadUser._id, recipientId);
    return res.status(413).json({ error: `Превышена квота хранилища одного из участников (${Math.round(USER_STORAGE_LIMIT_BYTES / 1024 / 1024)} МБ).` });
  }
  res.json({ url: publicUploadUrl(req, `/uploads/users/${req.uploadUser._id}/chats/${recipientId}/${encodeURIComponent(req.file.filename)}`) });
});

app.post('/uploadpost', authenticateUpload, (req, res, next) => userPostUpload.array('files', 12)(req, res, error => {
  if (error) return next(error);
  return next();
}), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'Файлы не выбраны.' });
  const slot = String(req.body.slot || '');
  if (!['imageUrl', 'imageUrl2', 'imageUrl3', 'imageUrl4', 'iconPost'].includes(slot)) {
    files.forEach(file => fs.rmSync(file.path, { force: true }));
    return res.status(400).json({ error: 'Некорректный блок записи.' });
  }
  const detectedFiles = await Promise.all(files.map(async file => ({ file, type: await fileTypeFromFile(file.path) })));
  const videoFiles = detectedFiles.filter(item => item.type && SAFE_VIDEO_MIMES.has(item.type.mime)).map(item => item.file);
  const imageFiles = detectedFiles.filter(item => item.type && SAFE_IMAGE_MIMES.has(item.type.mime)).map(item => item.file);
  const invalidFiles = detectedFiles.filter(item => !item.type || (!SAFE_VIDEO_MIMES.has(item.type.mime) && !SAFE_IMAGE_MIMES.has(item.type.mime)));
  const detectedMimeByFile = new Map(detectedFiles.map(item => [item.file, item.type?.mime || '']));
  const singleFileSlotHasManyFiles = ['imageUrl', 'iconPost'].includes(slot) && files.length > 1;
  if (videoFiles.some(file => file.size > 10 * 1024 * 1024) || (videoFiles.length && files.length !== 1) || invalidFiles.length || singleFileSlotHasManyFiles || imageFiles.length + videoFiles.length !== files.length || (slot === 'iconPost' && videoFiles.length > 0)) {
    files.forEach(file => fs.rmSync(file.path, { force: true }));
    return res.status(400).json({ error: 'Видео до 10 МБ; поддерживаются только изображения и видео, не более одного видео на блок.' });
  }

  const batchSize = files.reduce((sum, file) => sum + file.size, 0);
  if (exceedsUserStorageQuota(req.uploadUser._id, batchSize)) {
    files.forEach(file => fs.rmSync(file.path, { force: true }));
    return res.status(413).json({ error: `Превышена квота хранилища (${Math.round(USER_STORAGE_LIMIT_BYTES / 1024 / 1024)} МБ). Удалите ненужные файлы перед загрузкой.` });
  }

  let postFolder = null;
  if (req.body.postId) {
    const post = await models.Post.findById(req.body.postId).select('_id author');
    if (!post || String(post.author) !== String(req.uploadUser._id)) {
      files.forEach(file => fs.rmSync(file.path, { force: true }));
      return res.status(403).json({ error: 'Нет доступа к записи.' });
    }
    postFolder = path.join(userStorageRoot(req.uploadUser._id), 'posts', String(post._id));
    fs.mkdirSync(postFolder, { recursive: true });
  }

  const urls = await Promise.all(files.map(async file => {
    if (postFolder) fs.renameSync(file.path, path.join(postFolder, file.filename));
    const finalFilePath = postFolder ? path.join(postFolder, file.filename) : file.path;
    const mimetype = detectedMimeByFile.get(file) || '';
    await createMediaThumbnail(finalFilePath, mimetype);
    const storagePath = postFolder
      ? `/uploads/users/${req.uploadUser._id}/posts/${req.body.postId}/${encodeURIComponent(file.filename)}`
      : `/uploads/users/${req.uploadUser._id}/posts/.tmp/${encodeURIComponent(file.filename)}`;
    return publicUploadUrl(req, storagePath);
  }));
  if (exceedsUserStorageQuota(req.uploadUser._id)) {
    files.forEach(file => {
      const savedPath = postFolder ? path.join(postFolder, file.filename) : file.path;
      fs.rmSync(savedPath, { force: true });
      fs.rmSync(thumbnailPathFor(savedPath), { force: true });
    });
    return res.status(413).json({ error: `Превышена квота хранилища (${Math.round(USER_STORAGE_LIMIT_BYTES / 1024 / 1024)} МБ).` });
  }
  res.json({ urls });
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Размер одного из файлов превышает допустимый лимит.'
      : 'Превышено допустимое количество файлов или размер запроса.';
    return res.status(status).json({ error: message });
  }
  if (req.path.startsWith('/upload')) {
    console.error('Upload request failed:', error);
    return res.status(500).json({ error: 'Не удалось обработать загрузку.' });
  }
  return next(error);
});

// app.use(express.static("/"));

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
    validationRules: [depthLimit(5), createComplexityLimitRule(3000)],
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  
  await server.start();

  const PORT = process.env.PORT || 4000;

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        const tokenUser = getUser(token);
        const account = tokenUser ? await models.User.findById(tokenUser.id).select('isDeleted') : null;
        const user = account && !account.isDeleted ? tokenUser : null;
        return { models, user };
      },
    }),
  );

  const clientBuildPath = path.resolve(__dirname, '../web/dist');
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get(['/posts/:id', '/cats/:cname/post/:id', '/users/:uname/post/:id'], async (req, res, next) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).sendFile(path.join(clientBuildPath, 'index.html'));
        }

        const post = await models.Post.findOne({
          _id: req.params.id,
          status: { $ne: 'pending' },
        })
          .select('_id title body body2 body3 body4 iconPost imageUrl imageUrl2 imageUrl3 imageUrl4 createdAt updatedAt')
          .lean();

        if (!post) {
          return res.status(404).sendFile(path.join(clientBuildPath, 'index.html'));
        }

        const html = await fs.promises.readFile(path.join(clientBuildPath, 'index.html'), 'utf8');
        return res.type('html').send(renderArticleSeoHtml(html, post));
      } catch (error) {
        return next(error);
      }
    });
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  }

  await new Promise((resolve, reject) => {
    httpServer.listen(PORT, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  console.log(`🚀 Server ready at http://0.0.0.0:${PORT}/graphql`);
