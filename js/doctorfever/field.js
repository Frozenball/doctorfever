/*
 * State Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 */
function FieldState(size, stateTime) {
    this.size = size || [CONFIG.boardWidthTiles, CONFIG.boardHeightTiles];
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
 * @param puyoBlock a PuyoBlock
 */
FieldState.prototype.setBlock = function(puyoBlock) {
    var puyos = puyoBlock.puyos;
    var puyoPositions = puyoBlock.getRotatedPuyoPositions();
    this.block = puyoBlock;
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
function Field(size) {
    if (!size) {
        throw new Error('Undefined size');
    }
    this.state = new FieldState(size);
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

Field.prototype.rotateBlock = function(rotation) {
    var fieldState = this.state;
    var puyoBlock = fieldState.block;
    var newPuyoPositions = block.getRotatedPuyoPositions(rotation);
    var i;
    var puyo;
    var newPosition;
    var newTiledPosition;
    // Check if rotateabla(does not collide with other puyos/border)
    for(i = 0; i < newPuyoPositions; i++) {
        newPosition = newPuyoPositions[i];
        newTiledPosition = [ Math.floor(newPosition[0]),
                             Math.floor(newPosition[1]) ];
        puyo = newTiledPosition[0] >= 0 &&
               newTiledPosition[0] < fieldState.size[0] &&
               newTiledPosition[1] >= 0 &&
               newTiledPosition[1] < fieldState.size[0] &&
               fieldState.getPuyoAt(newTiledPosition[0], newTiledPosition[1]);
        if(puyo && !(puyo in puyoBlock.puyos)) {
            return;
        }
    }

    // Rotate and update puyo field
    puyoBlock.rotation = rotation;
    for(i = 0; i < puyoBlock.puyos.length; i++) {
        puyo = puyoBlock.puyos[i];
        var puyoPosition = puyo.position;
        var tiledPuyoPosition = [ Math.floor(puyoPosition[0]),
                                  Math.floor(puyoPosition[1]) ];
        newTiledPosition = [ Math.floor(newPosition[0]),
                                 Math.floor(newPosition[1]) ];
        fieldState.setPuyoAt( tiledPuyoPosition[0],
                              tiledPuyoPosition,
                              undefined );
        fieldState.setPuyoAt( tiledNewPosition[0],
                              tiledNewPosition[1],
                              puyo );
    }
};

Field.prototype.turnBlockRight = function() {
    var fieldState = this.state;
    var puyoBlock = fieldState.block;
    this.rotateBlock(puyoBlock.rotation + 1);
};

Field.prototype.turnBlockLeft = function() {
    var fieldState = this.state;
    var puyoBlock = fieldState.block;
    this.rotateBlock(puyoBlock.rotation - 1);
};

Field.prototype.updatePuyoPositions = function(currentTime) {
    var fieldState = this.state;
    
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
            }
            // If not collided vertically, update y position. Otherwise set
            // vertical velocity to 0 and set y position to the center
            // of current tile
            if (!collidedVertical) {
                puyo.position[1] = newPosition[1];
            } else {
                puyo.velocity[1] = 0;
                puyo.position[1] = TilePosition[1] + 0.5;
            }
        }
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

