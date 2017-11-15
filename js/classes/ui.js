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
		this.timings = {
			regen: .5
		};		
	}

	init() {
		this.followCamera();
		this.resize();

		// Change the mouse when over a button
		this.options.icon.events.onInputOver.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor_over.png), auto";
		}, this);
		this.options.icon.events.onInputOut.add(function(){
			game.canvas.style.cursor = "url(assets/ui/cursor.png), auto";
		}, this);		

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
	}
}