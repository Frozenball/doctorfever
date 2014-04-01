/*
 * State Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 */
function FieldState(size, stateTime) {
    this.size = [size[0], size[1]] || [CONFIG.boardWidthTiles, CONFIG.boardHeightTiles];
    this.block = undefined;
    this.puyos = new Array(this.size[0] * this.size[1]);
    this.time = stateTime || (new Date()).getTime();
}

FieldState.prototype.setPuyoAt = function(x, y, val) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
        throw new Error('Out of bounds error');
    }
    this.puyos[x + y * this.size[1]] = val;
};

FieldState.prototype.getPuyoAt = function(x, y) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
        throw new Error('Out of bounds error');
    }
    return this.puyos[x + y*this.size[1]];
};

/*
 * Add PuyoBlock to the field state
 * @param block a PuyoBlock
 */
FieldState.prototype.setBlock = function(block) {
    if(!block) { this.block = block; return;}
    var puyos = block.puyos;
    var puyoPositions = block.getRotatedPuyoPositions();
    this.block = block;
    for(var i = 0; i < puyos.length; i++) {
        var puyo = puyos[i];
        var pos = puyoPositions[i];
        puyo.position = [pos[0], pos[1]];
        this.setPuyoAt(Math.floor(pos[0]), Math.floor(pos[1]), puyos[i]);
    }
};

/*
 * Add some random puyos to the field
 */
FieldState.prototype.debugRandomize = function(){
    for (var x = 0; x < this.size[0]; x++) {
        for (var y = 0; y < this.size[1]; y++) {
            if (randint(0, 10) <= 5) {
                var puyo = new Puyo(coloredPuyos[randint(0,3)], [x, y], [0, 2] );
                this.setPuyoAt(x, y, puyo);
            }
        }
    }
};



/*
 * Field Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 */
function Field(game, size) {
    if (!size) {
        throw new Error('Undefined size');
    }
    this.game = game;
    this.state = new FieldState(size);
    this.actions = [];
    this.currentActionIndex = 0;
    this.nextUpdate = undefined;
    this.nextUpdateTimeout = undefined;
    var nextUpdateTime = this.getNextUpdateTime();
    if(nextUpdateTime < Infinity) {
        this.nextUpdate = new ActionUpdateFieldState(game, this, nextUpdateTime);
        this.nextUpdateTimeout = setTimeout(this.nextUpdate.process,
                nextUpdateTime - (new Date()).getTime());
    }
}

Field.prototype.drawBoard = function(canvas, i) {
    for (var x = 0; x < this.state.size[0]; x++) {
        var puyoSize = [CONFIG.puyoWidth, CONFIG.puyoHeight];
        var puyoPadding = [CONFIG.puyoPaddingX, CONFIG.puyoPaddingY];
        var boardSize = [CONFIG.boardWidth, CONFIG.boardHeight];
        var boardPadding = [ CONFIG.boardPaddingRight, CONFIG.boardPaddingBottom,
                             CONFIG.boardPaddingLeft, CONFIG.boardPaddingTop ];
        for (var y = 0; y < this.state.size[1]; y++) {
            var puyo = this.state.getPuyoAt(x, y);
            if (puyo) {
                var boardOffset = [ (i + 1) * boardPadding[0] +
                                    i * boardSize[0] +
                                    i * boardPadding[2],
                                    boardPadding[1]];
                puyo.draw(
                    canvas.ctx,
                    x * (puyoSize[0] + puyoPadding[0]) + boardOffset[0],
                    y * (puyoSize[1] + puyoPadding[1]) + boardOffset[1],
                    puyoSize
                );
            }
        }
    }
};

/*
 * Reschedule field update is one is needed suuner than the currently
 * scheduled one. Returns the time of next update - Infinity if no updates
 * are scheduled.
 */
Field.prototype.reScheduleUpdate = function() {
    DEBUG_PRINT("Rescheduling field update...");
    var nextUpdateTime = this.getNextUpdateTime();
    if (nextUpdateTime == Infinity) {
        DEBUG_PRINT("No update needed - field isn't changing");
        window.clearTimeout(this.nextUpdateTimeout);
        this.nextUpdate = undefined;
        this.nextUpdateTimeout = undefined;
    } else if(!this.nextUpdate || nextUpdateTime < this.nextUpdate.time) {
        window.clearTimeout(this.nextUpdateTimeout);
        this.nextUpdate = new ActionUpdateFieldState(this.game,
                this, nextUpdateTime);
        this.nextUpdateTimout = window.setTimeout(this.nextUpdate.process,
                nextUpdateTime - (new Date()).getTime());
        DEBUG_PRINT("Rescheduled next field update.");
    } else {
        nextUpdateTime = this.nextUpdate.time;
    }
    DEBUG_PRINT("Next update at " + nextUpdateTime);
    return nextUpdateTime;
};

/*
 * Add an action to the queue.
 * Actions with time before field's currentAction are ignored and not added.
 * (You can't alter the past... for the time being. With multiplayer/laggy
 * inputs this should be made possible though.
 */
Field.prototype.addAction = function(action) {
    // Add the action to the actions array, indexed and sorted according to
    // the action time.
    var i;
    for(i = this.actions.length - 1; i >= 0; i--  ) {
        if(this.actions[i].time <= action.time) {
            break;
        }
        if(i < this.currentActionIndex) {
            DEBUG_PRINT("Can't alter the past.");
            return;
        }
    }
    DEBUG_PRINT("Adding action " + action +
            " to action queue at position " + i);
    this.actions.splice(i + 1, 0, action);
    window.setTimeout(action.process, action.time - (new Date()).getTime());
};

Field.prototype.rotateBlock = function(rotation) {
    DEBUG_PRINT("Rotate block...");
    var fieldState = this.state;
    var block = fieldState.block;
    var newPuyoPositions = block.getRotatedPuyoPositions(rotation);
    var i;
    var puyo;
    var newPosition;
    var newTiledPosition;
    // Check if rotateabla(does not collide with other puyos/border)
    for(i = 0; i < block.puyos.length; i++) {
        newPosition = newPuyoPositions[i];
        newTiledPosition = [ Math.floor(newPosition[0]),
                             Math.floor(newPosition[1]) ];
        if (!( newTiledPosition[0] >= 0 &&
               newTiledPosition[0] < fieldState.size[0] &&
               newTiledPosition[1] >= 0 &&
               newTiledPosition[1] < fieldState.size[1] ))
        {
            DEBUG_PRINT("Collision with border - can't rotate");
             return;
        }
        puyo = fieldState.getPuyoAt(newTiledPosition[0], newTiledPosition[1]);
        if(puyo && block.puyos.indexOf(puyo) == -1) {
            DEBUG_PRINT("Collision with puyo - can't rotate");
            return;
        }
    }

    // Rotate and update puyo field
    var puyoPosition;
    var tiledPuyoPosition;
    block.rotation = rotation;
    for(i = 0; i < block.puyos.length; i++) {
        puyo = block.puyos[i];
        puyoPosition = puyo.position;
        tiledPuyoPosition = [ Math.floor(puyoPosition[0]),
                              Math.floor(puyoPosition[1]) ];
        fieldState.setPuyoAt( tiledPuyoPosition[0],
                              tiledPuyoPosition[1],
                              undefined );
    }
    for(i = 0; i < block.puyos.length; i++) {
        puyo = block.puyos[i];
        puyoPosition = puyo.position;
        tiledPuyoPosition = [ Math.floor(puyoPosition[0]),
                              Math.floor(puyoPosition[1]) ];
        newPosition = newPuyoPositions[i];
        newTiledPosition = [ Math.floor(newPosition[0]),
                             Math.floor(newPosition[1]) ];
        fieldState.setPuyoAt( newTiledPosition[0],
                              newTiledPosition[1],
                              puyo );
        puyo.position = newPosition;
    }
};

Field.prototype.turnBlockRight = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    this.rotateBlock(block.rotation + 1);
};

Field.prototype.turnBlockLeft = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    this.rotateBlock(block.rotation - 1);
};

Field.prototype.updatePuyoPositions = function(currentTime) {
    var fieldState = this.state;
    var block = fieldState.block;
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
            if(!collidedHorizontal) {
                puyo.position[0] = newPosition[0];
            } else {
                puyo.velocity[0] = 0;
                puyo.position[0] = TilePosition[0] + 0.5;
                if(block && (block.puyos.indexOf(puyo) != -1)) {
                    fieldState.setBlock(undefined);
                }

            }
            // If not collided vertically, update y position. Otherwise set
            // vertical velocity to 0 and set y position to the center
            // of current tile
            if (!collidedVertical) {
                puyo.position[1] = newPosition[1];
            } else {
                puyo.velocity[1] = 0;
                puyo.position[1] = TilePosition[1] + 0.5;
                if(block && (block.puyos.indexOf(puyo) != -1)) {
                    fieldState.setBlock(undefined);
                }
            }
        }
    }
    
    if(block) {
        block.position = [ block.position[0] + block.velocity[0] * time_d,
                           block.position[1] + block.velocity[1] * time_d ];
    }
    // Update the state timestamp
    fieldState.time = currentTime;
};

/*
 * Simply returns the next time a puyo crosses the border of 2 tiles. In other
 * words the time puyo grid should be updated by calling
 * Field.updatePuyoPositions(). The result is off by +planckTime to make sure
 * the update time comes after and not before the accurate value.
 */
Field.prototype.getNextUpdateTime = function() {
    var fieldState = this.state;
    
    // Time to next update - will be calculatet later and the time passed
    // since the time indicated by the state timestamp
    var nextUpdate = Infinity;
    
    // Iterate through every cell in the puyo grid
    // y axis in reverse so puyos below gets moved out for the falling
    // ones in time.
    for(var x = 0; x < fieldState.size[0]; x++) {
        for(var y = fieldState.size[1] - 1; y >= 0; y--) {
            
            // Puyo
            var puyo = fieldState.getPuyoAt(x, y);
            if (!puyo) { continue; }
            
            // Direction (sign of velocity) the puyo is moving
            var direction = [ puyo.velocity[0] / Math.abs(puyo.velocity[0]) || 1,
                              puyo.velocity[1] / Math.abs(puyo.velocity[1]) || 1];
            
            // Next column and row to enter with the puyo's current velocity
            var nextCoords = [ Math.floor(puyo.position[0] + direction[0]),
                               Math.floor(puyo.position[1] + direction[1])];
            // update nextUpdate, if the time befor this puyo enters a new
            // tile is shorther than it.
            nextUpdate = Math.min( nextUpdate,
                    (nextCoords[0] - puyo.position[0]) / puyo.velocity[0],
                    (nextCoords[1] - puyo.position[1]) / puyo.velocity[1]);
        }
    }

    return this.state.time + (nextUpdate + CONFIG.planckTime) * 1000;
};


// Get adjacent puyos of same type.
// Returns an array. each cell of returned array is an array containing puyos
// of same type that are adjacent on the puyo field. Each puyo on the field
// belongs to exactly one of these arrays.
Field.prototype.getAdjacentPuyoSets = function() {
    var fieldState = this.state;
    var fieldSize = fieldState.size;
    // Store found puyo sets as arrays of puyos
    var puyoSets = []; 
    // Array that is used to store index of puyo set the puyo residing at
    // each tile belongs to.
    var setIndexes = new Array(fieldSize[0] * fieldSize[1]);
    // convert x, y coordinates to array index
    
    // Helper functions
    // Convert x, y -coordinates to array index
    var xyToI = function(x, y) {
        return y * fieldSize[0] + x % fieldSize[0];
    };
    // Recursively find puyos that belong to the set of puyo at given x, y
    // coordinates
    var findSet = function(fieldState, x, y) {

        var puyo = fieldState.getPuyoAt(x, y);
        if(!puyo) return;
        
        var puyoSetIndex = setIndexes[xyToI(x, y)];

        if(puyoSetIndex === undefined) {
            puyoSets.push([puyo]);
            puyoSetIndex = puyoSets.length - 1;
            setIndexes[xyToI(x, y)] = puyoSetIndex;
        }
        var puyoSet = puyoSets[puyoSetIndex];
        
        var puyoAbove =
            y - 1 >= 0 &&
            setIndexes[xyToI(x, y - 1)] === undefined &&
            fieldState.getPuyoAt(x, y - 1);
        var puyoRight =
            x + 1 < fieldSize[0] &&
            setIndexes[xyToI(x + 1, y)] === undefined &&
            fieldState.getPuyoAt(x + 1, y);
        var puyoBelow =
            y + 1 < fieldSize[1] &&
            setIndexes[xyToI(x, y + 1)] === undefined &&
            fieldState.getPuyoAt(x, y + 1);
        var puyoLeft =
            x - 1 >= 0 &&
            setIndexes[xyToI(x - 1, y)] === undefined &&
            fieldState.getPuyoAt(x - 1, y);
        
        if (puyoAbove && puyoAbove.type == puyo.type) {
            puyoSet.push(puyoAbove);
            setIndexes[xyToI(x, y - 1)] = puyoSetIndex;
            findSet(fieldState, x, y - 1);
        }
        if (puyoRight && puyoRight.type == puyo.type) {
            puyoSet.push(puyoRight);
            setIndexes[xyToI(x + 1, y)] = puyoSetIndex;
            findSet(fieldState, x + 1, y);
        }
        if (puyoBelow && puyoBelow.type == puyo.type) {
            puyoSet.push(puyoBelow);
            setIndexes[xyToI(x, y + 1)] = puyoSetIndex;
            findSet(fieldState, x, y + 1);
        }
        if (puyoLeft && puyoLeft.type == puyo.type) {
            puyoSet.push(puyoLeft);
            setIndexes[xyToI(x - 1, y)] = puyoSetIndex;
            findSet(fieldState, x - 1, y);
        }
        
    };
    
    var i;
    for(var x = 0; x < fieldSize[0]; x++) {
        for(var y = 0; y < fieldSize[1]; y++) {
            if (setIndexes[xyToI(x, y)] === undefined) {
                findSet(this.state, x, y);
            }
        }
    }
    
    return puyoSets;
};

Field.prototype.popPuyoSets = function(puyoSets) {
    var fieldState = this.state;
    for(var i = 0; i < puyoSets.length; i++) {
        for(var j = 0; j < puyoSets[i].length; j++) {
            var puyo = puyoSets[i][j];
            var x = Math.floor(puyo.position[0]);
            var y = Math.floor(puyo.position[1]);
            fieldState.setPuyoAt(x, y, undefined);
        }
    }
};

/*
 * set falling puyos velocities to drop velocity
 */
Field.prototype.dropPuyos = function() {
    var fieldState = this.state;
    var fieldSize = fieldState.size;
    for(var x = 0; x < fieldSize[0]; x++) {
        for(var y = fieldSize[1] - 1; y > 0; y--) {
            if(!fieldState.getPuyoAt(x, y)) {
                for(var yy = y - 1; yy >= 0; yy--) {
                    var puyo = fieldState.getPuyoAt(x, yy);
                    if(!puyo) { continue; }
                    puyo.velocity = [0, CONFIG.puyoDropVelocityY];
                }
            }
        }
    }
};

