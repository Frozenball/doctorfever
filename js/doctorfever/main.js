/*
 * Main
 */
$(function() {
    stateManager = new StateManager();

    // Simulate loading screen for now
    setTimeout(function(){
        stateManager.selectState('selectCharacter');
    }, 500);
});
