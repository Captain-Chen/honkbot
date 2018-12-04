const print = console.log.bind(console);
const tjs = require('twitch-js');
const options = require('./options');

function Client(){
  this._client = new tjs.client(options);
  
  // add event listeners
  this._client.on('message', messageHandler);
}


Client.prototype.connect = function(){
  this._client
  .connect()
  .catch((err) => {
    console.error(err);
  });
}

Client.prototype.disconnect = function(){
  this._client
  .disconnect()
  .catch((err) => {
    console.error(err);
  });
}

function messageHandler(channel, userstate, message, self){
  if(self){
    return;
  }
}

module.exports = Client;