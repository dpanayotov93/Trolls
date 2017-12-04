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
				max: 3, // TODO: Make it a higher number when sprinting is implemented
				gameObjects: game.add.group()
			}
		};
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
		this.shadowOffset = 4;
		this.startPiece =  game.level.platforms.gameObjects.create(this.position.start, game.world.bounds.height - settings.tileSize, 'tile_bot_start');
		this.midPieces= [];
		this.endPiece = null;
		this.endPieceShadow = null;
	}

	create() {		
		this.startPiece.body.immovable = true; // Immovable from collision

		for (let i = 0; i < this.holePieces.chosen + 1; i += 1) {
			var hole = game.add.sprite( (this.position.end + 30) + (settings.tileSize / 2 * (i + 1)),  game.world.bounds.height - settings.tileSize + 10, 'waterfall');
			hole.animations.add('running', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 12, true); 
			hole.animations.play('running');
			game.level.holes.gameObjects.add(hole);
		}

		for(let i = 0; i < this.midPiecesCount.chosen; i += 1) {
			let id = i + 1;
			let midPiecePosition = id * settings.tileSize + this.position.start;

			this.midPieces[i] = game.level.platforms.gameObjects.create(midPiecePosition, game.world.bounds.height - settings.tileSize, 'tile_bot_mid');			
			this.midPieces[i].body.immovable = true; // Immovable from collision
		}

		this.endPieceShadow = game.level.platforms.gameObjects.create(this.position.end + this.shadowOffset, game.world.bounds.height - settings.tileSize + this.shadowOffset, 'tile_bot_end');
		this.endPieceShadow.tint = 0x000000;
		this.endPieceShadow.alpha = 0.6;

		this.endPiece = game.level.platforms.gameObjects.create(this.position.end, game.world.bounds.height - settings.tileSize, 'tile_bot_end');

		this.endPiece.body.immovable = true; // Immovable from collision
	
		game.level.platforms.positions[this._id] = [this.position.start, this.position.end];
		game.level.platforms.lastPlatformPosition = this.position.end + (settings.tileSize * this.holePieces.chosen);
	}
}