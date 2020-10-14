'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";
import CollisionCalculator from "../Utilities/Collisions.js";
import GameView from "../Views/GameView.js";
import { TriangleEnemy, Player, GameEntity } from "../Models/GameEntityModel.js";
import GameStateModel from "../Models/GameStateModel.js";
import Polygon from "../Utilities/Shapes.js";
import { ProbabilityBasedLevelController } from "./LevelControllers.js";
import KeybindController from "./KeybindController.js";
import PlayerController from "./PlayerController.js";

class GameUIController
{
    constructor(canvas)
    {
        this.level = 0;
        this.gamePaused = false;
        
        this.player = new Player();
        this.playerOffset = canvas.width * .03;
        
        this.GameEntityModels = [this.player];
        this.GameState = new GameStateModel();
        
        this.CameraEntity = new GameEntity();
        this.CameraEntity.SetPosition(new Vector(0, 0));
        this.CameraEntity.SetVelocity(new Vector(0, 0));

        this.GameOrigin = this.CameraEntity.Position;
        this.GameView = new GameView(canvas, this.GameState);
        this.LevelGenerator = new ProbabilityBasedLevelController(.01, 150);
        this.KeybindController = new KeybindController();
        this.PlayerController = new PlayerController(this.player, this.playerOffset);
        this.update_game_view();
    }

    update_game_view()
    {
        var width = this.GameView.DrawController.width;
        var height = this.GameView.DrawController.height;
        var gameOriginXOffset = this.GameOrigin.x;
        var vertices = 
        [
            new Vector(width + gameOriginXOffset, -height/2), 
            new Vector(gameOriginXOffset, -height/2), 
            new Vector(gameOriginXOffset, height/2), 
            new Vector(width + gameOriginXOffset, height/2)
        ];

        this.GameViewShape = new Polygon(vertices);
    }

    remove_game_entities(entityIndexesToRemove)
    {
        entityIndexesToRemove.forEach(entityIndex => 
        {
            delete this.GameEntityModels[entityIndex];
        });

        var newGameEntities = [];
        for (var i = 0; i < this.GameEntityModels.length; i++)
        {
            if (this.GameEntityModels[i] === undefined)
            {
                continue;
            }

            newGameEntities.push(this.GameEntityModels[i]);
        }

        this.GameEntityModels = newGameEntities;
    }

    generate_new_entities()
    {
        var canvasWidth = this.GameView.DrawController.width;
        var newEntityPosition = new Vector(canvasWidth + this.GameOrigin.x, 0);
        if (this.LevelGenerator.ShouldGenerateNewEntity(this.GameState, newEntityPosition))
        {
            if (this.LevelGenerator.LastGeneratedEntity != null)
            {
                console.log("Previous entity was at position: " + this.LevelGenerator.LastGeneratedEntity.Position.x + "," + this.LevelGenerator.LastGeneratedEntity.Position.y)
            }
            
            var newEntity = this.LevelGenerator.GenerateNewEntity(this.GameState, newEntityPosition);
            console.log("Generated a new entity at position: " + newEntity.Position.x + "," + newEntity.Position.y);
            this.GameEntityModels.push(newEntity);
        }
    }

    check_collisions()
    {
        for (var i = 0; i < this.GameEntityModels.length; i++)
        {
            var entity = this.GameEntityModels[i];
            if (entity.TypeName != "Player")
            {
                if (CollisionCalculator.IsColliding(entity.Shape, this.player.Shape))
                {
                    this.reset_game();
                }
            }
        }
    }

    get_offscreen_entities()
    {
        var entity_indexes_offscreen = []
        for (var i = 0; i < this.GameEntityModels.length; i++)
        {
            var entity = this.GameEntityModels[i];
            if (entity.TypeName != "Player")
            {
                if (!CollisionCalculator.IsColliding(entity.Shape, this.GameViewShape))
                {
                    entity_indexes_offscreen.push(i);
                }
            }
        }

        return entity_indexes_offscreen;
    }

    handle_key_press(keyCode, isKeyDown)
    {
        var playerAction = this.KeybindController.get_action(keyCode);
        console.log("This player action was pressed! : " + playerAction);
        this.PlayerController.handle_player_action(playerAction, isKeyDown);
    }

    apply_player_inputs()
    {
        var appliedVelocity = this.PlayerController.get_applied_velocities();

        var newXVel = appliedVelocity.x;
        var yVel = this.player.Velocity.y;
        this.player.SetVelocity(new Vector(newXVel, yVel));
    }

    update_game_entities(time_delta)
    {
        var grav_accel = new Vector(0, 9.8);

        for (var i = 0; i < this.GameEntityModels.length; i++)
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

    update_camera_position(time_delta)
    {
        var distance_travelled = this.CameraEntity.Velocity.Multiply(new Vector(time_delta, time_delta));
        this.CameraEntity.SetPosition(this.CameraEntity.Position.Add(distance_travelled));
    }

    // this method is used by the parent view
    step_game(time_delta)
    {
        // check for collisions
        this.check_collisions();

        // remove entities that are offscreen and increment score
        var offScreenEntityIndexes = this.get_offscreen_entities();
        var entitiesToRemove = [];
        offScreenEntityIndexes.forEach(entityIndex => {
            let entity = this.GameEntityModels[entityIndex];
            if (entity.Position.x < this.player.Position.x)
            {
                this.GameState.Score += 20;
                entitiesToRemove.push(entityIndex);
            }
        }, this);

        this.remove_game_entities(entitiesToRemove);

        // check if we should generate a new entity
        this.generate_new_entities();

        // update game entities
        this.apply_player_inputs();
        this.update_game_entities(time_delta);
        this.update_camera_position(time_delta);
        
        // update origin and render
        this.GameOrigin = this.CameraEntity.Position;
        this.GameView.render(this.GameOrigin, this.GameEntityModels);
        
        // update the camera view
        this.update_game_view();
        this.GameState.Timestamp += time_delta;
    }

    // this method is used by the parent view
    reset_game()
    {
        this.PlayerController.reset_player();
        this.GameState.Score = 0;
        this.LevelGenerator.LastGeneratedEntity = null;
        this.GameEntityModels = [this.player];
        this.CameraEntity.SetPosition(new Vector(0, 0));

        console.log("************************GAME RESET************************");
    }
};

export { GameUIController as default };