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
    var date = new Date();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.fields = [];
    this.fields.push(new Field(game, [6, 12]));
    this.fields.push(new Field(game, [6, 12]));
    
    this.initKeys();

    //TEMPORARY TEST CODE
    //this.fields[0].state.debugRandomize();
    //this.fields[1].state.debugRandomize();
    //this.fields[0].state.time = date.getTime();
    //this.fields[1].state.time = date.getTime();
    //this.fields[0].state.set(2, 2, new Puyo(puyoColors[0]));
    /*this.fields[0].state.puyos[3][2] = new Puyo(puyo_colors[1], puyo_types[0]);
    this.fields[0].state.puyos[4][2] = new Puyo(puyo_colors[2], puyo_types[0]);
    this.fields[0].state.puyos[5][3] = new Puyo(puyo_colors[3], puyo_types[0]);
    this.fields[1].state.puyos[2][2] = new Puyo(puyo_colors[0], puyo_types[0]);
    this.fields[1].state.puyos[3][2] = new Puyo(puyo_colors[1], puyo_types[0]);
    this.fields[1].state.puyos[4][2] = new Puyo(puyo_colors[2], puyo_types[0]);
    this.fields[1].state.puyos[5][3] = new Puyo(puyo_colors[3], puyo_types[0]);
    */
    var actionCreateNewBlock1 = ActionCreateNewBlock(
            game,
            this.fields[0],
            date.getTime() + 100);
    var actionCreateNewBlock2 = ActionCreateNewBlock(
            game,
            this.fields[1],
            date.getTime() + 100);
    window.setTimeout(actionCreateNewBlock1.process, 110);
    window.setTimeout(actionCreateNewBlock2.process, 110);
    console.log("Hello World :-)");
}

Game.prototype.updateGraphics = function() {
    var me = this;
    this.ctx.fillStyle = 'rgb(22, 22, 22)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.fields.forEach(function(field, i){
        field.drawBoard(me, i);
    });
};

Game.prototype.initKeys = function() {
    var game = this;
    var field = this.fields[0];
    window.onkeydown = function(e) {
        var key;
        if(window.event) {
            key = e.keyCode;
        } else {
            key = e.which;
        }
        DEBUG_PRINT("Key " + key + " pressed");
        switch(key) {
            case 88: // X
                field.addAction(new ActionTurnBlockRight(game, field,
                            (new Date()).getTime()));
                break;
            case 90: // Z
                field.addAction(new ActionTurnBlockLeft(game, field,
                            (new Date()).getTime()));
                break;
        }
    };
};
