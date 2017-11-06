var settings = {
		width: window.innerWidth < 480 ? 480 : window.innerWidth,
		height: window.innerHeight - 32 < 320 ? 320 : window.innerHeight,
		tileSize: 128,
		playerSize: {
			h: 264, //1056
			w: 179 // 715 			
		},
		towerSize: {
			h: 156,
			w: 174
		}
	};
var game = new Phaser.Game(settings.width, settings.height, Phaser.AUTO, '', {
		preload: preload,
		create: create,
		update: update,
		render: render
	});
var lastPlatformPosition = 0;
var isAttacking = false; 
var dmgLock = false; // TODO: Change to time related event / reference 
var platformsPositions = [];
var cursor, player, platforms, buildings, target, attackAnimation;

function preload() {
	// Setup for responsive resizing
	game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.canvas.style.width = '100%';
	game.canvas.style.height = '100%';
	game.scale.refresh();

	/* Loading of assets */
	// Images
	game.load.image('bg_village', 'assets/backgrounds/village.jpg');
	// Tiles - Terrain
	game.load.image('tile_bot_start', 'assets/tilesets/tile_bot_start.png');
	game.load.image('tile_bot_mid', 'assets/tilesets/tile_bot_mid.png');
	game.load.image('tile_bot_end', 'assets/tilesets/tile_bot_end.png');
	game.load.image('tile_float_start', 'assets/tilesets/tile_float_start.png');
	game.load.image('tile_float_mid', 'assets/tilesets/tile_float_mid.png');
	game.load.image('tile_float_end', 'assets/tilesets/tile_float_end.png');
	game.load.image('tile_mid_start', 'assets/tilesets/tile_mid_start.png');
	game.load.image('tile_mid_mid', 'assets/tilesets/tile_mid_mid.png');
	game.load.image('tile_mid_end', 'assets/tilesets/tile_mid_end.png');	
	// Sprites - Player
	game.load.spritesheet('troll_first_iddle', 'assets/sprites/troll_first/sprite_iddle_small.png', settings.playerSize.h, settings.playerSize.w);
	game.load.spritesheet('troll_first_walk', 'assets/sprites/troll_first/sprite_walk_small.png', settings.playerSize.h, settings.playerSize.w);
	game.load.spritesheet('troll_first_jump', 'assets/sprites/troll_first/sprite_jump_small.png', settings.playerSize.h, settings.playerSize.w);
	game.load.spritesheet('troll_first_attack', 'assets/sprites/troll_first/sprite_attack_small.png', settings.playerSize.h, settings.playerSize.w);
	// Sprites - Objects
	game.load.spritesheet('tower_first', 'assets/sprites/tower_first/sprite.png', settings.towerSize.h, settings.towerSize.w);

	game.log('Assets: ', 'Loaded', 'green');
}

function create() {
	// Add the background
	var background = game.add.sprite(0, 0, 'bg_village');
	background.fixedToCamera = true;
	game.log('Background: ', 'Created', 'green');

	// Set the physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// Set the keyboard manager
	cursors = game.input.keyboard.createCursorKeys();	

	cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	game.log('Keyboard: ', 'Created', 'green');

	createPlatform();
	createBuildings();
	createPlayer();
}

function update() {	
	var isPlayerTouchingPlatform = game.physics.arcade.collide(player, platforms); // Collision check between the player and the platform
	var isPlayerTouchingBuildings = game.physics.arcade.overlap(player, buildings); // Overlap check between the player and the buildings

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
}

function render() {    
	// Sprite debug info
	/*
    game.debug.spriteBounds(player); 
          
    for(var i = 0; i < platforms.children.length; i += 1) {
    	game.debug.spriteBounds(platforms.children[i]);
    } 
	*/ 
}

function createPlatform() {	
	var platformsN = Math.floor(Math.random() * 5 + 1); // Number of platforms
	platforms = game.add.group(); // A group to hold the platform pieces
	platforms.enableBody = true; // Enable physics for the group

	for(var n = 0; n < platformsN; n += 1) {
		createPlatformPiece(n);
	}	

	game.world.setBounds(0, 0, lastPlatformPosition, game.height);
	game.log('Platforms: ', 'Created (' + platformsN + ')', 'green');
}

function createPlatformPiece(n) {
	var midPiecesN = Math.floor(Math.random() * 5 + 1); // Number of pieces for testing purposes
	var holeSize = Math.floor(Math.random() * 2 + 2);
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
	var buildingsPerPlatform = Math.floor((Math.random() * 2) + 1);
	var buildingsN = (platformsPositions.length - 1) * buildingsPerPlatform; 
	buildings = game.add.group();
	buildings.enableBody = true; 

	for(var i = 1; i < buildingsN; i += 1) {
		var id = Math.floor((i + 1) / 2) ;
		var start = platformsPositions[id][0];
		var end = platformsPositions[id][1];
		var buldingPosition = null;
		var minDistance = buildings.children[buildings.children.length - 1] - settings.towerSize;
		var maxDistance = buildings.children[buildings.children.length - 1] + settings.towerSize;

		while((buldingPosition > minDistance && buldingPosition < maxDistance) || buldingPosition === null) {
			buldingPosition = Math.floor((Math.random() * end) + start);
		}

		var building = buildings.create(buldingPosition, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
		building.body.immovable = true;
		building.health = 100;		
	}

	game.log('Buildings: ', 'Created (' + buildingsN + ')', 'green');
}

function createPlayer() {
	player = game.add.sprite(0, game.world.height - settings.playerSize.h * 1.15, 'troll_first_iddle'); // Create the player - 1.15 to start just above the platform
	game.physics.arcade.enable(player); // Enable physics for the player
	player.body.bounce.y = 0; // Vertical bounce force
    player.body.gravity.y = 2500; // Gravity force
    player.body.collideWorldBounds = true; // Enable collision with the world boundaries
    player.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, true); // Create the iddle animation  
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
			target.health -= 10;
			console.log(target.health);
			if(target.health === 0) {
				buildings.remove(target);
			}
			if(target.health % 20 === 0) {
				target.frame += 1;
			}
		} else if(attackAnimation.frame === 0) {
			dmgLock = false;
		}
	}
}

Phaser.Game.prototype.log = function(title, message, color) {
	var color = color || '#333';
	console.log('%c' + title + ' %c' + message, 'font-weight: 600; color: ' + color, 'font-style: italic; color: ' + color);
}