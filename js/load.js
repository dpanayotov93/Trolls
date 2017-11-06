var stateLoad = {
	preload: function() {
		// Loading text
		var loadingLabel = game.add.text(80, 150, 'Loading...', {font: '30px Courier', fill: '#ffffff'});

		// Setup for responsive resizing
		game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.canvas.style.width = '100%';
		game.canvas.style.height = '100%';
		game.scale.refresh();

		/* Loading of assets */
		// Images
		game.load.image('bg_village', 'assets/backgrounds/village.jpg');
		// Tiles - Terrain
		game.load.image('tile_bot_start', 'assets/tilesets/tile_bot_start.png');
		game.load.image('tile_bot_mid', 'assets/tilesets/tile_bot_mid.png');
		game.load.image('tile_bot_end', 'assets/tilesets/tile_bot_end.png');
		game.load.image('tile_float_start', 'assets/tilesets/tile_float_start.png');
		game.load.image('tile_float_mid', 'assets/tilesets/tile_float_mid.png');
		game.load.image('tile_float_end', 'assets/tilesets/tile_float_end.png');
		game.load.image('tile_mid_start', 'assets/tilesets/tile_mid_start.png');
		game.load.image('tile_mid_mid', 'assets/tilesets/tile_mid_mid.png');
		game.load.image('tile_mid_end', 'assets/tilesets/tile_mid_end.png');	
		// Sprites - Player
		game.load.spritesheet('troll_first_iddle', 'assets/sprites/troll_first/sprite_iddle_small.png', settings.playerSize.h, settings.playerSize.w);
		game.load.spritesheet('troll_first_walk', 'assets/sprites/troll_first/sprite_walk_small.png', settings.playerSize.h, settings.playerSize.w);
		game.load.spritesheet('troll_first_jump', 'assets/sprites/troll_first/sprite_jump_small.png', settings.playerSize.h, settings.playerSize.w);
		game.load.spritesheet('troll_first_attack', 'assets/sprites/troll_first/sprite_attack_small.png', settings.playerSize.h, settings.playerSize.w);
		// Sprites - Objects
		game.load.spritesheet('tower_first', 'assets/sprites/tower_first/sprite.png', settings.towerSize.h, settings.towerSize.w);

		game.log('Assets: ', 'Loaded', 'green');		
	},
	create: function() {
		// Call the menu state		
		game.log('Calling state:', 'Menu');
		game.state.start('Menu');
	}
}