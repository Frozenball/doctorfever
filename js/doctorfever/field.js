/*
 * State Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 * @param stateTime Initial point of time for the state
 */
function FieldState(size, stateTime) {
    //Size of the puyo field
    this.size = [size[0], size[1]] || [CONFIG.boardWidthTiles, CONFIG.boardHeightTiles];
    // Puyo array
    this.puyos = new Array(this.size[0] * this.size[1]);
    // Currently falling block
    this.block = undefined;
    // trash in store is moved to trash on block init(if trashDrop is set)
    this.trashInStore = 0;
    this.trash = 0;
    // Indicates whether or no trash drop is incoming
    this.trashDrop = true;
    // Point of time this state represents
    this.time = stateTime || (new Date()).getTime();
}

/*
 * Set puyo at given coordinates
 * @param x x coordinate
 * @param y y coordinate
 * @param val puyo to add
 * Coordinates are rounded down. Throws error if coordinates outside of the
 * puyo field
 */
FieldState.prototype.setPuyoAt = function(x, y, val) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
        throw new Error('Out of bounds error');
    }
    this.puyos[Math.floor(x) + Math.floor(y) * this.size[1]] = val;
};

/*
 * Set puyo at given coordinates
 * @param x x coordinate
 * @param y y coordinate
 * Coordinates are rounded down. Throws error if coordinates outside of the
 * puyo field. Returns the puyo at given coordinates(may be undefined).
 */
FieldState.prototype.getPuyoAt = function(x, y) {
    if (x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1]) {
        throw new Error('Out of bounds error');
    }
    return this.puyos[Math.floor(x) + Math.floor(y)*this.size[1]];
};

/*
 * Add PuyoBlock to the field state
 * @param block a PuyoBlock
 */
FieldState.prototype.setBlock = function(block) {
    if(!block) { this.block = block; return;}
    var puyos = block.puyos;
    this.block = block;
    for(var i = 0; i < puyos.length; i++) {
        var puyo = puyos[i];
        this.setPuyoAt(Math.floor(puyo.position[0]),
                Math.floor(puyo.position[1]), puyos[i]);
    }
};

FieldState.prototype.generateChain = function(chainCount, patternIndex) {
    this.setBlock(undefined);
    var chain = chains[patternIndex];
    var puyos = chain[0];
    var colors = chain[1];
    if(this.size[0] < puyos[0].length || this.size[1] < puyos.length) {
        DEBUG_PRINT("field " + this.index + ": " + "Field too small, created chain will be broken.");
        return;
    }
    for(var x = 0; x < this.size[0]; x++) {
        for(var y = 0; y < this.size[1]; y++) {
            var velocity, type, position, puyo;
            if(x >= puyos[0].length || y >= puyos.length ||
                    !puyos[y][x] || puyos[y][x] > chainCount)
            {
                puyo = undefined;
            } else
            {
                velocity = [CONFIG.puyoDropVelocityX,
                CONFIG.puyoDropVelocityY];
                type = coloredPuyos[colors[y][x]];
                position = [x + 0.5, y + 0.5];
                puyo = new Puyo(type, position, velocity);
            }
            this.setPuyoAt(x, y, puyo);
        }
    }
};

/*
 * Add some random puyos to the field
 */
FieldState.prototype.debugRandomize = function(){
    this.setBlock(undefined);
    for (var x = 0; x < this.size[0]; x++) {
        for (var y = 0; y < this.size[1]; y++) {
            if (randint(0, 10) <= 5) {
                var velocity = [CONFIG.puyoDropVelocityX,
                    CONFIG.puyoDropVelocityY];
                var type = coloredPuyos[randint(0,3)];
                var position = [x + 0.5, y + 0.5];
                var puyo = new Puyo(type, position, velocity);
                this.setPuyoAt(x, y, puyo);
            }
        }
    }
};



/*
 * Field Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 */
function Field(game, size, index) {
    if (!size) {
        throw new Error('Undefined size');
    }
    this.game = game;
    this.index = index;
    this.state = new FieldState(size);
    this.actions = [];
    this.currentActionIndex = 0;
    this.nextUpdate = undefined;
    this.nextUpdateTimeout = undefined;
    this.chains = [new Chain()];
    var nextUpdateTime = this.getNextUpdateTime();
    if(nextUpdateTime < Infinity) {
        this.nextUpdate = new ActionUpdateFieldState(game, this, nextUpdateTime);
        this.nextUpdateTimeout = setTimeout(this.nextUpdate.process,
                nextUpdateTime - (new Date()).getTime());
    }
}


Field.prototype.getGfxData = function(canvas) {
    var i = this.index;
    if(canvas.fieldsGfx === undefined) { canvas.fieldsGfx = {}; }
    if(canvas.fieldsGfx[i] === undefined) {
        canvas.fieldsGfx[i] = {};
        gfx = canvas.fieldsGfx[i];
        gfx.score = 0;
        gfx.counter = 0;
        gfx.lastScore = 0;
        gfx.scoreDisp = 0;
        gfx.scoreAnimBegin = 0;
        gfx.chainOver = true;
        gfx.reset = true;
        gfx.puyoSize = [CONFIG.puyoWidth, CONFIG.puyoHeight];
        gfx.puyoPadding = [CONFIG.puyoPaddingX, CONFIG.puyoPaddingY];
        gfx.boardSize = [CONFIG.boardWidth, CONFIG.boardHeight];
        gfx.boardPadding = [ CONFIG.boardPaddingRight, CONFIG.boardPaddingBottom,
                             CONFIG.boardPaddingLeft, CONFIG.boardPaddingTop ];
        gfx.boardOffset = [ (i + 1) * gfx.boardPadding[0] +
                            i * gfx.boardSize[0] +
                            i * gfx.boardPadding[2],
                            gfx.boardPadding[1]];
    }
    var gfx = canvas.fieldsGfx[i];
    return gfx;
};

/*
 * Draw puyos on the field to the given canvas. i defines the index and
 * positioning of the field.
 */
Field.prototype.drawBoard = function(canvas) {
    var i = this.index;
    var gfx = this.getGfxData(canvas);
    for (var x = 0; x < this.state.size[0]; x++) {
        for (var y = 0; y < this.state.size[1]; y++) {
            var puyo = this.state.getPuyoAt(x, y);
            if (puyo) {
                puyo.draw(
                        canvas.ctx,
                        x * (gfx.puyoSize[0] + gfx.puyoPadding[0]) +
                            gfx.boardOffset[0],
                        y * (gfx.puyoSize[1] + gfx.puyoPadding[1]) +
                            gfx.boardOffset[1],
                        gfx.puyoSize
                );
            }
        }
    }
};

Field.prototype.drawGfx = function(canvas) {
    this.drawTrashMeter(canvas);
    this.drawChainText(canvas);
};

Field.prototype.drawBackground = function(canvas) {

    var ctx = canvas.ctx;
    var gfx = this.getGfxData(canvas);
    var state = this.state;

    var b = 32;
    var r= 32;
    var g = 32;
    if(this.chains) {
        b = this.chains[this.chains.length - 1].sets.length / 10 * 400;
        r = this.chains[this.chains.length - 1].sets.length / 20 * 400;
        g = 32 + this.chains[this.chains.length - 1].sets.length / 50 * 400;
    }
    var bgGradient = ctx.createLinearGradient(0, 0, gfx.boardSize[0], gfx.boardSize[1]);
    bgGradient.addColorStop(0, "rgba(" + 
                                Math.ceil(r) + "," +
                                Math.ceil(g) + "," +
                                Math.ceil(b) + ", 0.3)");
    bgGradient.addColorStop(1, "rgba(" +
                                Math.ceil(0.1 * r) +"," +
                                Math.ceil(0.1 * g) + "," +
                                Math.ceil(0.1 * b) + ", 0.2)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(gfx.boardOffset[0], gfx.boardOffset[1], gfx.boardSize[0], gfx.boardSize[1]);

};

Field.prototype.drawTrashMeter = function(canvas) {
    var f, g, h, x, y, w;
    var ctx = canvas.ctx;
    var gfx = this.getGfxData(canvas);
    var state = this.state;
    
    ctx.fillStyle = "#555555";
    ctx.strokeStyle = "FF7700";
    ctx.fillRect(gfx.boardOffset[0], gfx.boardOffset[1],
            gfx.boardSize[0], gfx.puyoSize[1]);
    ctx.strokeRect(gfx.boardOffset[0], gfx.boardOffset[1],
            gfx.boardSize[0], gfx.puyoSize[1]);
    var barFillWidth = gfx.boardSize[0] - 10;
    var barFillHeight = gfx.puyoSize[0] - 10;
    var barFillOffsetX = gfx.boardOffset[0] + 5;
    var barFillOffsetY = gfx.boardOffset[1] + 5;
    f = Math.min(state.trashInStore / CONFIG.trashMeterLvl1, 1);
    g = Math.min(state.trashInStore / CONFIG.trashMeterLvl2, 1);
    h = Math.min(state.trashInStore / CONFIG.trashMeterLvl3, 1);
    ctx.fillStyle = "#999999";
    ctx.fillRect(barFillOffsetX, barFillOffsetY,
            f * (barFillWidth), barFillHeight);
    ctx.fillStyle = "#005555";
    ctx.fillRect(barFillOffsetX, barFillOffsetY,
            g * (barFillWidth), barFillHeight);
    ctx.fillStyle = "#330033";
    ctx.fillRect(barFillOffsetX, barFillOffsetY,
            h * (barFillWidth), barFillHeight);
    
    var trash = new TrashPuyo();
    gfx.trashMeterPuyos = gfx.trashMeterPuyos || [];
    var trashMeterPuyoCount = Math.ceil(state.trashInStore /
            CONFIG.trashMeterLvl1);
    while(gfx.trashMeterPuyos.length > trashMeterPuyoCount) {
        gfx.trashMeterPuyos.pop();
    }
    while(gfx.trashMeterPuyos.length < trashMeterPuyoCount) {
        gfx.trashMeterPuyos.push([Math.random(), 0.0, 0.1]);
    }
    for(var i = 0; i < gfx.trashMeterPuyos.length; i++) {
        d = gfx.trashMeterPuyos[i];
        d[0] -= Math.random() / barFillWidth;
        d[0] = (d[0] + 1) % 1;
        d[1] += (Math.random() - 0.5) / 40;
        d[1] = Math.min(Math.max(d[1], -0.02), 0.02);
        d[2] += d[1];
        d[2] = Math.max(Math.min(1.5, d[2]), 0.1);
        x = barFillOffsetX + d[0] * barFillWidth - barFillHeight / 2;
        y = barFillOffsetY + (1 - d[2]) * barFillHeight;
        w = barFillHeight * d[2];
        h = barFillHeight * d[2];
        trash.draw(ctx, x, y, [w, h]);
    }
};

/*
 * Draw current chain text to the given canvas. i defines the index and
 * positioning of the field
 */
Field.prototype.drawChainText = function(canvas) {
    var i = this.index;
    if(!this.chains) { return; }
    var chain = this.chains[this.chains.length - 1];
    
    var ctx = canvas.ctx;
    var gfx = this.getGfxData(canvas);
    
    var boardCenter = [ gfx.boardOffset[0] + gfx.boardSize[0] / 2,
                        gfx.boardOffset[1] + gfx.boardSize[1] / 2 ]; 

    
    var counter = chain.sets.length;
    var score = chain.score;
   
    // Cool animation stuff...
    var t = (new Date()).getTime();
    if(gfx.counter < counter)
    {
        gfx.lastScore = gfx.score;
        gfx.score = score;
        gfx.scoreDisp = 0;
        gfx.counter = counter;
        gfx.chainOver = false;
        gfx.scoreAnimBegin = t;
        gfx.reset = false;
    } else if(gfx.chainOver && counter > 0)
    {
        gfx.lastScore = 0;
        gfx.score = score;
        gfx.scoreDisp = 0;
        gfx.counter = counter;
        gfx.ChainOver = false;
        gfx.scoreAnimBegin = t;
        gfx.reset = false;
    } else if(!gfx.reset && gfx.chainOver &&
            t - gfx.scoreAnimBegin > 3000)
    {
        gfx.lastScore = 0;
        gfx.score = 0;
        gfx.scoreDisp = 0;
        gfx.counter = 0;
        gfx.scoreAnimBegin = 0;
        gfx.reset = true;
        return;
    } else if(gfx.reset && gfx.chainOver)
    {
        return;
    }
    if(gfx.counter > counter) { gfx.chainOver = true; }

    var f = Math.min((t - gfx.scoreAnimBegin) / 2000, 1);

    gfx.scoreDisp = gfx.lastScore + f * (gfx.score - gfx.lastScore);
    gfx.scoreDisp = Math.floor(gfx.scoreDisp); 

    // Draw the chain&score texts
    var counterText = "Chain: " + gfx.counter;
    var scoreText = "Score: " + gfx.scoreDisp; 
    var fontF = Math.min(gfx.scoreDisp / 300, 2) + 0.5;
    ctx.font = Math.floor(fontF * 44) +"px Iceland";
    ctx.fillStyle = "#FF00FF";
    var counterDim = stringDimensions(counterText, ctx.font);
    var counterPos = [ boardCenter[0] - counterDim[0] / 2,
                       boardCenter[1] ];
    ctx.fillText(counterText, counterPos[0], counterPos[1]);
    ctx.fillStyle = "#00FFFF";
    ctx.font = Math.floor(fontF * 32) + "px Iceland";
    var scoreDim = stringDimensions(scoreText, ctx.font);
    var scorePos = [ boardCenter[0] - scoreDim[0] / 2,
                     boardCenter[1] + counterDim[1]];
    ctx.fillText(scoreText, scorePos[0], scorePos[1]);
};

/*
 * Reschedule field update is one is needed suuner than the currently
 * scheduled one. Returns the time of next update - Infinity if no updates
 * are scheduled.
 */
Field.prototype.reScheduleUpdate = function() {
    DEBUG_PRINT("field " + this.index + ": " + "Rescheduling field update...", 5);
    var nextUpdateTime = this.getNextUpdateTime();
    if (nextUpdateTime == Infinity) {
        DEBUG_PRINT("field " + this.index + ": " + "No update needed - field isn't changing", 5);
        window.clearTimeout(this.nextUpdateTimeout);
        this.nextUpdate = undefined;
        this.nextUpdateTimeout = undefined;
    } else if(!this.nextUpdate || nextUpdateTime != this.nextUpdate.time) {
        clearTimeout(this.nextUpdateTimeout);
        this.nextUpdate = new ActionUpdateFieldState(this.game,
                this, nextUpdateTime);
        this.nextUpdateTimeout = setTimeout(this.nextUpdate.process,
                nextUpdateTime - (new Date()).getTime());
        DEBUG_PRINT("field " + this.index + ": " + "Rescheduled next field update.", 5);
    } else {
        nextUpdateTime = this.nextUpdate.time;
    }
    DEBUG_PRINT("field " + this.index + ": " + "Next update at " + nextUpdateTime, 5);
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
            DEBUG_PRINT("field " + this.index + ": " + "Can't alter the past.", 5);
            return;
        }
    }
    DEBUG_PRINT("field " + this.index + ": " + "Adding action " + action +
            " to action queue at position " + i, 5);
    this.actions.splice(i + 1, 0, action);
    window.setTimeout(action.process, action.time - (new Date()).getTime());
};

/*
 * Generate new block.
 */
Field.prototype.initBlock = function(currentTime) {
        var state = this.state;
        // Update field state to currentTime to make sure the state represents
        // the time of block spawn
        DEBUG_PRINT("field " + this.index + ": " + "Update field state to the block spawn time.", 5);
        this.updateState(currentTime);
        state.time = currentTime;
        // Shuffle the block type and create a new block
        var blockType = blockTypes[randint(0, blockTypes.length - 1)];
        DEBUG_PRINT("field " + this.index + ": " + "CreateNewBlock of type " + blockType, 4);
        var puyoBlock = new PuyoBlock(blockType);
        state.setBlock(puyoBlock); 
};

/*
 * Rotate the block to given rotation.
 * Return true/false whether or not the rotation succeeded.
 */
Field.prototype.rotateBlock = function(rotation) {
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) { return false; }
    var oldBlockRotation = block.rotation;
    var i;
    var puyo;
    var puyoPosition;
    var tiledPosition;
    // Remove puyos from the field temporarily
    for(i = 0; i < block.puyos.length; i++) {
        puyo = block.puyos[i];
        puyoPosition = puyo.position;
        tiledPosition = [ Math.floor(puyoPosition[0]),
                              Math.floor(puyoPosition[1]) ];
        fieldState.setPuyoAt( tiledPosition[0],
                              tiledPosition[1],
                              undefined );
    }
    // Rotate the block and check for collisions
    block.setRotation(rotation);
    var collided = false;
    for(i = 0; i < block.puyos.length; i++) {
        puyoPosition = block.puyos[i].position;
        tiledPosition = [ Math.floor(puyoPosition[0]),
                          Math.floor(puyoPosition[1]) ];
        if (!( tiledPosition[0] >= 0 &&
               tiledPosition[0] < fieldState.size[0] &&
               tiledPosition[1] >= 0 &&
               tiledPosition[1] < fieldState.size[1] ))
        {
            DEBUG_PRINT("field " + this.index + ": " + "Collision with border - can't rotate", 3);
            collided = true;
            break;
        }
        puyo = fieldState.getPuyoAt(tiledPosition[0], tiledPosition[1]);
        if(puyo) {
            DEBUG_PRINT("field " + this.index + ": " + "Collision with puyo - can't rotate", 3);
            collided = true;
            break;
        }
    }
    // Revert the block rotation if collision
    if(collided) {
        block.setRotation(oldBlockRotation);
    }
    // Add puyos back to the field
    for(i = 0; i < block.puyos.length; i++) {
        puyo = block.puyos[i];
        puyoPosition = puyo.position;
        this.movePuyo(puyo, puyo.position[0], puyo.position[1]);
        tiledPosition = [ Math.floor(puyoPosition[0]),
                              Math.floor(puyoPosition[1]) ];
        fieldState.setPuyoAt( tiledPosition[0],
                              tiledPosition[1],
                              puyo );
    }
    return !collided;
};

/*
 * Move the block to given position
 * Return true/false whether or not the move succeeded
 */
Field.prototype.moveBlock = function(position) {
    DEBUG_PRINT("field " + this.index + ": " + "Moving block to " + position, 4);
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) { return false; }
    var oldBlockPosition = [block.position[0], block.position[1]];
    var i;
    var puyo;
    var puyoPosition;
    var tiledPosition;
    // Remove puyos from the field temporarily
    for(i = 0; i < block.puyos.length; i++) {
        puyo = block.puyos[i];
        puyoPosition = puyo.position;
        tiledPosition = [ Math.floor(puyoPosition[0]),
                              Math.floor(puyoPosition[1]) ];
        fieldState.setPuyoAt( tiledPosition[0],
                              tiledPosition[1],
                              undefined );
    }
    // Move the block and check for collisions
    block.setPosition([position[0], position[1]]);
    var collided = false;
    for(i = 0; i < block.puyos.length; i++) {
        puyoPosition = block.puyos[i].position;
        tiledPosition = [ Math.floor(puyoPosition[0]),
                          Math.floor(puyoPosition[1]) ];
        if (!( tiledPosition[0] >= 0 &&
               tiledPosition[0] < fieldState.size[0] &&
               tiledPosition[1] >= 0 &&
               tiledPosition[1] < fieldState.size[1] ))
        {
            DEBUG_PRINT("field " + this.index + ": " + "Collision with border - can't move", 3);
            collided = true;
            break;
        }
        puyo = fieldState.getPuyoAt(tiledPosition[0], tiledPosition[1]);
        if(puyo) {
            DEBUG_PRINT("field " + this.index + ": " + "Collision with puyo - can't move", 3);
            collided = true;
            break;
        }
    }
    // Revert the block position if collision
    if(collided) {
        block.setPosition(oldBlockPosition);
    }
    // Add puyos back to the field
    for(i = 0; i < block.puyos.length; i++) {
        puyo = block.puyos[i];
        puyoPosition = puyo.position;
        tiledPosition = [ Math.floor(puyoPosition[0]),
                              Math.floor(puyoPosition[1]) ];
        fieldState.setPuyoAt( tiledPosition[0],
                              tiledPosition[1],
                              puyo );
    }
    return collided;
};


Field.prototype.tiltBlockRight = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) {
        DEBUG_PRINT("field " + this.index + ": " + "No block to tilt.", 3);
        return;
    }
    this.moveBlock([block.position[0] + 1, block.position[1]]);
};

Field.prototype.tiltBlockLeft = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) {
        DEBUG_PRINT("field " + this.index + ": " + "No block to tilt.", 3);
        return;
    }
    this.moveBlock([block.position[0] - 1, block.position[1]]);
};

/*
 * Turn the block left
 * Return true/false whether or not the turn succeeded
 */
Field.prototype.turnBlockRight = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) { return false; }
    return this.rotateBlock(block.rotation + 1);
};

/*
 * Turn the block left
 * Return true/false whether or not the turn succeeded
 */
Field.prototype.turnBlockLeft = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) { return false;}
    return this.rotateBlock(block.rotation - 1);
};

/*
 * Drop the block
 * return true/false whether or not the drop succeeded.
 */
Field.prototype.dropBlock = function() {
    var fieldState = this.state;
    var block = fieldState.block;
    if(!block) { return false; }
    var puyos = block.puyos;
    for(var i = 0; i < puyos.length; i++) {
        var puyo = puyos[i];
        puyo.velocity = [CONFIG.puyoDropVelocityX, CONFIG.puyoDropVelocityY];
    }
    fieldState.setBlock(undefined);
    return true;
};

/*
 * Move puyo to new position
 * Doesn't check for collision and simply overrides existing puyo in the new
 * tile.
 * Drops(sets to drop velocity) puyos above this one
 */
Field.prototype.movePuyo = function(puyo, x, y) {
    var state = this.state;
    var tiledPosition = [ Math.floor(puyo.position[0]),
                          Math.floor(puyo.position[1]) ];
    var newTiledPosition = [ Math.floor(x), Math.floor(y) ];
    
    puyo.position = [x, y];
    
    if( tiledPosition[0] == newTiledPosition[0] &&
            tiledPosition[1] == newTiledPosition[1] )
    {
        return;
    }

    state.setPuyoAt(tiledPosition[0], tiledPosition[1], undefined);
    state.setPuyoAt(x, y, puyo);
    puyo.position = [x, y];
    // Puyos to drop
    var fallDirection = [ CONFIG.puyoDropVelocityX /
                            Math.abs(CONFIG.puyoDropVelocityX) || 0,
                          CONFIG.puyoDropVelocityY /
                              Math.abs(CONFIG.puyoDropVelocityY) || 0];
    var puyo1Y = tiledPosition[1] - fallDirection[1];
    var puyo2X = tiledPosition[0] - fallDirection[0];
    var puyo1 = puyo1Y >= 0 && puyo1Y < state.size[1] &&
        state.getPuyoAt(tiledPosition[0], puyo1Y);
    var puyo2 = puyo2X >= 0 && puyo2X < state.size[0] &&
        state.getPuyoAt(puyo2X, tiledPosition[1]);
    if(puyo1 && puyo1 != puyo && !puyo1.velocity[1]) {
        puyo1.velocity[1] = CONFIG.puyoDropVelocityY;
    }
    if(puyo2 && puyo2 != puyo && !puyo2.velocity[0]) {
        puyo2.velocity[0] = CONFIG.puyoDropVelocityX;
    }
};

/*
 * Update fieldState(puyoPositions, trash generation to currentTime).
 * Should be called every time a puyo moves to another tile. Updates
 * are scheduled this way by field.reScheduleUpdate.
 */
Field.prototype.updateState = function(currentTime) {
    var state = this.state;
    this.updatePuyoPositions(currentTime);
    this.updateTrash();
    state.time = currentTime;
};

/*
 * Generate amount of trash puyos indicated by state.trash - up to one row.
 * (state.trash is filled from state.trashInStore by field.initBlock)
 */
Field.prototype.updateTrash = function() {
    var state = this.state;
    if(!state.trash) {
        DEBUG_PRINT("field " + this.index + ": " + "No trash to add", 5);
        return;
    }
    var numbers = new Array(state.size[0]);
    var order = [];
    var i;
    for(i = 0; i < numbers.length; i++) {numbers[i] = i; }
    while(numbers.length) {
        order.push(numbers.pop(randint(0, numbers.length - 1)));
    }
    var iMax = Math.min(order.length, state.trash);
    var trashAdded = 0;
    DEBUG_PRINT("field " + this.index + ": " + "Adding trash: maxAmount: " + iMax +
            ", columnOrder: " + order, 5);
    for(i = 0; i < iMax; i++) {
        if(state.getPuyoAt(order[i], 0)){ continue; }
        var position = [order[i], 0];
        var velocity = [CONFIG.puyoDropVelocityX, CONFIG.puyoDropVelocityY];
        var puyo = new TrashPuyo(position, velocity);
        state.setPuyoAt(order[i], 0, puyo);
        trashAdded++;
    }
    state.trash -= trashAdded;
    DEBUG_PRINT("field " + this.index + ": " + "Trash added: " + trashAdded + " Trash left: " + state.trash, 5);
};



/* 
 * Helper function for field.updateState.
 * calculates puyo movement between field.state.time and currentTime
 * and updates puyo positions. This function doesn't update state.time
 * and it should be updated to currentTime after all time dependent updates
 * are done.
 * Field state updates including updatePuyoPositions and state.time are handled
 * by field.updateState.
 */
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
            var tilePosition = [ Math.floor(puyo.position[0]),
                                 Math.floor(puyo.position[1]) ];
            var newTilePosition = [ Math.floor(newPosition[0]),
                                    Math.floor(newPosition[1]) ];
            var direction = [ puyo.velocity[0] / Math.abs(puyo.velocity[0]) || 0,
                              puyo.velocity[1] / Math.abs(puyo.velocity[1]) || 0 ];
            var collidedHorizontal = false;
            var collidedVertical = false;
           
            // Check if the puyo has moved to another tile
            if ( tilePosition[0] != newTilePosition[0] ||
                 tilePosition[1] != newTilePosition[1] )
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
                    (newTilePosition[0] != tilePosition[0] &&
                     fieldState.getPuyoAt( newTilePosition[0],
                                           tilePosition[1] ));
                collidedVertical = collidedVertical ||
                    (newTilePosition[1] != tilePosition[1] &&
                     fieldState.getPuyoAt( tilePosition[0],
                                           newTilePosition[1] ));
                
            }

            // If collided set position to the edge of the tile
            if(collidedHorizontal) {
                newPosition[0] = tilePosition[0] +
                    direction[0] * (1 - CONFIG.planckWidth);
            }
            if(collidedVertical) {
                newPosition[1] = tilePosition[1] +
                    direction[1] * (1 - CONFIG.planckWidth);
            }
            // Move the puyo
            this.movePuyo(puyo, newPosition[0], newPosition[1]);
            
            // If collided puyo is contained in the block, release the block
            if(collidedHorizontal || collidedVertical) {
                puyo.velocity = [0, 0];
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

Field.prototype.getPuyoSetsToPop = function() {
        var i;
        var puyoSets = this.getAdjacentPuyoSets();
        var puyoSetsToPop = [];
        for(i = 0; i < puyoSets.length; i++) {
            if(puyoSets[i].length >= CONFIG.puyosInSet &&
                    !puyoSets[i][0].isTrash()) {
                puyoSetsToPop.push(puyoSets[i]);
            }
        }
        return puyoSetsToPop;
};

Field.prototype.popPuyo = function(puyo) {
    var fieldState = this.state;
    var fieldWidth = fieldState.size[0];
    var fieldHeight = fieldState.size[1];
    // Destroy the puyo
    var x = puyo.position[0];
    var y = puyo.position[1];
    fieldState.setPuyoAt(x, y, undefined);
    
    var right, below, left, above;
    if(x < fieldWidth - 1) { right = fieldState.getPuyoAt(x + 1, y); }
    if(y < fieldHeight - 1) { below = fieldState.getPuyoAt(x, y + 1); }
    if(x >= 1) { left = fieldState.getPuyoAt(x - 1, y); }
    if(y >= 1) { above = fieldState.getPuyoAt(x, y - 1); }
    // Drop above
    if(above && !above.velocity[1]) {
        above.velocity[1] = CONFIG.puyoDropVelocityY;
    }
    if(puyo.isTrash()) { return; }
    // Destroy surrounding trash if current puyo isn't trash
    if(right && right.isTrash()) { this.popPuyo(right); }
    if(below && below.isTrash()) { this.popPuyo(below); }
    if(left && left.isTrash()) { this.popPuyo(left); }
    if(above && above.isTrash()) { this.popPuyo(above); }
};

Field.prototype.popPuyoSets = function(puyoSets) {
    var fieldState = this.state;
    for(var i = 0; i < puyoSets.length; i++) {
        for(var j = 0; j < puyoSets[i].length; j++) {
            this.popPuyo(puyoSets[i][j]);
        }
    }
};

/*
 * set falling puyos velocities to drop velocity
 */
Field.prototype.dropPuyos = function() {
    var fieldState = this.state;
    var fieldSize = fieldState.size;
    fieldState.setBlock(undefined);
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

Field.prototype.createChain = function(currentTime, chainCount) {
    var patternIndex = randint(0, chains.length - 1);
    DEBUG_PRINT("field " + this.index + ": " + "Creating chain of " + chainCount +
                " With pattern index " + patternIndex, 2); 
    this.state.generateChain(chainCount, patternIndex);
    this.state.time = currentTime;
};

