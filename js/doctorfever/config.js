CONFIG = window.CONFIG || {};
CONFIG.debug = 0;

CONFIG.puyoWidth = 40;
CONFIG.puyoHeight = 40;
CONFIG.puyoPaddingX = 2;
CONFIG.puyoPaddingY = 2;
CONFIG.boardWidthTiles = 8;
CONFIG.boardHeightTiles = 16;
CONFIG.boardWidth = CONFIG.boardWidthTiles * (CONFIG.puyoWidth + CONFIG.puyoPaddingX);
CONFIG.boardHeight = CONFIG.boardHeightTiles * (CONFIG.puyoHeight + CONFIG.puyoPaddingY);
CONFIG.boardPaddingRight = 30;
CONFIG.boardPaddingBottom = 30;
CONFIG.boardPaddingLeft = 200;
CONFIG.boardPaddingTop = 30;

CONFIG.puyoFallVelocityX = 0;
CONFIG.puyoFallVelocityY = 3;
CONFIG.puyoDropVelocityX = 0;
CONFIG.puyoDropVelocityY = 10;
CONFIG.blockSpawnX = 2.5;
CONFIG.blockSpawnY = 2.5;

CONFIG.puyoColorCount = 4;
CONFIG.puyoPopDelay = 0.5;
CONFIG.puyoDropDelay = 0.5;
CONFIG.blockInitDelay = 0.2;

CONFIG.puyosInSet = 4;
CONFIG.maxTrashDrop = 18;

// An insignificantly small amount of time that can be added to time values
// to compensate for inaccuracies in various calculations.
CONFIG.planckTime = 0.01;
CONFIG.planckWidth = 0.00001;
