// ref: https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169

'use strict';

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

            var shape1Min = shape1MinMaxProjections[0];
            var shape2Min = shape2MinMaxProjections[0];

            var shape1Max = shape1MinMaxProjections[1];
            var shape2Max = shape2MinMaxProjections[1];

            if (shape2Max < shape1Min || shape1Max < shape2Min)
            {
                return false;
            }
        }

        for (var i = 0; i < shape2Norms.length; i++)
        {
            var norm = shape2Norms[i];
            var shape1MinMaxProjections = this.GetMinMaxProjections(shape1Vertices, norm);
            var shape2MinMaxProjections = this.GetMinMaxProjections(shape2Vertices, norm);

            var shape1Min = shape1MinMaxProjections[0];
            var shape2Min = shape2MinMaxProjections[0];

            var shape1Max = shape1MinMaxProjections[1];
            var shape2Max = shape2MinMaxProjections[1];

            if (shape2Max < shape1Min || shape1Max < shape2Min)
            {
                return false;
            }
        }

        return true;
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

export default CollisionCalculator;