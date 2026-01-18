import { model, Schema, Types } from 'mongoose';

const Message = model(
  'Message',

  new Schema(
    {
      text: {
        type: String,
        required: true
      },

      file: {
        type: String,
      },
      likesCount: {
        type: Number,
        default: 0
      },
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
