const print = console.log.bind(console);

const SDL2link = require('sdl2-link');
const SDL = SDL2link()
    .withFastcall(require('fastcall'))
    .withTTF()
    .load();

//const Dungeon = require('./modules/dungeon');
const Fishing = require('./modules/fishing');
const Client = require('./modules/twitch-client');

// initialize irc client
let client = new Client();
client.connect();

//SDL window params
const title = SDL.toCString("Fishing");
const SCREENWIDTH = 400;
const SCREENHEIGHT = 400;
let quit = false;

// initialize SDL
if (SDL.SDL_Init(SDL.SDL_INIT_VIDEO) < 0) {
  console.error(SDL.SDL_GetError());
}

// // initialize SDL TTF
if(SDL.TTF_Init() < 0){
  console.error(SDL.SDL_GetError());
}

// create SDL window
const window = SDL.SDL_CreateWindow(
  title,
  SDL.SDL_WINDOWPOS_UNDEFINED,
  SDL.SDL_WINDOWPOS_UNDEFINED,
  SCREENWIDTH,
  SCREENHEIGHT,
  SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN
);

//create SDL renderer
let renderer = SDL.SDL_CreateRenderer(window, -1, SDL.SDL_RendererFlags.SDL_RENDERER_ACCELERATED | SDL.SDL_RendererFlags.SDL_RENDERER_PRESENTVSYNC);
// initialize fishing game
let game = new Fishing(client, renderer);

let currTime = SDL.SDL_GetTicks();
let oldTime = currTime;
let deltaTime = 0;

// main event loop
(function tick() {
  let e = new SDL.SDL_Event();

  if (!quit) {
    // listen for events
    while (SDL.SDL_PollEvent(e.ref()) !== 0) {
      event(e);
    }

    oldTime = currTime;
    currTime = SDL.SDL_GetTicks();
    deltaTime = (currTime - oldTime) / 1000;

    update(deltaTime);
    render(renderer);

    setImmediate(tick, 0);
  } else {
    SDL.SDL_DestroyRenderer(renderer);
    SDL.SDL_DestroyWindow(window);

    SDL.SDL_Quit();
    SDL.TTF_Quit();
    client.disconnect();
  }
})();

function event(e) {
  switch (e.type) {
    case SDL.SDL_EventType.SDL_QUIT:
      quit = true;
      break;
    // case SDL.SDL_EventType.SDL_KEYDOWN:
    //   switch (e.key.keysym.scancode) {
    //     case SDL.SDL_SCANCODE_E:
    //       break;
    //   }
    //   break;
  }
}

function update(delta) {
}

function render(renderer) {
  if (SDL.SDL_SetRenderDrawColor(renderer, 0xFF, 0xFF, 0xFF, 0xFF) !== 0) {
    console.error(SDL.SDL_GetError());
  }

  if (SDL.SDL_RenderClear(renderer) !== 0) {
    console.error(SDL.SDL_GetError());
  }

  // let game do stuff with the renderer
  game.render();
}