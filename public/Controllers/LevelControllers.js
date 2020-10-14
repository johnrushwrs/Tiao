'use strict'
import { TriangleEnemy } from "../Models/GameEntityModel.js";
import Vector from "../Utilities/VectorUtilsModule.js";

class LevelController
{
    ShouldGenerateNewEntity(gameState)
    {
        return false;
    }

    GenerateNewEntity(gameState)
    {
        return null;
    }
}

class TimeBasedLevelController extends LevelController
{
    constructor(timeInterval)
    {
        super();
        this.Interval = timeInterval;
    }

    ShouldGenerateNewEntity(gameState)
    {
        if (gameState.Timestamp % this.Interval == 0)
        {
            return true;
        }

        return false;
    }

    GenerateNewEntity(gameState, position)
    {
        return new TriangleEnemy(position);
    }
}

class ProbabilityBasedLevelController extends LevelController
{
    constructor(generationProbability, distanceBetweenEnemies = undefined)
    {
        super();
        this.GenerationProbability = generationProbability;
        this.DistanceBetweenEnemies = distanceBetweenEnemies;
        this.LastGeneratedEntity = null;
    }

    ShouldGenerateNewEntity(gameState, position)
    {
        var randomVal = Math.random();
        if (randomVal < this.GenerationProbability)
        {
            if (this.DistanceBetweenEnemies == undefined || this.LastGeneratedEntity == null)
            {
                return true;
            }
            else
            {
                var distanceFromLastEntity = Vector.Distance(this.LastGeneratedEntity.Position, position);
                return distanceFromLastEntity > this.DistanceBetweenEnemies;
            }
        }

        return false;
    }

    GenerateNewEntity(gameState, position)
    {
        this.LastGeneratedEntity = new TriangleEnemy(position);
        this.LastGeneratedEntity.SetVelocity(new Vector(-9, 0));

        return this.LastGeneratedEntity;
    }
}

export {ProbabilityBasedLevelController, TimeBasedLevelController};