let stateMenu = {
	create: function() {		
		let background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		let titleLabel = game.add.bitmapText(settings.width / 2 - 110, 150, 'yggdrasil', 'TROLLS', 64);
		let startButton = game.add.button(settings.width / 2 - settings.buttonSize.w / 2, 250, 'button', this.start, this, 0, 1, 2);		
		let startLabel = game.add.bitmapText(settings.width / 2 - 64, 256, 'yggdrasil', 'Start', 46);
		let controlsButton = game.add.button(settings.width / 2 - settings.buttonSize.w / 2, 350, 'button', this.showControls, this, 0, 1, 2);		
		let controlsLabel = game.add.bitmapText(settings.width / 2 - 96, 356, 'yggdrasil', 'Controls', 46);		

		// Change the mouse when over a button
		startButton.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
		}, this);
		startButton.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
		}, this);	
		controlsButton.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
		}, this);
		controlsButton.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
		}, this);					

		// Set the keyboard manager
		game.keyboard = game.input.keyboard.createCursorKeys();	

		game.keyboard.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		game.keyboard.q = game.input.keyboard.addKey(Phaser.Keyboard.Q);

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