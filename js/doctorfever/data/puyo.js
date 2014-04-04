/*
 * 
 * Constructof for PuyoType
 * @param name name for the puyo type
 */


function PuyoType(name) {
    this.assetName = name;
}
function ColoredPuyoType(color_name) {
    return new PuyoType(color_name);
}
function TrashPuyoType() {
    return new PuyoType('trash');
}

/*
 * Default puyo type definitions
 */
coloredPuyos = [];
coloredPuyos.push(new ColoredPuyoType('red'));
coloredPuyos.push(new ColoredPuyoType('green'));
coloredPuyos.push(new ColoredPuyoType('blue'));
coloredPuyos.push(new ColoredPuyoType('yellow'));
coloredPuyos.push(new ColoredPuyoType('purple'));

puyoTypes = {};
puyoTypes.red       = coloredPuyos[0];
puyoTypes.green     = coloredPuyos[1];
puyoTypes.blue      = coloredPuyos[2];
puyoTypes.yellow    = coloredPuyos[3];
puyoTypes.purple    = coloredPuyos[4];
puyoTypes.nuisance  = new TrashPuyoType();

/*
 * Constructor for Puyo
 * @param color one of puyo_colors defined in data/puyo.js
 * @param type one of puyo_types defined in data/puyo.js
 * @param position [x, y], position on the field, unit = tiles;
 * @param velocity [x, y], velocity, unit = tile;
 */
function Puyo(type, position, velocity) {
    // [x, y], position on the field, unit=tiles.
    this.position = position || [0, 0];
    // one of puyo types defined in data/puyo.js
    this.type = type || coloredPuyos[0];
    // [x, y], velocity/speed, unit=tiles/s
    this.velocity = velocity ||
        [CONFIG.puyoDropVelocityX, CONFIG.puyoDropVelocityY];
}

/*
 * Return true/false whether or not the puyo is of trash type
 */
Puyo.prototype.isTrash = function() {
    return this.type == puyoTypes.nuisance;
};

function TrashPuyo(position, velocity) {
    var puyo = new Puyo(puyoTypes.nuisance, position, velocity);
    return puyo;
}

/*
 * Draw puyo on given canvas context
 * @param ctx canvas context
 * @param x x position, position defaults to puyo location*size
 * @param y y position, position defaults to puyo location*size
 * @param size [x, y], puyo size, defaults to asset size
 */
Puyo.prototype.draw = function(ctx, x, y, size) {
    if (Assets[this.type.assetName] === undefined) {
        throw new Error('Missing asset: '+this.type.assetName);
    }
    if (x === undefined || y === undefined || size === undefined) {
        throw new Error('X, Y, SIZE is undefined.');
    }
    var asset = Assets[this.type.assetName];
    ctx.drawImage(
        asset,
        x,
        y,
        size[0],
        size[1]
    );
};

/* Block typed defines shape of a puyo block. A puyo block consists of puyos
 * of 1 or 2 different colors. A block type is an array that contains a cell
 * for each separate color in the block type. A cell in the array contains an
 * array of puyo coordinates relative to the block center. For example, a
 * 3-puyo block with 2 colors could be
 * [
 *      [ [0, -1]        ],         first color/puyo type positions
 *      [ [0, 0], [1, 0] ]          second color/puyo type positions
 * ]
 */
blockTypes = [];
blockTypes.push({
    'blocks': [[[0, -1], [0, 0]]],
    'rotation': true
});
blockTypes.push({
    'blocks': [[[0, -1], [0,0]], [[1, 0]]],
    'rotation': true
});
blockTypes.push({
    'blocks': [[[0, 0], [1, 0], [0, 1], [1, 1]]],
    'rotation': 'color'
});
blockTypes.push({
    'blocks': [[[0, -1], [0, 0]]],
    'rotation': true
});
/*
blockTypes.push({
    'blocks': [
        [[0, 0], [1, 0]],
        [[0, 1], [1, 1]]
    ],
    'rotation': 'inplace'
});
*/

/*
 * PuyoBlock constructor
 * Puyo block is the usually falling, user controllable block that consists
 * of several (2 to 4) puyos.
 * @param blockType One of block types - defining shape of the block - defined in puyo.js
 */
function PuyoBlock(blockType, position, velocity) {
    
    // Puyos in the block, positioin rotation of the block and the velocity of
    // the block
    this.puyos = [];
    this.blockType = blockType;
    this.position = position || [CONFIG.blockSpawnX, CONFIG.blockSpawnY];
    this.rotation = 0; // 0, 1, 2 or 3
    this.velocity = velocity || [CONFIG.puyoFallVelocityX, CONFIG.puyoFallVelocityY];
    this.originalPositions = [];

    var blockTypeBlocks = blockType.blocks;
    
    // Check the color count and array to store already used colors
    if( blockTypeBlocks.length > CONFIG.puyoColorCount &&
        blockTypeBlocks.length > coloredPuyos.length )
    {
        throw new Error("Too many colors in a block");
    }
    var colorsUsed = new Array(CONFIG.puyoColorCount);
    
    // Iterate different puyo colors in the block type
    for(var i = 0; i < blockTypeBlocks.length; i++) {
     
        // Shuffle the color
        var color = randint(0, CONFIG.puyoColorCount);
        while(colorsUsed[color]) {
            color = randint(0, CONFIG.puyoColorCount);
        }
        colorsUsed[color] = true;
        
        // Create puyos of the color
        for(var j = 0; j < blockTypeBlocks[i].length; j++) {
            var pos = blockTypeBlocks[i][j];
            this.puyos.push( new Puyo(coloredPuyos[color],
                             [ this.position[0] + pos[0],
                               this.position[1] + pos[1] ],
                             [this.velocity[0], this.velocity[1]]) );
            this.originalPositions.push([ pos[0], pos[1] ]);
        }
    }
}

/*
 * Set block position and update puyos position attributes accordingly.
 * Doesn't update field's puyo grid.
 */
PuyoBlock.prototype.setPosition = function(position) {
    this.position = [position[0], position[1]];
    for(var i = 0; i < this.puyos.length; i++) {
        var x0 = this.originalPositions[i][0];
        var y0 = this.originalPositions[i][1];
        var a = Math.PI / 2 * this.rotation;
        var x = Math.cos(a) * x0 - Math.sin(a) * y0;
        var y = Math.sin(a) * x0 + Math.cos(a) * y0;
        this.puyos[i].position = [this.position[0] + x, this.position[1] + y];
    }
};

/*
 * Set block rotation and update puyos position attributes accordingly.
 * Doesn't update field's puyo grid.
 */
PuyoBlock.prototype.setRotation = function(rotation) {
    var i;

    if (this.blockType.rotation === false) return;
    else if (this.blockType.rotation === 'color') {
        for(i = 0; i < this.puyos.length; i++) {
            var oldColorIndex = coloredPuyos.indexOf(this.puyos[i].type);
            var newColorIndex = (oldColorIndex+1)%CONFIG.puyoColorCount;
            this.puyos[i].type = coloredPuyos[newColorIndex];

        }
        return;
    }
    
    this.rotation = rotation;
    for(i = 0; i < this.puyos.length; i++) {
        var x0 = this.originalPositions[i][0];
        var y0 = this.originalPositions[i][1];
        var a = Math.PI / 2 * this.rotation;
        var x = Math.cos(a) * x0 - Math.sin(a) * y0;
        var y = Math.sin(a) * x0 + Math.cos(a) * y0;
        this.puyos[i].position = [this.position[0] + x, this.position[1] + y];
    }
};
