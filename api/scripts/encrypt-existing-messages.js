import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Message from '../models/messages.js';
import { isEncryptedMessageText } from '../message-crypto.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

if (!process.env.DB_HOST) {
  throw new Error('DB_HOST must be configured before migrating chat messages.');
}
if (!process.env.CHAT_MESSAGE_ENCRYPTION_KEY || process.env.CHAT_MESSAGE_ENCRYPTION_KEY.length < 32) {
  throw new Error('Set CHAT_MESSAGE_ENCRYPTION_KEY to a random secret of at least 32 characters before migrating.');
}

await mongoose.connect(process.env.DB_HOST);

let encryptedCount = 0;
try {
  const cursor = Message.find({ text: { $type: 'string' } }).cursor();
  for await (const message of cursor) {
    const storedText = message.get('text', null, { getters: false });
    if (isEncryptedMessageText(storedText)) continue;
    const plaintext = message.text;
    message.text = plaintext;
    await message.save();
    encryptedCount += 1;
  }
  console.log(`Encrypted ${encryptedCount} chat messages.`);
} finally {
  await mongoose.disconnect();
}
