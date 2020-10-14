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
    constructor(origin, numSides, radiusLength = 5, initialAngleRadians = 0)
    {
        var vertices = [];

        let vertexAngle = 180 - (360/numSides);
        let vertexAngleRadians = (vertexAngle/360) * 2 * Math.PI;

        // calculate the vertices
        for (var i = 0; i < numSides; i++)
        {
            var currentAngle = i * vertexAngleRadians + initialAngleRadians;

            var xDistance = radiusLength * Math.cos(currentAngle);
            var yDistance = radiusLength * Math.sin(currentAngle);
            var vertex = origin.Add(new Vector(xDistance, yDistance));

            vertices.push(vertex);
        }

        var normals = [];

        // calculate the normals
        for (i = 1; i <= numSides; i++)
        {
            var firstVertex = vertices[i - 1];
            var secondVertex = null;
            if (i == numSides)
            {
                secondVertex = vertices[0];
            }
            else
            {
                secondVertex = vertices[i];
            }

            // get the vector between the second and first, i.e. the side
            var directionVector = secondVertex.Subtract(firstVertex);

            // normalize the direction
            var normalizedDirection = directionVector.Normalized();
            
            // rotate the direction so it is normal to the midpoint vector
            var rotatedDirection = normalizedDirection.Rotate(-Math.PI / 2);

            // this normalized vector is the vector normal to the side formed between 
            // the first and second vertex
            normals.push(rotatedDirection);
        }

        super(normals, vertices);
    }
}

var testPoly = new Polygon(new Vector(0, 0), 4, 10);
console.log(testPoly);

export default Polygon;