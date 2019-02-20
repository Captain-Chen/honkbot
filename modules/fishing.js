const print = console.log.bind(console);

const SDL2link = require('sdl2-link');
const SDL = SDL2link()
  .withFastcall(require('fastcall'))
  .withTTF()
  .load();

// initialize SDL libraries
if (SDL.SDL_Init(SDL.SDL_INIT_VIDEO) < 0) {
  throw SDL.SDL_GetError();
}

// initialize SDL TTF
if (SDL.TTF_Init() < 0) {
  throw SDL.SDL_GetError();
}

class Fish {
  constructor(name, rarity, minVal, maxVal) {
    this.name = name;
    this.rarity = rarity;
    this.sizeRange = { min: minVal, max: maxVal };
  }

  getFishSize(minValue, maxValue) {
    return Math.random() * (maxValue - minValue) + minValue;
  }

  toString() {
    let size = this.sizeRange;
    let rarity;
    switch (String(this.rarity).toLowerCase()) {
      case 'verycommon':
        rarity = 'very common';
        break;
      default:
        rarity = this.rarity;
        break;
    }
    return `${rarity} ${this.name} (${this.getFishSize(size.min, size.max).toFixed(1)} cm)`;
  }
}

let fishData = {
  rare: [
    ['crawfish', 10.0, 14.0],
    ['king salmon', 113.7, 166.3],
    ['koi', 46.8, 73.1],
    ['loach', 16.7, 23.3],
    ['neon tetra', 1.7, 2.3],
    ['pale chub', 12.5, 17.4],
    ['rainbow trout', 46.8, 73.1],
    ['barred knifejaw', 50.1, 69.9],
    ['blowfish', 20.8, 29.1],
    ['clown fish', 12.5, 17.5],
    ['football fish', 50.1, 69.8],
    ['napoleonfish', 175.1, 184.9],
    ['sea horse', 6.7, 9.3],
    ['surgeonfish', 25.9, 36.1],
    ['tuna', 192.1, 267.8]
  ],
  common: [
    ['black bass', 41.7, 58.2],
    ['red snapper', 75.1, 104.8]
  ],
  veryCommon: [
    ['crucian carp', 15.0, 24.9],
    ['yellow perch', 29.2, 40.7],
    ['horse mackeral', 33.4, 46.5],
    ['olive flounder', 66.8, 93.1],
    ['squid', 29.2, 40.7]
  ]
};

// generate list of fish
let fishes = {};
Object.keys(fishData).forEach((rarity) => {
  fishes[rarity] = [];
  for (let i = 0; i < fishData[rarity].length; i++) {
    fishes[rarity][i] = new Fish(fishData[rarity][i][0], rarity, fishData[rarity][i][1], fishData[rarity][i][2]);
  }
});

class Fishing {
  constructor(connection, renderer) {
    this.irc = connection;
    this.activeChatters = this.irc.activeChatters;
    this.handleMessages = this.handleMessages.bind(this);
    this.irc.client.on('message', this.handleMessages);
    print(renderer);
    this.renderer = renderer;
    this.fishingList = [];
  }

  join(sender) {
    if (!this.fishingList.includes(sender)) {
      this.fishingList.push(sender);
      return true;
    } else {
      return false;
    }
  }

  // main fishing game logic
  castLine(fisher) {
    let lineWasBitten = this.calculateResult(0, 100);
    // fish bit the line
    if (lineWasBitten >= 20) {
      // calculate if fish was caught
      let successRate = this.calculateResult(0, 100);
      if (successRate >= 25) {
        let fish = this.getRandomFish();
        // dumb way to handle fish names that begin with a
        let result = (fish.name[0] === 'a') ? `${fisher} caught an ${fish}!` : `${fisher} caught a ${fish}!`;
        return result;
      } else {
        return `${fisher}'s line snapped! The fish got away..`;
      }
    } else {
      return `${fisher} didn't catch anything..`;
    }
  }

  broadcastResult(channel, message) {
    let progress = 0;
    // loop through all the messages and queue each one until we reach the end
    let t = setInterval(() => {
      if (progress < message.length) {
        this.irc.client.say(channel, message[progress]);
      }
      else {
        clearInterval(t);
      }
      progress++;
    }, 7e3);
  }

  getRandomFish() {
    let result = this.calculateResult(0, 100);
    if (result >= 97) {
      return fishes.rare[Math.floor(Math.random() * fishes.rare.length)];
    } else if (result >= 45) {
      return fishes.common[Math.floor(Math.random() * fishes.common.length)];
    } else {
      return fishes.veryCommon[Math.floor(Math.random() * fishes.veryCommon.length)];
    }
  }

  handleMessages(channel, userstate, message, self) {
    if (self) {
      return;
    }
    let sender = userstate['display-name'];

    // keep track of how often a user has said something
    // if this is the first time the user has wrote something then add them
    if (!this.activeChatters.has(sender)) {
      this.activeChatters.set(sender, {
        msgCount: 1,
        timestamp: Date.now()
      });
      // otherwise increment the message count and update the timestamp
    } else {
      this.activeChatters.get(sender).msgCount++;
      this.activeChatters.get(sender).timestamp = Date.now();
    }
  }

  calculateResult(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  checkActiveChatters() {
    this.activeChatters.forEach((val, user) => {
      let secondsElapsed = (Date.now() - val.timestamp) / 1000;
      if (secondsElapsed > 60.0) {
        print(`Removing ${user} from active users due to inactivity`);
        this.activeChatters.delete(user);
      } else {
        // check if the user has sent at least 3 messages overall in the past 30 seconds
        if (this.activeChatters.get(user).msgCount >= 3 && secondsElapsed <= 30.0) {
          this.irc.client.say(this.irc.client.channels[0], `${user} casts out a line and begins fishing..`);
          let msg = [
            `${user} feels a tug on their line and begins to reel it in.`,
            this.castLine(user)
          ];
          this.broadcastResult(this.irc.client.channels[0], msg);
        }
      }
    });
  }

  update() {
    print('Game update was called');
  }

  render() {

  }
}

Array.prototype.remove = function (value) {
  print('Remove function was called!');
  let index = this.indexOf(value);
  // if index was found, i.e. non-zero value then remove that item from the array
  if (index > -1) {
    this.splice(index, 1);
  }
}

module.exports = Fishing;