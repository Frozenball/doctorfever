var States = States || {};

/*
 * Character selection state
 */
States.selectCharacter = {
    'runTick': function(){

    }
};

/*
 * Character click callback
 * object with character class is clicked -> select character from caracters array identified by id of the clicked object
 */
$('.character').click(function(){
    game.character = characters[$(this)[0].id];
    console.log('Character selected - ' + $(this)[0].id);
    game.selectState('fight');
});
