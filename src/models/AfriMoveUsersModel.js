const mongoose = require('mongoose');

const afriMoveUsersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Full Name is required"]
  },
  lastName: {
    type: String,
    required: [true, "Full Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  otp: {
    type: String,
    required: [true, "Password is required"]
  },
  expirationTime: {
    type: String,
    required: function () {
      // Make expirationTime required only for normal sign-ups
      return this.provider === 'local';
    }
  },
  otpVerified: {
    type: Boolean,
    required: [true, "OTP verification status is required"],
  },
  userImage: {
    type: String,
    required: false,
  },
  is_admin: {
    type: Boolean,
    required: [true, "Admin status is required"],
    default: false,
  }
});

const AfriMoveUsers = mongoose.model('AfriMoveUsers', afriMoveUsersSchema);
module.exports = AfriMoveUsers;
