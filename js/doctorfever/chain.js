function Chain() {
    this.sets = [];
    this.score = 0;
}

Chain.prototype.addSets = function(puyoSets) {
    DEBUG_PRINT("Adding sets to the chain...");
    var multiplier = Math.pow(2, this.sets.length);
    var puyoCount = 0;
    for(var i = 0; i < puyoSets.length; i++) {
        puyoCount += puyoSets[i].length;
    }
    this.score += multiplier * puyoSets.length * puyoCount;
    this.sets.push(puyoSets);
    DEBUG_PRINT( "Chain length: " + this.sets.length +
                 ". Added sets: " + puyoSets.length +
                 ". Added puyos: " + puyoCount);
};
