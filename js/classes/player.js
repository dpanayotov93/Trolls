class Player extends Unit {
	constructor(name, models, position, damage, speed, health, energy, charges) {
		super(name, models, position, damage, speed, health, energy);
		/* EXTENDED PROPERTIES */
		this.energy.costs.sprinting = 1;
		this.states.interacting = false;
		/* UNIQUE PROPERTIES */
		this.skills = {
			lightning: {
				element: null,
				animation: null,
				damage: 50
			}
		};					
		this.charges = charges;	
		this.score = {
			buildings: 0,
			enemies: 0,
			total: 0
		};
		/* INITIALIZATION METHOD */
		this.create(); 
	}

	create() {
		super.create();
		this.configureSprite();
		this.configureEvents();
		this.setSkills();

		this.direction = 1;
		this.gameObject.tint = -13027015;
		game.camera.follow(this.gameObject, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
	}

	setSkills() {
		game.input.onDown.add(function(pointer) {			
			if(this.skills.lightning.element === null && this.charges > 0 && !this.states.interacting) {
				this.skills.lightning.element = game.add.sprite(pointer.positionDown.x + game.camera.x + 15, pointer.positionDown.y, 'lightning_bolt');
				this.skills.lightning.element.anchor.x = .5;
				this.skills.lightning.element.anchor.y = 0;
				this.skills.lightning.animation = this.skills.lightning.element.animations.add('strike', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 64, false);
				this.skills.lightning.animation.enableUpdate = true;

				this.skills.lightning.animation.onComplete.add(function() {
					let centerPoint = new Phaser.Point(this.skills.lightning.element.position.x -  game.camera.x, this.skills.lightning.element.position.y + this.skills.lightning.element.height - 50);
					let hitZone = new Phaser.Circle(centerPoint.x, centerPoint.y, 100);

					game.level.enemies.gameObjects.forEachAlive(function(enemy) {  
						if(enemy.overlap(hitZone)) {   
							enemy.instance.recieveDmg(this.skills.lightning.damage);
						}
					}, this);
					game.level.buildings.gameObjects.forEachAlive(function(building) {  
						if(building.overlap(hitZone)) {   
							building.instance.recieveDmg(this.skills.lightning.damage);
						}
					}, this);					

					this.skills.lightning.element.destroy();
					this.skills.lightning.element = null;
					this.skills.lightning.animation = null;
				}, this);

				this.skills.lightning.animation.onUpdate.addOnce(function() {
					if(this.skills.lightning.element !== null && this.skills.lightning.element.alive) {
						this.skills.lightning.element.position.y += 20;
						this.charges -= 1;
						this.charges = this.charges < game.ui.charges.icon.length ? this.charges : game.ui.charges.icon.length - 1;
						this.charges = this.charges >= 0 ? this.charges : 0;
					}
				}, this);
				
				this.skills.lightning.element.animations.play('strike');
			}
		}, this);		
	}

	update() {
		super.update();
		this.checkCollisions();
		this.updateControls();
		this.updateTargets();
	}

	updateControls() {
		if((game.keyboard.spacebar.isDown || game.controler.attack) && this.energy.current >= this.energy.costs.attacking) {
			this.setState('attacking');
			this.swapModel(this.models.attacking);			
			this.gameObject.animations.play('attack');
		} else {
			if(game.keyboard.left.isDown || game.controler.move.left) {
				let isSprinting = game.keyboard.left.shiftKey;
				this.direction = -1;
				this.move(isSprinting);
			} else if(game.keyboard.right.isDown || game.controler.move.right) {
				let isSprinting = game.keyboard.right.shiftKey;
				this.direction = 1;
				this.move(isSprinting);
			} else if (this.states.grounded) {
				this.gameObject.body.velocity.x = 0;
				this.setState('iddle');
				this.swapModel(this.models.iddle);
			}

			if((game.keyboard.up.isDown || game.controler.jump) && this.gameObject.body.touching.down && this.states.grounded && this.energy.current >= this.energy.costs.jumping) {
				this.gameObject.body.moveTo(1000, 750, -90);
				this.setState('jumping');
				this.swapModel(this.models.jumping);
				this.loseEnergy(this.energy.costs.jumping);
			}

			this.gameObject.animations.play('current');		
		}
	}

	move(isSprinting) {
		isSprinting = isSprinting || false;

		if(isSprinting && this.energy.current >= this.energy.costs.sprinting) { // TODO: Imeplemnt controler 					
			this.gameObject.body.x += this.speed * 3 * this.direction;
			this.loseEnergy(this.energy.costs.sprinting);				
		} else {
			this.gameObject.body.x += this.speed * this.direction;
		}

		this.setState('moving');
		this.gameObject.scale.x = Math.abs(this.gameObject.scale.x) * this.direction; 

		if (this.states.grounded) {
			this.swapModel(this.models.moving);
		}
	}

	// TODO: Update after refactoring Enemy and Building
	updateTargets() {
		for(const building of game.level.buildings.list) {
			if(!this.targets.has(building.gameObject)) {
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
			if(!this.targets.has(enemy.gameObject)) {
				enemy.updateGUI();
			}
		}			
	}

	kill() {
		this.gameObject.kill();
		game.player.score.total = Math.floor((game.player.score.buildings + game.player.score.enemies) / 2);
		game.state.start('End');
	}

	checkOverlapWithGroup(group) {
		for (const item of group) {			
			if (this.overlaps(item)) {						
				let hitArea = this.gameObject.position.x + (this.gameObject.getBounds().width / 2 * this.gameObject.scale.x);
				let isOnTheRight = this.gameObject.scale.x > 0 && this.gameObject.position.x < item.position.x && hitArea > item.position.x;
				let isOnTheLeft = this.gameObject.position.x > item.position.x && hitArea < item.position.x + settings.towerSize.w;

				if((isOnTheRight || isOnTheLeft) && !this.targets.has(item)) {
					this.targets.add(item);
				} else if(!(isOnTheRight || isOnTheLeft) && this.targets.has(item)) {
					this.targets.delete(item);
				}			
			} else {
				if(this.targets.has(item)) {
					this.targets.delete(item);					
				}
			}
		}
	}

	checkCollisions() {
		super.checkCollisions();
		this.checkOverlapWithGroup(game.level.buildings.gameObjects.children);
		this.checkOverlapWithGroup(game.level.enemies.gameObjects.children);
	}
}