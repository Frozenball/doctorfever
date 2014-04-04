function StateManager() {
    this.state = 'loading';

    var me = this;
    var requestFrame = function(){
        me.updateGraphics();
        window.requestAnimationFrame(requestFrame);
    };
    requestFrame();
}
StateManager.prototype.updateGraphics = function() {
    if (this.state === undefined) {
        throw new Error("State is undefined.");
    }
    States[this.state].updateGraphics();
};
StateManager.prototype.selectState = function(new_state, data) {
    console.log('Switching to state', new_state);
    if (!$('#state-'+this.state)[0]) {
        throw new Error("Old state not found");
    }
    if (!$('#state-'+new_state)[0]) {
        throw new Error("New state was not found");
    }

    $('#state-'+this.state).css('z-index', 9).css('opacity', 0);
    $('#state-'+new_state).css('z-index', 10).css('opacity', 1).show();
    if (States[this.state].destroy) {
        States[this.state].destroy();
    }
    this.state = new_state;
    console.log('My state is',this.state);
    if (States[this.state].init) {
        States[this.state].init();
    }
};
