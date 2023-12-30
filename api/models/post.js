import { model, Schema, Types } from 'mongoose';

const Post = model(
  'Post',

  new Schema(
    {
      title: {
        type: String,
        required: true
      },
      iconPost: {
        type: String,
      },
      imageUrl: {
        type: String,
      },
      imageUrl2: {
        type: String,
      },
      imageUrl3: {
        type: String,
      },
      scriptUrl: {
        type: Boolean,
        default: false
      },
      category: {
        type: Types.ObjectId,
        ref: 'Cat'
      },
      viewsCount: {
        type: Number,
        default: 0
      },
      body: {
        type: String,
        required: true
      },
      body2: {
        type: String,
      },
      body3: {
        type: String,
      },
      author: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
      },
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

export default Post;
