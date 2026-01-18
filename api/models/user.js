import { model, Schema, Types } from 'mongoose';

const User = model(
  'User',

  new Schema(
    {
      name: {
        type: String,
        required: true,
        index: { unique: true }
      },

      email: {
        type: String,
        required: true,
        index: { unique: true }
      },
      password: {
        type: String,
        required: true
      },
      telephone: {
        type: String
      },
      family: [
        {
          type: Types.ObjectId,
          ref: 'User'
        }
      ],
      lastMessage: {
        type: Types.ObjectId,
        ref: 'Message'
      },
      messages: [
        {
          type: Types.ObjectId,
          ref: 'Message'
        }
      ],
      cursor: {
        type: String,
        default: ''
      },
      hasNextPage: {
        type: Boolean,
        default: false
      },
      avatar: {
        type: String
      },
      isAdmin: {
        type: Boolean,
        default: false
      },
      posts: [
        {
          type: Types.ObjectId,
          ref: 'Post'
        }
      ],
      comments: [
        {
          type: Types.ObjectId,
          ref: 'Comment'
        }
      ]
    },
    {
      timestamps: true
    }
  )
);
export default User;
