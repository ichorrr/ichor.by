import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
await mongoose.connect(process.env.DB_HOST);
const query = `query { getUser(_id: \