const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      require: true 
    },
    verified: {
      type: Boolean,
      require: false,
      default: false
    },
    role: { 
      type: String, 
      require: false, 
      default: "user" 
    },
    coin: { 
      type: Number, 
      require: false, 
      default: 0 
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
