
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
 * @param fieldState field state to update
 * @param currentTime the time the field state will be updated to
*/
function ActionUpdateFieldState(game, fieldState, currentTime) {
    this.process = function() {
        // Time to next update - will be calculatet later and the time passed
        // since the time indicated by the state timestamp
        var nextUpdate = Infinity;
        // Time delta between current and old state time in seconds
        var time_d = (currentTime - fieldState.time) / 1000;

        // Iterate through every cell in the puyo grid
        // y axis in reverse so puyos below gets moved out for the falling
        // ones in time.
        for(var x = 0; x < fieldState.size[0]; x++) {
            for(var y = fieldState.size[1] - 1; y >= 0; y--) {

                // puyo, updated position, old and updated floored (tile)
                // positions
                var puyo = fieldState.getPuyoAt(x, y);
                if (!puyo) { continue; }
                var newPosition = [ puyo.position[0] + time_d * puyo.velocity[0],
                                    puyo.position[1] + time_d * puyo.velocity[1] ];
                var TilePosition = [ Math.floor(puyo.position[0]),
                                     Math.floor(puyo.position[1]) ];
                var newTilePosition = [ Math.floor(newPosition[0]),
                                        Math.floor(newPosition[1]) ];
                var collidedHorizontal = false;
                var collidedVertical = false;
               
                // Check if the puyo has moved to another tile
                if ( TilePosition[0] != newTilePosition[0] ||
                     TilePosition[1] != newTilePosition[1] )
                {
                    // Check if collided in either, border of the field or another
                    // puyo
                    collidedHorizontal =
                        newTilePosition[0] >= fieldState.size[0] ||
                        newTilePosition[0] < 0;
                    collidedVertical =
                        newTilePosition[1] >= fieldState.size[1] ||
                        newTilePosition[1] < 0;
                    collidedHorizontal = collidedHorizontal ||
                        (newTilePosition[0] != TilePosition[0] &&
                         fieldState.getPuyoAt( newTilePosition[0],
                                               TilePosition[1] ));
                    collidedVertical = collidedVertical ||
                        (newTilePosition[1] != TilePosition[1] &&
                         fieldState.getPuyoAt( TilePosition[0],
                                               newTilePosition[1] ));
                    
                    // If not collided and moved to another tile, update state
                    // puyo grid
                    if(!(collidedVertical || collidedHorizontal)) {
                        console.log("asd");
                        fieldState.setPuyoAt(
                            TilePosition[0],
                            TilePosition[1],
                            undefined);
                        fieldState.setPuyoAt(
                            newTilePosition[0],
                            newTilePosition[1],
                            puyo);
                    }

                }
                
                // If not collided horizontally, update x position. Otherwise
                // set horizontal velocity to 0 and set x position to the center
                // of current tile
                if(!collidedVertical) {
                    puyo.position[0] = newPosition[0];
                } else {
                    puyo.velocity[0] = 0;
                    puyo.position[0] = TilePosition[0] + 0.5;
                }
                // If not collided vertically, update y position. Otherwise set
                // vertical velocity to 0 and set y position to the center
                // of current tile
                if (!collidedHorizontal) {
                    puyo.position[1] = newPosition[1];
                } else {
                    puyo.velocity[1] = 0;
                    puyo.position[1] = TilePosition[1] + 0.5;
                }
                
                // Direction (sign of velocity) the puyo is moving
                var direction = [ puyo.velocity[0] / Math.abs(puyo.velocity[0]) || 1,
                                  puyo.velocity[1] / Math.abs(puyo.velocity[1]) || 1];
                
                // Next column and row to enter with the puyo's current velocity
                var nextCoords = [ Math.floor(newPosition[0] + direction[0]),
                                    Math.floor(newPosition[1] + direction[1])];
                
                // update nextUpdate, if the time befor this puyo enters a new
                // tile is shorther than it.
                nextUpdate = Math.min(
                        nextUpdate,
                        (nextCoords[0] - newPosition[0]) / puyo.velocity[0],
                        (nextCoords[1] - newPosition[1]) / puyo.velocity[1]);
            }
        }
        
        // Do not generate new actions/event if no puyos are active/moving
        // IN FUTURE THIS BEHAVIOUR SHOULD BE REPLACED WITH SOMETHING THAT
        // ALLOWS YOU TO CONTINUE PLAYING... LIKE CHECK IF PUYOS SHOULD BE
        // DESTRUCTED OR A NEW BLOCk SHOULD BE SPAWNED
        if(nextUpdate == Infinity) { return; }
        
        // Update the state timestamp
        fieldState.time = currentTime;
        var nextUpdate_action = new ActionUpdateFieldState(
                game,
                fieldState,
                currentTime + nextUpdate * 1000);
        window.setTimeout( nextUpdate_action.process,
                           (currentTime + nextUpdate) - (new Date()).getTime());
    };
}
