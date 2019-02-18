const print = console.log.bind(console);

const SDL2link = require('sdl2-link');
const SDL = SDL2link()
  .withFastcall(require('fastcall'))
  .withTTF()
  .load();

//const Dungeon = require('./modules/dungeon');
const Fishing = require('./modules/fishing');
const Client = require('./modules/twitch-client');

// globals
let gWindowPtr;
let gRenderer;
let gScreenSurface;
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

  // create SDL window
  gWindowPtr = SDL.SDL_CreateWindow(
    title,
    SDL.SDL_WINDOWPOS_UNDEFINED,
    SDL.SDL_WINDOWPOS_UNDEFINED,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN
  );

  if(gWindowPtr === null){
    throw SDL.SDL_GetError();
  }else{
    // get window surface
    gScreenSurface = SDL.SDL_GetWindowSurface(gWindowPtr);
  }

  // create SDL renderer
  gRenderer = SDL.SDL_CreateRenderer(gWindowPtr, -1, SDL.SDL_RendererFlags.SDL_RENDERER_ACCELERATED | SDL.SDL_RendererFlags.SDL_RENDERER_PRESENTVSYNC);

  // render string to a texture
  const tuffy = SDL.TTF_OpenFont(SDL.toCString("tuffy.ttf"), 36);
  const messageSurface = SDL.TTF_RenderText_Blended(tuffy, SDL.toCString("Hello my fellow honkers"), 0xFFFFFFFF);

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

    //update(deltaTime);
    render();

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
  SDL.SDL_DestroyWindow(gWindowPtr);
  SDL.SDL_DestroyTexture(gMessageTexture);

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

function update(delta) {
}

function render() {
  const { width, height } = getTextureSize(gMessageTexture);
  const destRect = new SDL.SDL_Rect({ x: SCREEN_WIDTH / 2 - width / 2, y: SCREEN_HEIGHT / 2 - height / 2, w: width, h: height });

  if (SDL.SDL_SetRenderDrawColor(gRenderer, 0, 0, 0xFF, 0xFF) !== 0) {
    throw SDL.SDL_GetError();
  }

  if (SDL.SDL_RenderClear(gRenderer) !== 0) {
    throw SDL.SDL_GetError();
  }

  // copy message texture into renderer
  SDL.SDL_RenderCopy(gRenderer, gMessageTexture, null, destRect.ref());

  // render current frame onto screen
  SDL.SDL_RenderPresent(gRenderer);
}

function getTextureSize(texturePtr) {
  const widthPtr = SDL.ref.alloc('int'), heightPtr = SDL.ref.alloc('int');
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

// initialize fishing game
let game = new Fishing(client);

// run every 30 seconds
let t = setInterval(() => {
  game.checkActiveChatters();
}, 3e4);

// initialize SDL
setupSDL();
tick();