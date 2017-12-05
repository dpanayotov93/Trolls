let statePlay = {
	create: function() {
		game.test = true; // TODO: REMOVE LATER!!!
		game.time.advancedTiming = true; // Set up FPS counter
		game.forceSingleUpdate = true;

		game.ui = new UI();
		game.ui.init();

		game.level = new Level();
		game.level.init();
		// game.ui.setParallax();

		game.player = new Player();
		game.player.init(300, 0);

		if(!Phaser.Device.desktop) {
			game.world.bringToTop(game.ui.controls.gameObjects);
		};		

		// TODO: REMOVE - for testing only
		window.godmode = false;
		game.keyboard.q.onUp.add(function() {			
			if(game.player.energy.current > game.player.energy.max) {
				console.info('--- GODMODE OFF ---');
				window.godmode = false;
				game.player.energy.current = game.player.energy.max;
				game.player.health.current = game.player.health.max;
				game.player.damage = 20;
			} else {
				console.info('--- GODMODE ON ---');
				window.godmode = true;
				game.player.energy.current = 999999999999;
				game.player.health.current = 999999999999;
				game.player.damage = 999999999999;
				game.player.charges = game.ui.charges.icon.length;
			}
		});		
	},
	update: function() {				
		game.player.update();
		game.level.update();
		game.ui.update();		
	},
	render: function() {
		game.ui.render();
		this.debug();
	},

	debug: function() {
		game.debug.text('DEBUG INFO', 860, 12, "#ffa500");			
		game.debug.text('FPS: ' + game.time.fps, 880, 30, "#00ffff"); // Show FPS			
		game.debug.text('(Q) GODMODE ' + (window.godmode ? 'ON' : 'OFF'), (window.godmode ? 840 : 835), 48, (window.godmode ? "#00ff00" : "#ff0000")); // Show FPS			

		game.debug.text('____________________________', 785, 52, '#ffffff');

		game.debug.text('Enemies: ' + game.level.enemies.list.length, 800, 70, "#ffffff");			
		game.debug.text('Buildings: ' + game.level.buildings.list.length, 800, 88, "#ffffff");			
		game.debug.text('Platforms: ' + game.level.platforms.list.length, 800, 106, "#ffffff");			
		game.debug.text('Holes: ' + game.level.holes.gameObjects.length, 800, 124, "#ffffff");			

		game.debug.text('X: ' + Math.floor(game.player.gameObject.x), 950, 70, "#ffffff", 'text-align:right');			
		game.debug.text('Y: ' + Math.floor(game.player.gameObject.y), 950, 88, "#ffffff", 'text-align:right');			
		game.debug.text('Width: ' + Math.floor(game.player.gameObject.width), 950, 106, "#ffffff", 'text-align:right');			
		game.debug.text('Height: ' + Math.floor(game.player.gameObject.height), 950, 124, "#ffffff", 'text-align:right');		

		/*
		game.debug.spriteInfo(game.player.gameObject, 768, 64);				
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