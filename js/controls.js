var stateControls = {
	create: function() {
		var background = game.add.sprite(0, 0, 'bg_village'); // Add the background
		var controlsLabel = game.add.bitmapText(settings.width / 2 - 160, 150, 'yggdrasil', 'Controls', 64);
		var movementLabel = game.add.bitmapText(settings.width / 2 - 320, 300, 'yggdrasil', 'Left/Right arrow keys: Move', 48);
		var jumpLabel = game.add.bitmapText(settings.width / 2 - 220, 400, 'yggdrasil', 'UP arrow key: Jump', 48);
		var attackLabel = game.add.bitmapText(settings.width / 2 - 170, 500, 'yggdrasil', 'Space: Attack', 48);
		var backButton = game.add.button(game.world.centerX - settings.buttonSize.w / 2, 600, 'button', this.back, this, 0, 1, 2);		
		var startLabel = game.add.bitmapText(game.world.centerX - 60, 608, 'yggdrasil', 'Back', 46);

		// Change the mouse when over a button
		backButton.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
		}, this);
		backButton.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
		}, this);
	},
	back: function() {
		game.log('Calling state: ', 'Menu');
		game.state.start('Menu');
	},
}