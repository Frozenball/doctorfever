
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
 * @param field field to update
 * @param currentTime the time the field state will be updated to
*/
function ActionUpdateFieldState(game, field, currentTime) {
    this.process = function() {
        
        // Update puyo positions on given fieldState
        field.updatePuyoPositions(game, currentTime);

        // Get the next time puyo field needs to be updated at
        var nextUpdate = field.getNextUpdateTime();
        
        // Do not generate new actions/event if no puyos are active/moving
        // IN FUTURE THIS BEHAVIOUR SHOULD BE REPLACED WITH SOMETHING THAT
        // ALLOWS YOU TO CONTINUE PLAYING... LIKE CHECK IF PUYOS SHOULD BE
        // DESTRUCTED OR A NEW BLOCk SHOULD BE SPAWNED
        if(nextUpdate == Infinity) { return; }
        // Generate new action for next field update
        var nextUpdateAction = new ActionUpdateFieldState( game, field,
                nextUpdate);
        window.setTimeout( nextUpdateAction.process,
                           nextUpdate - (new Date()).getTime());
    };
}
