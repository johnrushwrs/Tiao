'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";

class BackgroundView
{
    constructor(viewElement)
    {
    }

    render(draw_controller)
    {
        // var bot_left_pos = (new Vector(0, draw_controller.height/2)).Add(draw_controller.origin);
        // var top_right_pos = (new Vector(draw_controller.width * .9, 0)).Add(draw_controller.origin);

        // var bot_left_pos = new Vector(draw_controller.origin.x, 0);
        // var top_right_pos = new Vector(draw_controller.origin.x + draw_controller.width, 0);

        var bot_left_pos = new Vector(draw_controller.origin.x, draw_controller.height/2);
        var top_right_pos = new Vector(draw_controller.origin.x + draw_controller.width, 0);

        draw_controller.fill_rect(bot_left_pos, top_right_pos);
    }
}

export default BackgroundView;