var States = States || {};

/*
 * Character selection state
 */
States.menu = {
    init: function() {

    },
    destroy: function() {
    },
    updateGraphics: function(){

    }
};

$(function(){
    $('.js-start-game').click(function(e){
        e.preventDefault();
        console.log("ASD");
        stateManager.selectState('fight', {});
    });
});