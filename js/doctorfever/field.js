/*
 * State Constructor
* @param size [width, height] size of the puyo field(in tiles)
*/
function FieldState(size) {
    this.size = size || [6, 12];
    this.puyos = new Array(this.size[0] * this.size[1]);
}
FieldState.prototype.set = function(x, y, val) {
    if (x < 0 || x > this.size[0] || y < 0 || y > this.size[1]) {
        throw new Error('Out of bounds error');
    }
    this.puyos[x + y*this.size[1]] = val;
};
FieldState.prototype.get = function(x, y) {
    if (x < 0 || x > this.size[0] || y < 0 || y > this.size[1]) {
        throw new Error('Out of bounds error');
    }
    return this.puyos[x + y*this.size[1]];
};
FieldState.prototype.debugRandomize = function(){
    for (var x = 0; x < this.size[0]; x++) {
        for (var y = 0; y < this.size[1]; y++) {
            if (randint(0, 10) <= 5) {
                this.set(x, y, new Puyo(puyoColors[randint(0,3)]));
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
    var size = 48;
    var padding = 4;
    for (var x = 0; x < this.state.size[0]; x++) {
        for (var y = 0; y < this.state.size[1]; y++) {
            var ball = this.state.get(x, y);
            if (ball) {
                console.log(ball);
                ball.draw(
                    game.ctx,
                    x*(size+padding) + i*530 + 30,
                    y*(size+padding) + 30,
                    size
                );
            }
        }
    }
};