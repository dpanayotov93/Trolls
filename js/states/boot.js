var stateBoot = {
	create: function() {
		// Set the physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// Call the load state
		game.log('Calling state:', 'Load');
		game.state.start('Load');
	}
}