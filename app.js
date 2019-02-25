const print = console.log.bind(console);

const SDL2link = require('sdl2-link');
const SDL = SDL2link()
  .withFastcall(require('fastcall'))
  .withImage()
  .withTTF()
  .load();

//const Dungeon = require('./modules/dungeon');
const Fishing = require('./modules/fishing');
const Client = require('./modules/twitch-client');

// globals
let gWindow;
let gRenderer;
let gScreenSurface;
let gTexture;
let gMessageTexture;
let quit = false;

// SDL window parameters
const title = SDL.toCString("Game Window");
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

function setupSDL() {
  // initialize SDL libraries
  if (SDL.SDL_Init(SDL.SDL_INIT_VIDEO) < 0) {
    throw SDL.SDL_GetError();
  }

  // initialize SDL TTF
  if (SDL.TTF_Init() < 0) {
    throw SDL.SDL_GetError();
  }

  // initialize extension
  SDL.IMG_Init(SDL.IMG_INIT_PNG);

  // create SDL window
  gWindow = SDL.SDL_CreateWindow(
    title,
    SDL.SDL_WINDOWPOS_UNDEFINED,
    SDL.SDL_WINDOWPOS_UNDEFINED,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN
  );

  if (gWindow === null) {
    throw SDL.SDL_GetError();
  }

  // create SDL renderer
  gRenderer = SDL.SDL_CreateRenderer(gWindow, -1, SDL.SDL_RendererFlags.SDL_RENDERER_ACCELERATED | SDL.SDL_RendererFlags.SDL_RENDERER_PRESENTVSYNC);

  // render string to a texture
  const tuffy = SDL.TTF_OpenFont(SDL.toCString("tuffy.ttf"), 36);
  const messageSurface = SDL.TTF_RenderText_Blended(tuffy, SDL.toCString("It's time to go fishing..."), 0xFFFFFFFF);

  // load image from file into texture
  gTexture = SDL.IMG_LoadTexture(gRenderer, SDL.toCString('resources/fishing.png'));

  // convert surface into a texture
  gMessageTexture = SDL.SDL_CreateTextureFromSurface(gRenderer, messageSurface);

  // deallocate memory related to the surface
  SDL.SDL_FreeSurface(messageSurface);
}

// main SDL event loop
function tick() {
  let e = new SDL.SDL_Event();

  if (!quit) {
    // listen for events
    while (SDL.SDL_PollEvent(e.ref()) !== 0) {
      event(e);
    }

    render();
    update();

    setImmediate(tick, 0);
  } else {
    // cleanup
    shutdownSDL();
    client.disconnect();
    process.exit(0);
  }
}

function shutdownSDL() {
  // deallocate memory
  SDL.SDL_DestroyRenderer(gRenderer);
  SDL.SDL_DestroyWindow(gWindow);
  SDL.SDL_DestroyTexture(gMessageTexture);
  SDL.SDL_DestroyTexture(gTexture);

  // quit SDL sub-systems
  SDL.SDL_Quit();
  SDL.TTF_Quit();
}

function event(e) {
  switch (e.type) {
    case SDL.SDL_EventType.SDL_QUIT:
      quit = true;
      break;
  }
}

function update() {
  game.update();
}

function render() {
  // set draw colour
  if (SDL.SDL_SetRenderDrawColor(gRenderer, 0, 0, 0xFF, 0xFF) !== 0) {
    throw SDL.SDL_GetError();
  }

  // clear current screen
  if (SDL.SDL_RenderClear(gRenderer) !== 0) {
    throw SDL.SDL_GetError();
  }

  // call game render
  game.render();

  // render current frame onto screen
  SDL.SDL_RenderPresent(gRenderer);
}

function getTextureSize(texturePtr) {
  const widthPtr = SDL.ref.alloc('int');
  const heightPtr = SDL.ref.alloc('int');
  SDL.SDL_QueryTexture(texturePtr, null, null, widthPtr, heightPtr);

  return { width: widthPtr.deref(), height: heightPtr.deref() };
}

process.on('SIGINT', () => {
  print('Initiating cleanup');
  shutdownSDL();
  client.disconnect();
  process.exit(0);
});

// initialize irc client
let client = new Client();
client.connect();

// initialize SDL
setupSDL();

let renderItems = new Map([
  ['fisherChen', gTexture]
]);

// initialize fishing game
let game = new Fishing(client, gRenderer, renderItems);

// start SDL event loop
tick();

// run every 30 seconds
let t = setInterval(() => {
  game.checkActiveChatters();
}, 3e4);