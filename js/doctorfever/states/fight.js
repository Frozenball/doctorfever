var States = States || {};

/*
 * Draw given FieldState to given Canvas
 * @param field_state state of a Field object
 * @param field_canvas HTML 5 Canvas
 */
function updateField(field_state, field_canvas) {
    var ctx = field_canvas.getContext("2d");
    ctx.font = "12px Arial";
    for(var i = 0; i < field_state.size[0]; i++) {
        for(var j = 0; j < field_state.size[1]; j++) {
            var puyo = field_state.puyos[i][j];
            if(!puyo) { continue; }
            ctx.fillStyle = puyo.color.css;
            var x = i * 12;
            var y = j * 12 + 12;
            ctx.fillText("@", x, y);
        }
    }
}

/*
 * Draw all fields
 * Draw given fields to canvases with class field-canvas. Canvases are ordered by theyr id alphabetically and fields are drawn to them in order they are in the given fields array. Excess canvases are left empty. Too few canvases results in all fields not being drawn
 * @param fields Field objects to draw.
 */
function updateFields(fields) {
    fields = fields || {};
    field_canvases = $('.field-canvas');
    field_canvases.each(function(index) {
        var field_canvas = $(this)[0];
	var field_state = fields[index].state;
	updateField(field_state, field_canvas);
    });
 }

/*
 * Fight state
 */
States.fight = {
    'runTick': function(){
        updateFields(game.fields);
    }
};


