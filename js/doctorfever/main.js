game = {};

function Game() {
    this.state = 'loading';
    console.log("Hello World :-)");
}

Game.prototype.runTick = function(){
    States[this.state].runTick();
    window.requestAnimationFrame(Game.prototype.runTick);
};
Game.prototype.selectState = function(new_state){
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

$(function(){
    game = new Game();
    game.runTick();
    setTimeout(function(){
        game.selectState('selectCharacter');
    }, 4000);
});