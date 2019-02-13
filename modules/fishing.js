const print = console.log.bind(console);

class Fish {
  constructor(name, rarity, flavourText = "") {
    this.name = name;
    this.rarity = rarity;
    this.flavourText = flavourText;
  }

  toString() {
    let rarity;
    switch (String(this.rarity).toLowerCase()) {
      case 'superrare':
        rarity = 'super rare';
        break;
      case 'verycommon':
        rarity = 'very common';
        break;
      default:
        rarity = this.rarity;
        break;
    }
    return `${rarity} ${this.name}`;
  }
}

let fishData = {
  superRare: [
    ['froggy', 'Whoa! There you are froggy!'],
    ['coelacanth', 'Whoa! It\'s a living fossil!'],
    ['dorado', 'That should be their motto!'],
    ['great white shark', 'It was a shark attack!'],
    ['stringfish', 'It was strung along quite easily.'],
    ['whale shark', 'It could have swallowed them up!'],
    ['beluga whale', 'What a majestic beast..']
  ],
  rare: [
    ['angelfish'],
    ['arapaima'],
    ['arowana'],
    ['blowfish'],
    ['blue marlin'],
    ['gar'],
    ['giant snakehead'],
    ['giant trevally'],
    ['goldfish'],
    ['hammerhead shark'],
    ['king salmon'],
    ['koi'],
    ['mitten crab'],
    ['napoleonfish'],
    ['nibble fish'],
    ['oarfish'],
    ['ocean sunfish'],
    ['popeyed goldfish'],
    ['saddled bichir'],
    ['saw fish'],
    ['soft-shelled turtle'],
    ['tuna']
  ],
  uncommon: [
    ['bluegill'],
    ['brook trout'],
    ['butterflyfish'],
    ['catfish'],
    ['char'],
    ['clownfish'],
    ['eel'],
    ['football fish'],
    ['freshwater goby'],
    ['killifish'],
    ['large bass'],
    ['neon tetra'],
    ['octopus'],
    ['olive flounder'],
    ['puffer fish'],
    ['red snapper'],
    ['ribbon eel'],
    ['surgeonfish'],
    ['sweetfish']
  ],
  common: [
    ['barbel steed'],
    ['bitterling'],
    ['cherry salmon'],
    ['crawfish'],
    ['crucian carp'],
    ['dab'],
    ['frog'],
    ['tadpole'],
    ['horse mackerel'],
    ['loach'],
    ['pale chub'],
    ['pond smelt', 'It could sure use a bath!'],
    ['seahorse', `They meant to, of course!`],
    ['small bass'],
    ['squid', 'Yes they did!']
  ],
  veryCommon: [
    ['black bass', 'Now that\'s some class!'],
    ['carp'],
    ['salmon', 'Oh, that\'s slammin\'!'],
    ['sea bass', 'What?! You again?!']
  ]
};

// generate list of fish
let fishes = {};
Object.keys(fishData).forEach((rarity) => {
  fishes[rarity] = [];
  for (let i = 0; i < fishData[rarity].length; i++) {
    if (fishData[rarity][i][1] !== undefined) {
      fishes[rarity][i] = new Fish(fishData[rarity][i][0], rarity, fishData[rarity][i][1]);
    } else {
      fishes[rarity][i] = new Fish(fishData[rarity][i][0], rarity);
    }
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
    let lineWasBitten = this.calculateResult(0, 100);
    // fish bit the line
    if (lineWasBitten >= 20) {
      // calculate if fish was caught
      let successRate = this.calculateResult(0, 100);
      if (successRate >= 25) {
        let fish = this.getRandomFish();
        // dumb way to handle rarity name starting with u
        let result = (fish.rarity[0] === 'u') ? `${sender} caught an ${fish}!` : `${sender} caught a ${fish}!`;
        // check if there is flavour text
        if (fish.flavourText.length > 0) { result += ` ${fish.flavourText}`; }
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
    let result = this.calculateResult(0, 100);
    if (result >= 99) {
      return fishes.superRare[Math.floor(Math.random() * fishes.superRare.length)];
    } else if (result >= 97) {
      return fishes.rare[Math.floor(Math.random() * fishes.rare.length)];
    } else if (result >= 70) {
      return fishes.uncommon[Math.floor(Math.random() * fishes.uncommon.length)];
    } else if (result >= 40) {
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