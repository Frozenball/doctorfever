var States = States || {};
States.selectCharacter = {
    'runTick': function(){

    }
};

$('.character').click(function(){
    game.character = characters[$(this)[0].id];
	console.log('Character selected - ' + $(this)[0].id);
    game.selectState('fight');
});
