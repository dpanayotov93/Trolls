var stateEnd = {
	create: function() {
		var background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		var endLabel = game.add.bitmapText(settings.width / 2 - 200, 150, 'yggdrasil', 'You have died', 64);
		var buildingsDestroyedLabel = game.add.bitmapText(settings.width / 2 - 250, 250, 'yggdrasil', 'Destroyred buildings: ' + game.player.score.buildings, 48);		

		this.debugStart(5);
	},
	// TODO:  Remove when done debugging
	debugStart(n) {
		setTimeout(function() {
			game.state.start('Play');
		}, n * 100);		
	}
}