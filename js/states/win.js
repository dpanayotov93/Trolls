let stateWin = {
	create: function() {
		let background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		let endLabel = game.add.bitmapText(settings.width / 2 - 384, 96, 'yggdrasil', 'You have won', 128);
		let buildingsDestroyedLabel = game.add.bitmapText(settings.width / 2 - 250, 256, 'yggdrasil', 'Destroyred buildings: ' + game.player.score.buildings, 48);
		let enemiesDestroyedLabel = game.add.bitmapText(settings.width / 2 - 250, 320, 'yggdrasil', 'Destroyred enemies: ' + game.player.score.enemies, 48);
		let scoreLabel = game.add.bitmapText(settings.width / 2 - 110, 400, 'yggdrasil', 'Score: ' + game.player.score.total, 48);
		let menuButton = game.add.button(settings.width / 2 - 512, 480, 'button', this.menu, this, 0, 1, 2);		
		let menuLabel = game.add.bitmapText(settings.width / 2 - 64, 484, 'yggdrasil', 'Menu', 46);		
		let restartButton = game.add.button(settings.width / 2 - 512, 576, 'button', this.restart, this, 0, 1, 2);		
		let restartLabel = game.add.bitmapText(settings.width / 2 - 96, 580, 'yggdrasil', 'Restart', 46);

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
		game.state.start('Menu');
	},
	restart: function() {
		game.state.start('Play');
	}
}