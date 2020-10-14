'use strict';

import Vector from "./VectorUtilsModule.js";
import CollisionCalculator from "./Collisions.js";
import Polygon from "./Shapes.js";

function GameEntity()
{
    this.Position = new Vector(0, 0);
    this.Velocity = new Vector(0, 0);
    this.Shape = new Polygon(this.Position, 4, 10, Math.PI/4);
};
GameEntity.prototype.SetShape = function ()
{
    this.Shape = new Polygon(this.Position, 4, 10, Math.PI/4);
};
GameEntity.prototype.SetPosition = function (position_vector)
{
    this.Position = position_vector;
    this.SetShape();
};
GameEntity.prototype.SetVelocity = function (velocity_vector)
{
    this.Velocity = velocity_vector;
};
GameEntity.prototype.Draw = function (draw_controller)
{
    draw_controller.draw_polygon(this.Shape);
};

Player.prototype = new GameEntity;
function Player()
{
    // make a delegate draw function here that we can pass to the draw controller 
    // rather than having it be elsewhere. With this pattern we can change the player drawing 
};
Player.prototype.SetShape = function ()
{
    var playerRadius = 50;
    var shapeOrigin = this.Position.Add(new Vector(playerRadius * Math.cos(Math.PI/4), -playerRadius * Math.sin(Math.PI/4)));
    this.Shape = new Polygon(shapeOrigin, 4, playerRadius, Math.PI/4);
};
Player.prototype.Draw = function (draw_controller)
{
    draw_controller.draw_polygon(this.Shape);
    draw_controller.fill();
};

TriangleEnemy.prototype = new GameEntity;
function TriangleEnemy(position_vector)
{
    this.Position = position_vector;
};
TriangleEnemy.prototype.SetShape = function ()
{
    var radius = 50;
    var shapeOrigin = this.Position.Add(new Vector(radius * Math.cos(Math.PI/6), -radius * Math.sin(Math.PI/6)));
    shapeOrigin = this.Position.Add(new Vector(0, -radius/2));
    this.Shape = new Polygon(shapeOrigin, 3, radius, Math.PI/6);
};
TriangleEnemy.prototype.Draw = function (draw_controller)
{
    draw_controller.draw_polygon(this.Shape);
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
        this.reset_player();

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

    reset_player()
    {
        this.player.SetPosition(new Vector(this.playerOffset, -this.player.Shape.radius * 2 / Math.sqrt(2)));
        this.player.SetVelocity(new Vector(9, 0));
    }

    draw_background()
    {
        this.DrawController.draw_line(new Vector(this.DrawController.origin.x, 0),
                                      new Vector(this.DrawController.origin.x + this.DrawController.width, 0));
        this.DrawController.draw();
    }

    draw_player()
    {
        this.player.Draw(this.DrawController);
        this.DrawController.draw();
    }

    draw_enemies()
    {
        for (var i = 0; i < this.EnemyEntities.length; i++)
        {
            var enemyEntity = this.EnemyEntities[i];
            enemyEntity.Draw(this.DrawController);
        }
        this.DrawController.draw();
    }

    check_collisions()
    {
        for (var i = 0; i < this.EnemyEntities.length; i++)
        {
            var enemyEntity = this.EnemyEntities[i];
            if (CollisionCalculator.IsColliding(enemyEntity.Shape, this.player.Shape))
            {
                alert("You died.");
                this.reset_player();
            }
        }
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

        // clear the screen before we start
        this.DrawController.clear_canvas();
        this.DrawController.set_origin(new Vector(this.player.Position.x - this.playerOffset, 0));

        // check for collisions
        this.check_collisions();

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