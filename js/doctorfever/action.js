
function Action() {
    this.process = function(){};
}


function ActionDropPuyos(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        // Set puyos to drop
        field.dropPuyos();
        
        // Get the next time puyo field needs to be updated at
        var nextUpdate = field.getNextUpdateTime();

        // Generate new action for next field update
        var nextUpdateAction = new ActionUpdateFieldState( game, field,
                nextUpdate);
        window.setTimeout( nextUpdateAction.process,
                           nextUpdate - (new Date()).getTime() );
    };
    return action;
}

function ActionPopPuyos(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
            var puyoSets = field.getAdjacentPuyoSets();
            var puyoSetsToPop = [];
            for(var i = 0; i < puyoSets.length; i++) {
                if(puyoSets[i].length >= 4) {
                    puyoSetsToPop.push(puyoSets[i]);
                }
            }
            if(puyoSetsToPop.length > 0)
            {
                field.popPuyoSets(puyoSetsToPop);
                var puyoDropTime = currentTime + CONFIG.puyoDropDelay;
                var actionDropPuyos = new ActionDropPuyos(game, field, puyoDropTime);
                window.setTimeout( actionDropPuyos.process,
                        puyoDropTime - (new Date()).getTime() );
            }
    };

    return action;
}

/*
 * Update the given field state, this involves updating position of puyos on
 * the field, checking for collisions etc. and generating new actions
 * accordingly(puyo popping, new puyo generation, trash generation etc.).
 * @param game the game object
 * @param field field to update
 * @param currentTime the time the field state will be updated to
*/
function ActionUpdateFieldState(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        
        // Update puyo positions on given fieldState
        field.updatePuyoPositions(currentTime);

        // Get the next time puyo field needs to be updated at
        var nextUpdate = field.getNextUpdateTime();
        
        // Do not generate new actions/event if no puyos are active/moving
        if(nextUpdate == Infinity) {
            var puyoPopTime = currentTime + CONFIG.popPuyosDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(
                    game,
                    field,
                    puyoPopTime);
            window.setTimeout( actionPopPuyos.process,
                               puyoPopTime - (new Date()).getTime() );
            return;
        }
        // Generate new action for next field update
        var nextUpdateAction = new ActionUpdateFieldState(game, field,
                nextUpdate);
        window.setTimeout( nextUpdateAction.process,
                           nextUpdate - (new Date()).getTime());
    };

    return action;
}

