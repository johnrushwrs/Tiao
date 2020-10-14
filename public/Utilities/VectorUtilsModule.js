'use strict';

function Vector(x, y)
{
    this.x = x;
    this.y = y;
};
Vector.prototype.Subtract = function (vector2)
{
    var output = new Vector(0, 0);
    output.x = this.x - vector2.x;
    output.y = this.y - vector2.y;

    return output;
};
Vector.prototype.Add = function (vector2)
{
    var output = new Vector(0, 0);
    output.x = this.x + vector2.x;
    output.y = this.y + vector2.y;

    return output;
};
Vector.prototype.Multiply = function (vector2)
{
    var output = new Vector(0, 0);
    output.x = this.x * vector2.x;
    output.y = this.y * vector2.y;

    return output;
};
Vector.prototype.Dot = function (vector2)
{
    return this.x * vector2.x + this.y * vector2.y;
};
Vector.prototype.Squared = function ()
{
    var output = new Vector(0, 0);
    output.x = this.x * this.x;
    output.y = this.y * this.y;

    return output;
};
Vector.prototype.Length = function ()
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
};
Vector.prototype.Normalized = function ()
{
    var length = this.Length();
    if (length == 0 || isNaN(length))
    {
        throw "Length was invalid, can't calculate normalized vector!";
    }

    return this.Multiply(new Vector(1.0 / length, 1.0 / length));
};
Vector.prototype.Rotate = function (rotationRadians)
{
    var alpha = Math.atan(this.y / (this.x + 0.0));

    // arc tangent has multiple solutions, so we need to narrow down which
    // angle is correct. Also we need to make sure it is in the range of 0 to 2pi
    if (alpha > 0)
    {
        if (this.y < 0)
        {
            alpha += Math.PI;
        }
    }
    else
    {
        if (this.x > 0)
        {
            alpha += 2 * Math.PI;
        }
        else
        {
            alpha += Math.PI;
        }
    }

    var length = this.Length();
    var rotatedX = Math.sqrt(length) * Math.cos(alpha + rotationRadians);
    var rotatedY = Math.sqrt(length) * Math.sin(alpha + rotationRadians);

    return new Vector(rotatedX, rotatedY);
};

export default Vector;