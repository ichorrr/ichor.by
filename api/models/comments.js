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
      },

      likesCount: {
        type: Number,
        default: 0
      },
      dislikesCount: {
        type: Number,
        default: 0
      },
      likes: [{
        user: {
          type: Types.ObjectId,
          ref: 'User'
        }
      }],
      dislikes: [{
        user: {
          type: Types.ObjectId,
          ref: 'User'
        }
      }]
    },
    {
      timestamps: true
    }
  )
);

export default Comment;
