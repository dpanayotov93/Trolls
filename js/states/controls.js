let stateControls = {
	create: function() {
		let background = game.add.sprite(0, 0, 'bg_village');
		let controlsLabel = game.add.bitmapText(settings.width / 2 - 160, 150, 'yggdrasil', 'Controls', 64);
		let movementLabel = game.add.bitmapText(settings.width / 2 - 320, 300, 'yggdrasil', 'Left/Right arrow keys: Move', 48);
		let jumpLabel = game.add.bitmapText(settings.width / 2 - 220, 400, 'yggdrasil', 'UP arrow key: Jump', 48);
		let attackLabel = game.add.bitmapText(settings.width / 2 - 170, 500, 'yggdrasil', 'Space: Attack', 48);
		let sprintLabel = game.add.bitmapText(settings.width / 2 - 420, 600, 'yggdrasil', 'Shift + Left/Right arrow keys: Sprint', 48);
		let skillLabel = game.add.bitmapText(settings.width / 2 - 180, 700, 'yggdrasil', 'LMB: Cast skill', 48);
		let backButton = game.add.button(settings.width / 2 - settings.buttonSize.w / 2, 800, 'button', this.back, this, 0, 1, 2);		
		let backLabel = game.add.bitmapText(settings.width / 2 - 60, 808, 'yggdrasil', 'Back', 46);

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