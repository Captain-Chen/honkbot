const print = console.log.bind(console);
const SDL2link = require('sdl2-link');
const SDL = SDL2link()
  .withFastcall(require('fastcall'))
  .withTTF()
  .load();

class Fish {
  constructor(name, rarity) {
    this.name = name;
    this.rarity = rarity;
  }

  toString() {
    return `${this.name} (${this.rarity})`;
  }
}

let fishData = {
  superRare: [
    ['froggy'],
    ['angler fish'],
    ['axolotl'],
    ['coelacanth'],
    ['lion fish'],
    ['great white shark']
  ],
  rare: [
    ['honk fish'],
    ['bluefin tuna'],
    ['rainbow trout'],
    ['arowana'],
    ['blue marlin'],
    ['octopus']
  ],
  uncommon: [
    ['trout'],
    ['bass'],
    ['catfish'],
    ['pike'],
    ['pale chub']
  ],
  common: [
    ['sardine'],
    ['guppy'],
    ['smelt'],
    ['anchovy']
  ]
};

// generate list of fish
let fishes = {};
Object.keys(fishData).forEach((rarity) => {
  fishes[rarity] = [];
  for (let i = 0; i < fishData[rarity].length; i++) {
    fishes[rarity][i] = new Fish(fishData[rarity][i][0], rarity);
  }
});

// globals
if (SDL.TTF_Init() > 0) {
  throw new Error(SDL.SDL_GetError());
}

const tuffy = SDL.TTF_OpenFont(SDL.toCString("tuffy.ttf"), 14);
let messageSurfacePtr = SDL.TTF_RenderText_Blended(tuffy, SDL.toCString("This is the fishing window."), 0xFFFFFFFF);

const SCREENWIDTH = 400;
const SCREENHEIGHT = 400;

class Fishing {
  constructor(connection, renderer) {
    this.irc = connection;
    this.renderer = renderer;

    this.handleMessages = this.handleMessages.bind(this);
    this.irc.client.on('message', this.handleMessages);
    this.fishingList = [];
  }

  join(sender) {
    if (!this.fishingList.exists(sender)) {
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
    if (lineWasBitten >= 25) {
      // calculate if fish was caught
      let successRate = this.calculateResult(0, 100);
      if (successRate >= 30) {
        let fish = this.getRandomFish();
        // dumb way to handle fish names starting with 'a'
        let result = (fish.name[0] === 'a') ? `${sender} caught an ${fish}!` : `${sender} caught a ${fish}!`;
        return result;
      } else {
        return `${sender}'s line snapped..`;
      }
    } else {
      return `${sender} didn't catch anything..`;
    }
  }

  broadcastResult(channel, sender, message) {
    // game loop
    let progress = 0;
    let t = setInterval(() => {
      if (progress < message.length) {
        this.irc.client.say(channel, message[progress]);
      }
      else 
      {
        // remove person from list
        this.fishingList.remove(sender);
        clearInterval(t);
      }
      progress++;
    }, 7e3);
  }

  getRandomFish() {
    let result = this.calculateResult(0, 100);
    if(result >= 99){
      return fishes.superRare[Math.floor(Math.random() * fishes.superRare.length)];
    } else if (result >= 97) {
      return fishes.rare[Math.floor(Math.random() * fishes.rare.length)];
    } else if (result >= 70) {
      return fishes.uncommon[Math.floor(Math.random() * fishes.uncommon.length)];
    } else {
      return fishes.common[Math.floor(Math.random() * fishes.common.length)];
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
        this.irc.client.say(channel, `${sender}, you are already fishing!`);
      }
    }
  }

  calculateResult(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getTextureSize(texturePtr) {
    const widthPtr = SDL.ref.alloc('int');
    const heightPtr = SDL.ref.alloc('int');

    SDL.SDL_QueryTexture(texturePtr, null, null, widthPtr, heightPtr);
    return { width: widthPtr.deref(), height: heightPtr.deref() };
  }

  render() {
    let messageTexturePtr = SDL.SDL_CreateTextureFromSurface(this.renderer, messageSurfacePtr);
    const { width, height } = this.getTextureSize(messageTexturePtr);
    const destRect = new SDL.SDL_Rect({ x: (SCREENWIDTH / 2) - width / 2, y: (SCREENHEIGHT / 2) - height / 2, w: width, h: height });

    SDL.SDL_SetRenderDrawColor(this.renderer, 0, 0, 200, 255);
    SDL.SDL_RenderClear(this.renderer);
    SDL.SDL_RenderCopy(this.renderer, messageTexturePtr, null, destRect.ref());
    SDL.SDL_RenderPresent(this.renderer);
  }
}

Array.prototype.exists = function (value) {
  for (let i = 0; i < this.length; i++) {
    const currentItem = this[i];
    if (currentItem === value) {
      return true;
    }
  }
  return false;
}

Array.prototype.remove = function (value) {
  for (let i = 0; i < this.length; i++) {
    const currentItem = this[i];
    if (currentItem === value) {
      this.splice(i, 1);
    }
  }
}

module.exports = Fishing;