'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";
import Polygon, { Square , Triangle } from "../Utilities/Shapes.js";

function GameEntity()
{
    this.Position = new Vector(0, 0);
    this.Velocity = new Vector(0, 0);
    this.Shape = new Square(this.Position, 10, Math.PI/4);
    this.TypeName = "GameEntity";
};
GameEntity.prototype.SetShape = function ()
{
    this.Shape = new Square(this.Position, 10, Math.PI/4);
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

Player.prototype = new GameEntity;
function Player()
{
    this.TypeName = "Player";
};
Player.prototype.SetShape = function ()
{
    var playerRadius = 50;
    var shapeOrigin = this.Position.Add(new Vector(playerRadius * Math.cos(Math.PI/4), -playerRadius * Math.sin(Math.PI/4)));
    this.Shape = new Square(shapeOrigin, playerRadius, Math.PI/4);
};

TriangleEnemy.prototype = new GameEntity;
function TriangleEnemy(position_vector)
{
    this.Position = position_vector;
    this.SetShape();
};
TriangleEnemy.prototype.SetShape = function ()
{
    var radius = 50;
    var shapeOrigin = this.Position.Add(new Vector(radius * Math.cos(Math.PI/6), -radius * Math.sin(Math.PI/6)));
    shapeOrigin = this.Position.Add(new Vector(0, -radius/2));
    this.Shape = new Triangle(shapeOrigin, radius, Math.PI/6);
};

export { GameEntity as GameEntity, Player as Player, TriangleEnemy as TriangleEnemy };