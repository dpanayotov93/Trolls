var stateMenu = {
	create: function() {		
		var background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		var titleLabel = game.add.bitmapText(game.world.centerX - 100, 150, 'yggdrasil', 'TROLLS', 64);
		var startButton = game.add.button(game.world.centerX - settings.buttonSize.w / 2, 250, 'button', this.start, this, 0, 1, 2);		
		var startLabel = game.add.bitmapText(game.world.centerX - 64, 256, 'yggdrasil', 'Start', 46);

		background.fixedToCamera = true;
		game.log('Background: ', 'Created', 'green');

		// Set the keyboard manager
		cursors = game.input.keyboard.createCursorKeys();	

		cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		game.log('Keyboard: ', 'Created', 'green');		
	},
	start: function() {
		game.state.start('Play');
	}
}