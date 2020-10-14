'use strict'

class KeybindSettingsModel
{
    // keybindMapping is a dictionary mapping
    // the keycode to the player action it is bound to.
    constructor(keybindMapping)
    {
        this.KeyBindings = keybindMapping;
    }

    get_keybind(keyCode)
    {
        return this.KeyBindings[keyCode];
    }

    set_keybind(keyCode, playerAction)
    {
        this.KeyBindings[keyCode] = playerAction;
    }

    remove_keybind(keyCode)
    {
        if (keyCode in this.KeyBindings)
        {
            delete this.KeyBindings[keyCode];
        }
    }
}

export default KeybindSettingsModel;