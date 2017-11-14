var cursor, buildings, enemies;

var statePlay = {
	create: function() {
		game.time.advancedTiming = true; // Set up FPS counter

		game.ui = new UI();
		game.ui.init();

		game.level = new Level();
		game.level.init();
		
		createBuildings();

		game.player = new Player();
		game.player.init(300, 25);			

		createEnemies();
	},
	update: function() {
		var areEnemiesTouchingPlatform = game.physics.arcade.collide(enemies, game.level.platforms.gameObjects); // Collision check between the enemies and the platforms		

		game.player.update();
		game.ui.update();		

		updateAI();
	},
	render: function() {
		game.debug.text('DEBUG INFO', 860, 24, "#ff9800");			
		game.debug.text('FPS: ' + game.time.fps, 880, 48, "#00ff00"); // Show FPS						
		game.debug.spriteInfo(game.player.gameObject, 768, 64);
		// game.debug.body(player);
		// game.debug.spriteBounds(player);
		// game.debug.spriteCoords(player);	

		/*
	    for(var i = 0; i < enemies.children.length; i += 1) {
			var enemy = enemies.children[i];	
	    	game.debug.body(enemy);
	    }
	    */
	}
}

function createBuildings() {
	buildings = game.add.group();
	buildings.enableBody = true;

	for (var i = 0; i < game.level.platforms.positions.length - 1; i += 1) {
		var id = i + 1;
		var buildingsPerPlatform = game.rnd.integerInRange(1, 3);
		var start = game.level.platforms.positions[id][0];
		var end = game.level.platforms.positions[id][1];

		for (var j = 0; j < buildingsPerPlatform; j += 1) {
			var buldingPosition = game.rnd.integerInRange(start, end);
			var building = buildings.create(buldingPosition, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
			building.body.immovable = true;
			building.name = 'Building ' + j;
			building.health = 100;
		}
	}

	game.log('Buildings: ', 'Created (' + buildings.children.length + ')', 'green');
}

function createEnemies() {

	enemies = game.add.group();
	enemies.enableBody = true;
	enemies.physicsBodyType = Phaser.Physics.ARCADE;

	for (var i = 0; i < game.level.platforms.positions.length - 1; i += 1) {
		var id = i + 1;
		// TODO: Change to enemy factory
		var enemiesPerPlatform = 1; //game.rnd.integerInRange(1, 3);
		var start = game.level.platforms.positions[id][0];
		var end = game.level.platforms.positions[id][1];

		for (var j = 0; j < enemiesPerPlatform; j += 1) {
			var enemyPosition = game.rnd.integerInRange(start, end); // Placement position for the current enemy
			var enemy = game.add.sprite(enemyPosition, 0, 'enemy_first_iddle'); // // Create the enemy; TODO: Change to enemy sprites		
			var attackAnimationEnemy;
			var bitmapData; // Used for colorizing the sprite

			enemies.add(enemy); // Add the current enenemy to the group
			enemy.name = 'Enemy ' + i;
			enemy.health = 100;
			enemy.damage = 5;
			game.physics.arcade.enable(enemy); // Enable physics for the player
			enemy.body.enable = true;
			enemy.body.bounce.y = 0; // Vertical bounce force
			enemy.body.gravity.y = 2500; // Gravity force
			enemy.body.collideWorldBounds = true; // Enable collision with the world boundaries
			enemy.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, true); // Create the iddle animation  
			attackAnimationEnemy = enemy.animations.add('attack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, false); // Create the attack animation  
			attackAnimationEnemy.onComplete.add(function() {
				game.player.recieveDmg(enemy.damage);	
			});				
			enemy.outOfBoundsKill = true;
			enemy.nextToWhole = false; // Used for AI movement algorythm
			enemy.updateTime = 0;
			enemy.isInPlayerRange = false;
			enemy.scale.x *= -1;
			enemy.anchor.x = .5; // Set the X anchor point to the center of the body
			enemy.body.setSize(settings.playerSize.w - 48, settings.playerSize.h * 2 / 3, 10, 0); // Update the sprite bounds to match the actual physical body

			if (enemy.position.x - game.player.gameObject.position.x > 0) {
				enemy.directionToPlayer = 0;
			} else {
				enemy.directionToPlayer = 1;
			}
		}
	}

	game.log('Enemies: ', 'Created (' + enemies.children.length + ')', 'red');
}

function updateAI() {
	enemies.forEach(function(enemy) {
		var newDirectionToPlayer;

		// Check if the player is located to the left or to the right of the enemy
		if (enemy.position.x - game.player.gameObject.position.x > 0) {
			newDirectionToPlayer = 0; // If enemy's X is higher than the player then the player is to the left
		} else {
			newDirectionToPlayer = 1; // If enemy's X is lower than the player then the player is to the right
		}

		if (enemy.directionToPlayer !== newDirectionToPlayer) {
			enemy.scale.x *= -1; // Flip the sprite horizontally    		

			enemy.nextToWhole = false; // If the player changes direction  then set the enemy to be no longer locked to "next to a hole" state
		}

		enemy.directionToPlayer = newDirectionToPlayer; // Set the direction of the enemy towards the player

		enemyInPlayerRangeCheck(enemy);

		if (!enemy.isInPlayerRange) {
			enenmyMove(enemy);
		}
	});
}

function enemyInPlayerRangeCheck(enemy) {
	// var isEnemyTouchingPlayer  = game.physics.arcade.overlap(enemy, player);

	if (Math.abs(enemy.position.x - game.player.gameObject.position.x) < 150) {
		enemy.isInPlayerRange = true;
	} else {
		enemy.isInPlayerRange = false;
	}

	if (enemy.isInPlayerRange) {
		enemy.isInPlayerRange = true;
		enemy.body.velocity.setTo(0, 0); // If the enemy collides with the player set the enemy's X and Y velocity to 0
		enemyAttack(enemy);
	}
}

function enenmyMove(enemy) {
	// Move towards the player if not next to a whole between them		
	for (var i = 0; i < game.level.platforms.positions.length; i += 1) {
		var checkDist; // Used to determine the distance between the sprite nad the whole depending on the direction

		if (enemy.directionToPlayer === 0) {
			checkDist = 120;
		} else {
			checkDist = 5;
		}

		if (Math.abs(enemy.position.x - game.level.platforms.positions[i][enemy.directionToPlayer]) < checkDist) {
			enemy.nextToWhole = true; // If the enemy is 5 pixels away from the hole lock him into a "next to a hole" state
		}
	}

	// Move the enemy towards the player if not next to a hole and if standing on the ground
	if (!enemy.nextToWhole && enemy.body.touching.down) {
		if (game.time.now > enemy.updateTime) {
			enemy.updateTime = game.time.now + 500; // Leave a threshold time for the reaction

			if (enemy.key !== 'enemy_first_walk') {
				enemy.loadTexture('enemy_first_walk');
			}

			enemy.animations.play('test');


			game.physics.arcade.moveToObject(enemy, game.player.gameObject, 500);
		}
	} else {
		if (enemy.body.touching.down) {
			enemy.body.velocity.setTo(0, 0); // If next to a hole and touching the ground set the enemy's X and Y velocity to 0

			if (enemy.key !== 'enemy_first_iddle') {
				enemy.loadTexture('enemy_first_iddle');
			}

			enemy.animations.play('test');
		} else {
			enemy.body.velocity.setTo(0, enemy.body.velocity.y); // If next to a hole and not touching the ground set the enemy's X velocity to 0
		}
	}

}

function enemyAttack(enemy) {
	var attackAnimation;

	if (enemy.key !== 'enemy_first_attack') {
		enemy.loadTexture('enemy_first_attack');
	}

	attackAnimation = enemy.animations.play('attack');
}

function resetEnemyTint() {
	for (var i = 0; i < enemies.children.length; i += 1) {
		var enemy = enemies.children[i];
		enemy.tint = 0xffffff;
	}
}