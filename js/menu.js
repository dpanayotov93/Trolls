var stateMenu = {
	create: function() {		
		var background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		var titleLabel = game.add.bitmapText(game.world.centerX - 110, 150, 'yggdrasil', 'TROLLS', 64);
		var startButton = game.add.button(game.world.centerX - settings.buttonSize.w / 2, 250, 'button', this.start, this, 0, 1, 2);		
		var startLabel = game.add.bitmapText(game.world.centerX - 64, 256, 'yggdrasil', 'Start', 46);
		var controlsButton = game.add.button(game.world.centerX - settings.buttonSize.w / 2, 350, 'button', this.showControls, this, 0, 1, 2);		
		var controlsLabel = game.add.bitmapText(game.world.centerX - 96, 356, 'yggdrasil', 'Controls', 46);		

		game.log('Background: ', 'Created', 'green');

		// Set the keyboard manager
		cursors = game.input.keyboard.createCursorKeys();	

		cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		game.log('Keyboard: ', 'Created', 'green');		
	},
	start: function() {
		game.log('Calling state: ', 'Play');
		game.state.start('Play');
	},
	showControls: function() {
		game.log('Calling state: ', 'Controls');
		game.state.start('Controls');		
	}
}