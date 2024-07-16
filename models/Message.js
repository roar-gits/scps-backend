const mongoose = require('mongoose');
const crypto = require('crypto');

const MessageSchema = new mongoose.Schema({
  connectionId: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedContent: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

MessageSchema.methods.encryptMessage = function(content, connectionId) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(String(connectionId)).digest('base64').substr(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(content);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  this.iv = iv.toString('hex');
  this.encryptedContent = encrypted.toString('hex');
};

MessageSchema.methods.decryptMessage = function(connectionId) {
  const iv = Buffer.from(this.iv, 'hex');
  const key = crypto.createHash('sha256').update(String(connectionId)).digest('base64').substr(0, 32);
  const encryptedText = Buffer.from(this.encryptedContent, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports = mongoose.model('Message', MessageSchema);
