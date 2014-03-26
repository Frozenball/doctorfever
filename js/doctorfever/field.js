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
                var puyo = new Puyo(coloredPuyos[randint(0,3)], [x, y], [0, 1] );
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
                //console.log(ball);
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
