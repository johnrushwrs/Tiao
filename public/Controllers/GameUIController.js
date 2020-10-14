'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";
import CollisionCalculator from "../Utilities/Collisions.js";
import GameView from "../Views/GameView.js";
import { TriangleEnemy, Player, GameEntity } from "../Models/GameEntityModel.js";

class GameUIController
{
    constructor(canvas)
    {
        this.level = 0;
        this.spacePressed = false;
        this.gamePaused = false;
        
        this.player = new Player();
        this.playerOffset = canvas.width * .03;
        this.reset_player();
        
        this.EnemyEntityModels = [];
        for (var i = 0; i < 10; i++)
        {
            this.EnemyEntityModels.push(new TriangleEnemy(new Vector(canvas.width * (i + 1), 0)));
        }
        
        this.PlayerEntityModels = [this.player];
        this.GameEntityModels = this.PlayerEntityModels.concat(this.EnemyEntityModels);
        this.GameView = new GameView(canvas, this.GameEntityModels, new Vector(0, 0));
    }

    reset_player()
    {
        this.player.SetPosition(new Vector(this.playerOffset, -this.player.Shape.radius * 2 / Math.sqrt(2)));
        this.player.SetVelocity(new Vector(9, 0));
    }

    check_collisions()
    {
        for (var i = 0; i < this.EnemyEntityModels.length; i++)
        {
            var enemyEntity = this.EnemyEntityModels[i];
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
        for (i = 0; i < this.GameEntityModels.length; i++)
        {
            var entity = this.GameEntityModels[i];
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

    // this method is used by the parent view
    step_game(time_delta)
    {
        // check for collisions
        this.check_collisions();

        // apply input to player objects
        if (this.spacePressed == true)
        {
            this.player.SetVelocity(this.player.Velocity.Add(new Vector(0, -80)));
            this.spacePressed = false;
        }

        this.update_gameEntity_Vectors(time_delta);
        
        // things to consider here:
        // How can we pass the current updated values to the gameview? if they are the same reference, does that work?
        // Is it bad practice to create the view over and over again? seems bad.
        // Maybe we should pass the models in the render function?
        this.GameView.render(new Vector(this.player.Position.x - this.playerOffset, 0));
    }

    // this method is used by the parent view
    reset_game()
    {
        this.reset_player();
    }
};

export { GameUIController as default };