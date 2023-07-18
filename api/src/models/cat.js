const mongoose = require('mongoose');

const Cat = mongoose.model(
  'Cat',

  new mongoose.Schema(
    {
      catname: {
        type: String,
        required: true
      },

      posts: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'Post'
        }
      ]
    },
    {
      timestamps: true
    }
  )
);
module.exports = Cat;
