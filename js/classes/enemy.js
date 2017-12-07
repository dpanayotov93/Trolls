class Enemy extends Unit {
	constructor(name, models, position, damage, speed, health, energy, charges) {
		super(name, models, position, damage, speed, health, energy);
		/* EXTENDED PROPERTIES */
		this.updateTime = 0;
		this.directionToPlayer = 0;			
		this.nextToHole = false; // Used for AI movement algorythm
		this.isInPlayerRange = false;			
		this.hasDrop = game.rnd.integerInRange(1, 4) === 1 ? true : false;
		this.info = {
			health: null,
			icon: null
		};
		this.emitter = null;

		this.create();
	}

	create() {
		super.create();
			
		this.configureSprite();
		this.configureEvents();

		this.direction = -1;

		this.emitter = game.add.emitter(0, 0, 100);
		this.emitter.makeParticles('blood');
		this.emitter.gravity = 500;			
	}

	update() {
		super.update();
		super.checkCollisions();

		this.gameObject.scale.x = Math.abs(this.gameObject.scale.x) * this.direction; 

		let newDirectionToPlayer = 0;

		// Check if the player is located to the left or to the right of the enemy
		if (this.gameObject.position.x - game.player.gameObject.position.x > 0) {
			newDirectionToPlayer = 0; // If enemy's X is higher than the player then the player is to the left
			this.direction = -1;
		} else {
			newDirectionToPlayer = 1; // If enemy's X is lower than the player then the player is to the right
			this.direction = 1;
		}

		if (this.directionToPlayer !== newDirectionToPlayer) {
			this.nextToHole = false; // If the player changes direction  then set the enemy to be no longer locked to "next to a hole" state
		}

		this.directionToPlayer = newDirectionToPlayer; // Set the direction of the enemy towards the player
		this.checkRangeToPlayer();

		if (!this.isInPlayerRange) {
			this.chase();
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

	chase() {
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
				
				this.swapModel('enemy_first_walk');
				this.gameObject.animations.play('current');


				game.physics.arcade.moveToObject(this.gameObject, game.player.gameObject, 500);
			}
		} else {
			if (this.gameObject.body.touching.down) {
				this.gameObject.body.velocity.setTo(0, 0); // If next to a hole and touching the ground set the enemy's X and Y velocity to 0

				this.swapModel('enemy_first_iddle');
				this.gameObject.animations.play('current');
			} else {
				this.gameObject.body.velocity.setTo(0, this.gameObject.body.velocity.y); // If next to a hole and not touching the ground set the enemy's X velocity to 0
			}
		}
	}

	attack() {
		super.attack([game.player.gameObject]);
		this.swapModel('enemy_first_attack');
		this.gameObject.animations.play('attack');		
	}

	recieveDmg(dmg) {
		super.recieveDmg(dmg);	
		this.emitter.position.setTo(this.gameObject.x, this.gameObject.y + settings.playerSize.h / 2);
		this.emitter.start(true, 500, null, 15);		
	}

	kill() {
		let index = game.level.enemies.gameObjects.children.indexOf(this.gameObject);

		game.level.enemies.gameObjects.remove(this.gameObject);
		game.level.enemies.list.splice(index, 1);
		game.level.enemies.gameObjects.remove(this.gameObject);		
			
		game.player.targets.delete(this.gameObject);		

		if(this.info.health !== null) {
			this.info.health.destroy();
		}

		if(this.info.icon !== null) {
			this.info.icon.destroy();
		}

		game.player.score.enemies += 1;	

		this.dropItem();
		this.gameObject.destroy();
	}

	dropItem() {
		if(this.hasDrop) {
			let drop = game.add.button(this.gameObject.x, game.height - settings.tileSize , 'potion_health');
			drop.width *= .5;
			drop.height *= .5;
			drop.anchor.x = 1;
			drop.anchor.y = 1;

			drop.events.onInputOver.add(function(){
				game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
				game.player.setState('interacting');
			}, this);
			drop.events.onInputOut.add(function(){
				game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
			}, this);			
			drop.events.onInputDown.add(function(){
				game.canvas.style.cursor = "url(assets/ui/cursor_over.png, auto";
				game.player.health.current += game.rnd.integerInRange(10, 40); // TODO: Remove the constant
				drop.destroy();
			}, this);					
		}
	}
}