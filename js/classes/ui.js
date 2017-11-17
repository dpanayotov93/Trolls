class UI {
	constructor() {
		this.background = game.add.sprite(0, 0, 'bg_village');
		this.options = {
			icon: game.add.button(game.width - 110, 16, 'icon_options', null, this),		//game.add.sprite(game.width - 110, 16, 'icon_options'),
			label: game.add.bitmapText(game.width - 100, 96, 'yggdrasil', 'Options', 64)
		};
		this.health = {
			icon: game.add.sprite(16, 4, 'icon_health'),
			label: null,
			bar: {
				empty: game.add.sprite(80, 16, 'bar_empty'),
				full: game.add.sprite(80, 16, 'healthbar_full')
			}
		};
		this.energy = {
			icon: game.add.sprite(16, 88, 'icon_energy'),
			label: null,
			bar: {
				empty: game.add.sprite(80, 100, 'bar_empty'),
				full: game.add.sprite(80, 100, 'energybar_full')
			}
		};
		this.charges = {
			icon: [
				{
					empty: game.add.sprite(116 * 1, 60, 'icon_orb_empty'),
					full: game.add.sprite(116 * 1, 60, 'icon_orb')
				},
				{
					empty: game.add.sprite(116 * 2, 60, 'icon_orb_empty'),
					full: game.add.sprite(116 * 2, 60, 'icon_orb')
				},
												{
					empty: game.add.sprite(116 * 3, 60, 'icon_orb_empty'),
					full: game.add.sprite(116 * 3, 60, 'icon_orb')
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
			regen: .5
		};		
	}

	init() {	
		if(game.test) Phaser.Device.desktop = false;
		if(Phaser.Device.desktop) {
			this.addMouse();			
		} else {
			this.addControls();		
		}
		
		this.followCamera();
		this.resize();	

		// Timed energy regeneration
		game.time.events.loop(Phaser.Timer.SECOND * this.timings.regen, this.regenEnergy, this);

		game.log('UI: ', 'Created', 'green');
	}

	update() {
		this.updateBars();
	}

	updateBars() {
		let cropArea = {
			health: new Phaser.Rectangle(0, 0, this.health.bar.empty.width * game.player.health.current / 100, this.health.bar.full.height),
			energy: new Phaser.Rectangle(0, 0, this.energy.bar.empty.width * game.player.energy.current / 100, this.energy.bar.full.height)
		};

		this.health.bar.full.crop(cropArea.health);		
		this.energy.bar.full.crop(cropArea.energy);				
	}

	regenEnergy() {
		if(game.player && game.player.energy.current < 100) // TODO: Change the constant to variable
		game.player.energy.current += 1;
	}

	followCamera() {
		this.background.fixedToCamera = true;

		this.options.icon.fixedToCamera = true;
		this.options.label.fixedToCamera = true;	

		this.health.icon.fixedToCamera = true;
		this.health.bar.empty.fixedToCamera = true;
		this.health.bar.full.fixedToCamera = true;	

		this.energy.icon.fixedToCamera = true;
		this.energy.bar.empty.fixedToCamera = true;
		this.energy.bar.full.fixedToCamera = true;	

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

	resize() {
		// TODO: Change the constants to variables
		this.options.icon.scale.setTo(.15);
		this.options.label.scale.setTo(.25);

		this.health.icon.scale.setTo(.15);

		this.energy.icon.scale.setTo(.15);

		for(var i = 0; i < this.charges.icon.length; i += 1) {
			this.charges.icon[i].empty.scale.setTo(.1);
			this.charges.icon[i].full.scale.setTo(.1);
		}		

		if(!Phaser.Device.desktop) {
			this.controls.move.slider.scale.setTo(.15);
			this.controls.attack.scale.setTo(.15);
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
		game.controler = {
			move: {}
		};

		this.controls.move.background = this.controls.gameObjects.create(30, game.height - 75, 'bar_empty');						
		this.controls.move.slider = this.controls.gameObjects.create(207.5, game.height - game.cache.getImage('icon_move').height * .15, 'icon_move');
		this.controls.attack = this.controls.gameObjects.create(game.width - 100, game.height - game.cache.getImage('icon_attack').height * .15, 'icon_attack');

		// Events		
		this.controls.move.slider.inputEnabled = true;
		this.controls.move.slider.input.enableDrag(false, false, false, 255, new Phaser.Rectangle(40, game.height - 185, 400, 177));
		this.controls.move.slider.anchor.setTo(.5, 0);		

		this.controls.move.slider.events.onInputOver.add(function(e) {
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), default";
		}, this);
		this.controls.move.slider.events.onInputOut.add(function(e) {
			game.canvas.style.cursor = "url(assets/ui/cursor.png), default";
		}, this);		

		this.controls.move.slider.events.onDragUpdate.add(function(e) {
			if(e.cameraOffset.x > 207.5) {
				game.controler.move.left = false;
				game.controler.move.right = true;
				if(e.cameraOffset.y < game.height - game.cache.getImage('icon_move').height * .15 - 40) {
					game.controler.jump = true;
				} else {
					game.controler.jump = false;
				}
			} else if(e.cameraOffset.x < 207.5) {
				game.controler.move.left = true;
				game.controler.move.right = false;
				if(e.cameraOffset.y < game.height - game.cache.getImage('icon_move').height * .15 - 40) {
					game.controler.jump = true;
				} else {
					game.controler.jump = false;
				}
			} else {
				game.controler.move.left = false;	
				game.controler.move.right = false;
				game.controler.jump = false;
			}
		}, this);	

		this.controls.move.slider.events.onDragStop.add(function(e) {			
			e.cameraOffset.x = 207.5;
			e.cameraOffset.y = game.height - game.cache.getImage('icon_move').height * .15;
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

	showControls() {
		game.world.bringToTop(this.controls.gameObjects);


		game.level.platforms.gameObjects.forEach(function(item) {
			item.scale.setTo(item.scale.x, item.scale.y * .5);
			item.position.y += item.height;
		});		
	}
}