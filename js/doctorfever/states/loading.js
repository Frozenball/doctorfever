var States = States || {};

/*
 * Load state
 */
States.loading = {
    init: function(){
        var loopUntilLoaded = function(){
            var loaded = 0;
            var images = 0;
            var unLoadedSrc = null;
            $('#assets img').each(function(){
                var $img = $(this);
                images += 1;
                if ($img[0].complete) {
                    loaded += 1;
                } else {
                    unLoadedSrc = $img.attr('src');
                }
            });
            if (loaded < images) {
                $('#state-loading h1').text("Loading image: "+unLoadedSrc);
                setTimeout(loopUntilLoaded, 10);
            } else {
                $('#state-loading h1').text("Loading images "+loaded+" / "+images);
                stateManager.selectState('menu');
            }
        };
        loopUntilLoaded();
    },
    updateGraphics: function(){

    }
};