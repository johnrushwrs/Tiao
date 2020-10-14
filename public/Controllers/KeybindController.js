'use strict'

import KeybindSettingsModel from "../Models/KeybindSettingsModel.js";
import PlayerAction from "../Enums/PlayerActionEnum.js";

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

// this controller supplies the current keybinds to the 
// other controllers, mostly for the player controller
// it also provides the ability to change keybinds,
// in case there is need to do so through a UI in the future
class KeybindController
{
    constructor(keybindMapping = defaultMapping)
    {
        this.KeybindingModel = new KeybindSettingsModel(keybindMapping);
    }

    get_action(keyCode)
    {
        return this.KeybindingModel.get_keybind(keyCode);
    }

    set_action(originalKeyCode, newKeyCode, action)
    {
        if (originalKeyCode != null)
        {
            this.KeybindingModel.remove_keybind(originalKeyCode);
        }

        this.KeybindingModel.set_keybind(newKeyCode, action);
    }
}

export default KeybindController;