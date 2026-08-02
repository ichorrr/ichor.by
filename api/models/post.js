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
      externalSource: {
        icon: String,
        url: String
      },
      tags: [
        {
          type: String
        }
      ],
      category: {
        type: Types.ObjectId,
        ref: 'Cat'
      },
      viewsCount: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        default: 'approved'
      },
      moderationNote: {
        type: String,
        default: null
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
      ],
      commentCount: {
        type: Number,
        default: 0
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

export default Post;
