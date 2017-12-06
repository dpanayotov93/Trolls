class Player extends Unit {
	constructor(name, model, position, damage, health, energy, charges) {
		super(name, model, position, damage, health, energy);

		/* PROPERTY EXTENSIONS */
		this.energy.costs.sprinting = 2.5;
		this.states.interacting = false;

		/* PROPERTIES */
		this.skills = {
			lightning: {
				element: null,
				animation: null,
				damage: 50
			}
		};					
		this.charges = charges;	
		this.targetsQueue = [];
		this.targets = [];		
		this.score = {
			buildings: 0,
			enemies: 0
		};
		/* Initialization method */
		this.create(); 
	}

	/* METHODS */
	create() {
		super.create();
		this.configureSprite(); 
		this.configureEvents();

		// Custom keyboard hotkeys
		game.keyboard.spacebar.onUp.add(function() {
			game.player.setState('iddle');
		});
		game.keyboard.spacebar.onDown.add(function() {
			if(game.player.energy.current >= game.player.energy.costs.attacking) {
				game.player.setState('attacking');
			}
		});

		// SKILL
		game.input.onDown.add(function(pointer) {			
			if(game.player.skills.lightning.element === null && game.player.charges > 0 && !game.player.states.interacting) {
				console.log(pointer);
				let x = pointer.positionDown.x + game.camera.x + 15; // TODO: Fix that damn constant
				let y = pointer.positionDown.y;

				game.player.skills.lightning.element = game.add.sprite(x, y, 'lightning_bolt');
				let animation = null;

				game.player.skills.lightning.element.anchor.x = .5;
				game.player.skills.lightning.element.anchor.y = 0;
				game.player.skills.lightning.animation = game.player.skills.lightning.element.animations.add('strike', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 64, false);
				game.player.skills.lightning.animation.enableUpdate = true;
				game.player.skills.lightning.animation.onComplete.add(function() {
					let centerPoint = new Phaser.Point(game.player.skills.lightning.element.position.x, game.player.skills.lightning.element.position.y + game.player.skills.lightning.element.height);
					let triggerRadius = 250;

					game.level.enemies.gameObjects.forEachAlive(function(enemy) {  
						if(Phaser.Math.distance(enemy.x, enemy.y, centerPoint.x, centerPoint.y) <= triggerRadius) {   
							enemy.instance.recieveDmg(game.player.skills.lightning.damage);
						}
					});
					game.level.buildings.gameObjects.forEachAlive(function(building) {  
						if(Phaser.Math.distance(building.x, building.y, centerPoint.x, centerPoint.y) <= triggerRadius) {   
							building.instance.recieveDmg(game.player.skills.lightning.damage);
						}
					});					

					game.player.skills.lightning.element.destroy();
					game.player.skills.lightning.element = null;
					game.player.skills.lightning.animation = null;
				});
				game.player.skills.lightning.animation.onUpdate.addOnce(function() {
					if(game.player.skills.lightning.element !== null && game.player.skills.lightning.element.alive) {
						game.player.skills.lightning.element.position.y += 20;
						game.player.charges -= 1;
						if(game.ui.charges.icon[game.player.charges].full.alive) {				
							game.ui.charges.icon[game.player.charges].full.destroy();
						}
					}
				});
				
				game.player.skills.lightning.element.animations.play('strike');
			}
		}, this);

		// Create a canera that follow the player;
		game.camera.follow(this.gameObject, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

		// Tint the player to a bit darker color (Cos I like it)
		this.gameObject.tint = -13027015;
	}

	configureSprite() {
		// Enable physics for the player	
		game.physics.arcade.enable(this.gameObject);	

		// Sprite settings
		this.gameObject.body.bounce.y = 0; // Vertical bounce force
		this.gameObject.body.gravity.y = 2500; // Gravity force
		this.gameObject.body.collideWorldBounds = true; // Enable collision with the world boundaries	    
		this.gameObject.outOfBoundsKill = true; // A switch for just in case to kill the player if it goes out of bounds
		this.gameObject.anchor.x = 0.5; // Set the X anchor point to the center of the body
		this.gameObject.body.setSize(settings.playerSize.w - 64, settings.playerSize.h * 2 / 3, 15, 0); // Update the sprite bounds to match the actual physical body    			    
		this.gameObject.body.stopVelocityOnCollide = false; // Resets the velocity to 0 when colliding with anything
		this.gameObject.animations.add('current', null, 15, true); // Create the iddle animation  		
	}

	configureEvents() {
		this.animations.attack = this.gameObject.animations.add('attack', null, 10, false);
		this.animations.attack.onComplete.add(function() {
			game.player.attack(game.player.targets);
			game.player.loseEnergy(game.player.energy.costs.attacking);			
		});

		this.gameObject.body.onMoveComplete = new Phaser.Signal();
		this.gameObject.body.onMoveComplete.add(function(e) {
			game.player.targets = game.player.targetsQueue.slice();
			game.player.targetsQueue = [];			
		});
	}

	update() {
		this.checkDeath();
		this.checkCollisions();
		this.updateControls();
		this.updateTargets();
	}

	updateControls() {
		// Reset the player horizontal velocity
		this.gameObject.body.velocity.x = 0;

		// ATTACK
		if((this.states.attacking || game.controler.attack) && this.energy.current > 0) {
			this.swapModel('troll_first_attack');			
			this.gameObject.animations.play('attack');
		} else {
		// MOVE - LEFT
			if(game.keyboard.left.isDown || game.controler.move.left) {
				if(game.keyboard.left.shiftKey && game.player.energy.current >= game.player.energy.costs.sprinting) { // TODO: Imeplemnt controler 					
					this.gameObject.body.moveTo(300, 500, 180);
					this.loseEnergy(this.energy.costs.sprinting);				
				} else {
					this.gameObject.body.moveTo(1000, 500, 180);
				}

				this.setState('moving');
				this.gameObject.scale.x = Math.abs(this.gameObject.scale.x) * -1; 

				if (this.states.grounded) {
					this.swapModel('troll_first_walk');
					this.gameObject.animations.play('current');
				}
		// MOVE - RIGHT		
			} else if(game.keyboard.right.isDown || game.controler.move.right) { // Right arrow key      
				if(game.keyboard.right.shiftKey && game.player.energy.current >= game.player.energy.costs.sprinting) { // TODO: Imeplemnt controler 
					this.gameObject.body.moveTo(300, 500, 0);
					this.loseEnergy(this.energy.costs.sprinting);
				} else {
					this.gameObject.body.moveTo(1000, 500, 0);
				}

				this.setState('moving');
				this.gameObject.scale.x = Math.abs(this.gameObject.scale.x);

				if (this.states.grounded) {
					this.swapModel('troll_first_walk');
					this.gameObject.animations.play('current');
				}
			} else if (this.states.grounded && !this.states.attacking) {
		// IDDLE		
				this.swapModel('troll_first_iddle');
				this.setState('iddle');
				this.gameObject.animations.play('current');
			}

		// JUMP
			if((game.keyboard.up.isDown || game.controler.jump) && this.gameObject.body.touching.down && this.states.grounded && this.energy.current >= this.energy.costs.jumping) {
				this.gameObject.body.moveTo(1000, 750, -90);
				this.swapModel('troll_first_jump');
				this.setState('jumping');
				this.gameObject.animations.play('current');

				this.loseEnergy(this.energy.costs.jumping);
			}
		}
	}

	// TODO: Update after refactoring Enemy and Building
	updateTargets() {
		for(const building of game.level.buildings.list) {
			if(!this.targets.contains(building.gameObject)) {
				// building.updateGUI();
				if(building.info.health !== null) {
					building.info.health.setText('');
				}

				if(building.info.icon !== null) {
					building.info.icon.visible = false;
				}				
			}
		}

		for(const enemy of game.level.enemies.list) {
			if(!this.targets.contains(enemy.gameObject)) {
				// enemy.updateGUI();
				if(enemy.info.health !== null) {
					enemy.info.health.setText('');
				}

				if(enemy.info.icon !== null) {
					enemy.info.icon.visible = false;
				}
			}
		}			
	}

	kill() {
		super.kill();
		game.state.start('End');
	}

	checkOverlapWithGroup(group) {
		for (const item of group) {
			if (this.overlaps(item)) {
				let hitArea = this.gameObject.position.x + (this.gameObject.getBounds().width / 2 * this.gameObject.scale.x);
				let isOnTheRight = this.gameObject.scale.x > 0 && this.gameObject.position.x < item.position.x && hitArea > item.position.x;
				let isOnTheLeft = this.gameObject.position.x > item.position.x && hitArea < item.position.x + settings.towerSize.w;

				if((isOnTheRight || isOnTheLeft) && !this.targetsQueue.contains(item)) {
					this.targetsQueue.push(item);
				} else if(!(isOnTheRight || isOnTheLeft) && this.targetsQueue.contains(item)) {
					this.targets.splice(item);
				}

			}
		}
	}

	checkCollisions() {
		this.states.grounded = game.physics.arcade.collide(this.gameObject, game.level.platforms.gameObjects); 
		this.checkOverlapWithGroup(game.level.buildings.gameObjects.children);
		this.checkOverlapWithGroup(game.level.enemies.gameObjects.children);
	}
}