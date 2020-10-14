'use strict'

import PlayerAction from "../Enums/PlayerActionEnum.js";
import Vector from "../Utilities/VectorUtilsModule.js";

const PlayerSpeedValues = {};
PlayerSpeedValues[PlayerAction.MOVE_LEFT] = -10;
PlayerSpeedValues[PlayerAction.MOVE_RIGHT] = 10;
PlayerSpeedValues[PlayerAction.MOVE_DOWN] = 50;
PlayerSpeedValues[PlayerAction.JUMP] = -65;

class PlayerController
{
    constructor(playerEntityModel, playerOffset)
    {
        this.PlayerModel = playerEntityModel;
        this.PlayerOffset = playerOffset;
        this.reset_player();

        this.BaseVelocity = this.PlayerModel.Velocity;
    }

    handle_player_action(playerAction, startAction = true)
    {
        if (playerAction == PlayerAction.JUMP)
        {
            if (startAction && this.PlayerModel.Position.y == 0)
            {
                this.PlayerModel.SetVelocity(this.PlayerModel.Velocity.Add(new Vector(0, PlayerSpeedValues[PlayerAction.JUMP])));
            }
        }
        else if (playerAction == PlayerAction.MOVE_LEFT)
        {
            // add left velocity
            this.IsMovingLeft = startAction;
        }
        else if (playerAction == PlayerAction.MOVE_RIGHT)
        {
            // add right velocity
            this.IsMovingRight = startAction;
        }
    }

    get_applied_velocities()
    {
        var totalApplied = new Vector(0, 0);        
        if (this.IsMovingLeft)
        {
            totalApplied = totalApplied.Add(new Vector(PlayerSpeedValues[PlayerAction.MOVE_LEFT], 0));
        }

        if (this.IsMovingRight)
        {
            totalApplied = totalApplied.Add(new Vector(PlayerSpeedValues[PlayerAction.MOVE_RIGHT], 0));
        }

        return totalApplied;
    }

    reset_player()
    {
        this.PlayerModel.SetPosition(new Vector(this.PlayerOffset, -this.PlayerModel.Shape.radius * 2 / Math.sqrt(2)));
        this.PlayerModel.SetVelocity(new Vector(9, 0));

        this.IsMovingLeft = false;
        this.IsMovingRight = false;
    }
}

export default PlayerController;