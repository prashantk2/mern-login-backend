const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ROLES = ['Admin', 'Employee'];

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'Admin', enum: ROLES },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function () {
  now = new Date();
  this.updated_at = now;
  if(!this.created_at) {
    this.created_at = now;
  }
  next();
})

module.exports = User = mongoose.model("users", UserSchema);
