import { model, Schema, Types } from 'mongoose';

const Message = model(
  'Message',

  new Schema(
    {
      text: {
        type: String,
        required: false
      },

      file: {
        type: String,
      },
      read: {                // track whether the recipient has seen this message
        type: Boolean,
        default: false
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
      }],
      user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
      },
      addressee: {
        type: String,
        required: true
      },
      chat: {
        type: Types.ObjectId,
        ref: 'Chat'
      }
    },
    {
      timestamps: true
    }
  )
);

export default Message;
