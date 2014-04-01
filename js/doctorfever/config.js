CONFIG = window.CONFIG || {};
CONFIG.debug = true;

CONFIG.puyoWidth = 48;
CONFIG.puyoHeight = 48;
CONFIG.puyoPaddingX = 4;
CONFIG.puyoPaddingY = 4;
CONFIG.boardWidthTiles = 6;
CONFIG.boardHeightTiles = 12;
CONFIG.boardWidth = CONFIG.boardWidthTiles * (CONFIG.puyoWidth + CONFIG.puyoPaddingX);
CONFIG.boardHeight = CONFIG.boardHeightTiles * (CONFIG.puyoHeight + CONFIG.puyoPaddingY);
CONFIG.boardPaddingRight = 30;
CONFIG.boardPaddingBottom = 30;
CONFIG.boardPaddingLeft = 200;
CONFIG.boardPaddingTop = 30;

CONFIG.puyoFallVelocityX = 0;
CONFIG.puyoFallVelocityY = 5;
CONFIG.puyoDropVelocityX = 0;
CONFIG.puyoDropVelocityY = 5;
CONFIG.blockSpawnX = 2.5;
CONFIG.blockSpawnY = 2.5;

CONFIG.puyoColorCount = 5;
CONFIG.puyoPopDelay = 0.2;
CONFIG.puyoDropDelay = 0.2;
CONFIG.blockCreateDelay = 0.2;

// An insignificantly small amount of time that can be added to time values
// to compensate for inaccuracies in various calculations.
CONFIG.planckTime = 0.001;
