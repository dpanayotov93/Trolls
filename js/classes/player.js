class Player {
	constructor() {
		this.gameObject = null;
		this.target = null;
		this.moving = false;
		this.attacking = false;
		this.touchingPlatforms = false;
		this.damage = 20;
		this.targetsQueue = [];
		this.targets = [];		
		this.charges = game.ui.charges.icon.length;	
		this.skills = {
			lightning: {
				element: null,
				animation: null,
				damage: 50
			}
		};
		this.health = {
			max: 100,
			current: 100
		};
		this.energy = {
			max: 100,
			current: 100,
			loss: {
				sprint: 2.5,
				jump: 5,				
				attack: 10
			}
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
			let value = game.player.energy.loss.attack;			

			game.player.attack();

			if(game.player.energy.current - value < 0) {
				value = game.player.energy.current;
			}

			game.player.energy.current -= value;
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
			if(game.player.energy.current >= game.player.energy.loss.attack) {
				game.player.attacking = true;
			}
		});

		game.input.onDown.add(function(pointer) {
			if(game.player.skills.lightning.element === null && game.player.charges > 0) {
				let x = pointer.positionDown.x + 15; // TODO: Fix that damn constant
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

		// Tint the player to a bit darker color
		this.gameObject.tint = -13027015;
	}

	update() {
		this.checkDeath();
		this.checkCollisions();
		this.updateControls();
		this.updateTargets();
	}

	updateControls() {
		this.gameObject.body.velocity.x = 0; // Reset the player velocity    		

		if ((this.attacking  || game.controler.attack) && this.energy.current > 0) {
			if (this.gameObject.key !== 'troll_first_attack') {
				this.gameObject.loadTexture('troll_first_attack');
			}

			this.gameObject.animations.play('attack');
		} else {
			if (game.keyboard.left.isDown || game.controler.move.left) { // Left arrow key
				if(game.keyboard.left.shiftKey && game.player.energy.current >= game.player.energy.loss.sprint) { // TODO: Imeplemnt controler 					
					let value = game.player.energy.loss.sprint;			

					this.gameObject.body.moveTo(300, 500, 180);

					if(game.player.energy.current - value < 0) {
						value = game.player.energy.current;
					}

					game.player.energy.current -= value;					
				} else {
					this.gameObject.body.moveTo(1000, 500, 180);
				}

				this.gameObject.scale.x = Math.abs(this.gameObject.scale.x) * -1; // Flip the sprite horizontally 

				if (this.touchingPlatforms) {
					// If the player is touching the ground set the sprite to the walking one
					if (this.gameObject.key !== 'troll_first_walk') {
						this.gameObject.loadTexture('troll_first_walk');
					}

					this.gameObject.animations.play('test');
				}
			} else if (game.keyboard.right.isDown || game.controler.move.right) { // Right arrow key      
				if(game.keyboard.right.shiftKey && game.player.energy.current >= game.player.energy.loss.sprint) { // TODO: Imeplemnt controler 
					let value = game.player.energy.loss.sprint;			

					this.gameObject.body.moveTo(300, 500, 0);

					if(game.player.energy.current - value < 0) {
						value = game.player.energy.current;
					}

					game.player.energy.current -= value;		
				} else {
					this.gameObject.body.moveTo(1000, 500, 0);
				}

				this.gameObject.scale.x = Math.abs(this.gameObject.scale.x);

				if (this.touchingPlatforms) {
					if (this.gameObject.key !== 'troll_first_walk') {
						this.gameObject.loadTexture('troll_first_walk');
					}

					this.gameObject.animations.play('test');
				}
			} else if (this.touchingPlatforms && !this.attacking) {
				// Play the iddle animation when not moving	   
				if (this.gameObject.key !== 'troll_first_iddle') {
					this.gameObject.loadTexture('troll_first_iddle');
				}

				this.gameObject.animations.play('test');
			}

			if ((game.keyboard.up.isDown || game.controler.jump) && this.gameObject.body.touching.down && this.touchingPlatforms && this.energy.current >= this.energy.loss.jump) {
				//  Allow the player to jump if they are touching the ground.   
				let value = this.energy.loss.jump;
				 
				this.gameObject.body.moveTo(1000, 750, -90);

				if (this.gameObject.key !== 'troll_first_jump') {
					this.gameObject.loadTexture('troll_first_jump');
				}

				this.gameObject.animations.play('test');

				if(this.energy.current - value < 0) {
					value = this.energy.current;
				}

				this.energy.current -= value;
			}
		}
	}

	updateTargets() {
		for(let i = 0; i < game.level.buildings.list.length; i += 1) {
			let building = game.level.buildings.list[i];

			if(!this.targets.contains(building.gameObject)) {
				if(building.info.health !== null) {
					building.info.health.setText('');
				}

				if(building.info.icon !== null) {
					building.info.icon.visible = false;
				}				
			}
		}

		for(let i = 0; i < game.level.enemies.list.length; i += 1) {
			let enemy = game.level.enemies.list[i];

			if(!this.targets.contains(enemy.gameObject)) {
				if(enemy.info.health !== null) {
					enemy.info.health.setText('');
				}

				if(enemy.info.icon !== null) {
					enemy.info.icon.visible = false;
				}
			}
		}			
	}

	attack() {
		if (this.targets.length > 0) {
			for (let i = 0; i < this.targets.length; i += 1) {
				let target = this.targets[i];

				target.instance.recieveDmg(this.damage);
				game.log(target.name + ' health:', target.instance.health.current);
			}
		}
	}

	recieveDmg(dmg) {
		if(this.health.current > 0) {
			this.flash();
			this.health.current -= dmg;
		}
	}

	// TODO: Rework the target selection
	checkCollisions() {
		this.touchingPlatforms = game.physics.arcade.collide(this.gameObject, game.level.platforms.gameObjects); // Collision check between the player and the platform		

		for (let i = 0; i < game.level.buildings.gameObjects.children.length - 1; i += 1) {
			let building = game.level.buildings.gameObjects.children[i];
			if(building === undefined) debugger;
			let intersect = this.overlaps(building);

			if (intersect) {
				let hitArea = this.gameObject.position.x + (this.gameObject.getBounds().width / 2 * this.gameObject.scale.x);
				let hitTest = false;
				
				if(this.gameObject.scale.x > 0 && this.gameObject.position.x < building.position.x) {
					hitTest = hitArea > building.position.x;
				} else if(this.gameObject.position.x > building.position.x) {
					hitTest = hitArea < building.position.x + settings.towerSize.w;
				}	

				if (hitTest) {
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

		for (let i = 0; i < game.level.enemies.gameObjects.children.length; i += 1) {
			let enemy = game.level.enemies.gameObjects.children[i];
			let intersect = this.overlaps(enemy);

			if (intersect) {
				let hitArea = this.gameObject.position.x + (this.gameObject.getBounds().width / 2 * this.gameObject.scale.x);
				let hitTest = false;

				if(this.gameObject.scale.x > 0 && this.gameObject.position.x < enemy.position.x) {
					hitTest = hitArea > enemy.position.x;
				} else if(this.gameObject.position.x > enemy.position.x) {
					hitTest = hitArea < enemy.position.x  + settings.playerSize.w;
				}				
				
				if (hitTest) {
					if (!this.targetsQueue.contains(enemy)) {
						this.targetsQueue.push(enemy);
					}
				} else {
					if (this.targets.contains(enemy)) {
						let index = this.targets.indexOf(enemy);
						this.targets.splice(enemy);
					}
				}
			} else {
				if(enemy.instance.info.health !== null) {
					enemy.instance.info.health.setText('');
				}
			}
		}
	}

	overlaps(object) {
		let boundsThis = this.gameObject.getBounds();
		if(object === undefined) debugger;
		let boundsObject = object.getBounds();
		let isOverlapping = Phaser.Rectangle.intersects(boundsThis, boundsObject);

		return isOverlapping;
	}

	checkDeath() {
		if (this.health.current <= 0 || (this.gameObject.position.y + this.gameObject.height > game.world.height)) {
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