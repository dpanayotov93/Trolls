class Platform {
	constructor(id, start) {
		this._id = id;
		this.constraints = {
			pieces: {
				min: 2,
				max: 6
			},
			holes: {
				min: 3,
				max: 3 // TODO: Make it a higher number when sprinting is implemented
			}
		}
		this.midPiecesCount = {
			chosen: game.rnd.integerInRange(this.constraints.pieces.min, this.constraints.pieces.max)
		};		
		this.holePieces = {
			chosen: game.rnd.integerInRange(this.constraints.holes.min, this.constraints.holes.max)
		};		
		this.position = {
			start: start,
			end: (this.midPiecesCount.chosen + 1) * settings.tileSize + start
		};
		this.startPiece =  game.level.platforms.gameObjects.create(this.position.start, game.world.bounds.height - settings.tileSize, 'tile_bot_start');
		this.midPieces= [];
		this.endPiece = null;
	}

	create() {		
		this.startPiece.body.immovable = true; // Immovable from collision
		for(var i = 0; i < this.midPiecesCount.chosen; i += 1) {
			let id = i + 1;
			let midPiecePosition = id * settings.tileSize + this.position.start;

			this.midPieces[i] = game.level.platforms.gameObjects.create(midPiecePosition, game.world.bounds.height - settings.tileSize, 'tile_bot_mid');			
			this.midPieces[i].body.immovable = true; // Immovable from collision
		}

		this.endPiece = game.level.platforms.gameObjects.create(this.position.end, game.world.bounds.height - settings.tileSize, 'tile_bot_end');
		this.endPiece.body.immovable = true; // Immovable from collision
	
		game.level.platforms.positions[this._id] = [this.position.start, this.position.end];
		game.level.platforms.lastPlatformPosition = this.position.end + (settings.tileSize * this.holePieces.chosen);
	}
}