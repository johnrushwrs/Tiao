'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";

class ScoreBoardView
{
    constructor(viewElement)
    {
    }

    render(draw_controller, currentScore)
    {
        var x = draw_controller.width * .10;
        var y = - (draw_controller.height / 2) * .80;

        draw_controller.set_font('24px serif');
        draw_controller.fill_text("Score: " + currentScore, new Vector(x, y));
    }
}

export default ScoreBoardView;