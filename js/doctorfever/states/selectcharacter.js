var States = States || {};

/*
 * Character selection state
 */
States.selectCharacter = {
    init: function() {

    },
    destroy: function() {
        $('.character').unbind('click');
    },
    updateGraphics: function(){

    }
};

/*
 * Character click callback
 * object with character class is clicked -> select character from caracters array identified by id of the clicked object
 */
$('.character').click(function(){
    var character = characters[$(this)[0].id];
    stateManager.selectState('fight', {
        character: characters[$(this)[0].id]
    });
});