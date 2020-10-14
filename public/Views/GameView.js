'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";
import ScoreBoardView from "./ScoreBoardView.js";
import GameEntityViewFactory from "./GameEntityViewFactory.js";
import BackgroundView from "./BackgroundView.js";

class GameView
{
    constructor(canvas, gameState)
    {
        this.DrawController = new HTMLCanvasController(canvas, new Vector(0, canvas.height/2.0));
        this.GameStateModel = gameState;
        this.ScoreBoardView = new ScoreBoardView();
        this.BackgroundView = new BackgroundView();
    }

    create_game_entity_views(entityModels)
    {
        this.GameEntityViews = [];
        for (var i = 0; i < entityModels.length; i++)
        {
            this.GameEntityViews.push(GameEntityViewFactory.GetView(entityModels[i]));
        }
    }

    draw_background()
    {
        // this.DrawController.draw_line(new Vector(this.DrawController.origin.x, 0),
        //                               new Vector(this.DrawController.origin.x + this.DrawController.width, 0));
        // this.DrawController.draw();
        this.BackgroundView.render(this.DrawController);
        this.DrawController.draw();
    }

    draw_player() // this function is unused, but we may need special drawing for the player
    {
        this.player.Draw(this.DrawController);
        this.DrawController.draw();
    }

    draw_game_entities(entityModels)
    {
        this.create_game_entity_views(entityModels);
        for (var i = 0; i < this.GameEntityViews.length; i++)
        {
            var entityView = this.GameEntityViews[i];
            entityView.draw(this.DrawController);
        }
        this.DrawController.draw();
    }

    draw_scoreboard()
    {
        this.ScoreBoardView.render(this.DrawController, this.GameStateModel.Score);
    }

    render(player_position, entityModels)
    {
        this.DrawController.clear_canvas();
        this.DrawController.set_origin(player_position);
        this.draw_background();
        this.draw_game_entities(entityModels);
        this.draw_scoreboard();
    }
};

class HTMLCanvasController
{
    constructor(canvas, origin)
    {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d');
        this.origin = origin;
        this.height = this.canvas.height;
        this.width = this.canvas.width;

        this.canvasContext.translate(origin.x, origin.y);
    }

    clear_canvas()
    {
        // Store the current transformation matrix
        this.canvasContext.save();

        // Use the identity matrix while clearing the canvas
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Restore the transform
        this.canvasContext.restore();
    }

    set_origin(new_origin_pos)
    {
        this.origin = new_origin_pos;
    }

    set_font(newFont)
    {
        this.canvasContext.font = newFont;
    }

    fill_text(text, start_pos)
    {
        this.canvasContext.fillText(text, start_pos.x, start_pos.y);
    }

    draw_line(start_pos, end_pos)
    {
        start_pos = this.translate_to_canvas_space(start_pos);
        end_pos = this.translate_to_canvas_space(end_pos);

        this.canvasContext.beginPath();
        this.canvasContext.moveTo(start_pos.x, start_pos.y);

        this.canvasContext.lineTo(end_pos.x, end_pos.y);
        this.canvasContext.closePath();
    }

    draw_line_multi(start_pos, ...positions)
    {
        start_pos = this.translate_to_canvas_space(start_pos);

        this.canvasContext.beginPath();
        this.canvasContext.moveTo(start_pos.x, start_pos.y);

        positions.forEach(pos => 
        {
            var translated_pos = this.translate_to_canvas_space(pos);
            this.canvasContext.lineTo(translated_pos.x, translated_pos.y);
        },
        this);
    }

    draw_polygon(polygon)
    {
        var positions = polygon.vertices.slice(1, polygon.vertices.length);
        positions.push(polygon.vertices[0]);

        this.draw_line_multi(polygon.vertices[0], ...positions);
    }

    draw_rect(bot_left_pos, top_right_pos)
    {
        bot_left_pos = this.translate_to_canvas_space(bot_left_pos);
        top_right_pos = this.translate_to_canvas_space(top_right_pos);

        this.canvasContext.beginPath();

        var width = top_right_pos.x - bot_left_pos.x;
        var height = top_right_pos.y - bot_left_pos.y;

        this.canvasContext.rect(bot_left_pos.x, bot_left_pos.y, width, height);
    }

    fill_rect(bot_left_pos, top_right_pos)
    {
        bot_left_pos = this.translate_to_canvas_space(bot_left_pos);
        top_right_pos = this.translate_to_canvas_space(top_right_pos);

        this.canvasContext.beginPath();

        var width = top_right_pos.x - bot_left_pos.x;
        var height = top_right_pos.y - bot_left_pos.y;

        this.canvasContext.fillRect(bot_left_pos.x, bot_left_pos.y, width, height);
    }

    fill()
    {
        this.canvasContext.fill();
    }

    translate_to_canvas_space(vector)
    {
        return vector.Subtract(this.origin);
    }

    draw()
    {
        this.canvasContext.stroke();
    }
};

export default GameView;