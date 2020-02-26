require('dotenv').config();
const mongoose = require('mongoose');

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = mongoose.connect(process.env.MONGO_URL, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true
    });
  }
}

module.exports = new Database();