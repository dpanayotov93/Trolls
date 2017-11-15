let statePlay = {
	create: function() {
		game.time.advancedTiming = true; // Set up FPS counter

		game.ui = new UI();
		game.ui.init();

		game.level = new Level();
		game.level.init();

		game.player = new Player();
		game.player.init(300, 25);
	},
	update: function() {				
		game.player.update();
		game.level.update();
		game.ui.update();
	},
	render: function() {
		game.debug.text('DEBUG INFO', 860, 24, "#ff9800");			
		game.debug.text('FPS: ' + game.time.fps, 880, 48, "#00ff00"); // Show FPS						
		game.debug.spriteInfo(game.player.gameObject, 768, 64); //()		
		
		for(let i = 0; i < game.player.targets.length; i += 1) {
			let target = game.player.targets[i];
			if(target.name.indexOf('Enemy') != -1) {
				game.debug.geom(new Phaser.Circle(target.position.x - target.width / 4.5, target.position.y + 50, 50), 'rgba(0, 223, 255, .75)');
			} else {
				game.debug.geom(new Phaser.Circle(target.position.x + target.width / 1.35, target.position.y - 30, 50), 'rgba(255, 167, 0, .75)');
			}
		}
		/*
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