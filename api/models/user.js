import { model, Schema, Types } from 'mongoose';

const User = model(
  'User',

  new Schema(
    {
      name: {
        type: String,
        required: true
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
      passwordResetTokenHash: {
        type: String,
        select: false
      },
      passwordResetExpires: {
        type: Date,
        select: false
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
      lastVisit: {
        type: Date,
        default: () => new Date()
      },
      avatar: {
        type: String
      },
      bio: {
        type: String
      },
      isAdmin: {
        type: Boolean,
        default: false
      },
      isDeleted: {
        type: Boolean,
        default: false,
        index: true
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
