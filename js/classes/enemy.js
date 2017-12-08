class Enemy extends Unit {
	constructor(name, models, position, damage, speed, health, energy, charges) {
		super(name, models, position, damage, speed, health, energy);
		/* EXTENDED PROPERTIES */
		this.timings.reaction = 0;
		this.directionToPlayer = 0; // Used for AI movement algorythm			
		this.nextToHole = false; // Used for AI movement algorythm
		this.isInPlayerRange = false;			
		this.hasDrop = game.rnd.integerInRange(1, 4) === 1 ? true : false;
		this.emitter = null;
		this.info = {
			health: null,
			icon: null
		};

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

		if(this.gameObject.alive) {
			this.updateAI();
		}
	}

	updateAI() {
		this.directionToPlayer = this.getDirectionToPlayer(); // Set the direction of the enemy towards the player
		this.isInPlayerRange = this.checkRangeToPlayer();
		this.direction = this.getDirection();


		if(this.isInPlayerRange) {
			this.gameObject.body.velocity.setTo(0, 0); // If the enemy collides with the player set the enemy's X and Y velocity to 0				
			this.targets.add(game.player.gameObject);
			this.setState('attacking');
			this.swapModel('enemy_first_attack');				
			this.gameObject.animations.play('attack');
		} else {
			this.chase();
		}
	}

	getDirectionToPlayer() {
		if (this.gameObject.position.x - game.player.gameObject.position.x < 0) {
			return 1; 
		} else {
			return 0;
		}
	}

	getDirection() {
		if(this.directionToPlayer === 1 ) {
			return 1;
		} else {
			return -1;
		}
	}

	checkRangeToPlayer() {
		if (Math.abs(this.gameObject.position.x - game.player.gameObject.position.x) < 150) {
			return true;
		} else {
			return false;
		}
	}

	// TODO: Rework that - it sucks now
	checkRangeToHole() {
		let nextToHole = false;

		for(const position of game.level.platforms.positions) {
			let distanceToHole = 15;

			if (this.directionToPlayer === 0) {
				distanceToHole = 100;
			}

			if (Math.abs(this.gameObject.position.x - position[this.directionToPlayer]) < distanceToHole) {
				nextToHole = true; 
			}
		}

		return nextToHole;
	}

	chase() {
		this.nextToHole = this.checkRangeToHole();

		// Move the enemy towards the player if not next to a hole and if standing on the ground
		if (!this.nextToHole) {
			if (game.time.now > this.timings.reaction  && this.gameObject.body.touching.down) {
				this.timings.reaction = game.time.now + 500; // Leave a threshold time for the reaction
				this.setState('moving');
				this.swapModel('enemy_first_walk');
				this.gameObject.animations.play('current');
				game.physics.arcade.moveToObject(this.gameObject, game.player.gameObject, 65 * this.speed);
			}
		} else {
			if (this.gameObject.body.touching.down) {
				this.gameObject.body.velocity.setTo(0, 0); // If next to a hole and touching the ground set the enemy's X and Y velocity to 0
				this.setState('iddle');
				this.swapModel('enemy_first_iddle');
				this.gameObject.animations.play('current');
			} else {
				this.gameObject.body.velocity.setTo(0, this.gameObject.body.velocity.y); // If next to a hole and not touching the ground set the enemy's X velocity to 0
			}
		}
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
				game.player.states['interacting'] = true;
			}, this);
			drop.events.onInputOut.add(function(){
				game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
				game.player.states['interacting'] = false;
			}, this);			
			drop.events.onInputDown.add(function(){
				game.canvas.style.cursor = "url(assets/ui/cursor_over.png, auto";
				game.player.health.current += game.rnd.integerInRange(10, 40); // TODO: Remove the constant
				game.player.states['interacting'] = false;
				drop.destroy();
			}, this);					
		}
	}
}