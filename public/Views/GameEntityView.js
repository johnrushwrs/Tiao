'use strict';

class GameEntityView
{
    constructor(gameEntity)
    {
        this.GameEntity = gameEntity;
    }

    draw(draw_controller)
    {
        draw_controller.draw_polygon(this.GameEntity.Shape);
        draw_controller.fill();
    }
}

export default GameEntityView; 