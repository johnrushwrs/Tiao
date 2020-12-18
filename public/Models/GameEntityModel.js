'use strict';

import Vector from "../Utilities/VectorUtilsModule.js";
import Polygon, { Square , Triangle } from "../Utilities/Shapes.js";

function GameEntity()
{
    this.Position = new Vector(0, 0);
    this.Velocity = new Vector(0, 0);
    this.Mass = 1;
    this.AppliedForces = new Vector(0, 0);
    this.IsMovable = true;
    this.IsEnemy = true;
};
GameEntity.prototype.SetPosition = function (position_vector)
{
    this.Position = position_vector;
};
GameEntity.prototype.SetVelocity = function (velocity_vector)
{
    this.Velocity = velocity_vector;
};
GameEntity.prototype.AddForce = function (force_vector)
{
    this.AppliedForces = this.AppliedForces.Add(force_vector);
};
GameEntity.prototype.ResetForces = function ()
{
    this.AppliedForces = new Vector(0, 0);
};

ShapedGameEntity.prototype = new GameEntity;
function ShapedGameEntity()
{
    this.Shape = new Square(this.Position, 10, Math.PI/4);
    this.TypeName = "ShapedGameEntity";
};
ShapedGameEntity.prototype.SetShape = function ()
{
    this.Shape = new Square(this.Position, 10, Math.PI/4);
};
ShapedGameEntity.prototype.SetPosition = function (position_vector)
{
    this.Position = position_vector;
    this.SetShape();
};

Player.prototype = new ShapedGameEntity;
function Player()
{
    this.TypeName = "Player";
    this.IsEnemy = false;
};
Player.prototype.SetShape = function ()
{
    var playerRadius = 50;
    var shapeOrigin = this.Position.Add(new Vector(playerRadius * Math.cos(Math.PI/4), -playerRadius * Math.sin(Math.PI/4)));
    this.Shape = new Square(shapeOrigin, playerRadius, Math.PI/4);
};

TriangleEnemy.prototype = new ShapedGameEntity;
function TriangleEnemy(position_vector)
{
    this.Position = position_vector;
    this.SetShape();
    this.IsEnemy = true;
};
TriangleEnemy.prototype.SetShape = function ()
{
    var radius = 50;
    var shapeOrigin = this.Position.Add(new Vector(radius * Math.cos(Math.PI/6), -radius * Math.sin(Math.PI/6)));
    shapeOrigin = this.Position.Add(new Vector(0, -radius/2));
    this.Shape = new Triangle(shapeOrigin, radius, Math.PI/6);
};

export { GameEntity as GameEntity, Player as Player, TriangleEnemy as TriangleEnemy, ShapedGameEntity as ShapedGameEntity };