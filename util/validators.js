module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Username field must not be empty';
  }
  if (email.trim() === '') {
    errors.email = 'Email field must not be empty';
  } else {
    // Check if email is valid
    const regEx =
      /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = 'Email must be a valid email address';
    }
  }
  if (password === '') {
    errors.password = 'Password field must not empty';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }

  return {
    errors,
    // If smaller than 1, that means there are no errors, i.e., the data is valid:
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'Username field must not be empty';
  }
  if (password.trim() === '') {
    errors.password = 'Password field must not be empty';
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
