# Honkbot
An application that hooks to twitch-irc and will allow users to play games in the chatroom. Games will be displayed in a graphical window.

# Modules Folder
This is where the various types of games are stored and can be "loaded". They are typically invoked in the chat room by a command word prefixed by an exclamation mark.
## Games
* dungeon - Is a four player game where players venture into a labyrinth-like dungeon to find treasure. The dungeon is home to many creatures that players will need to defeat in order to keep traversing safely (work in progress).
* fishing - Players cast out a fishing line and wait for something to bite. A wide variety of things can be caught of differing rarities.

## Tools
* twitch-client
Wrapper class for the twitch-js library

## Dependencies
### Required to compile and run SDL2
* Requires [Windows Build Tools](https://github.com/felixrieseberg/windows-build-tools) installed.
* [sdl2-link](https://github.com/dananderson/sdl2-link)
* [fastcall](https://github.com/cmake-js/fastcall)

### Twitch library API
* [twitch-js](https://github.com/twitch-devs/twitch-js)

## How to use
* Run *npm install* and it will download all the required dependencies. If you need to recompile the libraries run *npm rebuild*.

## Misc Notes
* You may need to download precompiled [SDL2](https://www.libsdl.org/download-2.0.php) libraries and place them in the project folder.
* NodeV8 may 

## SDL2 API Reference
https://wiki.libsdl.org/CategoryAPI
