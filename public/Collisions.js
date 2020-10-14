// ref: https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169

import Vector from "./VectorUtilsModule.js";
import Polygon from "./Shapes.js";

class CollisionCalculator
{
    static IsColliding(shape1, shape2)
    {
        var shape1Norms = shape1.normals;
        var shape2Norms = shape2.normals;

        var shape1Vertices = shape1.vertices;
        var shape2Vertices = shape2.vertices;

        for (var i = 0; i < shape1Norms.length; i++)
        {
            var norm = shape1Norms[i];
            var shape1MinMaxProjections = this.GetMinMaxProjections(shape1Vertices, norm);
            var shape2MinMaxProjections = this.GetMinMaxProjections(shape2Vertices, norm);

            if (shape1MinMaxProjections[0] > shape2MinMaxProjections[1]
                || shape1MinMaxProjections[1] > shape2MinMaxProjections[0])
            {
                return true;
            }
        }

        for (var i = 0; i < shape2Norms.length; i++)
        {
            var norm = shape2Norms[i];
            var shape1MinMaxProjections = this.GetMinMaxProjections(shape1Vertices, norm);
            var shape2MinMaxProjections = this.GetMinMaxProjections(shape2Vertices, norm);

            if (shape1MinMaxProjections[0] > shape2MinMaxProjections[1]
                || shape1MinMaxProjections[1] > shape2MinMaxProjections[0])
            {
                return true;
            }
        }

        return false;
    }

    static GetMinMaxProjections(verts, projectingAxis)
    {
        var minProjectionValue = verts[0].Dot(projectingAxis);
        var minProjectionIndex = 0;
        var maxProjectionValue = minProjectionValue;
        var maxProjectionIndex = 0;

        for (var i = 1; i < verts.length; i++)
        {
            var currProj = verts[i].Dot(projectingAxis);
            if (minProjectionValue > currProj)
            {
                minProjectionValue = currProj;
                minProjectionIndex = i;
            }

            if (maxProjectionValue < currProj)
            {
                maxProjectionValue = currProj;
                maxProjectionIndex = i;
            }
        }

        return [minProjectionValue, maxProjectionValue];
    }
}

var squarePoly = new Polygon(new Vector(0, 0), 4, 5, Math.PI / 4);
var squarePoly2 = new Polygon(new Vector(0, 0), 4, 10, Math.PI / 4);

var collides = CollisionCalculator.IsColliding(squarePoly, squarePoly2);
var collidesReverse = CollisionCalculator.IsColliding(squarePoly2, squarePoly);

export default CollisionCalculator;