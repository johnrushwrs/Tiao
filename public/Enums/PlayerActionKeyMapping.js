'use strict'

import PlayerAction from "./PlayerActionEnum.js";

const defaultMapping =
{
    // space bar
    32: PlayerAction.JUMP,

    // Left arrow
    37: PlayerAction.MOVE_LEFT,

    // Up arrow
    38: PlayerAction.MOVE_UP,

    // Right arrow
    39: PlayerAction.MOVE_RIGHT,

    // Down arrow 
    40: PlayerAction.MOVE_DOWN,
    
    // W
    87: PlayerAction.MOVE_UP,

    // A
    65: PlayerAction.MOVE_LEFT,

    // S
    83: PlayerAction.MOVE_DOWN,

    // D
    68: PlayerAction.MOVE_RIGHT
};