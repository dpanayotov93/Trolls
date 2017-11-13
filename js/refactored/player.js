class Player {
	constructor() {		
		this.gameObject = null;
		this.target = null;
		this.moving = false;
		this.attacking = false;
		this.health = 100;
		this.energy = 100;
		this.damage = 20;
		this.targetsQueue = [];
		this.targets = [];
		this.touching = {
			platforms: false,
			buildings: false
		};
		this.animations = {
			attack: null
		};
		this.score = {
			buildings: 0,
			enemies: 0
		}
	}

	setup(x, y) {
		// Create the sprite
		this.gameObject = game.add.sprite(x, y, 'troll_first_iddle'); // Create the player
		game.physics.arcade.enable(this.gameObject); // Enable physics for the player		

		// Sprite settings
		this.gameObject.body.bounce.y = 0; // Vertical bounce force
		this.gameObject.body.gravity.y = 2500; // Gravity force
		this.gameObject.body.collideWorldBounds = true; // Enable collision with the world boundaries	    
		this.gameObject.outOfBoundsKill = true; // A switch for just in case to kill the player if it goes out of bounds
		this.gameObject.maxHealth = 100; // Maximum player health
		this.gameObject.anchor.x = 0.5; // Set the X anchor point to the center of the body
		this.gameObject.body.setSize(settings.playerSize.w - 64, settings.playerSize.h * 2 / 3, 15, 0); // Update the sprite bounds to match the actual physical body    			    
		this.gameObject.body.stopVelocityOnCollide = false;
		this.gameObject.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true); // Create the iddle animation  

		// Events
		this.animations.attack = this.gameObject.animations.add('attack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, false); // Create the attacl animation  
		this.animations.attack.onComplete.add(function() {
			game.player.attack();
			game.player.energy -= 10;
			ui.energybarCropArea = new Phaser.Rectangle(0, 0, ui.energybarEmpty.width * game.player.energy / 100, ui.energybarFull.height);
			ui.energybarFull.crop(ui.energybarCropArea);			
		});
		this.gameObject.body.onMoveComplete = new Phaser.Signal();
		this.gameObject.body.onMoveComplete.add(function(e) {
			game.player.targets = game.player.targetsQueue.slice();
			game.player.targetsQueue = [];
		});

		// Custom keyboard hotkeys
		cursors.spacebar.onUp.add(function() {
			game.player.attacking = false;
		});
		cursors.spacebar.onDown.add(function() {
			game.player.attacking = true;
		});

		// Create a canera that follow the player;
		game.camera.follow(this.gameObject, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
	}

	update() {
		this.checkDeath();
		this.checkCollisions();
		this.updateControls();
	}

	updateControls() {
		this.gameObject.body.velocity.x = 0; // Reset the player velocity    		

		if (this.attacking && this.energy > 0) {
			if (player.scale.x > 0) {
				this.gameObject.scale.x = 1;
			} else {
				this.gameObject.scale.x = -1;
			}

			if (player.key !== 'troll_first_attack') {
				this.gameObject.loadTexture('troll_first_attack');
			}

			this.gameObject.animations.play('attack');
		} else {
			resetEnemyTint(); // TODO: Move this after refactoring to the Game object
			if (cursors.left.isDown) { // Left arrow key
				this.gameObject.body.moveTo(1000, 500, 180);
				this.gameObject.scale.x = -1; // Flip the sprite horizontally 

				if (this.touching.platforms) {
					// If the player is touching the ground set the sprite to the walking one
					if (this.gameObject.key !== 'troll_first_walk') {
						this.gameObject.loadTexture('troll_first_walk');
					}

					this.gameObject.animations.play('test');
				}
			} else if (cursors.right.isDown) { // Right arrow key      
				this.gameObject.body.moveTo(1000, 500, 0);
				this.gameObject.scale.x = 1;

				if (this.touching.platforms) {
					if (this.gameObject.key !== 'troll_first_walk') {
						this.gameObject.loadTexture('troll_first_walk');
					}

					this.gameObject.animations.play('test');
				}
			} else if (this.touching.platforms && !this.attacking) {
				// Play the iddle animation when not moving	   
				if (this.gameObject.key !== 'troll_first_iddle') {
					this.gameObject.loadTexture('troll_first_iddle');
				}

				this.gameObject.animations.play('test');
			}

			if (cursors.up.isDown && this.gameObject.body.touching.down && this.touching.platforms) {
				//  Allow the player to jump if they are touching the ground.   
				this.gameObject.body.moveTo(1000, 750, -90);

				// Flip the sprite horizontally if it's looking in the wrong direction
				if (this.gameObject.scale.x > 0) {
					this.gameObject.scale.x = 1;
				} else {
					this.gameObject.scale.x = -1;
				}

				if (this.gameObject.key !== 'troll_first_jump') {
					this.gameObject.loadTexture('troll_first_jump');
				}

				this.gameObject.animations.play('test');
			}
		}
	}

	attack() {
		if (this.targets.length > 0) {
			for (var i = 0; i < this.targets.length; i += 1) {
				var target = this.targets[i];
				target.health -= this.damage;
				game.log(target.name + ' health:', target.health);

				if (target.name.indexOf('Building') !== -1) {
					target.frame += 1;
				} else if (target.name.indexOf('Enemy') !== -1) {
					target.tint = 0x666666;
				}

				if (target.health === 0) {
					var index = this.targets.indexOf(target);
					this.targets.splice(index, 1);
					game.log('Killed: ', target.name);
					if (target.name.indexOf('Building') !== -1) {
						buildings.remove(target);
						this.score.buildings += 1;
					} else if (target.name.indexOf('Enemy') !== -1) {
						enemies.remove(target);
						this.score.enemies += 1;
					}

					target.destroy();
				}
			}
		}
	}

	checkCollisions() {
		var hasBuildingIntersections;
		var hasUEnemyIntersections;
		this.touching.platforms = game.physics.arcade.collide(this.gameObject, platforms); // Collision check between the player and the platform		

		for (var i = 0; i < buildings.children.length; i += 1) {
			var building = buildings.children[i];
			var intersect = this.overlaps(building);

			if (intersect) {
				hasBuildingIntersections = true;

				if (this.gameObject.position.x + (game.player.gameObject.getBounds().width / 4 * this.gameObject.scale.x) > building.position.x) {
					if (!this.targetsQueue.contains(building)) {
						this.targetsQueue.push(building);
					}
				} else {
					if (this.targets.contains(building)) {
						var index = this.targets.indexOf(building);
						this.targets.splice(building);
					}
				}
			}
		}

		for (var i = 0; i < enemies.children.length; i += 1) {
			var enemy = enemies.children[i];
			var intersect = this.overlaps(enemy);

			if (intersect) {
				hasUEnemyIntersections = true;

				if (this.gameObject.position.x + (game.player.gameObject.getBounds().width / 4 * this.gameObject.scale.x) > enemy.position.x) {
					if (!this.targetsQueue.contains(enemy)) {
						this.targetsQueue.push(enemy);
					}
				} else {
					if (this.targets.contains(enemy)) {
						var index = this.targets.indexOf(enemy);
						this.targets.splice(enemy);
					}
				}
			}
		}

		// Reset the values
		hasUEnemyIntersections = false;
		hasBuildingIntersections = false;
	}

	overlaps(object) {
		var boundsThis = this.gameObject.getBounds();
		var boundsObject = object.getBounds();
		var isOverlapping = Phaser.Rectangle.intersects(boundsThis, boundsObject);

		return isOverlapping;
	}

	checkDeath() {
		if (this.gameObject.position.y > game.world.bottom - this.gameObject.height * 1.75) { // TODO: Why 1.75 works?
			this.gameObject.kill();
			game.log('Calling state: ', 'End');
			game.state.start('End');
		}
	}
}