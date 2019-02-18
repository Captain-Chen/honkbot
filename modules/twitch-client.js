const tjs = require('twitch-js');
const options = require('./options');

class Client{
  constructor(){
    this.client = new tjs.client(options);
    this.activeChatters = new Map();
  }

  connect(){
    this.client
    .connect()
    .catch((err) => {
      console.error(err);
    });
  }

  disconnect(){
    this.client
    .disconnect()
    .catch((err) => {
      console.error(err);
    });
  }
}

module.exports = Client;