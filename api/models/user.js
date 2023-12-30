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
      avatar: {
        type: String
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
