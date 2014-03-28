/*
 * State Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 */
function FieldState(size) {
    this.size = size || [6, 12];
    this.puyos = new Array(this.size[0] * this.size[1]);
}

FieldState.prototype.setPuyoAt = function(x, y, val) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
        throw new Error('Out of bounds error');
    }
    this.puyos[x + y*this.size[1]] = val;
};

FieldState.prototype.getPuyoAt = function(x, y) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
        throw new Error('Out of bounds error');
    }
    return this.puyos[x + y*this.size[1]];
};

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

Field.prototype.drawBoard = function(game, i) {
    for (var x = 0; x < this.state.size[0]; x++) {
	var puyoSize = CONFIG.puyoSize;
	var puyoPadding = CONFIG.puyoPadding;
	var boardSize = CONFIG.boardSize;
        var boardPadding = CONFIG.boardPadding;
        for (var y = 0; y < this.state.size[1]; y++) {
            var puyo = this.state.getPuyoAt(x, y);
            if (puyo) {
                var boardOffset = [ (i + 1) * boardPadding[0] + i * boardSize[0] + i * boardPadding[2],
                                    boardPadding[1]];
                puyo.draw(
                    game.ctx,
                    x * (puyoSize[0] + puyoPadding[0]) + boardOffset[0],
                    y * (puyoSize[1] + puyoPadding[1]) + boardOffset[1],
                    puyoSize
                );
            }
        }
    }
};

Field.prototype.updatePuyoPositions = function(game, currentTime) {
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
 * Field.updatePuyoPositions().
 */
Field.prototype.getNextUpdateTime = function(game) {
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
    return this.state.time + nextUpdate * 1000;
};

Field.prototype.getAdjacentPuyoSets = function(game) {
    var fieldState = this.state;
    var fieldSize = fieldState.size;
    // Store found puyo sets as arrays of puyos
    var puyoSets = [];
    
    // Array that is used to store index of puyo set the puyo residing at
    // each tile belongs to.
    var setIndexes = new Array(fieldSize[0] * fieldSize[1]);
    var i;
    for(var x = 0; x < fieldSize[0]; x++) {
        for(var y = 0; y < fieldSize[1]; y++) {
            i = y * fieldSize[0] + x % fieldSize[0];

            // Puyo
            var puyo = fieldState.getPuyoAt(x, y);
            if (!puyo) { continue; }
            var puyoRight = x < fieldState.size[0] - 1 && fieldState.getPuyoAt(x + 1, y);
            var puyoBelow = y < fieldState.size[1] - 1 && fieldState.getPuyoAt(x, y + 1);
            
            if (puyoRight && puyoRight.type == puyo.type) {
                if (setIndexes[i + 1] === undefined) {
                    if(setIndexes[i] === undefined)
                    {
                        puyoSets.push(new Array(puyo));
                        setIndexes[i] = puyoSets.length - 1;
                    }
                    puyoSets[setIndexes[i]].push(puyoRight);
                    setIndexes[i + 1] = setIndexes[i];
                } else {
                    puyoSets[setIndexes[i + 1]].push(puyo);
                    setIndexes[i] = setIndexes[i + 1];
                }
            } else if (setIndexes[i] === undefined) {
                puyoSets.push(new Array(puyo));
                setIndexes[i] = puyoSets.length - 1;
            }
            
            if (puyoBelow && puyoBelow.type == puyo.type) {
                puyoSets[setIndexes[i]].push(puyoBelow);
                setIndexes[i + fieldSize[0]] = setIndexes[i];
            }
        }
    }
    var puyoSets2 = [];
    for(i = 0; i < puyoSets.length; i++){
        if(puyoSets[i].length >= 4) {
            puyoSets2.push(puyoSets[i]);
        }
    }

    return puyoSets2;
};

Field.prototype.popPuyoSets = function(game, puyoSets) {
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
