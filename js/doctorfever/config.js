CONFIG = window.CONFIG || {};
CONFIG.debug = 1;

CONFIG.puyoWidth = 48;
CONFIG.puyoHeight = 48;
CONFIG.puyoPaddingX = 2;
CONFIG.puyoPaddingY = 2;
CONFIG.boardWidthTiles = 6;
CONFIG.boardHeightTiles = 13;
CONFIG.boardWidth = CONFIG.boardWidthTiles * (CONFIG.puyoWidth + CONFIG.puyoPaddingX);
CONFIG.boardHeight = CONFIG.boardHeightTiles * (CONFIG.puyoHeight + CONFIG.puyoPaddingY);
CONFIG.boardPaddingRight = 80;
CONFIG.boardPaddingBottom = 30;
CONFIG.boardPaddingLeft = 100;
CONFIG.boardPaddingTop = 30;

CONFIG.puyoFallVelocityX = 0;
CONFIG.puyoFallVelocityY = 2;
CONFIG.puyoDropVelocityX = 0;
CONFIG.puyoDropVelocityY = 40;
CONFIG.blockSpawnX = 3;
CONFIG.blockSpawnY = 2;

CONFIG.puyoColorCount = 4;
CONFIG.puyoPopDelay = 1.0;
CONFIG.puyoDropDelay = 0.5;
CONFIG.blockInitDelay = 0.2;

CONFIG.puyosInSet = 4;
CONFIG.maxTrashDrop = 18;
CONFIG.trashMeterLvl1 = 10;
CONFIG.trashMeterLvl2 = 50;
CONFIG.trashMeterLvl3 = 250;
// An insignificantly small amount of time that can be added to time values
// to compensate for inaccuracies in various calculations.
CONFIG.planckTime = 0.01;
CONFIG.planckWidth = 0.00001;
