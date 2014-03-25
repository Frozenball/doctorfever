/*
 * Constructof for PuyoType
 * @param name name for the puyo type
 */
function ColoredPuyoType(name) {
    this.assetName = name;
}
function TrashPuyoType() {
    this.assetName = 'trash';
}

/*
 * Default puyo type definitions
 */
puyoColors = [];
puyoColors.push(new ColoredPuyoType('red'));
puyoColors.push(new ColoredPuyoType('green'));
puyoColors.push(new ColoredPuyoType('blue'));
puyoColors.push(new ColoredPuyoType('yellow'));
puyoColors.push(new ColoredPuyoType('purple'));

puyoTypes = {};
puyoTypes.nuisance = new TrashPuyoType();


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
    this.type = type || puyoColors[0];

    // [x, y], velocity/speed, unit=tiles/s
    this.velocity = velocity || [0, 0];
}
Puyo.prototype.draw = function(ctx, x, y, size) {
    if (Assets[this.type.assetName] === undefined) {
        throw new Error('Missing asset: '+this.type.assetName);
    }
    ctx.drawImage(
        Assets[this.type.assetName],
        x,
        y,
        size,
        size
    );
};

