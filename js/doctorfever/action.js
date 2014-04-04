
function Action(currentTime) {
    this.time = currentTime;
    this.process = function(){};
}


/*
 * Tilt the block on field right.
 * If the block were to collide, nothing is done.
 */
function ActionTiltBlockRight(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionTiltBlockRight...");
        if(!field.tiltBlockRight()) {
            DEBUG_PRINT("field " + field.index + ": " + "Unable to tilt the block", 2);
            return;
        }
        DEBUG_PRINT("field " + field.index + ": " + "Block tilted to right", 2);
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
        DEBUG_PRINT("field " + field.index + ": " + "ActionTiltBlockRight...");
        if(!field.tiltBlockLeft()) {
            DEBUG_PRINT("field " + field.index + ": " + "Unable to tilt the block", 2);
            return;
        }
        DEBUG_PRINT("field " + field.index + ": " + "Block tilted to left", 2);
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
        DEBUG_PRINT("field " + field.index + ": " + "ActionTurnBlockRight...");
        if(!field.turnBlockRight()) {
            DEBUG_PRINT("field " + field.index + ": " + "Unable to turn the block", 2);
            return;
        }
        DEBUG_PRINT("field " + field.index + ": " + "Block turned to right", 2);
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
        DEBUG_PRINT("field " + field.index + ": " + "ActionTurnBlockLeft...");
        if(!field.turnBlockLeft()) {
            DEBUG_PRINT("field " + field.index + ": " + "Unable to turn the block", 2);
            return;
        }
        DEBUG_PRINT("field " + field.index + ": " + "Block turned to left", 2);
    };
    return action;
}

/*
 * Drop the block.
 */
function ActionDropBlock(game, field, currentTime) {
    var action = new Action();
    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionDropBlock...");
        field.updateState(currentTime);
	if(!field.dropBlock()) {
            DEBUG_PRINT("field " + field.index + ": " + "Unable to drop the block", 2);
            return;
        }

        // Reschedule next field update if needed 
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("field " + field.index + ": " + "Schedule puyo pop", 3);
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            field.addAction(actionPopPuyos);
        }
    };
    return action;
}

/*
 * Init new block(usually after previous one hit the bottom or chain ended)
 */
function ActionInitBlock(game, field, currentTime) {
    var action = new Action(currentTime);

    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionInitBlock...", 2);
        if(field.state.trashDrop && field.state.trashInStore) {
            //Drop trash
            DEBUG_PRINT("field " + field.index + ": " + "DropTrash", 3);
            field.state.trashDrop = false; // No trash drop next time
            var actionDropTrash = new ActionDropTrash(game, field, currentTime);
            field.addAction(actionDropTrash);
        } else {
            //Create block
            DEBUG_PRINT("field " + field.index + ": " + "CreateBlock", 3);
            field.state.trashDrop = true; // Drop trash next time
            var actionCreateBlock = new ActionCreateNewBlock(game, field,
                    currentTime);
            field.addAction(actionCreateBlock);
        }
    };
    return action;
}

function ActionDropTrash(game, field, currentTime) {
    var action = new Action(currentTime);

    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionDropTrash...", 2);
        var trashToDrop = Math.min(CONFIG.maxTrashDrop,
                field.state.trashInStore); 
        DEBUG_PRINT("field " + field.index + ": " + "Dropping " + trashToDrop + " trash");
        field.state.trash += trashToDrop;
        field.state.trashInStore -= trashToDrop;
        field.updateState(currentTime);
        // Reschedule next field update if needed
	// Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("field " + field.index + ": " + "Schedule puyo pop", 3);
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field,
                    puyoPopTime);
            field.addAction(actionPopPuyos);
	}
    };

    return action;
}

function ActionCreateNewBlock(game, field, currentTime) {
    var action = new Action(currentTime);
    
    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionCreateNewBlock...", 2);
        field.initBlock(currentTime);
        // Reschedule next field update if needed
	// Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("field " + field.index + ": " + "Schedule puyo pop", 3);
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
        DEBUG_PRINT("field " + field.index + ": " + "ActionPopPuyos...", 3);

        //Find adjacent puyo sets and those of them that needs to be popped
        var puyoSetsToPop = field.getPuyoSetsToPop();
        var chains = field.chains;
        var chain = chains[chains.length - 1];

        // Is there puyo sets to pop?
        if(puyoSetsToPop.length > 0) {
            
            // Puyo sets needs to be popped
            DEBUG_PRINT("field " + field.index + ": " + "Popping " + puyoSetsToPop.length + "puyo sets", 4);
            field.popPuyoSets(puyoSetsToPop);
            for(i = 0; i < puyoSetsToPop.length; i++) {
                chain.addSets(puyoSetsToPop);
            }

            field.state.time = currentTime;
            //field.updateState(currentTime);

            // Reschedule next field update if needed 
            // Alternatively, if the field is not updating (no puyos moving) and
            // therefore next update is at Infinity, schedule an action to check
            // if puyos needs to be popped/destroyed.
            var nextUpdateTime = field.reScheduleUpdate();
            if(nextUpdateTime == Infinity) {
                DEBUG_PRINT("field " + field.index + ": " + "Schedule puyo pop", 4);
                var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
                var actionPopPuyos = new ActionPopPuyos(game, field,
                        puyoPopTime);
                field.addAction(actionPopPuyos);
            }
        } else {
        
            // No puyo sets to pop
            // Add trash if chain ended and reset chain
            if(!chain) {
                chains.push(new Chain());
            } else if(chain.sets.length > 0) {
                var trashCount = chain.score / 20;
                var fieldCount = game.fields.length;
                DEBUG_PRINT("field " + field.index + ": " + "Adding total of " + trashCount +
                        "trash to " + (fieldCount - 1) + " fields", 4);
                for(i = 0; i < fieldCount; i++) {
                    if(game.fields[i] == field) {  continue; }
                    var actionAddTrash = new ActionAddTrash(game,
                            game.fields[i], currentTime,
                            Math.ceil(trashCount / (fieldCount - 1)));
                    game.fields[i].addAction(actionAddTrash);
                }
                chains.push(new Chain());
            }
            DEBUG_PRINT("field " + field.index + ": " + "Schedule block init", 4);
            var actionInitBlock = new ActionInitBlock(game, field,
                    currentTime + CONFIG.blockInitDelay);
            field.addAction(actionInitBlock);
        }
    };

    return action;
}

/*
 * Add given amount of trash to the field
 */
function ActionAddTrash(game, field, currentTime, amount) {
    var action = new Action(currentTime);
    
    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionAddTrash...", 5);
        field.state.trashInStore += amount;
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
        DEBUG_PRINT("field " + field.index + ": " + "ActionUpdateFieldState...", 5);
        // Update puyo positions on given fieldState
        field.updateState(currentTime);
        // Reschedule next field update if needed
        // Alternatively, if the field is not updating (no puyos moving) and
        // therefore next update is at Infinity, schedule an action to check
        // if puyos needs to be popped/destroyed.
        field.nextUpdate = undefined;
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("field " + field.index + ": " + "Schedule puyo pop", 5);
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field, puyoPopTime);
            field.addAction(actionPopPuyos);
        }
    };

    return action;
}


function ActionCreateChain(game, field, currentTime, chainCount) {
    var action = new Action(currentTime);

    action.process = function() {
        DEBUG_PRINT("field " + field.index + ": " + "ActionCreateChain...");
        field.createChain(currentTime, chainCount);
        var nextUpdateTime = field.reScheduleUpdate();
        if(nextUpdateTime == Infinity) {
            DEBUG_PRINT("field " + field.index + ": " + "Schedule puyo pop", 3);
            var puyoPopTime = currentTime + CONFIG.puyoPopDelay * 1000;
            var actionPopPuyos = new ActionPopPuyos(game, field, puyoPopTime);
            field.addAction(actionPopPuyos);
        }
    };

    return action;
}
