var lastPlatformPosition = 0;
var isAttacking = false; 
var dmgLock = false; // TODO: Change to time related event / reference 
var platformsPositions = [];
var destroyedBuildingsN = 0;
var updateTime = 0;
var cursor, player, platforms, buildings, enemies, target, attackAnimation;

var statePlay = {
	create: function() {			
		game.time.advancedTiming = true; // Set up FPS counter

		createBackground();
		createPlatform();
		createBuildings();
		createPlayer();
		createEnemies();
	}, 
	update: function() {
		var isPlayerTouchingPlatform = game.physics.arcade.collide(player, platforms); // Collision check between the player and the platform
		var areEnemiesTouchingPlatform  = game.physics.arcade.collide(enemies, platforms); // Collision check between the enemies and the platforms
		var isPlayerTouchingBuildings = game.physics.arcade.overlap(player, buildings); // Overlap check between the player and the buildings			

		if(player.position.y > 790) {
			player.kill();
			game.log('Calling state: ', 'End');
			game.state.start('End');
		}

		for(var i = 0; i < enemies.children.length; i += 1) {
			var enemy = enemies.children[i];
			if(enemy.position.y > 790) {
				enemy.kill();
			}		
		}

		if(isPlayerTouchingBuildings) {  // If the player overlaps a building in the group set it as it's current target		
			var building = buildings.filter(function(building) { // Filter through the group to find the currently overlapping building
				return building.body.touching.up === true 
						|| building.body.touching.down === true 
						|| building.body.touching.left === true 
						|| building.body.touching.right === true;
			}).list[0];

			checkAttack(building); // Function to set the player's target and take care of applying dmg to it if the player is attacking
		} else {
			target = null; // Clear the current target if out of the overlapping area
		}
		
		checkControls(isPlayerTouchingPlatform);
		updateAI();			
	},
	render: function() {
		game.debug.text('FPS: ' + game.time.fps, 32, 32, "#00ff00"); // Show FPS						
	    game.debug.spriteInfo(player, 32, 64);
	    game.debug.body(player);     
	    // game.debug.spriteBounds(player);	     	 
	    // game.debug.spriteCoords(player);	
	    
	    
	    for(var i = 0; i < enemies.children.length; i += 1) {
			var enemy = enemies.children[i];	
	    	game.debug.body(enemy);
	    }
	    /**/
	   
	}
}

function createBackground() {
	var background = game.add.sprite(0, 0, 'bg_village');
	background.fixedToCamera = true;
	game.log('Background: ', 'Created', 'green');
}

function createPlatform() {	
	var platformsN = Math.floor(Math.random() * 7 + 3); // Number of platforms
	platforms = game.add.group(); // A group to hold the platform pieces
	platforms.enableBody = true; // Enable physics for the group

	for(var n = 0; n < platformsN; n += 1) {
		createPlatformPiece(n);
	}	

	game.world.setBounds(0, 0, lastPlatformPosition, game.height);
	game.log('Platforms: ', 'Created (' + platformsN + ')', 'green');
}

function createPlatformPiece(n) {
	var midPiecesN = game.rnd.integerInRange(2, 5); // Number of pieces for testing purposes
	var holeSize = game.rnd.integerInRange(3, 4); // Number of empty spaces betweeb the platforms
	var platformStart = platforms.create(lastPlatformPosition, game.world.bounds.height - settings.tileSize, 'tile_bot_start'); // Start piece
	var platformEndPosition, platformEnd;

	platformStart.body.immovable = true; // Make it immovable from collision

	// Loop for the mid pieces
	for(var i = 0; i < midPiecesN; i += 1) {
		var id = i + 1 ; // Start from 1 for the horizontal position calculation
		var platformMidPosition = id * settings.tileSize + lastPlatformPosition;
		var platformMid = platforms.create(platformMidPosition, game.world.bounds.height - settings.tileSize, 'tile_bot_mid'); // Mid pieces
		platformMid.body.immovable = true; // Make it immovable from collision
	}

	platformEndPosition = (midPiecesN + 1 ) * settings.tileSize + lastPlatformPosition;
	platformEnd = platforms.create(platformEndPosition, game.world.bounds.height - settings.tileSize, 'tile_bot_end'); // End piece
	platformEnd.body.immovable = true; // Make it immovable from collision	

	platformsPositions[n] = [lastPlatformPosition, platformEndPosition];

	lastPlatformPosition = platformEndPosition + (settings.tileSize * holeSize);
}

function createBuildings() {	
	buildings = game.add.group();
	buildings.enableBody = true; 

	for(var i = 0; i < platformsPositions.length - 1; i += 1) {
		var id = i + 1;
		var buildingsPerPlatform = game.rnd.integerInRange(1, 3);
		var start = platformsPositions[id][0];
		var end = platformsPositions[id][1];

		for(var j = 0; j < buildingsPerPlatform; j +=1) {
			var buldingPosition = game.rnd.integerInRange(start, end);
			var building = buildings.create(buldingPosition, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
			building.body.immovable = true;
			building.health = 100;	
		}		
	}

	game.log('Buildings: ', 'Created (' + buildings.children.length + ')', 'green');
}

function createPlayer() {
	player = game.add.sprite(100, 25, 'troll_first_iddle'); // Create the player
	game.physics.arcade.enable(player); // Enable physics for the player
	player.body.bounce.y = 0; // Vertical bounce force
    player.body.gravity.y = 2500; // Gravity force
    player.body.collideWorldBounds = true; // Enable collision with the world boundaries
    player.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true); // Create the iddle animation  
    player.outOfBoundsKill = true; // A switch for just in case to kill the player if it goes out of bounds
    player.maxHealth = 100; // Maximum player health
    player.health = 100;
    player.anchor.x = 0.5; // Set the X anchor point to the center of the body
    player.body.setSize(settings.playerSize.w - 64, settings.playerSize.h * 2 / 3, 15, 0); // Update the sprite bounds to match the actual physical body    

    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1); // Create a canera that follow the player;

    game.log('Player: ', 'Created', 'blue');
}

function createEnemies() {
	var enemiesN = game.rnd.integerInRange();

	enemies = game.add.group();
	enemies.enableBody = true;
	enemies.physicsBodyType = Phaser.Physics.ARCADE;

	for(var i = 0; i < platformsPositions.length - 1; i += 1) {
		var id = i + 1;
		// TODO: Change to enemy factory
		var enemiesPerPlatform = game.rnd.integerInRange(1, 3);
		var start = platformsPositions[id][0];
		var end = platformsPositions[id][1];	

		for(var j = 0; j < enemiesPerPlatform; j += 1) {
			var enemyPosition = game.rnd.integerInRange(start, end); // Placement position for the current enemy
			var enemy = game.add.sprite(enemyPosition, 0, 'enemy_first_iddle'); // // Create the enemy; TODO: Change to enemy sprites		
			var bitmapData; // Used for colorizing the sprite
			
			enemies.add(enemy); // Add the current enenemy to the group
			enemy.name = 'Enemy ' + i;
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
    		enemy.body.setSize(settings.playerSize.w - 64, settings.playerSize.h * 2 / 3, 15, 0); // Update the sprite bounds to match the actual physical body

    		// Colorize the sprite
		    var gray = game.add.filter('Gray');
		    enemy.filters = [gray];

		    if(enemy.position.x - player.position.x > 0) {
		    	enemy.directionToPlayer = 0;
			} else {
				enemy.directionToPlayer = 1;
			}
		}
	}

	game.log('Enemies: ', 'Created (' + enemies.children.length + ')', 'red');
}

function checkControls(isPlayerTouchingPlatform) {
	/* Controls */
    player.body.velocity.x = 0; // Reset the player velocity    


    if (cursors.left.isDown) {  
        player.body.velocity.x = -500; //  Move to the left
		
		
        player.scale.x = -1;


		if(isPlayerTouchingPlatform) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if (cursors.right.isDown) {               
        player.body.velocity.x = 500; //  Move to the right 

        
        player.scale.x = 1;

        if(isPlayerTouchingPlatform) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if(isPlayerTouchingPlatform && !isAttacking) {		
        // Play the iddle animation when not moving
        if(player.key !== 'troll_first_iddle') {
        	player.loadTexture('troll_first_iddle');
        }

        player.animations.play('test');
    }
  
    //  Allow the player to jump if they are touching the ground.   
    if (cursors.up.isDown && player.body.touching.down && isPlayerTouchingPlatform) {	    	
        player.body.velocity.y = -750; // Move the player up

        if(player.scale.x > 0) {
        	player.scale.x = 1;
        } else {
        	player.scale.x = -1;
        }

        if(player.key !== 'troll_first_jump') {
        	player.loadTexture('troll_first_jump');
        }
		
        player.animations.play('test');       
    }

    /* Attacking */
    if(cursors.spacebar.isUp) {
    	isAttacking = false; // Reset the boolen that marks the attacking state
    }
    if(cursors.spacebar.isDown && !isAttacking) {
    	isAttacking = true; // Mark the current state as attacking

    	if(player.scale.x > 0) {
    		player.scale.x = 1;   
    	} else {
    		player.scale.x = -1;
    	}

        if(player.key !== 'troll_first_attack') {
        	player.loadTexture('troll_first_attack');
        }        

        attackAnimation = player.animations.play('test');
    }
}

function checkAttack(building) {	
	if(target !== building && building !== undefined) { // Check if new building is in range and that the returned object is not undefined
		target = building;
	}

	if(isAttacking) { // Check if the player is currently attacking
		if(attackAnimation.frame === 9 && !dmgLock) { // TODO: Change the constant to a variable
			dmgLock = true;
			if(target === undefined || target === 'undefined') {
				debugger;
			}
			target.health -= 10;
			console.log(target.health);
			if(target.health === 0) {
				buildings.remove(target);
				destroyedBuildingsN += 1;
			}
			if(target.health % 20 === 0) {
				target.frame += 1;
			}
		} else if(attackAnimation.frame === 0) {
			dmgLock = false;
		}
	}
}

function updateAI() {
	enemies.forEach(function(enemy) {
		var newDirectionToPlayer;

		// Check if the player is located to the left or to the right of the enemy
		if(enemy.position.x - player.position.x > 0) { 
			newDirectionToPlayer = 0; // If enemy's X is higher than the player then the player is to the left
		} else {
			newDirectionToPlayer = 1; // If enemy's X is lower than the player then the player is to the right
		}	
			
		if(enemy.directionToPlayer !== newDirectionToPlayer) {			
			enemy.scale.x *= -1; // Flip the sprite horizontally    		

    		enemy.nextToWhole = false; // If the player changes direction  then set the enemy to be no longer locked to "next to a hole" state
    	}

    	enemy.directionToPlayer = newDirectionToPlayer; // Set the direction of the enemy towards the player

		enemyInPlayerRangeCheck(enemy);

		if(!enemy.isInPlayerRange) {			
			enenmyMove(enemy);
		}
	});
}

function enemyInPlayerRangeCheck(enemy) {	
	var isEnemyTouchingPlayer  = game.physics.arcade.overlap(enemy, player);
	if(isEnemyTouchingPlayer) {
		enemy.isInPlayerRange = true;
		enemy.body.velocity.setTo(0, 0); // If the enemy collides with the player set the enemy's X and Y velocity to 0
		enemyAttack(enemy);
	} else {
		enemy.isInPlayerRange = false;
	}
}

function enenmyMove(enemy) {
	// Move towards the player if not next to a whole between them	
	for(var i = 0; i < platformsPositions.length; i += 1) {				
		if(Math.abs(enemy.position.x - platformsPositions[i][enemy.directionToPlayer]) < 120) { 
			enemy.nextToWhole = true; // If the enemy is 5 pixels away from the hole lock him into a "next to a hole" state
		}			
	}		

	// Move the enemy towards the player if not next to a hole and if standing on the ground
	if(!enemy.nextToWhole && enemy.body.touching.down) {
		if (game.time.now > enemy.updateTime) {
			enemy.updateTime = game.time.now + 500;	// Leave a threshold time for the reaction

	        if(enemy.key !== 'enemy_first_walk') {
	        	enemy.loadTexture('enemy_first_walk');
	        }

	        enemy.animations.play('test');


			game.physics.arcade.moveToObject(enemy, player, 500); 			
		}
	} else {
		if(enemy.body.touching.down) {
			enemy.body.velocity.setTo(0, 0); // If next to a hole and touching the ground set the enemy's X and Y velocity to 0

		    if(enemy.key !== 'enemy_first_iddle') {
		    	enemy.loadTexture('enemy_first_iddle');
		    }

		    enemy.animations.play('test');				
		} else {
			enemy.body.velocity.setTo(0, enemy.body.velocity.y); // If next to a hole and not touching the ground set the enemy's X velocity to 0
		}
	}

}

function enemyAttack(enemy) {
    if(enemy.key !== 'enemy_first_attack') {
    	enemy.loadTexture('enemy_first_attack');
    }

    enemy.animations.play('test');
}