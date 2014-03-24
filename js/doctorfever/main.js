game = {};

/*
 * Game constructor
 * A Game object consists of following:
 * state - id string of the current state
 * fields - array of puyo fields of type Field
 */
function Game() {
    this.state = 'loading';
    this.fields = {};
    
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
}

/*
 * Game tick/update function
 * This function gets called through global runTick()
 */
Game.prototype.runTick = function() {
    States[this.state].runTick();
};

/*
 * Select state
 * Hides old state and displays the new one. current state id string is stored in Game.state.
 * @param new_state string representing id of the new state. Object with the state id must exist in the document
 */
Game.prototype.selectState = function(new_state) {
    if (!$('#state-'+this.state)[0]) {
        throw new Error("Old state not found");
    }
    if (!$('#state-'+new_state)[0]) {
        throw new Error("New state was not found");
    }

    $('#state-'+this.state).css('z-index', 9).css('opacity', 0);
    $('#state-'+new_state).css('z-index', 10).css('opacity', 1).show();
    this.state = new_state;
};


/*
 * Global tick/update function
 * Calls game.runTick()
 */
function runTick() {
    game.runTick();
    window.requestAnimationFrame(runTick);
} 

/*
 * Main
 */
$(function() {
    game = new Game();
    runTick();
    setTimeout(function(){
        game.selectState('selectCharacter');
    }, 500);
});
