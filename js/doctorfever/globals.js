function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function stringDimensions(string, font) {
    var f = font || '12px arial',
        o = $('<div>' + string + '</div>').css({'position': 'absolute',
            'float': 'left', 'white-space': 'nowrap',
            'visibility': 'hidden', 'font': f}).appendTo($('body'));
    w = o.width();
    h = o.height();
    o.remove();
    return [w, h];
}

function DEBUG_PRINT(text) {
    if (CONFIG.debug) { console.log(text); }
}

