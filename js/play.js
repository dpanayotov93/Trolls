var lastPlatformPosition = 0;
var isAttacking = false; 
var isJumping = false;
var dmgLock = false; // TODO: Change to time related event / reference 
var platformsPositions = [];
var destroyedBuildingsN = 0;
var cursor, player, platforms, buildings, target, attackAnimation;

var statePlay = {
	create: function() {			
		game.time.advancedTiming = true; // Set up FPS counter

		createBackground();
		createPlatform();
		createBuildings();
		createPlayer();					
	}, 
	update: function() {
		var isPlayerTouchingPlatform = game.physics.arcade.collide(player, platforms); // Collision check between the player and the platform
		var isPlayerTouchingBuildings = game.physics.arcade.overlap(player, buildings); // Overlap check between the player and the buildings		

		if(player.position.y > 790) {
			player.kill();
			game.log('Calling state: ', 'End');
			game.state.start('End');
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
	},
	render: function() {
		game.debug.text('FPS: ' + game.time.fps, 25, 25, "#00ff00"); // Show FPS
		game.debug.body(player);		
		game.debug.spriteBounds(player);		
		/*	     
	    game.debug.spriteCoords(player);
	          
	    for(var i = 0; i < platforms.children.length; i += 1) {
	    	game.debug.spriteBounds(platforms.children[i]);
	    } 
		*/ 		
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
	var holeSize = game.rnd.integerInRange(3, 4);
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
	var buildingsN = platformsPositions.length - 1; // * buildingsPerPlatform; 
	buildings = game.add.group();
	buildings.enableBody = true; 

	for(var i = 1; i <= buildingsN; i += 1) {
		var buildingsPerPlatform = game.rnd.integerInRange(1, 3);
		var start = platformsPositions[i][0];
		var end = platformsPositions[i][1];

		for(var j = 0; j < buildingsPerPlatform; j +=1) {
			var buldingPosition = game.rnd.integerInRange(start, end);
			var building = buildings.create(buldingPosition, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
			building.body.immovable = true;
			building.health = 100;	
		}		
	}

	game.log('Buildings: ', 'Created (' + buildingsN + ')', 'green');
}

function createPlayer() {
	player = game.add.sprite(0, 0, 'troll_first_iddle'); // Create the player - 1.15 to start just above the platform
	game.physics.arcade.enable(player); // Enable physics for the player
	player.body.bounce.y = 0; // Vertical bounce force
    player.body.gravity.y = 2500; // Gravity force
    player.body.collideWorldBounds = true; // Enable collision with the world boundaries
    player.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, true); // Create the iddle animation  
    player.outOfBoundsKill = true;            

    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    game.log('Player: ', 'Created', 'green');
}

function checkControls(isPlayerTouchingPlatform) {
	/* Controls */
    player.body.velocity.x = 0; // Reset the player velocity    

    if (cursors.left.isDown) {  
        player.body.velocity.x = -500; //  Move to the left
		
        if(player.scale.x === 1) {
        	player.scale.x *= -.7;
    	} else if(player.scale.x === .7) {
    		player.scale.x *= -1;
    	}

		if(isPlayerTouchingPlatform) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if (cursors.right.isDown) {               
        player.body.velocity.x = 500; //  Move to the right 

        if(player.scale.x === -1) {
        	player.scale.x *= -.7;
    	} else if(player.scale.x === -.7) {
    		player.scale.x *= -1;
    	}

        if(isPlayerTouchingPlatform) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if(isPlayerTouchingPlatform && !isAttacking) {		
    	player.anchor.x = .5; // Set the X anchor to the middle of the sprite    	
    	if(player.scale.x > 0) {
    		player.scale.x = .7;
    	} else {
    		player.scale.x = -.7;
    	}

        // Play the iddle animation when not moving
        if(player.key !== 'troll_first_iddle') {
        	player.loadTexture('troll_first_iddle');
        }

        player.animations.play('test');               
        if(!isJumping) {
        	player.body.setSize(player._bounds.width - 60, player._bounds.height, 15, 0);	
        }    
    }
  
    //  Allow the player to jump if they are touching the ground.
    if(cursors.up.isUp) {
    	isJumping = false; // Reset the boolen that marks the attacking state
    }      
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
        isJumping = true; 
        player.body.setSize(player._bounds.width - 120, player._bounds.height, 60, 0);		
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