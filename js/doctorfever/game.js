/*
 * Game constructor
 * A Game object consists of following:
 * state - id string of the current state
 * fields - array of puyo fields of type Field
 */
function Game(canvas) {
    if (!canvas) {
        throw new Error('Canvas was not specified.');
    }
    this.ctx = canvas.getContext("2d");
    this.fields = [];
    this.fields.push(new Field([10, 20]));
    this.fields.push(new Field([10, 20]));
    /*
    //TEMPORARY TEST CODE
    this.fields[0] = new Field([10, 20]);
    this.fields[1] = new Field([10, 20]);
    this.fields[0].state.puyos[2][2] = new Puyo(puyo_colors[0], puyo_types[0]);
    this.fields[0].state.puyos[3][2] = new Puyo(puyo_colors[1], puyo_types[0]);
    this.fields[0].state.puyos[4][2] = new Puyo(puyo_colors[2], puyo_types[0]);
    this.fields[0].state.puyos[5][3] = new Puyo(puyo_colors[3], puyo_types[0]);
    this.fields[1].state.puyos[2][2] = new Puyo(puyo_colors[0], puyo_types[0]);
    this.fields[1].state.puyos[3][2] = new Puyo(puyo_colors[1], puyo_types[0]);
    this.fields[1].state.puyos[4][2] = new Puyo(puyo_colors[2], puyo_types[0]);
    this.fields[1].state.puyos[5][3] = new Puyo(puyo_colors[3], puyo_types[0]);
    //TEST END
    
    console.log("Hello World :-)");
    */
}

Game.prototype.updateGraphics = function() {
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(0, 0, 600, 600);
    this.fields.forEach(function(field, i){
        field.drawBoard(this.ctx, i);
    });
};