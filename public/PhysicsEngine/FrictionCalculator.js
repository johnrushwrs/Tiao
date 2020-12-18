'use strict';

import Vector from "../Utilities/VectorUtilsModule.js"

var FORCE_THRESHOLD = .001;
var MIN_VELOCITY_FOR_FRICTION = .01;
var MAX_FRICTION_FORCE = 5;

class FrictionCalculator
{
    calculate_adjusted_velocity(friction_force, curr_vel, time_delta, entity_mass)
    {
        // apply friction force to velocity
        // here we need to check if the velocity "changed sign"
        // i.e. whether or not we flipped the direction of the movement
        // we can check this by computing the dot product again. If the sign has changed, movement has been reversed. in this case we just decrease to 0.
        // on a slanted surface this will allow gravity to keep the object moving. there will be value of friction that perfectly keeps the object going, but we can avoid this

        if (curr_vel.Length() < MIN_VELOCITY_FOR_FRICTION || friction_force.Length() == 0)
        {
            return curr_vel;
        }

        var applied_friction_force = friction_force.Multiply(new Vector(time_delta / entity_mass, time_delta / entity_mass));

        var friction_axis = applied_friction_force.Normalized();
        var velocity_friction_projection = curr_vel.Dot(friction_axis);

        var new_velocity = curr_vel.Add(applied_friction_force);
        var new_velocity_friction_projection = new_velocity.Dot(applied_friction_force);

        var changed_sign = velocity_friction_projection < 0 ? new_velocity_friction_projection >= 0 : new_velocity_friction_projection < 0;
        if (changed_sign)
        {
            // if we changed sign, then we need to apply the minimal amount of friction, i.e. we need to subtract out the friction axis.
            new_velocity = curr_vel.Subtract(friction_axis.Multiply(new Vector(velocity_friction_projection, velocity_friction_projection)));
        }

        return new_velocity;
    }

    calculate_friction_force(normal_force, curr_vel)
    {
        var friction_constant = .5;
        
        var friction_force = normal_force.Multiply(new Vector(friction_constant, friction_constant));
        friction_force = friction_force.Rotate(Math.PI/2);

        var friction_axis = normal_force.Rotate(Math.PI/2);

        var velocity_friction_projection = curr_vel.Dot(friction_axis);
        if (velocity_friction_projection > 0)
        {
            friction_force = friction_force.Multiply(new Vector(-1, -1)); // flip so friction is applied in the opposite direction.
        }

        var friction_magnitude = friction_force.Length();
        if (friction_magnitude > MAX_FRICTION_FORCE)
        {
            friction_force = friction_force.Multiply(new Vector(MAX_FRICTION_FORCE / friction_magnitude, MAX_FRICTION_FORCE / friction_magnitude));
        }

        return friction_force;
    }

    should_apply_friction_force(friction_force, curr_vel)
    {
        if (curr_vel.Length() < MIN_VELOCITY_FOR_FRICTION || friction_force.Length() == 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
}

export default FrictionCalculator;