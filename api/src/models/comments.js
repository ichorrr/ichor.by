const mongoose = require('mongoose');

const Comment = mongoose.model(
  'Comment',

  new mongoose.Schema(
    {
      text: {
        type: String,
        required: true
      },

      post: {
        type: mongoose.Types.ObjectId,
        ref: 'Post'
      },

      author: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    },
    {
      timestamps: true
    }
  )
);

module.exports = Comment;
