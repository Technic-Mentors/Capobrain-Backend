const mongoose = require("mongoose");
const { Schema } = mongoose;

const SignupSchema = new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String
  },
  number: {
    type: String
  },
  schoolName: {
    type: String
  }
});

module.exports = mongoose.model("Signup", SignupSchema);
