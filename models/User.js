const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  passphrase: {
    type: String,
    required: true,
    unique: true
  },
  connections: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the passphrase before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passphrase')) return next();
  this.passphrase = await bcrypt.hash(this.passphrase, 10);
  next();
});

// Method to check if passphrase is correct
UserSchema.methods.matchPassphrase = async function(enteredPassphrase) {
  return await bcrypt.compare(enteredPassphrase, this.passphrase);
};

module.exports = mongoose.model('User', UserSchema);
