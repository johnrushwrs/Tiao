'use strict';

import Vector from "./VectorUtilsModule.js";
import CollisionCalculator from "./Collisions.js";

function GameEntity()
{
    this.Position = new Vector(0, 0);
    this.Velocity = new Vector(0, 0);
};
GameEntity.prototype.SetPosition = function (position_vector)
{
    this.Position = position_vector;
};
GameEntity.prototype.SetVelocity = function (velocity_vector)
{
    this.Velocity = velocity_vector;
};
GameEntity.prototype.Draw = function (draw_controller)
{
    draw_controller.fillRect(this.Position.x, this.Position.y, 100, 100);
};

Player.prototype = new GameEntity;
function Player()
{
    // make a delegate draw function here that we can pass to the draw controller 
    // rather than having it be elsewhere. With this pattern we can change the player drawing 
    // 
};
Player.prototype.Draw = function (draw_controller)
{
    draw_controller.fill_rect(this.Position, new Vector(this.Position.x + 100, this.Position.y + 100));
};

TriangleEnemy.prototype = new GameEntity;
function TriangleEnemy(position_vector)
{
    this.Position = position_vector;
};
TriangleEnemy.prototype.Draw = function (draw_controller)
{
    var triangle_top_vertex = new Vector(this.Position.x + 50, this.Position.y - 100);
    var triangle_right_vertex = new Vector(this.Position.x + 100, this.Position.y);

    draw_controller.draw_line_multi(this.Position, triangle_top_vertex, triangle_right_vertex, this.Position);
    draw_controller.fill();
}

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

    draw_rect(bot_left_pos, top_right_pos)
    {
        bot_left_pos = this.translate_to_canvas_space(bot_left_pos);
        top_right_pos = this.translate_to_canvas_space(top_right_pos);

        this.canvasContext.beginPath();

        var width = top_right_pos.x - bot_left_pos.x;
        var height = top_right_pos.y - bot_left_pos.y;

        this.canvasContext.rect(bot_left_pos.x, bot_left_pos.y, width, -height);
    }

    fill_rect(bot_left_pos, top_right_pos)
    {
        bot_left_pos = this.translate_to_canvas_space(bot_left_pos);
        top_right_pos = this.translate_to_canvas_space(top_right_pos);

        this.canvasContext.beginPath();

        var width = top_right_pos.x - bot_left_pos.x;
        var height = top_right_pos.y - bot_left_pos.y;

        this.canvasContext.fillRect(bot_left_pos.x, bot_left_pos.y, width, -height);
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

class GameController
{
    constructor(canvas)
    {
        this.gamePaused = false;
        this.DrawController = new HTMLCanvasController(canvas, new Vector(0, canvas.height/2.0));
        this.player = new Player();

        this.playerOffset = this.DrawController.width * .03;
        this.player.SetPosition(new Vector(this.playerOffset, 0));
        this.player.SetVelocity(new Vector(9, 0));

        this.EnemyEntities = [];
        for (var i = 0; i < 10; i++)
        {
            this.EnemyEntities.push(new TriangleEnemy(new Vector(this.DrawController.width * (i + 1), 0)));
        }

        this.PlayerEntities = [this.player];
        this.GameEntities = this.PlayerEntities.concat(this.EnemyEntities);
        this.spacePressed = false;
        this.level = 0;
    }

    draw_background()
    {
        this.DrawController.draw_line(new Vector(this.DrawController.origin.x, 0),
                                      new Vector(this.DrawController.origin.x + this.DrawController.width, 0));
        this.DrawController.draw();
    }

    draw_player()
    {
        //this.DrawController.fill_rect(this.player.Position, new Vector(this.player.Position.x + 100, this.player.Position.y + 100));
        
        this.player.Draw(this.DrawController);
        this.DrawController.draw();
    }

    draw_enemies()
    {
        var i;
        for (i = 0; i < this.EnemyEntities.length; i++)
        {
            var enemyEntity = this.EnemyEntities[i];
            enemyEntity.Draw(this.DrawController);
            //this.DrawController.fill_rect(enemyEntity.Position, new Vector(enemyEntity.Position.x + 100, enemyEntity.Position.y + 100));
        }
        this.DrawController.draw();
    }

    handle_keyPress(event)
    {
        console.log("hello!");
        if (event.keyCode == 32)
        {
            this.spacePressed = true;
            event.preventDefault();
        }
    }

    update_gameEntity_Vectors(time_delta)
    {
        var grav_accel = new Vector(0, 9.8);

        var i;
        for (i = 0; i < this.GameEntities.length; i++)
        {
            var entity = this.GameEntities[i];
            var curr_pos = entity.Position;

            var time_delta_squared = time_delta * time_delta;
            var accel_calc = grav_accel.Multiply(new Vector(.5 * time_delta_squared, .5 * time_delta_squared));
            var vel_calc = entity.Velocity.Multiply(new Vector(time_delta, time_delta));
            
            var new_pos = accel_calc.Add(vel_calc).Add(curr_pos);
            new_pos.y = Math.min(new_pos.y, 0); // we use min because positive is towards the ground

            entity.SetPosition(new_pos);

            accel_calc = grav_accel.Multiply(new Vector(time_delta, time_delta));
            var new_vel = accel_calc.Add(entity.Velocity);
            new_vel.y = Math.min(new_vel.y, 0);

            entity.SetVelocity(new_vel);
        }
    }

    step_game(time_delta)
    {
        // play one step of the game
        console.log(this);

        // clear the screen before we start
        this.DrawController.clear_canvas();
        this.DrawController.set_origin(new Vector(this.player.Position.x - this.playerOffset, 0));

        // draw the background
        this.draw_background();

        // apply input to player objects
        if (this.spacePressed == true)
        {
            this.player.SetVelocity(this.player.Velocity.Add(new Vector(0, -80)));
            this.spacePressed = false;
        }

        this.update_gameEntity_Vectors(time_delta);

        // draw the player
        this.draw_player();

        // draw any objects
        this.draw_enemies();

        // check input 

        
        // check for game ending scenario
    }
};

var canvas = document.querySelector("canvas");

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

canvas.width = windowWidth;
canvas.height = windowHeight;

var gameController = new GameController(canvas);

var keypressFunction = gameController.handle_keyPress.bind(gameController);
window.addEventListener("keypress", keypressFunction, false);

// create the game loop
setInterval(gameController.step_game.bind(gameController), 10, 1);