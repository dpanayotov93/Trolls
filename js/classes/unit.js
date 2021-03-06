'use strict';

class Unit {
	constructor(name, models, position, damage, speed, health, energy) {
		this.gameObject = null;
		this.position = position || new Phaser.Point();
		this.name = name || 'Troll Doe';
		this.models = {
			iddle: models.iddle || 'enemy_first_iddle',
			moving: models.moving || 'enemy_first_walk',
			jumping: models.jumping || 'enemy_first_jump',
			attacking: models.attacking || 'enemy_first_attack'
		};
		this.damage = damage || 1;
		this.speed = speed || 1;
		this.health = {
			max: health || 100,
			current: health || 100
		};
		this.energy = {
			max: energy || 100,
			current: energy || 100,
			costs: {
				attacking: 5,
				jumping: 10			
			}
		};
		this.direction = 0;
		this.targets = new Set();		
		this.states = {
			iddle: false,
			moving: false,
			jumping: false,
			attacking: false,
			grounded: false			
		};
		this.animations = {
			iddle: null,
			moving: null,
			jumping: null,
			attacking: null
		};
		this.timings = {
			resetTint: .5
		};
	}

	create() {
		// Create the sprite
		this.gameObject = game.add.sprite(this.position.x, this.position.y, this.models.iddle);
		this.setState('iddle');
		this.gameObject.instance = this;	
	}

	configureSprite() {
		// Enable physics for the unit	
		game.physics.arcade.enable(this.gameObject);	

		// Sprite settings
		this.gameObject.body.bounce.y = 0; // Vertical bounce force
		this.gameObject.body.gravity.y = 2500; // Gravity force
		this.gameObject.body.collideWorldBounds = true; // Enable collision with the world boundaries	    
		this.gameObject.outOfBoundsKill = true; // A switch for just in case to kill the unit if it goes out of bounds
		this.gameObject.anchor.x = 0.5; // Set the X anchor point to the center of the body
		this.gameObject.body.stopVelocityOnCollide = false; // Resets the velocity to 0 when colliding with anything
		this.gameObject.animations.add('current', null, 15, true); // Create the iddle animation  				
		this.gameObject.body.setSize(settings.playerSize.w - 64, settings.playerSize.h * 2 / 3, 15, 0); // Update the sprite bounds to match the actual physical body    			    
	}

	configureEvents() {
		this.animations.attack = this.gameObject.animations.add('attack', null, 10, false);
		this.animations.attack.onComplete.add(function() {
			this.attack(this.targets);
			this.loseEnergy(this.energy.costs.attacking);
		}, this);	
	}	

	update() {
		this.checkDeath();
	}

	renderGUI() {
		if(this.info.icon === null) {
			this.info.icon = game.add.graphics(0, 0);
			this.info.icon.lineStyle(0);
			this.info.icon.beginFill(0xFF0000, 0.5);
			this.info.icon.drawCircle(0, 0, 50);
			this.info.icon.endFill();
			this.info.icon.anchor.setTo(.5, 1.5);
			this.info.icon.alignTo(this.gameObject, Phaser.TOP_CENTER, -52.5 * this.gameObject.scale.x, 0);									
		} else if(this.info.icon.alive) {
			this.info.icon.alignTo(this.gameObject, Phaser.TOP_CENTER, -52.5 * this.gameObject.scale.x, 0);									
		}

		if(this.info.health === null) {
			this.info.health = game.add.bitmapText(0, 0, 'yggdrasil', this.health.current, 26);			
		} else {
			this.info.health.setText(this.health.current);
		}

		this.info.icon.visible = true;

		if(this.info.health.alive) {
			this.info.health.alignTo(this.gameObject, Phaser.TOP_CENTER, -52.5 * this.gameObject.scale.x + (this.gameObject.scale.x > 0 ? 2 : 1), -38);	
		}		
	}

	updateGUI() {
		if(this.info.health !== null) {
			this.info.health.setText('');
		}

		if(this.info.icon !== null) {
			this.info.icon.visible = false;
		}
	}

	overlaps(object) {
		let boundsThis = this.gameObject.getBounds();
		let boundsObject = object.getBounds();
		let isOverlapping = Phaser.Rectangle.intersects(boundsThis, boundsObject);

		return isOverlapping;
	}

	attack(targets) {
		for(let target of targets) {
			target.instance.recieveDmg(this.damage);
		}
	}

	recieveDmg(dmg) {
		if(this.health.current > 0) {
			this.flash();
			this.health.current -= dmg;
		} else {
			return;
		}
	}

	checkDeath() {
		if (this.health.current <= 0 || (this.gameObject.position.y + this.gameObject.height > game.world.height)) {
			this.kill();
		}
	}	

	checkCollisions() {
		this.states.grounded = game.physics.arcade.collide(this.gameObject, game.level.platforms.gameObjects);
	}

	loseEnergy(value) {
		if(this.energy.current - value < 0) {
			this.energy.current = 0;
		} else {
			this.energy.current -= value;
		}	
	}	

	swapModel(model) {
		if(this.model !== model) {
			this.model = model;
			this.gameObject.loadTexture(this.model);
		}
	}	

	setState(stateName) {
		for(let [key, value] of Object.entries(this.states)) {
			if(key !== 'grounded') {
				if(stateName ==='jumping') {
					if(key !== 'moving') {
						this.states[key] = false;
					}
				} else if(stateName ==='moving') {
					if(key !== 'jumping') {
						this.states[key] = false;
					}					
				} else {
					if(key !== 'interacting') {
						this.states[key] = false;
					}
				}
			}
		}
		this.states[stateName] = true;
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
			this.gameObject.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
		}, this); 
		
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
			this.gameObject.tint = Phaser.Color.interpolateColor(endColor, startColor, 100, colorBlend.step);
		}, this); 
		
		this.gameObject.tint = endColor;
		colorTween.start();				
	}	
}