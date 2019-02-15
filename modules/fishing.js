const print = console.log.bind(console);

class Fish {
  constructor(name, rarity, sizeRange = { min: 0, max: 0 }) {
    this.name = name;
    this.rarity = rarity;
    this.sizeRange = { min: sizeRange.min, max: sizeRange.max };
  }

  getFishSize(minValue, maxValue) {
    return 0;
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
    return `${rarity} ${this.name} (${this.getFishSize(size.min, size.max).toFixed(2) } cm)`;
  }
}

let fishData = {
  rare: [
    ['crawfish', '10.0-14.0'],
    ['king salmon', '113.7-166.3'],
    ['koi', '46.8-73.1'],
    ['loach', '16.7-23.3'],
    ['neon tetra', '1.7-2.3'],
    ['pale chub', '12.5-17.4'],
    ['rainbow trout', '46.8-73.1'],
  ],
  common: [
    ['black bass', '41.7-58.2'],
  ],
  veryCommon: [
    ['crucian carp', '15.0-24.9'],
    ['yellow perch', '29.2-40.7']
  ]
};

// generate list of fish
let fishes = {};
Object.keys(fishData).forEach((rarity) => {
  fishes[rarity] = [];
  for (let i = 0; i < fishData[rarity].length; i++) {
    let sizeRange = fishData[rarity][i][1].split('-');
    fishes[rarity][i] = new Fish(fishData[rarity][i][0], rarity, { min: sizeRange[0], max: sizeRange[1] });
  }
});

class Fishing {
  constructor(connection) {
    this.irc = connection;
    this.handleMessages = this.handleMessages.bind(this);
    this.irc.client.on('message', this.handleMessages);
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
  castLine(sender) {
    let lineWasBitten = this.calculateResult(100, 100);
    // fish bit the line
    if (lineWasBitten >= 20) {
      // calculate if fish was caught
      let successRate = this.calculateResult(100, 100);
      if (successRate >= 25) {
        let fish = this.getRandomFish();
        // dumb way to handle rarity name starting with u
        let result = (fish.rarity[0] === 'u') ? `${sender} caught an ${fish}!` : `${sender} caught a ${fish}!`;
        return result;
      } else {
        return `${sender}'s line snapped! The fish got away..`;
      }
    } else {
      return `${sender} didn't catch anything..`;
    }
  }

  broadcastResult(channel, sender, message) {
    let progress = 0;
    // loop through all the messages and queue each one until we reach the end
    let t = setInterval(() => {
      if (progress < message.length) {
        this.irc.client.say(channel, message[progress]);
      }
      else {
        // remove person from list
        this.fishingList.remove(sender);
        this.irc.client.say(channel, `${sender}, you can fish again.`)
        clearInterval(t);
      }
      progress++;
    }, 7e3);
  }

  getRandomFish() {
    return fishes.common[Math.floor(Math.random() * fishes.common.length)];
    // let result = this.calculateResult(0, 100);
    // if (result >= 99) {
    //   return fishes.superRare[Math.floor(Math.random() * fishes.superRare.length)];
    // } else if (result >= 97) {
    //   return fishes.rare[Math.floor(Math.random() * fishes.rare.length)];
    // } else if (result >= 70) {
    //   return fishes.uncommon[Math.floor(Math.random() * fishes.uncommon.length)];
    // } else if (result >= 40) {
    //   return fishes.common[Math.floor(Math.random() * fishes.common.length)];
    // } else {
    //   return fishes.veryCommon[Math.floor(Math.random() * fishes.veryCommon.length)];
    // }
  }

  handleMessages(channel, userstate, message, self) {
    if (self) {
      return;
    }

    let sender = userstate['display-name'];
    if (message === "!fish") {
      // check if user is able to fish
      let canFish = this.join(sender);
      if (canFish) {
        this.irc.client.say(channel, `${sender} casts out a line..`);
        // build dialog
        let msg = [
          `${sender} feels a tug on their line and begins to reel it in.`,
          this.castLine(sender)
        ];
        this.broadcastResult(channel, sender, msg);
      } else {
        this.irc.client.say(channel, `${sender}, you are already fishing! Please wait a few seconds.`);
      }
    }
  }

  calculateResult(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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