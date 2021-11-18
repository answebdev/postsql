const { model, Schema } = require('mongoose');

// MongoDB model

const postSchema = new Schema({
  body: String,
  username: String,
  createdAt: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  // Link the data models - link post to specific user.
  // This will allow us to use Mongoose to automatically populate this user field if we want
  // using Mongoose methods.
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
});

module.exports = model('Post', postSchema);
