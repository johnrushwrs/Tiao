'use strict';

import Vector from "./VectorUtilsModule.js"

class Shape
{
    constructor(normals, vertices)
    {
        this.normals = normals;
        this.vertices = vertices;
    }
}
class Polygon extends Shape
{
    // takes an origin position (Vector) and creates a shape
    constructor(vertices)
    {
        var normals = [];

        // calculate the normals
        for (var i = 1; i <= vertices.length; i++)
        {
            var firstVertex = vertices[i - 1];
            var secondVertex = null;
            if (i == vertices.length)
            {
                secondVertex = vertices[0];
            }
            else
            {
                secondVertex = vertices[i];
            }

            // get the vector between the second and first, i.e. the side
            var directionVector = secondVertex.Subtract(firstVertex);
            
            // rotate the direction so it is normal to the midpoint vector
            var rotatedDirection = directionVector.Rotate(-Math.PI / 2);

            normals.push(rotatedDirection);
        }

        super(normals, vertices);
        this.numSides = vertices.length;
    }
}

class Square extends Polygon
{
    constructor(origin, radiusLength = 5, initialAngleRadians = 0)
    {
        var vertices = GeneratePolygonVertices(origin, 4, radiusLength, initialAngleRadians);
        super(vertices);
        this.radius = radiusLength;
    }
}

class Triangle extends Polygon
{
    constructor(origin, radiusLength = 5, initialAngleRadians = 0)
    {
        var vertices = GeneratePolygonVertices(origin, 3, radiusLength, initialAngleRadians);
        super(vertices);
        this.radius = radiusLength;
    }
}

function GeneratePolygonVertices(origin, numSides, radiusLength = 5, initialAngleRadians = 0)
{
    let vertexAngle = (360/numSides);
    let vertexAngleRadians = (vertexAngle/360) * 2 * Math.PI;

    // calculate the vertices
    var vertices = [];
    for (var i = 0; i < numSides; i++)
    {
        var currentAngle = i * vertexAngleRadians + initialAngleRadians;

        var xDistance = radiusLength * Math.cos(currentAngle);
        var yDistance = radiusLength * Math.sin(currentAngle);
        var vertex = origin.Add(new Vector(xDistance, yDistance));

        vertices.push(vertex);
    }

    return vertices;
}

export {Polygon as default, Triangle, Square, GeneratePolygonVertices};