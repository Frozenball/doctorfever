/*
 * State Constructor
* @param size [width, height] size of the puyo field(in tiles)
*/
function FieldState(size) {
    this.size = size || [10, 20];
    this.puyos = {};
    for(var i = 0; i < this.size[0]; i++) {
        this.puyos[i] = {};
    }
}



/*
 * Field Constructor
 * @param size [width, height] size of the puyo field(in tiles)
 */
function Field(size) {
    this.state = new FieldState(size);
}

