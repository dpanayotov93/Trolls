var stateMenu = {
	create: function() {		
		var background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		var titleLabel = game.add.text(game.world.centerX - 100, 150, 'TROLLS', {font: '64px Courier', fontWeight: 500, fill: '#ffffff'}); // Add the game title		
		var startButton = game.add.button(game.world.centerX - settings.buttonSize.w / 2, 250, 'button', this.start, this, 0, 1, 2);		
		var startLabel = game.add.text(game.world.centerX - 48, 256, 'Start', {font: "48px Courier", fill: "#ffffff"});

		// Add shadows to the labels
		titleLabel.setShadow(2, 2, 'rgba(0,0,0,0.5)', 0);
		startLabel.setShadow(2, 2, 'rgba(0,0,0,0.5)', 0);

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