var States = States || {};
//(function(){
    var game;

    States.fight = {
        init: function(){
            game = new Game($('#state-fight canvas')[0]);
        },
        destroy: function() {
            game = null;
        },
        updateGraphics: function(){
            game.updateGraphics();
        }
    };
//})();
