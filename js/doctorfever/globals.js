function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function DEBUG_PRINT(text) {
    if (CONFIG.debug) { console.log(text); }
}
