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
    this.velocity = velocity || [0, 0];
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
    var asset = Assets[this.type.assetName];
    size = typeof(size[0]) === 'number' ? size : [asset.clientWidth, asset.clientHeight];
    x = typeof(x) === 'number' ? x : Math.floor(position[0]) * size[0];
    y = typeof(y) === 'number' ? y : Math.floor(position[1]) * size[1];
    ctx.drawImage(
        asset,
        x,
        y,
        size[0],
        size[1]
    );
};

