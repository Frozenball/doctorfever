/*
 * Constructor for Color
 * @param name name for the color
 * @param css CSS color
 */
function PuyoColor(name, css) {
    this.name = name || "Puyo";
    this.css = css || "888888";
}

/*
 * Default puyo type definitions
 */
puyo_colors = {};
puyo_colors[0] = new PuyoColor("Red", "#FF0000");
puyo_colors[1] = new PuyoColor("Green", "#00FF00");
puyo_colors[2] = new PuyoColor("Blue", "#0000FF");
puyo_colors[3] = new PuyoColor("Yellow", "#FFFF00");
puyo_colors[4] = new PuyoColor("Cyan", "#00FFFF");
puyo_colors[5] = new PuyoColor("Magenta", "#FF00FF");



/*
 * Constructof for PuyoType
 * @param name name for the puyo type
 */
function PuyoType(name) {
    this.name = name;
}

/*
 * Default puyo type definitions
 */
puyo_types = {};
puyo_types[0] = new PuyoType("Normal");
puyo_types[1] = new PuyoType("Trash");



/*
 * Constructor for Puyo
 * @param color one of puyo_colors defined in data/puyo.js
 * @param type one of puyo_types defined in data/puyo.js
 * @param position [x, y], position on the field, unit = tiles;
 * @param velocity [x, y], velocity, unit = tile;
 */
function Puyo(color, type, position, velocity) {
    this.position = position || [0, 0];        // [x, y], position on the field, unit=tiles.
    this.type = type || puyo_types[0];    // one of puyo types defined in data/puyo.js
    this.color = color || puyo_colors[0];        // one of colors defined in data/puyo.js
    this.velocity = velocity || [0, 0];        // [x, y], velocity/speed, unit=tiles/s
}

