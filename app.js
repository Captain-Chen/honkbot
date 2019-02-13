const print = console.log.bind(console);

//const Dungeon = require('./modules/dungeon');
const Fishing = require('./modules/fishing');
const Client = require('./modules/twitch-client');

// initialize irc client
let client = new Client();
client.connect();

// initialize fishing game
let game = new Fishing(client);