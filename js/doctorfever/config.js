CONFIG = window.CONFIG || {};
CONFIG.debug = true;
CONFIG.puyoSize = [48, 48];
CONFIG.puyoPadding = [4, 4];
CONFIG.boardSizeTiles = [6, 12];
CONFIG.boardSize = [	CONFIG.boardSizeTiles[0] * (CONFIG.puyoSize[0] + CONFIG.puyoPadding[0]),
			CONFIG.boardSizeTiles[1] * (CONFIG.puyoSize[1] + CONFIG.puyoPadding[1])];
CONFIG.boardPadding = [30, 30, 200, 30];
