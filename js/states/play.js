let statePlay = {
	create: function() {
		game.test = true; // TODO: REMOVE LATER!!!
		game.time.advancedTiming = true; // Set up FPS counter

		game.ui = new UI();
		game.ui.init();

		game.level = new Level();
		game.level.init();

		game.player = new Player();
		game.player.init(300, 0);

		if(!Phaser.Device.desktop) {
			game.ui.showControls();
		}
	},
	update: function() {				
		game.player.update();
		game.level.update();
		game.ui.update();
	},
	render: function() {
		for(let i = 0; i < game.player.targets.length; i += 1) {
			let target = game.player.targets[i];
			if(target.name.indexOf('Enemy') != -1) {
				game.debug.geom(new Phaser.Circle(target.position.x - target.width / 4.5, target.position.y + 50, 50), 'rgba(255, 0, 0, .5)');
				target.instance.info.target = target.position.x - target.width / 4.5, target.position.y + 50;
				if(target.instance.info.health === null) {
					target.instance.info.health = game.add.bitmapText(target.instance.info.target, target.position.y + 35, 'yggdrasil', target.instance.health.current, 26);				
				} else {
					target.instance.info.health.setText(target.instance.health.current);
				}				
			} else if(target.name.indexOf('Building') != -1) {
				game.debug.geom(new Phaser.Circle(target.position.x + target.width / 1.35, target.position.y - 30, 50), 'rgba(0, 223, 255, .5)');
				if(target.instance.info.health === null) {
					target.instance.info.health = game.add.bitmapText(target.position.x + target.width / 1.575, target.position.y - 40, 'yggdrasil', target.instance.health.current, 26);				
				} else {
					target.instance.info.health.setText(target.instance.health.current);
				}
			}
		}

		for(let i = 0; i < game.level.buildings.list.length - 1; i += 1) {
			let building = game.level.buildings.list[i];

			if(!game.player.targets.contains(building.gameObject) && building.info.health !== null) {
				building.info.health.setText('');
			}
		}

		for(let i = 0; i < game.level.enemies.list.length - 1; i += 1) {
			let enemy = game.level.enemies.list[i];

			if(!game.player.targets.contains(enemy.gameObject) && enemy.info.health !== null) {
				enemy.info.health.setText('');
			}
		}		

		game.debug.text('FPS: ' + game.time.fps, 10, 20, "#00ff00"); // Show FPS						
		
		/*
		game.debug.text('DEBUG INFO', 860, 24, "#ff9800");			
		game.debug.spriteInfo(game.player.gameObject, 768, 64);				
		game.debug.geom(new Phaser.Rectangle( game.player.gameObject.position.x, game.player.gameObject.position.y, game.player.gameObject.getBounds().width / 2 * game.player.gameObject.scale.x, settings.playerSize.h ) , 'rgba(255,255,0,.2)');				
		game.debug.body(player);
		game.debug.spriteBounds(player);
		game.debug.spriteCoords(player);	
		
	    for(var i = 0; i < enemies.children.length; i += 1) {
			var enemy = enemies.children[i];	
	    	game.debug.body(enemy);
	    }
	    */
	}
}