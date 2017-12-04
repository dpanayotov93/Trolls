let statePlay = {
	create: function() {
		game.test = true; // TODO: REMOVE LATER!!!
		game.time.advancedTiming = true; // Set up FPS counter
		game.forceSingleUpdate = true;

		game.ui = new UI();
		game.ui.init();

		game.level = new Level();
		game.level.init();
		game.ui.setParallax();

		game.player = new Player();
		game.player.init(300, 0);

		if(!Phaser.Device.desktop) {
			game.world.bringToTop(game.ui.controls.gameObjects);
		};		
	},
	update: function() {				
		game.player.update();
		game.level.update();
		game.ui.update();

		for(let i = 0; i < game.level.buildings.list.length - 1; i += 1) {
			let building = game.level.buildings.list[i];

			if(!game.player.targets.contains(building.gameObject) && building.info.health !== null) {
				building.info.health.setText('');

				if(building.info.icon !== null) {
					building.info.icon.visible = false;
				}				
			}
		}

		for(let i = 0; i < game.level.enemies.list.length - 1; i += 1) {
			let enemy = game.level.enemies.list[i];

			if(!game.player.targets.contains(enemy.gameObject) && enemy.info.health !== null) {
				enemy.info.health.setText('');

				if(enemy.info.icon !== null) {
					enemy.info.icon.visible = false;
				}
			}
		}			
	},
	render: function() {
		game.ui.render();
		this.debug();
	},

	debug: function() {
		game.debug.text('FPS: ' + game.time.fps, 20, game.height - 20, "#00ff00"); // Show FPS						
		/*
		game.debug.text('DEBUG INFO', 860, 24, "#ff9800");			
		game.debug.spriteInfo(game.player.gameObject, 768, 64);				
		game.debug.geom(new Phaser.Rectangle( game.player.gameObject.position.x, game.player.gameObject.position.y, game.player.gameObject.getBounds().width / 2 * game.player.gameObject.scale.x, settings.playerSize.h ) , 'rgba(255,255,0,.2)');				
		game.debug.body(player);
		game.debug.spriteBounds(player);
		game.debug.spriteCoords(player);	
		
		let items = game.level.enemies.gameObjects.children;
	    for(var i = 0; i < items.length; i += 1) {
			var item = items[i];	
	    	game.debug.spriteBounds(item);
	    	game.debug.body(item);
	    }
	    */
	}
}