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
		this.timings = {
			resetTint: .5
		}
		this.score = {
			buildings: 0,
			enemies: 0
		};
	}

	init(x, y) {
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
		});
		this.gameObject.body.onMoveComplete = new Phaser.Signal();
		this.gameObject.body.onMoveComplete.add(function(e) {
			game.player.targets = game.player.targetsQueue.slice();
			game.player.targetsQueue = [];
		});

		// Custom keyboard hotkeys
		game.keyboard.spacebar.onUp.add(function() {
			game.player.attacking = false;
		});
		game.keyboard.spacebar.onDown.add(function() {
			game.player.attacking = true;
		});

		// Create a canera that follow the player;
		game.camera.follow(this.gameObject, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

		// Tint the player to a bit darker color
		this.gameObject.tint = -13027015;
	}

	update() {
		this.checkDeath();
		this.checkCollisions();
		this.updateControls();
	}

	updateControls() {
		this.gameObject.body.velocity.x = 0; // Reset the player velocity    		

		if (this.attacking && this.energy > 0) {
			if (this.gameObject.scale.x > 0) {
				this.gameObject.scale.x = 1;
			} else {
				this.gameObject.scale.x = -1;
			}

			if (this.gameObject.key !== 'troll_first_attack') {
				this.gameObject.loadTexture('troll_first_attack');
			}

			this.gameObject.animations.play('attack');
		} else {
			resetEnemyTint(); // TODO: Move this after refactoring to the Game object
			if (game.keyboard.left.isDown) { // Left arrow key
				this.gameObject.body.moveTo(1000, 500, 180);
				this.gameObject.scale.x = -1; // Flip the sprite horizontally 

				if (this.touching.platforms) {
					// If the player is touching the ground set the sprite to the walking one
					if (this.gameObject.key !== 'troll_first_walk') {
						this.gameObject.loadTexture('troll_first_walk');
					}

					this.gameObject.animations.play('test');
				}
			} else if (game.keyboard.right.isDown) { // Right arrow key      
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

			if (game.keyboard.up.isDown && this.gameObject.body.touching.down && this.touching.platforms) {
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
			for (let i = 0; i < this.targets.length; i += 1) {
				let target = this.targets[i];							

				console.warn(target.name);
				if (target.name.indexOf('Building') !== -1) {
					target.instance.recieveDmg(this.damage);
					target.frame += 1;
				} else if (target.name.indexOf('Enemy') !== -1) {
					target.health -= this.damage;
					target.tint = 0x666666;
				}

				game.log(target.name + ' health:', target.health);

				if (target.name.indexOf('Enemy') !== -1) {
					if (target.health <= 0) {
						let index = this.targets.indexOf(target);
						this.targets.splice(index, 1);				    
						enemies.remove(target);
						
						this.score.enemies += 1;					
						target.destroy();
					}
				}
			}
		}
	}

	recieveDmg(dmg) {
		this.flash();
		this.health -= dmg;
	}

	checkCollisions() {
		let hasBuildingIntersections;
		let hasUEnemyIntersections;
		this.touching.platforms = game.physics.arcade.collide(this.gameObject, game.level.platforms.gameObjects); // Collision check between the player and the platform		

		for (let i = 0; i < game.level.buildings.gameObjects.children.length - 1; i += 1) {
			let building = game.level.buildings.gameObjects.children[i];
			if(building === undefined) debugger;
			let intersect = this.overlaps(building);

			if (intersect) {
				hasBuildingIntersections = true;

				if (this.gameObject.position.x + (game.player.gameObject.getBounds().width / 4 * this.gameObject.scale.x) > building.position.x) {
					if (!this.targetsQueue.contains(building)) {
						this.targetsQueue.push(building);
					}
				} else {
					if (this.targets.contains(building)) {
						let index = this.targets.indexOf(building);
						this.targets.splice(building);
					}
				}
			}
		}

		for (let i = 0; i < enemies.children.length; i += 1) {
			let enemy = enemies.children[i];
			let intersect = this.overlaps(enemy);

			if (intersect) {
				hasUEnemyIntersections = true;

				if (this.gameObject.position.x + (game.player.gameObject.getBounds().width / 4 * this.gameObject.scale.x) > enemy.position.x) {
					if (!this.targetsQueue.contains(enemy)) {
						this.targetsQueue.push(enemy);
					}
				} else {
					if (this.targets.contains(enemy)) {
						let index = this.targets.indexOf(enemy);
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
		let boundsThis = this.gameObject.getBounds();
		if(object === undefined) debugger;
		let boundsObject = object.getBounds();
		let isOverlapping = Phaser.Rectangle.intersects(boundsThis, boundsObject);

		return isOverlapping;
	}

	checkDeath() {
		if (this.gameObject.position.y > game.world.bottom - this.gameObject.height * 1.75) { // TODO: Why 1.75 works?
			this.gameObject.kill();
			game.log('Calling state: ', 'End');
			game.state.start('End');
		}
	}

	flash() {
		let startColor = 0x333333;
		let endColor = 0xffffff;
		let colorBlend = {
			step: 0
		};
		let colorTween = game.add.tween(colorBlend).to({ // Create the tween on this object and tween its step property to 100   
			step: 100
		}, 500);

		// Run the interpolateColor function every time the tween updates, feeding it the updated value of our tween each time, and set the result as our tint    		
		colorTween.onUpdateCallback(function() {
			game.player.gameObject.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
		}); 
		
		this.gameObject.tint = startColor;
		colorTween.start();

		// Reverse the effect
		colorBlend = {
			step: 0
		};

		colorTween = game.add.tween(colorBlend).to({
			step: 100
		}, 500);

		colorTween.onUpdateCallback(function() {
			game.player.gameObject.tint = Phaser.Color.interpolateColor(endColor, startColor, 100, colorBlend.step);
		}); 
		
		this.gameObject.tint = endColor;
		colorTween.start();				
	}
}