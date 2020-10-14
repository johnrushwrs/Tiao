'use strict'

import PlayerEntityView from "./PlayerEntityView.js";
import GameEntityView from "./GameEntityView.js";

class GameEntityViewFactory
{
    GetView(gameEntityModel)
    {
        switch (gameEntityModel.TypeName)
        {
            case 'Player':
                return new PlayerEntityView(gameEntityModel);
            case 'GameEntity':
                return new GameEntityView(gameEntityModel);
            case 'ShapedGameEntity':
                return new GameEntityView(gameEntityModel);
            default:
                console.log("Unknown entity model type");
                return null;
        }
    }
}

export default new GameEntityViewFactory();