import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import models from './models/index.js';
await mongoose.connect(process.env.DB_HOST);
const { User, Message } = models;
const test = await User.findOne({ name: 'test' });
const ichor = await User.findOne({ name: 'ichor' });
console.log('test', test ? test._id.toString() : null, 'ichor', ichor ? ichor._id.toString() : null);
if (test && ichor) {
  const unread = await Message.countDocuments({ addressee: test._id.toString(), user: ichor._id, read: false });
  const last = await Message.findOne({ $or:[{addressee: test._id.toString(), user: ichor._id},{addressee: ichor._id.toString(), user: test._id}] }).sort({ createdAt: -1 });
  console.log('unread count', unread);
  console.log('last message', last ? { text: last.text, addressee: last.addressee, user: last.user?.toString(), createdAt: last.createdAt, read: last.read } : null);
  const testFamily = test.family ? test.family.map(id=>id.toString()) : [];
  console.log('test family', testFamily);
}
process.exit();
