class UI {
	constructor() {
		this.positions = 4,
		this.background = game.add.sprite(0, 0, 'bg_village');
		this.backgroundParallax = [
			game.add.group(),
			game.add.group(),
			game.add.group()
		];
		this.options = {
			icon: game.add.button(game.width - Math.pow(this.positions, 2.5), this.positions, 'icon_options', null, this),
			label: game.add.bitmapText(game.width - Math.pow(this.positions, 2.5), Math.pow(this.positions, 2.125), 'yggdrasil', 'Options', 16)
		};
		this.health = {		
			bar: {
				empty: game.add.sprite(this.positions, this.positions, 'bar_empty'),
				full: game.add.sprite(this.positions, this.positions, 'healthbar_full')
			},
			label: game.add.bitmapText(this.positions * 10, Math.pow(this.positions, 2.25), 'yggdrasil', '', 16)
		};
		this.energy = {
			bar: {
				empty: game.add.sprite(this.positions, Math.pow(this.positions, 2.5), 'bar_empty'),
				full: game.add.sprite(this.positions, Math.pow(this.positions, 2.5), 'energybar_full')
			},
			label: game.add.bitmapText(this.positions * 10, Math.pow(this.positions, 2.85), 'yggdrasil', '', 16)
		};
		this.charges = {
			icon: [
				{
					empty: game.add.sprite(this.positions * 3 + 1, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1, Math.pow(this.positions,  3.15), 'icon_orb')
				},
				{
					empty: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 1, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 1, Math.pow(this.positions,  3.15), 'icon_orb')
				},
				{
					empty: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 2, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 2, Math.pow(this.positions, 3.15), 'icon_orb')
				},
				{
					empty: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 3, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 3, Math.pow(this.positions, 3.15), 'icon_orb')
				},
				{
					empty: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 4, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 4, Math.pow(this.positions, 3.15), 'icon_orb')
				},
				{
					empty: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 5, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 5, Math.pow(this.positions, 3.15), 'icon_orb')
				},
				{
					empty: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 6, Math.pow(this.positions,  3.15), 'icon_orb_empty'),
					full: game.add.sprite(this.positions * 3 + 1 + Math.pow(this.positions, 2) * 3 * 6, Math.pow(this.positions, 3.15), 'icon_orb')
				}															
			]
		};
		this.controls = {
			gameObjects: game.add.group(),
			move: {				
				background: null,
				slider: null,
				position: {
					x: null,
					y: null
				}
			},
			attack: null
		};
		this.timings = {
			regen: .25
		};		
	};

	init() {	
		// if(game.test) Phaser.Device.desktop = false; // For testing		 	

		game.controler = {
			move: {}
		};

		if(Phaser.Device.desktop) {
			this.addMouse();			
		} else {
			this.addControls();		
		}
		
		this.setup();
		this.followCamera();
		this.setParallax();

		// Timed energy regeneration
		game.time.events.loop(Phaser.Timer.SECOND * this.timings.regen, this.regenEnergy, this);
	};

	update() {
		this.updateBars();
		this.updateTexts();
		this.updateCharges();
		this.updateParallax();
	};

	render() {
		game.player.targets.forEach(function(target) {
			if(target.instance.name == undefined) target.instance.name = 'Building'; // TODO: Remove when building inherits from unit
			// target.instance.renderGUI();
			// TODO: Uncomment the line above and remove the two if-else blocks when building inherits from Unit
			if(target.instance.name.indexOf('Enemy') != -1) {
				target.instance.renderGUI();
			} else if(target.instance.name.indexOf('Building') != -1) {
				if(target.instance.info.icon === null) {
					target.instance.info.icon = game.add.graphics(0, 0);
					target.instance.info.icon.lineStyle(0);
					target.instance.info.icon.beginFill(0x00DFFF, 0.5);
					target.instance.info.icon.drawCircle(0, 0, 50);
					target.instance.info.icon.endFill();
					target.instance.info.icon.anchor.setTo(.5, 0);
					target.instance.info.icon.alignTo(target, Phaser.TOP_CENTER);									
				} else if(target.instance.info.icon.alive) {				
					target.instance.info.icon.alignTo(target, Phaser.TOP_CENTER);									
				}				

				target.instance.info.icon.visible = true; 

				if(target.instance.info.health === null) {
					target.instance.info.health = game.add.bitmapText(0, 0, 'yggdrasil', target.instance.health.current, 26);
				} else {
					target.instance.info.health.setText(target.instance.health.current);
				}
				
				if(target.instance.info.health.alive) {
					target.instance.info.health.alignTo(target, Phaser.TOP_CENTER, 2, 38);							
				}
			}
		});
	};

	setup() {
		this.options.icon.anchor.setTo(.5, 0);
		this.options.label.anchor.setTo(.5, 0);
	};

	setParallax() {
		let width = game.cache.getImage('bg_trees_0').width;
		let count = Math.floor(game.width / width) * 2;

		for(let i = this.backgroundParallax.length; i > 0; i -= 1) { 
			let id = this.backgroundParallax.length - i;

			for(let j = 0; j < count; j += 1) {
				this.backgroundParallax[id].create(-20 + (j * width - j * 50), game.height - 300, 'bg_trees_' + (i - 1));
				this.backgroundParallax[id].create(-20 + (j * width - j * 50), game.height - 300, 'bg_trees_' + (i - 1));
			}

			this.backgroundParallax[id].position.y -= 30 * id + id * 20;
		}
	};

	updateBars() {
		let cropArea = {
			health: new Phaser.Rectangle(0, 0, this.health.bar.empty.width * game.player.health.current / 100, this.health.bar.full.height),
			energy: new Phaser.Rectangle(0, 0, this.energy.bar.empty.width * game.player.energy.current / 100, this.energy.bar.full.height)
		};

		this.health.bar.full.crop(cropArea.health);		
		this.energy.bar.full.crop(cropArea.energy);				
	};

	updateTexts() {
		let healthText = 'HEALTH  ' + game.player.health.current + '/' + game.player.health.max;
		let energyText = 'ENERGY  ' + game.player.energy.current + '/' + game.player.energy.max;

		this.health.label.text = healthText;
		this.energy.label.text = energyText;
	};

	updateCharges() {
		for(let i = game.player.charges; i < this.charges.icon.length; i += 1) {
			if(this.charges.icon[i].full.alive) {				
				this.charges.icon[i].full.kill();
			}
		}

		for(let i = 0; i < game.player.charges; i += 1) {
			if(i >= this.charges.icon.length) {
				break;
			}
			if(!this.charges.icon[i].full.alive) {				
				this.charges.icon[i].full.reset();
			}			
		}
	}

	updateParallax() {
		let firstImage = game.ui.backgroundParallax[0].getFirst();
		let width = firstImage.width;;
		let velocity = game.player.gameObject.body.velocity.x / 3000;
		
		if(game.player.gameObject.position.x > game.width / 2 && game.player.gameObject.position.x < game.world.width - game.width / 2) {
			for(let i = this.backgroundParallax.length; i > 0; i -= 1) {
				let id = this.backgroundParallax.length - i;
				let group = this.backgroundParallax[id];

				for(let j = 0; j < group.length; j += 1) {
					group.getChildAt(j).position.x -= velocity * (i * .5);
				}				
			}
		}

		for(let i = 0; i < this.backgroundParallax.length; i += 1) {
			let group = this.backgroundParallax[i];
			let firstImage = group.getChildAt(0);
			let lastImage = group.getChildAt(group.length - 1);

			if(game.player.gameObject.scale.x > 0) {
				if(firstImage.position.x < Math.abs(game.world.x) - width) {
					firstImage.position.x = lastImage.position.x + lastImage.width - 20;
					group.sort('x', Phaser.Group.SORT_ASCENDING);
				}
			} else {
				if(firstImage.position.x > Math.abs(game.world.x)) {
					lastImage.position.x = firstImage.position.x - width + 20;
					group.sort('x', Phaser.Group.SORT_ASCENDING);
				}				
			}
		}
		
	};

	regenEnergy() {
		if(game.player && game.player.energy.current < 100) // TODO: Change the constant to variable
		game.player.energy.current += 1;
	}

	followCamera() {
		// this.background.fixedToCamera = true;

		this.options.icon.fixedToCamera = true;
		this.options.label.fixedToCamera = true;	

		this.health.bar.empty.fixedToCamera = true;
		this.health.bar.full.fixedToCamera = true;	
		this.health.label.fixedToCamera = true;	

		this.energy.bar.empty.fixedToCamera = true;
		this.energy.bar.full.fixedToCamera = true;	
		this.energy.label.fixedToCamera = true;	

		for(var i = 0; i < this.charges.icon.length; i += 1) {
			this.charges.icon[i].empty.fixedToCamera = true;
			this.charges.icon[i].full.fixedToCamera = true;	
		}

		if(!Phaser.Device.desktop) {
			this.controls.move.background.fixedToCamera = true;
			this.controls.move.slider.fixedToCamera = true;
			this.controls.attack.fixedToCamera = true;
		}		
	}

	addMouse() {
		this.options.icon.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), default";
		}, this);
		this.options.icon.events.onInputDown.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), default";
		}, this);	
		this.options.icon.events.onInputUp.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), default";
		}, this);				
		this.options.icon.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), default";
		}, this);			
	}

	addControls() {
		var bounds = null;
		var boundsX = null;
		var boundsY = null;
		var boundsH = null;
		var boundsW = null;

		boundsX = Math.pow(this.positions, 2);
		boundsY = game.height - Math.pow(this.positions, 3) * 2; 

		this.controls.move.background = this.controls.gameObjects.create(Math.pow(this.positions, 2), game.height - Math.pow(this.positions, 3), 'bar_empty');						
		this.controls.move.slider = this.controls.gameObjects.create(Math.pow(this.positions, 2) + this.controls.move.background.width / 2 - this.positions * 6, game.height - Math.pow(this.positions, 3) / 1.125, 'icon_move');
		this.controls.attack = this.controls.gameObjects.create(game.width - Math.pow(this.positions, 3), game.height - Math.pow(this.positions, 3) - this.positions, 'icon_attack');

		boundsH = this.controls.move.background.height * 2 + this.controls.move.slider.height / 4;
		boundsW = this.controls.move.background.width;
		bounds = new Phaser.Rectangle(boundsX, boundsY, boundsW, boundsH);
		
		// Events		
		this.controls.move.slider.inputEnabled = true;
		this.controls.move.slider.input.enableDrag(false, false, false, 255, bounds);

		this.controls.move.slider.events.onInputOver.add(function(e) {
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), default";
		}, this);
		this.controls.move.slider.events.onInputOut.add(function(e) {
			game.canvas.style.cursor = "url(assets/ui/cursor.png), default";
		}, this);		

		this.controls.move.slider.events.onDragUpdate.add(function(e) {
			if(e.cameraOffset.x > Math.pow(this.positions, 2) + this.controls.move.background.width / 2 - this.positions * 6 + 20) {
				game.controler.move.left = false;
				game.controler.move.right = true;
			} else if(e.cameraOffset.x < Math.pow(this.positions, 2) + this.controls.move.background.width / 2 - this.positions * 6 - 20) {
				game.controler.move.left = true;
				game.controler.move.right = false;
			} else {
				game.controler.move.left = false;	
				game.controler.move.right = false;
				game.controler.jump = false;
			}

			if(e.cameraOffset.y < game.height - Math.pow(this.positions, 3) - this.positions * 10) {
				game.controler.jump = true;
			} else {
				game.controler.jump = false;
			}			
		}, this);	

		this.controls.move.slider.events.onDragStop.add(function(e) {			
			e.cameraOffset.x = Math.pow(this.positions, 2) + this.controls.move.background.width / 2 - this.positions * 6;
			e.cameraOffset.y = game.height - Math.pow(this.positions, 3) / 1.125;
			game.controler.move.right = false;
			game.controler.move.left = false;
			game.controler.jump = false;
			game.canvas.style.cursor = "url(assets/ui/cursor.png), default";			
		}, this);					 		

		this.controls.attack.inputEnabled = true;
		this.controls.attack.events.onInputDown.add(function() {
			game.controler.attack = true;
		}, this);
		this.controls.attack.events.onInputUp.add(function() {
			game.controler.attack = false;
		}, this);	
	}
}