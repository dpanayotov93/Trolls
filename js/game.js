// Custom logging function
Phaser.Game.prototype.log = function(title, message, color) {
	var color = color || '#333';
	console.log('%c' + title + ' %c' + message, 'font-weight: 600; color: ' + color, 'font-style: italic; color: ' + color);
};
// Removing the Phaser header
// Phaser.Game.prototype.showDebugHeader = function() {
// 	// Just a return statement to overwrite the default behaviour
// 	return;
// };

// Define the settings for the game
var settings = {
	width: window.innerWidth < 480 ? 480 : window.innerWidth,
	height: window.innerHeight - 32 < 320 ? 320 : window.innerHeight,
	tileSize: 128,
	buttonSize: {
		h: 64,
		w: 1024
	},
	playerSize: {
		h: 264, //1056
		w: 179 // 715 			
	},
	towerSize: {
		h: 156,
		w: 174
	}
};
// Create the game object
var game = new Phaser.Game(settings.width, settings.height, Phaser.CANVAS, '');

// State management
game.state.add('Boot', stateBoot);
game.state.add('Load', stateLoad);
game.state.add('Menu', stateMenu);
game.state.add('Controls', stateControls);
game.state.add('Play', statePlay);
game.state.add('End', stateEnd);

// Initiate from the boot state
game.log('Calling state:', 'Boot');
game.state.start('Boot');