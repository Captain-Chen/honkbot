const print = console.log.bind(console);
const sdl = require('node-sdl2');
const Dungeon = require('./modules/dungeon');
const client = require('./modules/twitch-client');

// SDL window params
const title = "Test Dungeon";
const SCREENWIDTH = 400;
const SCREENHEIGHT = 400;
let quit = false;

// initialize SDL
if (sdl.SDL_Init(sdl.SDL_INIT_VIDEO) < 0) {
  console.error(sdl.SDL_GetError());
}

// create window
let window = sdl.SDL_CreateWindow(title,
  sdl.SDL_WINDOWPOS_UNDEFINED,
  sdl.SDL_WINDOWPOS_UNDEFINED,
  SCREENWIDTH,
  SCREENHEIGHT,
  sdl.SDL_WINDOW_SHOWN
);

// create a dungeon game
let game = new Dungeon();

// create renderer
let renderer = sdl.SDL_CreateRenderer(window, -1, sdl.SDL_RENDERER_ACCELERATED | sdl.SDL_RENDERER_PRESENTVSYNC);

let currTime = sdl.SDL_GetTicks();
let oldTime = currTime;
let deltaTime = 0;

// main event loop
(function tick() {
  let e = new sdl.SDL_Event();

  if (!quit) {
    // listen for events
    while (sdl.SDL_PollEvent(e.ref()) !== 0) {
      event(e);
    }

    oldTime = currTime;
    currTime = sdl.SDL_GetTicks();
    deltaTime = (currTime - oldTime) / 1000;

    update(deltaTime);
    render(renderer);

    // asynchronous recursive callback
    setImmediate(tick, 0);
  } else {
    sdl.SDL_DestroyWindow(window);
    sdl.SDL_Quit();
    client.disconnect();
  }
})();


function event(e) {
  switch (e.type) {
    case sdl.SDL_EventType.SDL_QUIT:
      quit = true;
      break;
    case sdl.SDL_EventType.SDL_KEYDOWN:
      switch (e.key.keysym.scancode) {
        case sdl.SDL_SCANCODE_E:
          break;
      }
      break;
  }
}

function update(delta) {
}

function render(renderer) {
  if (sdl.SDL_SetRenderDrawColor(renderer, 0xFF, 0xFF, 0xFF, 0xFF) !== 0) {
    console.error(sdl.SDL_GetError());
  }

  if (sdl.SDL_RenderClear(renderer) !== 0) {
    console.error(sdl.SDL_GetError());
  }

  sdl.SDL_RenderPresent(renderer);
}
