var ui = {};
var platformsPositions = [];
var orbsN = 3;
var lastPlatformPosition = 0;
var destroyedBuildingsN = 0;
var cursor, player, platforms, buildings, enemies;

var statePlay = {
	create: function() {
		game.time.advancedTiming = true; // Set up FPS counter

		createUI();
		createPlatform();
		createBuildings();

		game.player = new Player();
		game.player.setup(300, 25);
		player = game.player.gameObject; // Remove this when done refactoring	

		createEnemies();
	},
	update: function() {
		var areEnemiesTouchingPlatform = game.physics.arcade.collide(enemies, platforms); // Collision check between the enemies and the platforms		

		game.player.update();

		updateAI();
	},
	render: function() {
		game.debug.text('FPS: ' + game.time.fps, 880, 32, "#00ff00"); // Show FPS						
		game.debug.spriteInfo(player, 768, 64);
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

function createUI() {
	// Create the background
	ui.background = game.add.sprite(0, 0, 'bg_village');
	ui.background.fixedToCamera = true;

	// Create the fullscreen button
	ui.fullscreenIcon = game.add.sprite(game.width - 110, 16, 'icon_fullscreen');
	ui.fullscreenIcon.scale.setTo(.15);
	ui.fullscreenLabel = game.add.bitmapText(game.width - 110, 96, 'yggdrasil', 'Fullscreen', 64);
	ui.fullscreenLabel.scale.setTo(.25);
	ui.fullscreenIcon.fixedToCamera = true;
	ui.fullscreenLabel.fixedToCamera = true;

	// Create the healthbar
	ui.healthIcon = game.add.sprite(16, 4, 'icon_health');
	ui.healthIcon.scale.setTo(.15);
	ui.healthbarEmpty = game.add.sprite(80, 16, 'bar_empty');
	ui.healthbarFull = game.add.sprite(80, 16, 'healthbar_full');
	ui.healthIcon.fixedToCamera = true;
	ui.healthbarEmpty.fixedToCamera = true;
	ui.healthbarFull.fixedToCamera = true;

	// Create the energybar
	ui.energyIcon = game.add.sprite(16, 88, 'icon_energy');
	ui.energyIcon.scale.setTo(0.15);
	ui.energybarEmpty = game.add.sprite(80, 100, 'bar_empty');
	ui.energybarFull = game.add.sprite(80, 100, 'energybar_full');
	ui.energyIcon.fixedToCamera = true;
	ui.energybarEmpty.fixedToCamera = true;
	ui.energybarFull.fixedToCamera = true;

	// Create shout charges	
	ui.orbs = [];
	ui.orbIcons = [];

	for (var i = 0; i < orbsN; i += 1) {
		ui.orbs[i] = game.add.sprite(116 * (i + 1), 60, 'icon_orb_empty');
		ui.orbIcons[i] = game.add.sprite(116 * (i + 1), 60, 'icon_orb');
		ui.orbs[i].scale.setTo(0.1);
		ui.orbIcons[i].scale.setTo(0.1, 0.1);
		ui.orbs[i].fixedToCamera = true;
		ui.orbIcons[i].fixedToCamera = true;
	}

	game.log('UI: ', 'Created', 'green');
}

function createPlatform() {
	var platformsN = Math.floor(Math.random() * 7 + 3); // Number of platforms
	platforms = game.add.group(); // A group to hold the platform pieces
	platforms.enableBody = true; // Enable physics for the group

	for (var n = 0; n < platformsN; n += 1) {
		createPlatformPiece(n);
	}

	game.world.setBounds(0, 0, lastPlatformPosition, game.height);
	game.log('Platforms: ', 'Created (' + platformsN + ')', 'green');
}

function createPlatformPiece(n) {
	var midPiecesN = game.rnd.integerInRange(2, 5); // Number of pieces for testing purposes
	var holeSize = game.rnd.integerInRange(3, 3); // Number of empty spaces betweeb the platforms
	var platformStart = platforms.create(lastPlatformPosition, game.world.bounds.height - settings.tileSize, 'tile_bot_start'); // Start piece
	var platformEndPosition, platformEnd;

	platformStart.body.immovable = true; // Make it immovable from collision

	// Loop for the mid pieces
	for (var i = 0; i < midPiecesN; i += 1) {
		var id = i + 1; // Start from 1 for the horizontal position calculation
		var platformMidPosition = id * settings.tileSize + lastPlatformPosition;
		var platformMid = platforms.create(platformMidPosition, game.world.bounds.height - settings.tileSize, 'tile_bot_mid'); // Mid pieces
		platformMid.body.immovable = true; // Make it immovable from collision
	}

	platformEndPosition = (midPiecesN + 1) * settings.tileSize + lastPlatformPosition;
	platformEnd = platforms.create(platformEndPosition, game.world.bounds.height - settings.tileSize, 'tile_bot_end'); // End piece
	platformEnd.body.immovable = true; // Make it immovable from collision	

	platformsPositions[n] = [lastPlatformPosition, platformEndPosition];

	lastPlatformPosition = platformEndPosition + (settings.tileSize * holeSize);
}

function createBuildings() {
	buildings = game.add.group();
	buildings.enableBody = true;

	for (var i = 0; i < platformsPositions.length - 1; i += 1) {
		var id = i + 1;
		var buildingsPerPlatform = game.rnd.integerInRange(1, 3);
		var start = platformsPositions[id][0];
		var end = platformsPositions[id][1];

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
	var enemiesN = game.rnd.integerInRange();

	enemies = game.add.group();
	enemies.enableBody = true;
	enemies.physicsBodyType = Phaser.Physics.ARCADE;

	for (var i = 0; i < platformsPositions.length - 1; i += 1) {
		var id = i + 1;
		// TODO: Change to enemy factory
		var enemiesPerPlatform = game.rnd.integerInRange(1, 3);
		var start = platformsPositions[id][0];
		var end = platformsPositions[id][1];

		for (var j = 0; j < enemiesPerPlatform; j += 1) {
			var enemyPosition = game.rnd.integerInRange(start, end); // Placement position for the current enemy
			var enemy = game.add.sprite(enemyPosition, 0, 'enemy_first_iddle'); // // Create the enemy; TODO: Change to enemy sprites		
			var bitmapData; // Used for colorizing the sprite

			enemies.add(enemy); // Add the current enenemy to the group
			enemy.name = 'Enemy ' + i;
			enemy.health = 100;
			game.physics.arcade.enable(enemy); // Enable physics for the player
			enemy.body.enable = true;
			enemy.body.bounce.y = 0; // Vertical bounce force
			enemy.body.gravity.y = 2500; // Gravity force
			enemy.body.collideWorldBounds = true; // Enable collision with the world boundaries
			enemy.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, true); // Create the iddle animation  
			enemy.outOfBoundsKill = true;
			enemy.nextToWhole = false; // Used for AI movement algorythm
			enemy.updateTime = 0;
			enemy.isInPlayerRange = false;
			enemy.scale.x *= -1;
			enemy.anchor.x = .5; // Set the X anchor point to the center of the body
			enemy.body.setSize(settings.playerSize.w - 48, settings.playerSize.h * 2 / 3, 10, 0); // Update the sprite bounds to match the actual physical body

			// Colorize the sprite
			var gray = game.add.filter('Gray');
			enemy.filters = [gray];

			if (enemy.position.x - player.position.x > 0) {
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
		if (enemy.position.x - player.position.x > 0) {
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

	if (Math.abs(enemy.position.x - player.position.x) < 150) {
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
	for (var i = 0; i < platformsPositions.length; i += 1) {
		var checkDist; // Used to determine the distance between the sprite nad the whole depending on the direction

		if (enemy.directionToPlayer === 0) {
			checkDist = 120;
		} else {
			checkDist = 5;
		}

		if (Math.abs(enemy.position.x - platformsPositions[i][enemy.directionToPlayer]) < checkDist) {
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


			game.physics.arcade.moveToObject(enemy, player, 500);
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

	attackAnimation = enemy.animations.play('test');

	if (attackAnimation.frame === 9 && player.health > 0) {
		player.tint = 0x666666; // Tint the player to indicate damage
		player.health -= 1;
		ui.healthbarCropArea = new Phaser.Rectangle(0, 0, ui.healthbarEmpty.width * player.health / 100, ui.healthbarFull.height);
		ui.healthbarFull.crop(ui.healthbarCropArea);
	} else if (attackAnimation.frame === 1) {
		player.tint = 0xffffff; // Reset the player tint
	}
}

function resetEnemyTint() {
	for (var i = 0; i < enemies.children.length; i += 1) {
		var enemy = enemies.children[i];
		enemy.tint = 0xffffff;
	}
}