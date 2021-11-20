const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    // See SECRET_KEY in 'config.js',
    // + expiration time of 1 hour:
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      // Get user from database (if the user does not exist, then we need to return an error)
      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }
      // Compare this password to the actual user password to make sure the password is correct:
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong credentials';
        throw new UserInputError('Wrong credentials', { errors });
      }
      // Issue token if password is correct
      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // Validate user data ('validateRegisterInput' is from 'validators.js' file in 'util' folder)
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
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
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });

      // Save new user to the database
      const res = await newUser.save();

      // Create token for the user
      const token = generateToken(res);

      // Return data to the user
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
