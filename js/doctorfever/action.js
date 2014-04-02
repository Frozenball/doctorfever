
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
        // FOR THE TIME BEING, HOWEVER, THE STATE ISN'T CHANGING NOR ARE THE PUYOS
        // MOVING SO IT'S OK TO JUST CHANGE THE TIMESTAMP.
        field.state.time = currentTime; 
        // Reschedule next field update if needed
	// Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            field.addAction(actionPopPuyos);
	}
    };

    return action;
}

/*
 * Tilt the block on field right.
 * If the block were to collide, nothing is done.
 */
function ActionTiltBlockRight(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("ActionTiltBlockRight...");
        if(!field.tiltBlockRight()) {
            DEBUG_PRINT("Unable to tilt the block");
            return;
        }
        DEBUG_PRINT("Block tilted to right");
    };
    return action;
}

/*
 * Tilt the block on field left.
 * If the block were to collide, nothing is done.
 */
function ActionTiltBlockLeft(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("ActionTiltBlockRight...");
        if(!field.tiltBlockLeft()) {
            DEBUG_PRINT("Unable to tilt the block");
            return;
        }
        DEBUG_PRINT("Block tilted to left");
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
        if(!field.turnBlockRight()) {
            DEBUG_PRINT("Unable to turn the block");
            return;
        }
        DEBUG_PRINT("Block turned to right");
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
        if(!field.turnBlockLeft()) {
            DEBUG_PRINT("Unable to turn the block");
            return;
        }
        DEBUG_PRINT("Block turned to left");
    };
    return action;
}

/*
 * Drop the block.
 */
function ActionDropBlock(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("ActionDropBlock...");
        if(!field.dropBlock()) {
            DEBUG_PRINT("Unable to drop the block");
            return;
        }

        // Reschedule next field update if needed 
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            field.addAction(actionPopPuyos);
        }
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
        
        // Reschedule next field update if needed 
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            field.addAction(actionPopPuyos);
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
        var i;
        for(i = 0; i < puyoSets.length; i++) {
            if(puyoSets[i].length >= 4) {
                puyoSetsToPop.push(puyoSets[i]);
            }
        }
        var chains = field.chains;
        var chain = chains[chains.length - 1];
        if(puyoSetsToPop.length > 0) {
            DEBUG_PRINT("Popping " + puyoSetsToPop.length + "puyo sets");
            field.popPuyoSets(puyoSetsToPop);
            for(i = 0; i < puyoSetsToPop.length; i++) {
                chain.addSets(puyoSetsToPop);
            }
            DEBUG_PRINT("Schedule puyo drop");
            var puyoDropTime = currentTime + CONFIG.puyoDropDelay * 1000;
            var actionDropPuyos = new ActionDropPuyos(game, field,
                    puyoDropTime);
            field.addAction(actionDropPuyos);
        } else {
            if(!chain || chain.sets.length > 0) {
                chains.push(new Chain());
            }
            DEBUG_PRINT("Schedule block creation");
            var blockCreateTime = currentTime + CONFIG.blockCreateDelay * 1000;
            var actionCreateNewBlock = ActionCreateNewBlock(game, field,
                    blockCreateTime);
            field.addAction(actionCreateNewBlock);
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
        // Reschedule next field update if needed
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        field.nextUpdate = undefined;
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("Schedule puyo pop");
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field, puyoPopTime);
            window.setTimeout( actionPopPuyos.process,
                               puyoPopTime - (new Date()).getTime() );
        }
    };

    return action;
}

