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
    this.startTime = Date.now();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.fields = [];
    this.fields.push(new Field(this, [CONFIG.boardWidthTiles,
                CONFIG.boardHeightTiles], 0));
    this.fields.push(new Field(this, [CONFIG.boardWidthTiles,
                CONFIG.boardHeightTiles], 1));
    
    this.initKeys();

    //TEMPORARY TEST CODEpda
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
    
    var t = (Date.now() - this.startTime) / 500;

    var r = Math.floor(Math.max((t / 1280) * 128), 1);
    var g = Math.floor(Math.max(0, (1 - t / 135) * 255));
    var b = Math.floor(Math.abs(Math.min(t + 160, 480) % 320 - 160) / 160 * 255);
    this.ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // Draw background
    this.ctx.drawImage(Assets.gamebg, 0, 0);

    // Add two clouds
    var time = Date.now()/5;
    var time2 = Date.now()/5;
    this.ctx.drawImage(Assets.clouds1, (time % 1300), 0);    
    this.ctx.drawImage(Assets.clouds1, (time % 1300) - 1300, 0);  
    this.ctx.drawImage(Assets.clouds2, 0, (time2 % 1200)); 
    this.ctx.drawImage(Assets.clouds2, 0, (time2 % 1200) - 1200); 


    this.fields.forEach(function(field){
        field.drawBackground(me);
    });
    this.fields.forEach(function(field){
        field.drawBoard(me);
    });
    this.fields.forEach(function(field){
        field.drawGfx(me);
    });
};

Game.prototype.initKeys = function() {
    var game = this;
    var fields = this.fields;
    window.onkeydown = function(e) {
        var key;
        if(window.event) {
            key = e.keyCode;
        } else {
            key = e.which;
        }
        DEBUG_PRINT("Key " + key + " pressed", 2);
        switch(key) {
            case 39: // Right
                fields[0].addAction(new ActionTiltBlockRight(game, fields[0],
                            (new Date()).getTime()));
                break;
            case 37: // Left
                fields[0].addAction(new ActionTiltBlockLeft(game, fields[0],
                            (new Date()).getTime()));
                break;
            case 38: // Up
                fields[0].addAction(new ActionDropBlock(game, fields[0],
                            (new Date()).getTime()));
                break;
            case 189: // - 
                fields[0].addAction(new ActionTurnBlockRight(game, fields[0],
                            (new Date()).getTime()));
                break;
        case 190: // .
                fields[0].addAction(new ActionTurnBlockLeft(game, fields[0],
                            (new Date()).getTime()));
                break;
            
        case 70: // F
                fields[1].addAction(new ActionTiltBlockRight(game, fields[1],
                            (new Date()).getTime()));
                break;
            case 83: // S
                fields[1].addAction(new ActionTiltBlockLeft(game, fields[1],
                            (new Date()).getTime()));
                break;
            case 68: // D
                fields[1].addAction(new ActionDropBlock(game, fields[1],
                            (new Date()).getTime()));
                break;
            case 65: // A
                fields[1].addAction(new ActionTurnBlockRight(game, fields[1],
                            (new Date()).getTime()));
                break;
            case 81: // Q
                fields[1].addAction(new ActionTurnBlockLeft(game, fields[1],
                            (new Date()).getTime()));
                break;

            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
                window.setTimeout((new ActionCreateChain(game, game.fields[0],
                                (new Date()).getTime(), key - 48)).process, 0);
                break;
            case 48:
                window.setTimeout((new ActionCreateChain(game, game.fields[0],
                                (new Date()).getTime(), 10)).process, 0);
                break;
            case 187: 
                window.setTimeout((new ActionCreateChain(game, game.fields[0],
                                (new Date()).getTime(), 11)).process, 0);
                break;
            case 219:
                window.setTimeout((new ActionCreateChain(game, game.fields[0],
                                (new Date()).getTime(), 12)).process, 0);
                break;
        }
    };
};
