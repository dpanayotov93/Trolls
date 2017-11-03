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
var isAttacking = false; 
var dmgLock = false; // TODO: Change to time related event / reference 
var cursor, player, floor, buildings, target, attackAnimation;

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
}

function create() {
	// Add the background
	game.add.sprite(0, 0, 'bg_village');

	// Set the physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// Set the keyboard manager
	cursors = game.input.keyboard.createCursorKeys();

	cursors.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	createFloor();

	// Create the buildings
	buildings = game.add.group();
	buildings.enableBody = true; 
	var building = buildings.create(650, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
	building.body.immovable = true;
	building.health = 100;
	var building2 = buildings.create(1250, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
	building2.body.immovable = true;
	building2.health = 100;

	createPlayer();
}

function update() {	
	var isPlayerTouchingFloor = game.physics.arcade.collide(player, floor); // Collision check between the player and the floor
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

	checkControls(isPlayerTouchingFloor);
}

function render() {    
	// Sprite debug info
	/*
    game.debug.spriteBounds(player); 
    for(var i = 0; i < buildings.children.length; i += 1) {
    	game.debug.spriteBounds(buildings.children[i]);
    } 
    */   
}

function createFloor() {	
	var midPiecesN = 10; // Number of pieces for testing purposes
	var floorMid = []; // Array to hold the mid pieces
	var floorStart;
	var floorEnd;

	floor = game.add.group(); // A group to hold the floor pieces
	floor.enableBody = true; // Enable physics for the group

	floorStart = floor.create(0, game.world.bounds.height - settings.tileSize, 'tile_bot_start'); // Start piece
	floorStart.body.immovable = true; // Make it immovable from collision
	
	// Loop for the mid pieces
	for(var i = 0; i < midPiecesN; i += 1) {
		var id = i + 1; // Start from 1 for the horizontal position calculation
		floorMid[i] = floor.create(id * settings.tileSize, game.world.bounds.height - settings.tileSize, 'tile_bot_mid'); // Mid pieces
		floorMid[i].body.immovable = true; // Make it immovable from collision
	}

	floorEnd = floor.create((midPiecesN + 1 ) * settings.tileSize, game.world.bounds.height - settings.tileSize, 'tile_bot_end'); // End piece
	floorEnd.body.immovable = true; // Make it immovable from collision	
}

function createPlayer() {
	player = game.add.sprite(settings.tileSize, game.world.height - settings.playerSize.h * 1.15, 'troll_first_iddle'); // Create the player - 1.15 to start just above the floor
	game.physics.arcade.enable(player); // Enable physics for the player
	player.body.bounce.y = 0; // Vertical bounce force
    player.body.gravity.y = 2500; // Gravity force
    player.body.collideWorldBounds = true; // Enable collision with the world boundaries
    player.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true); // Create the iddle animation  
}

function checkControls(isPlayerTouchingFloor) {
	/* Controls */
    player.body.velocity.x = 0; // Reset the player velocity    

    if (cursors.left.isDown) {  
        player.body.velocity.x = -500; //  Move to the left
		
        if(player.scale.x === 1) {
        	player.scale.x *= -.7;
    	} else if(player.scale.x === .7) {
    		player.scale.x *= -1;
    	}

		if(isPlayerTouchingFloor) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if (cursors.right.isDown) {               
        player.body.velocity.x = 350; //  Move to the right 

        if(player.scale.x === -1) {
        	player.scale.x *= -.7;
    	} else if(player.scale.x === -.7) {
    		player.scale.x *= -1;
    	}

        if(isPlayerTouchingFloor) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if(isPlayerTouchingFloor && !isAttacking) {
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
    if (cursors.up.isDown && player.body.touching.down && isPlayerTouchingFloor) {	    	
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