
function Action(currentTime) {
    this.time = currentTime;
    this.process = function(){};
}

function ActionCreateNewBlock(game, field, currentTime) {
    var action = new Action(currentTime);
    
    action.process = function() {
        DEBUG_PRINT("ActionCreateNewBlock...");
        // Shuffle the block type and create a new block
        var blockType = blockTypes[randint(0, blockTypes.length - 1)];
        DEBUG_PRINT("CreateNewBlock of type " + blockType);
        var puyoBlock = new PuyoBlock(blockType);
        field.state.setBlock(puyoBlock);
        // UPDATING STATE TIME THIS WAY MAY BE PROBLEM IN THE FUTURE...
        // WE SHOULD FIRST MAKE SURE THE FIELD STATE REPRESENTS THE STATE
        // AT currentTime.
        // AT THE MOMENT, HOWEVER, THE STATE ISN'T CHANGING NOR ARE THE PUYOS
        // MOVING SO IT'S OK TO JUST CHANGE THE TIMESTAMP FOR THE TIME BEING.
        field.state.time = currentTime; 
        // Find next time the field needs to be updated. Schedule an action
        // for the update.
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdate = field.getNextUpdateTime();
        if(nextUpdate == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            window.setTimeout(actionPopPuyos.process,
                    puyoPopTime - (new Date()).getTime());
        } else {
            DEBUG_PRINT("Schedule next field update");
            var nextUpdateAction = new ActionUpdateFieldState(game, field,
                    nextUpdate);
            window.setTimeout(nextUpdateAction.process,
                    nextUpdate - (new Date()).getTime());
        }
    };

    return action;
}

/*
 * Rotate the block on field right.
 * If the block were to collide on rotation, nothing is done.
 */
function ActionTurnBlockRight(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("ActionTurnBlockRight...");
        field.turnBlockRight();
    };
    return action;
}

/*
 * Rotate the block on field light.
 * If the block were to collide on rotation, nothing is done.
 */
function ActionTurnBlockLeft(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("ActionTurnBlockLeft...");
        field.turnBlockLeft();
    };
    return action;
}

/*
 * Set puyos in air to the drop velocity
 */
function ActionDropPuyos(game, field, currentTime) {
    var action = new Action(currentTime);
    action.process = function() {
        DEBUG_PRINT("ActionDropPuyos...");
        // Set puyos to drop and update state's time to the drop time
        field.dropPuyos();

        // UPDATING STATE TIME THIS WAY MAY BE PROBLEM IN THE FUTURE...
        // WE SHOULD FIRST MAKE SURE THE FIELD STATE REPRESENTS THE STATE
        // AT currentTime.
        // FOR THE TIME BEING, HOWEVER, THE STATE ISN'T CHANGING NOR ARE THE PUYOS
        // MOVING SO IT'S OK TO JUST CHANGE THE TIMESTAMP
        field.state.time = currentTime;
        
        // Find next time the field needs to be updated. Schedule an action
        // for the update.
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdate = field.getNextUpdateTime();
        if(nextUpdate == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            window.setTimeout(actionPopPuyos.process,
                    puyoPopTime - (new Date()).getTime());
        } else {
            DEBUG_PRINT("Schedule next field update");
            var nextUpdateAction = new ActionUpdateFieldState(game, field,
                    nextUpdate);
            window.setTimeout(nextUpdateAction.process,
                    nextUpdate - (new Date()).getTime());
        }
    };
    return action;
}

/*
 * Pop adjacent puyo sets if needed
 */
function ActionPopPuyos(game, field, currentTime) {
    var action = new Action(currentTime);
    action.process = function() {
        DEBUG_PRINT("ActionPopPuyos...");
        var puyoSets = field.getAdjacentPuyoSets();
        var puyoSetsToPop = [];
        for(var i = 0; i < puyoSets.length; i++) {
            if(puyoSets[i].length >= 4) {
                puyoSetsToPop.push(puyoSets[i]);
            }
        }
        if(puyoSetsToPop.length > 0) {
            DEBUG_PRINT("Popping " + puyoSetsToPop.length + "Puyos");
            field.popPuyoSets(puyoSetsToPop);
            DEBUG_PRINT("Schedule puyo drop");
            var puyoDropTime = currentTime + CONFIG.puyoDropDelay * 1000;
            var actionDropPuyos = new ActionDropPuyos(game, field,
                    puyoDropTime);
            window.setTimeout( actionDropPuyos.process,
                    puyoDropTime - (new Date()).getTime());
        } else {
            DEBUG_PRINT("Schedule block creation");
            var blockCreateTime = currentTime + CONFIG.blockCreateDelay * 1000;
            var actionCreateNewBlock = ActionCreateNewBlock(game, field,
                    blockCreateTime);
            window.setTimeout(actionCreateNewBlock.process,
                    blockCreateTime - (new Date()).getTime());
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
    var action = new Action(currentTime);
    
    action.process = function() {
        DEBUG_PRINT("ActionUpdateFieldState...");
        // Update puyo positions on given fieldState
        field.updatePuyoPositions(currentTime);

        // Find next time the field needs to be updated. Schedule an action
        // for the update.
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdate = field.getNextUpdateTime();
        if(nextUpdate == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field, puyoPopTime);
            window.setTimeout( actionPopPuyos.process,
                               puyoPopTime - (new Date()).getTime() );
        } else {
            DEBUG_PRINT("Schedule next field update");
            var nextUpdateAction = new ActionUpdateFieldState(game, field,
                    nextUpdate);
            window.setTimeout(nextUpdateAction.process,
                    nextUpdate - (new Date()).getTime());
        }
    };

    return action;
}

