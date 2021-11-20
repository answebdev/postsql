const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

module.exports = {
  Mutation: {
    async register(
      parent,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data
      // Make sure user does not already exist
      const user = await User.findOne({ username });
      if (user) {
        // 'UserInputError' is from ApolloServer (require up above)
        throw new UserInputError('Username is taken', {
          // Error for the front end - to display on the form:
          errors: {
            username: 'This username is taken',
          },
        });
      }
      // Hash password and create authentication token - we'll choose '12' for the number of rounds
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email: email,
        username: username,
        password: password,
        createdAt: new Date().toISOString(),
      });
      // Saver new user to the database
      const res = await newUser.save();

      // Create token for the user
      const token = jwt.sign(
        {
          id: res.id,
          email: res.email,
          username: res.username,
          // See SECRET_KEY in 'config.js',
          // + expiration time of 1 hour:
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
      // Return data to the user
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};