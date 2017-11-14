var stateEnd = {
	create: function() {
		var background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		var endLabel = game.add.bitmapText(settings.width / 2 - 384, 96, 'yggdrasil', 'You have died', 128);
		var buildingsDestroyedLabel = game.add.bitmapText(settings.width / 2 - 250, 256, 'yggdrasil', 'Destroyred buildings: ' + game.player.score.buildings, 48);
		var enemiesDestroyedLabel = game.add.bitmapText(settings.width / 2 - 250, 320, 'yggdrasil', 'Destroyred enemies: ' + game.player.score.enemies, 48);
		var menuButton = game.add.button(settings.width / 2 - 512, 480, 'button', this.menu, this, 0, 1, 2);		
		var menuLabel = game.add.bitmapText(settings.width / 2 - 64, 484, 'yggdrasil', 'Menu', 46);		
		var restartButton = game.add.button(settings.width / 2 - 512, 576, 'button', this.restart, this, 0, 1, 2);		
		var restartLabel = game.add.bitmapText(settings.width / 2 - 96, 580, 'yggdrasil', 'Restart', 46);

		// Change the mouse when over a button
		menuButton.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
		}, this);
		menuButton.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
		}, this);	
		restartButton.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
		}, this);
		restartButton.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
		}, this);							
	},
	menu: function() {
		game.log('Calling state: ', 'Menu');
		game.state.start('Menu');
	},
	restart: function() {
		game.log('Calling state: ', 'Play');
		game.state.start('Play');
	}
}