
function Action() {
    this.process = function(){};
}

/*
 * Update the given field state, this involves updating position of puyos on
 * the field, checking for collisions etc. and generating new actions
 * accordingly(puyo destructions, new puyo generation, trash generation etc.).
 * For example: update positions -> non-destructing(different colors)
 * collision detected -> generate ActionCreatePuyo and set timer to launch it.
 * OR SOMETHING LIKE DESCRIBED ABOVE... ONLY PUYO MOVEMENT AND STOP ON COLLISION
 * IMPLEMENTED AT THE MOMENT
 * @param game the game object
 * @param field_state field state to update
 * @param current_time the time the field state will be updated to
*/
function ActionUpdateFieldState(game, field_state, current_time) {
    this.process = function() {
        // Time to next update - will be calculatet later and the time passed
        // since the time indicated by the state timestamp
        var next_update = Infinity;
        // Time delta between current and old state time in seconds
        var time_d = (current_time - field_state.time) / 1000;

        // Iterate through every cell in the puyo grid
        // y axis in reverse so puyos below gets moved out for the falling
        // ones in time.
        for(var x = 0; x < field_state.size[0]; x++) {
            for(var y = field_state.size[1] - 1; y >= 0; y--) {

                // puyo, updated position, old and updated floored (tile)
                // positions
                var puyo = field_state.getPuyoAt(x, y);
                if (!puyo) { continue; }
                var new_position = [ puyo.position[0] + time_d * puyo.velocity[0],
                                     puyo.position[1] + time_d * puyo.velocity[1] ];
                var tile_position = [ Math.floor(puyo.position[0]),
                                      Math.floor(puyo.position[1]) ];
                var new_tile_position = [ Math.floor(new_position[0]),
                                          Math.floor(new_position[1]) ];
                var collided_x = false;
                var collided_y = false;
               
                // Check if the puyo has moved to another tile
                if (tile_position[0] != new_tile_position[0] ||
                        tile_position[1] != new_tile_position[1])
                {
                    // Check if collided in either, border of the field or another
                    // puyo
                    if ( new_tile_position[0] >= field_state.size[0] ||
                         new_tile_position[0] < 0)
                    {
                        collided_x = true;
                    } 
                    if ( new_tile_position[1] >= field_state.size[1] ||
                         new_tile_position[1] < 0)
                    {
                        collided_y = true;
                    }
                    if (!(collided_x || collided_y) &&
                        field_state.getPuyoAt( new_tile_position[0],
                                               new_tile_position[1]))
                    {
                        if(new_tile_position[0] != tile_position[0]) {
                            collided_x = true;
                        }
                        if(new_tile_position[1] != tile_position[1]) {
                            collided_y = true;
                        }
                    }
                    
                    // If not collided and moved to another tile, update state
                    // puyo grid
                    if(!(collided_x || collided_y)) {
                        field_state.setPuyoAt(
                            tile_position[0],
                            tile_position[1],
                            undefined);
                        field_state.setPuyoAt(
                            new_tile_position[0],
                            new_tile_position[1],
                            puyo);
                    }

                }
                
                // If not collided horizontally, update x position. Otherwise
                // set horizontal velocity to 0 and set x position to the center
                // of current tile
                if(!collided_x) {
                    puyo.position[0] = new_position[0];
                } else {
                    puyo.velocity[0] = 0;
                    puyo.position[0] = tile_position[0] + 0.5;
                }
                // If not collided vertically, update y position. Otherwise set
                // vertical velocity to 0 and set y position to the center
                // of current tile
                if (!collided_y) {
                    puyo.position[1] = new_position[1];
                } else {
                    puyo.velocity[1] = 0;
                    puyo.position[1] = tile_position[1] + 0.5;
                }
                
                // Direction (sign of velocity) the puyo is moving
                var direction = [ puyo.velocity[0] / Math.abs(puyo.velocity[0]) || 1,
                                  puyo.velocity[1] / Math.abs(puyo.velocity[1]) || 1];
                
                // Next column and row to enter with the puyo's current velocity
                var next_coords = [ Math.floor(new_position[0] + direction[0]),
                                    Math.floor(new_position[1] + direction[1])];
                
                // update next_update, if the time befor this puyo enters a new
                // tile is shorther than it.
                next_update = Math.min(
                        next_update,
                        (next_coords[0] - new_position[0]) / puyo.velocity[0],
                        (next_coords[1] - new_position[1]) / puyo.velocity[1]);
            }
        }
        
        // Do not generate new actions/event if no puyos are active/moving
        // IN FUTURE THIS BEHAVIOUR SHOULD BE REPLACED WITH SOMETHING THAT
        // ALLOWS YOU TO CONTINUE PLAYING... LIKE CHECK IF PUYOS SHOULD BE
        // DESTRUCTED OR A NEW BLOCk SHOULD BE SPAWNED
        if(next_update == Infinity) { return; }
        
        // Update the state timestamp
        field_state.time = current_time;
        var next_update_action = new ActionUpdateFieldState(
                game,
                field_state,
                current_time + next_update * 1000);
        window.setTimeout( next_update_action.process,
                           (current_time + next_update) - (new Date()).getTime());
    };
}
