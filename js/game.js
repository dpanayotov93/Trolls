var settings = {
		width: window.innerWidth < 480 ? 480 : window.innerWidth,
		height: window.innerHeight - 32 < 320 ? 320 : window.innerHeight,
		tileSize: 128,
		playerSize: {
			iddle: {
				h: 264, //1056
				w: 179 // 715 
			},
			walk: {
				h: 295, // 1182
				w: 186 // 745
			}
		}
	};
var game = new Phaser.Game(settings.width, settings.height, Phaser.AUTO, '', {
		preload: preload,
		create: create,
		update: update,
		render: render
	});
var isAttacking = false;
var player, floor, cursors;

function preload() {
	// Setup for responsive resizing
	game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.canvas.style.width = '100%';
	game.canvas.style.height = '100%';
	game.scale.refresh();

	// Loading of assets
	game.load.image('bg_village', 'assets/backgrounds/village.jpg');
	game.load.image('tile_bot_start', 'assets/tilesets/tile_bot_start.png');
	game.load.image('tile_bot_mid', 'assets/tilesets/tile_bot_mid.png');
	game.load.image('tile_bot_end', 'assets/tilesets/tile_bot_end.png');
	game.load.image('tile_float_start', 'assets/tilesets/tile_float_start.png');
	game.load.image('tile_float_mid', 'assets/tilesets/tile_float_mid.png');
	game.load.image('tile_float_end', 'assets/tilesets/tile_float_end.png');
	game.load.image('tile_mid_start', 'assets/tilesets/tile_mid_start.png');
	game.load.image('tile_mid_mid', 'assets/tilesets/tile_mid_mid.png');
	game.load.image('tile_mid_end', 'assets/tilesets/tile_mid_end.png');
	game.load.spritesheet('troll_first_iddle', 'assets/sprites/troll_first/sprite_iddle_small.png', settings.playerSize.iddle.h, settings.playerSize.iddle.w);
	game.load.spritesheet('troll_first_walk', 'assets/sprites/troll_first/sprite_walk_small.png', settings.playerSize.iddle.h, settings.playerSize.iddle.w);
	game.load.spritesheet('troll_first_jump', 'assets/sprites/troll_first/sprite_jump_small.png', settings.playerSize.iddle.h, settings.playerSize.iddle.w);
	game.load.spritesheet('troll_first_attack', 'assets/sprites/troll_first/sprite_attack_small.png', settings.playerSize.iddle.h, settings.playerSize.iddle.w);
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
	createPlayer();
}

function update() {	
	// Collision check between the player and the floor
	var isPlayerTouchingFloor = game.physics.arcade.collide(player, floor);

	// Controls
    player.body.velocity.x = 0; // Reset the player velocity    

    if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = -500;

        console.log(player.scale.x);
		
        if(player.scale.x === 1) {
        	player.anchor.x = 0.5;
        	player.scale.x *= -1;
    	}		

		if(isPlayerTouchingFloor) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if (cursors.right.isDown) {
        //  Move to the right        
        player.body.velocity.x = 350;

        if(player.scale.x === -1) {
        	player.anchor.x = 0.5;
        	player.scale.x *= -1;
    	}

        if(isPlayerTouchingFloor) {
	        if(player.key !== 'troll_first_walk') {
	        	player.loadTexture('troll_first_walk');
	        }

	        player.animations.play('test');
    	}
    } else if(isPlayerTouchingFloor && !isAttacking) {
        // Play the iddle animation when not moving
        if(player.key !== 'troll_first_iddle') {
        	player.loadTexture('troll_first_iddle');
        }

        player.animations.play('test');    
    }
  
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && isPlayerTouchingFloor) {	
    	// Move the player up
        player.body.velocity.y = -750;        

        if(player.key !== 'troll_first_jump') {
        	player.loadTexture('troll_first_jump');
        }        
		console.log('Up is pressed');
        player.animations.play('test');        
    }

    // Attacking
    if(cursors.spacebar.isUp) {
    	isAttacking = false;
    }
    if(cursors.spacebar.isDown && !isAttacking) {
    	isAttacking = true;
        if(player.key !== 'troll_first_attack') {
        	player.loadTexture('troll_first_attack');
        }        
        console.log('Spacebar is pressed');
        player.animations.play('test');
    }        
}

function render() {
    // Sprite debug info
    // game.debug.spriteBounds(player);
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
	player = game.add.sprite(settings.tileSize, game.world.height - settings.playerSize.iddle.h * 1.15, 'troll_first_iddle'); // Create the player - 1.15 to start just above the floor
	game.physics.arcade.enable(player); // Enable physics for the player
	player.body.bounce.y = 0; // Vertical bounce force
    player.body.gravity.y = 2500; // Gravity force
    player.body.collideWorldBounds = true; // Enable collision with the world boundaries
    player.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true); // Create the iddle animation  
}