// ref: https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169

'use strict';
import Vector from "../Utilities/VectorUtilsModule.js"
import CollisionCalculator from "../Utilities/Collisions.js";
import FrictionCalculator from "./FrictionCalculator.js";

var CLIP_THRESHOLD = .00001;
var COLLISION_THRESHOLD = .0001;

class PhysicsEngine
{   
    constructor(world_forces, max_velocity_magnitude = 10)
    {
        this.WorldForces = world_forces;
        this.FrictionCalculator = new FrictionCalculator();
        this.MaxVelocityMagnitude = max_velocity_magnitude;
    }

    get_world_forces()
    {
        var world_forces_sum = new Vector(0, 0);
        this.WorldForces.forEach(force => {
            world_forces_sum = world_forces_sum.Add(force);
        });

        return world_forces_sum;
    }

    get_colliding_entities(game_entities, entity)
    {
        var colliding = [];
        game_entities.forEach(other_entity => 
        {
            if (other_entity != entity
                && CollisionCalculator.IsColliding(entity.Shape, other_entity.Shape))
            {
                colliding.push(other_entity);
            }
        });

        return colliding;
    }

    get_other_entities(game_entities, entity)
    {
        var others = [];
        game_entities.forEach(other_entity => 
        {
            if (other_entity != entity)
            {
                others.push(other_entity);
            }
        });

        return others;
    }

    calculate_normal_force(applied_force, normal_vector)
    {
        var normal_axis = normal_vector.Normalized();

        var scale = applied_force.Dot(normal_axis);
        var component_of_force = normal_axis.Multiply(new Vector(-1 * scale, -1 * scale));
        return component_of_force;
    }

    find_collision_time_and_normal(colliding_entity, position, velocity)
    {
        var min_t = 100000;
        var colliding_normal = null;

        var shape = colliding_entity.Shape;
        for (var i = 0; i < shape.vertices.length; i++)
        {
            var vertex = shape.vertices[i];
            var normal = shape.normals[i];

            var t_i = null;
            var in_vertex_space = position.Subtract(vertex);
            var dot_p = normal.Dot(in_vertex_space);
            if ((dot_p > 0 && dot_p < COLLISION_THRESHOLD)
                || (dot_p < 0 && dot_p > -COLLISION_THRESHOLD))
            {
                t_i = 0;
            }
            else
            {
                var numerator = vertex.Dot(normal) - position.Dot(normal);
                var denom = velocity.Dot(normal);
    
                if (denom == 0)
                {
                    continue;
                }
    
                t_i = numerator / denom;
            }

            if (t_i < min_t && t_i >= 0) // added t_i > 0 because moving backwards should not be considered
            {
                min_t = t_i;
                colliding_normal = normal;
            }
        }

        return {min_t: min_t, colliding_normal: colliding_normal};
    }

    resolve_collisions(colliding_entities, entity)
    {
        var resolved_collision_normals = [];

        var shape = entity.Shape;
        var velocity = entity.Velocity;
        for (var i = 0; i < colliding_entities.length; i++)
        {
            var colliding_entity = colliding_entities[i];
            if (!colliding_entity.IsMovable)
            {
                // go through the points in our shape. find which one has the earliest collision along our 
                // velocity path, and which normal it collides with

                var collision_calculations = [];
                for (var j = 0; j < shape.vertices.length; j++)
                {
                    var vertex = shape.vertices[j];
                    var collision_calc = this.find_collision_time_and_normal(colliding_entity, vertex, velocity);
                    collision_calculations.push(collision_calc);
                }

                // find the minimum time here, and return that normal.
                var min_t = 100000000;
                var colliding_normal = null;
                for (j = 0; j < collision_calculations.length; j++)
                {
                    var collision_min_t = collision_calculations[j].min_t;
                    if (collision_min_t < min_t)
                    {
                        min_t = collision_min_t;
                        colliding_normal = collision_calculations[j].colliding_normal;
                    }
                }

                if (colliding_normal != null && min_t >= 0 && min_t <= 1) // added min_t >= 0 so that we don't go "back in time"
                {
                    // adjust the position and velocity
                    var travel_distance = velocity.Multiply(new Vector(min_t, min_t));
                    var new_position = entity.Position.Add(travel_distance);

                    var scale = velocity.Dot(colliding_normal) / colliding_normal.Dot(colliding_normal);
                    var velocity_in_collision_axis = colliding_normal.Multiply(new Vector(scale, scale));

                    var new_velocity = velocity.Subtract(velocity_in_collision_axis);
                    
                    // in the future, we need to apply these adjustments based on the time that they happened.
                    // if this collision actually happened at a later time than the next one we compute, we need to apply the next one first

                    // dont apply the change if the velocity is moving away from the colliding normal.
                    // this should only happen when t = 0, because otherwise the shape would be separated from the normal
                    if (scale <= 0)
                    {
                        entity.SetPosition(new_position);
                        entity.SetVelocity(new_velocity);
                    }
                    
                    resolved_collision_normals.push(colliding_normal);
                }
            }
            else
            {
                console.log("We are colliding with a movable entity");
            }
        }

        return resolved_collision_normals;
    }

    calculate_net_forces(applied_forces, resolved_normals, curr_vel)
    {
        var net_normal_force = new Vector(0, 0);
        var net_friction_force = new Vector(0, 0);

        for (var j = 0; j < resolved_normals.length; j++)
        {
            var normal_force = this.calculate_normal_force(applied_forces, resolved_normals[j]);
            var friction_force = this.FrictionCalculator.calculate_friction_force(normal_force, curr_vel);

            net_normal_force = net_normal_force.Add(normal_force);
            net_friction_force = net_friction_force.Add(friction_force);
        }

        return [net_normal_force, net_friction_force];
    }

    apply_constraints(entity)
    {
        var velocity_magnitude = entity.Velocity.Length();
        if (velocity_magnitude > this.MaxVelocityMagnitude)
        {
            var scalar = this.MaxVelocityMagnitude / velocity_magnitude;
            entity.SetVelocity(entity.Velocity.Multiply(new Vector(scalar, scalar)));
        }
    }

    update_game_entities(game_entities, time_delta)
    {
        var world_forces = this.get_world_forces();

        for (var i = 0; i < game_entities.length; i++)
        {
            var entity = game_entities[i];

            if (entity.IsMovable)
            {
                // find colliding entities
                //var colliding_entities = this.get_colliding_entities(game_entities, entity);
                var colliding_entities = this.get_other_entities(game_entities, entity);

                // lets say this only returns for immovable entities, because we shouldn't calculate friction for anything else
                var resolved_normals = this.resolve_collisions(colliding_entities, entity);

                // calculate the net forces
                var applied_force_sum = world_forces.Add(entity.AppliedForces)
                var [net_normal_force, net_friction_force] = this.calculate_net_forces(applied_force_sum, resolved_normals, entity.Velocity);

                // first we calculate the change in velocity based on the normal and applied forces.
                // this allows us to check if we need to apply the friction force. When the velocity is below a certain threshold,
                // we will not apply friction
                var net_force_no_friction = applied_force_sum.Add(net_normal_force);

                var accel_calc = net_force_no_friction.Multiply(new Vector(time_delta / entity.Mass, time_delta / entity.Mass));
                var vel_no_friction_adjustment = accel_calc.Add(entity.Velocity);

                var new_velocity = vel_no_friction_adjustment;
                if (this.FrictionCalculator.should_apply_friction_force(net_friction_force, vel_no_friction_adjustment))
                {
                    var vel_friction_adjusted = this.FrictionCalculator.calculate_adjusted_velocity(net_friction_force, vel_no_friction_adjustment, time_delta, entity.Mass);
                    var new_velocity = vel_friction_adjusted;
                }
                else
                {
                    net_friction_force = new Vector(0, 0);
                }
    
                // calculate the change in position
                var curr_pos = entity.Position;
    
                var net_force = net_force_no_friction.Add(net_friction_force);
                var net_acceleration = net_force.Multiply(new Vector(1 / entity.Mass, 1 / entity.Mass));

                var time_delta_squared = time_delta * time_delta;

                var accel_calc = net_acceleration.Multiply(new Vector(.5 * time_delta_squared, .5 * time_delta_squared));
                accel_calc = new Vector(0, 0);
                var vel_calc = entity.Velocity.Multiply(new Vector(time_delta, time_delta));
                
                var new_pos = accel_calc.Add(vel_calc).Add(curr_pos);
                
                // set the position and velocity, clipping low floating point values
                entity.SetPosition(new_pos.ClipValues(CLIP_THRESHOLD));
                entity.SetVelocity(new_velocity.ClipValues(CLIP_THRESHOLD));

                this.apply_constraints(entity);
            }
        }
    }
}

export default PhysicsEngine;