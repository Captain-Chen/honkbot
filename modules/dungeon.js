const print = console.log.bind(this);
const SDL2link = require('sdl2-link');
const SDL = SDL2link()
  .withFastcall(require('fastcall'))
  .withTTF()
  .load();

// text stuff
if(SDL.TTF_Init() > 0){
  throw new Error(SDL.SDL_GetError());
}

const tuffy = SDL.TTF_OpenFont(SDL.toCString("tuffy.ttf"), 14);
let messageSurfacePtr = SDL.TTF_RenderText_Blended(tuffy, SDL.toCString("Hello my fellow honkers"), 0xFFFFFFFF);

const SCREENWIDTH = 400;
const SCREENHEIGHT = 400;

class Dungeon {
  constructor(connection) {
    this.irc = connection;
    this.handleMessages = this.handleMessages.bind(this);
    this.irc._client.on('message', this.handleMessages);
    this.partyList = [];
  }

  start() { }

  reset() { }

  join(sender) {
    if (!this.partyList.exists(sender)) {
      this.partyList.push(sender);
      return `${sender} joined the party.`;
    } else {
      return `${sender}, you are already in the party!`;
    }
  }

  render(renderer) {
    let messageTexturePtr = SDL.SDL_CreateTextureFromSurface(renderer, messageSurfacePtr);
    const { width, height } = getTextureSize(messageTexturePtr);
    const destRect = new SDL.SDL_Rect({ x: (SCREENWIDTH / 2) - width / 2, y: (SCREENHEIGHT / 2) - height / 2, w: width, h: height });

    SDL.SDL_SetRenderDrawColor(renderer, 0, 0, 200, 255);
    SDL.SDL_RenderClear(renderer);
    SDL.SDL_RenderCopy(renderer, messageTexturePtr, null, destRect.ref());
    SDL.SDL_RenderPresent(renderer);
  }

  handleEvents(event) {

  }

  handleMessages(channel, userstate, message, self) {
    if (self) {
      return;
    }

    let sender = userstate['display-name'];

    if (message === "!dungeon") {
      this.irc._client.say(channel, this.join(sender));
    }
  }
}


function getTextureSize(texturePtr) {
  const widthPtr = SDL.ref.alloc('int');
  const heightPtr = SDL.ref.alloc('int');

  SDL.SDL_QueryTexture(texturePtr, null, null, widthPtr, heightPtr);
  return { width: widthPtr.deref(), height: heightPtr.deref() };
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

module.exports = Dungeon;