const tjs = require('twitch-js');
const options = require('./options');

// init twitch client
const client = new tjs.client(options);
client.connect()
  .catch((err) => {
    console.error(err);
  });

module.exports = client;