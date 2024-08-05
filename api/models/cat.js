import { model, Schema, Types } from 'mongoose';

const Cat = model(
  'Cat',

  new Schema(
    {
      catname: {
        type: String,
        required: true
      },

      posts: [
        {
          type: Types.ObjectId,
          ref: 'Post'
        }
      ]
    },
    {
      timestamps: true
    }
  )
);
export default Cat;
