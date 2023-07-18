const mongoose = require('mongoose');

const User = mongoose.model(
  'User',

  new mongoose.Schema(
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
          type: mongoose.Types.ObjectId,
          ref: 'Post'
        }
      ],

      comments: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'Comment'
        }
      ]
    },
    {
      timestamps: true
    }
  )
);
module.exports = User;
