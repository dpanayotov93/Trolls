class Enemy {
	constructor(id, position) {
		this._id = id;		
		this.position = position;
		this.gameObject = game.level.enemies.gameObjects.create(this.position, 0, 'enemy_first_iddle');
		this.damage = 5;
		this.updateTime = 0;
		this.directionToPlayer = 0;			
		this.touchingPlatforms = false;
		this.nextToHole = false; // Used for AI movement algorythm
		this.isInPlayerRange = false;						
		this.health = {
			max: 100,
			current: 100
		};
		this.animations = {
			attack: null
		};
	}

	create() {
		let damage = this.damage; // TODO: Fix this in the animation onComplete event ...
		this.gameObject.name = 'Enemy ' + this._id;
		this.gameObject.instance = this;		

		this.gameObject.body.enable = true;
		this.gameObject.body.bounce.y = 0; // Vertical bounce force
		this.gameObject.body.gravity.y = 2500; // Gravity force
		this.gameObject.body.collideWorldBounds = true; // Enable collision with the world boundaries		
		this.gameObject.outOfBoundsKill = true;
		this.gameObject.scale.x *= -1;
		this.gameObject.anchor.x = .5; // Set the X anchor point to the center of the body
		this.gameObject.body.setSize(settings.playerSize.w - 48, settings.playerSize.h * 2 / 3, 10, 0); // Update the sprite bounds to match the actual physical body		

		this.gameObject.animations.add('test', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, true); // Create the iddle animation  
		this.animations.attack = this.gameObject.animations.add('attack', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 12.5, false); // Create the attack animation  
		this.animations.attack.onComplete.add(function() {
			game.player.recieveDmg(damage);	
		});

		game.physics.arcade.enable(this.gameObject);
	}

	update() {
		let newDirectionToPlayer = 0;		 		

		if(this.health.current <= 0) {
			this.kill();
			return;
		}	

		this.touchingPlatforms = game.physics.arcade.collide(this.gameObject, game.level.platforms.gameObjects);; // Collision check between the enemies and the platforms	

		// Check if the player is located to the left or to the right of the enemy
		if (this.gameObject.position.x - game.player.gameObject.position.x > 0) {
			newDirectionToPlayer = 0; // If enemy's X is higher than the player then the player is to the left
		} else {
			newDirectionToPlayer = 1; // If enemy's X is lower than the player then the player is to the right
		}

		if (this.directionToPlayer !== newDirectionToPlayer) {
			this.gameObject.scale.x *= -1; // Flip the sprite horizontally    		
			this.nextToHole = false; // If the player changes direction  then set the enemy to be no longer locked to "next to a hole" state
		}

		this.directionToPlayer = newDirectionToPlayer; // Set the direction of the enemy towards the player

		this.checkRangeToPlayer();

		if (!this.isInPlayerRange) {
			this.move();
		}
	}

	checkRangeToPlayer() {
		if (Math.abs(this.gameObject.position.x - game.player.gameObject.position.x) < 150) {
			this.isInPlayerRange = true;
		} else {
			this.isInPlayerRange = false;
		}

		if (this.isInPlayerRange) {
			this.gameObject.body.velocity.setTo(0, 0); // If the enemy collides with the player set the enemy's X and Y velocity to 0
			this.attack();
		}
	}

	move() {
		// Move towards the player if not next to a hole between them		
		for (var i = 0; i < game.level.platforms.positions.length; i += 1) {
			var distanceToHole; // Used to determine the distance between the sprite nad the hole depending on the direction

			if (this.directionToPlayer === 0) {
				distanceToHole = 120;
			} else {
				distanceToHole = 5;
			}

			if (Math.abs(this.gameObject.position.x - game.level.platforms.positions[i][this.directionToPlayer]) < distanceToHole) {
				this.nextToHole = true; // If the enemy is 5 pixels away from the hole lock him into a "next to a hole" state
			}
		}

		// Move the enemy towards the player if not next to a hole and if standing on the ground
		if (!this.nextToHole && this.gameObject.body.touching.down) {
			if (game.time.now > this.updateTime) {
				this.updateTime = game.time.now + 500; // Leave a threshold time for the reaction

				if (this.gameObject.key !== 'enemy_first_walk') {
					this.gameObject.loadTexture('enemy_first_walk');
				}

				this.gameObject.animations.play('test');


				game.physics.arcade.moveToObject(this.gameObject, game.player.gameObject, 500);
			}
		} else {
			if (this.gameObject.body.touching.down) {
				this.gameObject.body.velocity.setTo(0, 0); // If next to a hole and touching the ground set the enemy's X and Y velocity to 0

				if (this.gameObject.key !== 'enemy_first_iddle') {
					this.gameObject.loadTexture('enemy_first_iddle');
				}

				this.gameObject.animations.play('test');
			} else {
				this.gameObject.body.velocity.setTo(0, this.gameObject.body.velocity.y); // If next to a hole and not touching the ground set the enemy's X velocity to 0
			}
		}
	}

	attack() {
		if (this.gameObject.key !== 'enemy_first_attack') {
			this.gameObject.loadTexture('enemy_first_attack');
		}

		// this.animations.attack = 
		this.gameObject.animations.play('attack');		
	}

	recieveDmg(dmg) {
		if(this.health.current > 0) {
			this.health.current -= dmg;
		}	
	}

	resetTint() {
		this.gameObject.tint = 0xffffff;
	}

	kill() {
		let index = game.level.enemies.gameObjects.children.indexOf(this.gameObject);

		game.level.enemies.gameObjects.remove(this.gameObject);
		game.level.enemies.list.splice(index, 1);
			
		index = game.player.targets.indexOf(this.gameObject);		
		game.player.targets.splice(index, 1);	

		this.gameObject.destroy();
		game.player.score.enemies += 1;			
	}
}