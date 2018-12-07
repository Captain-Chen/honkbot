const tjs = require('twitch-js');
const options = require('./options');

class Client{
  constructor(){
    this._client = new tjs.client(options);
  }

  connect(){
    this._client
    .connect()
    .catch((err) => {
      console.error(err);
    });
  }

  disconnect(){
    this._client
    .disconnect()
    .catch((err) => {
      console.error(err);
    });
  }
}

module.exports = Client;