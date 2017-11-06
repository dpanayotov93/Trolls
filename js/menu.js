var stateMenu = {
	create: function() {
		// Add the background
		var background = game.add.sprite(0, 0, 'bg_village');
		background.fixedToCamera = true;
		game.log('Background: ', 'Created', 'green');

		// Set the keyboard manager
		cursors = game.input.keyboard.createCursorKeys();	

		cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		cursors.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		game.log('Keyboard: ', 'Created', 'green');		

		cursors.enter.onDown.addOnce(this.start, this);
	},
	start: function() {
		game.state.start('Play');
	}
}