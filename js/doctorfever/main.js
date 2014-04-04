/*
 * Main
 */
$(function() {
    stateManager = new StateManager();
    stateManager.selectState('loading');
    window.stateManager = stateManager;

    // Simulate loading screen for now
    /*setTimeout(function(){
        stateManager.selectState('menu');
    }, 500);*/
});
