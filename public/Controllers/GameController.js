'use strict';

import GameUIController from "./GameUIController.js";

class GameController
{
    constructor(canvas)
    {
        this.gamePaused = false;
        this.gameUIController = new GameUIController(canvas);
        this.level = 0;
    }

    handle_keypress(event)
    {
        if (event.keyCode == 32)
        {
            this.gameUIController.spacePressed = true;
            event.preventDefault();
        }
    }

    render(time_delta)
    {
        // currently this just steps the game, so we go into the same game loop that we had before.
        // in the future we can have several different states defined here, and show pause menus,
        // start menus, etc.
        // keypresses should be handled in this class and passed down to this UI controller
        this.gameUIController.step_game(time_delta);
    }
};

var canvas = document.querySelector("canvas");

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

canvas.width = windowWidth;
canvas.height = windowHeight;

var gameController = new GameController(canvas);

var keypressFunction = gameController.handle_keypress.bind(gameController);
window.addEventListener("keypress", keypressFunction, false);

// create the game loop
setInterval(gameController.render.bind(gameController), 10, 1);