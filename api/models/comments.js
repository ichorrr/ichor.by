import { model, Schema, Types } from 'mongoose';

const Comment = model(
  'Comment',

  new Schema(
    {
      text: {
        type: String,
        required: true
      },

      post: {
        type: Types.ObjectId,
        ref: 'Post'
      },

      author: {
        type: Types.ObjectId,
        ref: 'User'
      }
    },
    {
      timestamps: true
    }
  )
);

export default Comment;
