var stateLoad = {
	preload: function() {
		// Loading text
		var loadingLabel = game.add.text(80, 150, 'Loading...', {font: '30px Courier', fill: '#ffffff'});

		// Setup for responsive resizing
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;		 
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.refresh();
		game.canvas.style.width = '100%';
		game.canvas.style.height = '100%';
		
		/* Loading of assets */
		// Images - Bakckgrounds
		game.load.image('bg_village', 'assets/backgrounds/trolls_env1_ice.jpg');
		game.load.image('bg_ridges', 'assets/backgrounds/snow_ridges.png');
		game.load.image('bg_ridges_reversed', 'assets/backgrounds/snow_ridges_reversed.png');
		// Images - UI
		game.load.image('icon_options', 'assets/ui/icon-options.png');
		game.load.image('bar_empty', 'assets/ui/bar-empty.png');
		game.load.image('healthbar_full', 'assets/ui/healthbar-full.png');		
		game.load.image('energybar_full', 'assets/ui/energybar-full.png');
		game.load.image('icon_health', 'assets/ui/icon-health.png');
		game.load.image('icon_energy', 'assets/ui/icon-energy.png');
		game.load.image('icon_orb', 'assets/ui/icon-orb.png');
		game.load.image('icon_orb_empty', 'assets/ui/icon-orb-empty.png');
		game.load.image('icon_move', 'assets/ui/move.png');
		game.load.image('icon_jump', 'assets/ui/jump.png');
		game.load.image('icon_attack', 'assets/ui/attack.png');
		// Images - Objects
		game.load.image('item_dead_pig', 'assets/objects/dead_pig.png');
		// Images - Particles
		game.load.image('muzzle_flash', 'assets/particles/muzzle-flash.png');
		game.load.image('smoke_puff', 'assets/particles/smoke-puff.png');
		game.load.image('stone', 'assets/particles/stones-small.png');
		game.load.image('blood', 'assets/particles/blood.png');
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
		// Sprites - Enemies
		game.load.spritesheet('enemy_first_iddle', 'assets/sprites/enemy_test/sprite_iddle_small.png', settings.playerSize.h, settings.playerSize.w);
		game.load.spritesheet('enemy_first_walk', 'assets/sprites/enemy_test/sprite_walk_small.png', settings.playerSize.h, settings.playerSize.w);
		game.load.spritesheet('enemy_first_jump', 'assets/sprites/enemy_test/sprite_jump_small.png', settings.playerSize.h, settings.playerSize.w);
		game.load.spritesheet('enemy_first_attack', 'assets/sprites/enemy_test/sprite_attack_small.png', settings.playerSize.h, settings.playerSize.w);		
		// Sprites - Objects
		game.load.spritesheet('tower_first', 'assets/sprites/tower_first/sprite.png', settings.towerSize.h, settings.towerSize.w);
		game.load.spritesheet('button', 'assets/sprites/button.png', settings.buttonSize.w, settings.buttonSize.h);
		// Fonts
		game.load.bitmapFont('yggdrasil', 'assets/fonts/font.png', 'assets/fonts/font.fnt');

		game.log('Assets: ', 'Loaded', 'green');		
	},
	create: function() {
		// Call the menu state		
		game.log('Calling state:', 'Menu');
		game.state.start('Menu');
	}
}