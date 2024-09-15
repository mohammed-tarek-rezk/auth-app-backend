const mongoose = require("mongoose");
const roles = require("./../utils/roles")
let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: [roles.ADMIN , roles.USER  , roles.MODERATOR],
      default: roles.USER
    },
    avatar: {
      type: String,
      default: "avatar.jpg",
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await require("bcrypt").hash(this.password, 10);
  }
});




module.exports = mongoose.model("User", userSchema);
