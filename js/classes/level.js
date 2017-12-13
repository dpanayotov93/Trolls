class Level {
	constructor() {
		this.platforms = {
			count: game.rnd.integerInRange(3, 7),
			lastPlatformPosition: 0,
			positions: [],
			list: [],
			gameObjects: game.add.group()
		};
		this.holes = {
			gameObjects: game.add.group()
		};
		this.buildings = {
			count: [0], // Initial 0 as the starting platform will be empty
			list: [],
			gameObjects: game.add.group()
		};
		this.enemies = {
			count: [0], // Initial 0 as the starting platform will be empty
			list: [],
			gameObjects: game.add.group()
		};
		this.weather = {
			snow: game.add.emitter(game.world.centerX, 0, 200),
			clouds: [
				game.add.sprite(game.width / 2 - game.cache.getImage('cloud_storm').width, game.cache.getImage('cloud_storm').height / 8, 'cloud_storm'),
				game.add.sprite(game.width / 2, game.cache.getImage('cloud_storm').height / 8, 'cloud_storm'),
				game.add.sprite(game.width / 2 + game.cache.getImage('cloud_storm').width, game.cache.getImage('cloud_storm').height / 8, 'cloud_storm')
			],
			updateTime: game.time.now + Phaser.Timer.SECOND * 5
		};
		this.clutter = {
			items: ['pine_1', 'pine_2', 'tree_1', 'tree_2'],
			list: []
		}
	}

	init() {
		this.addPlatforms();
		this.addWeather();
		this.addBuildings();
		this.addEnemies();
		this.reorderLayers();
	}

	addPlatforms() {
		this.platforms.gameObjects.enableBody = true;

		for(var i = 0; i < this.platforms.count; i += 1) {
			let platform = new Platform(i, this.platforms.lastPlatformPosition);
			platform.create();
			this.platforms.list.push(platform);
			this.addClutter(platform);
		}
	}

	addBuildings() {
		this.buildings.gameObjects.enableBody = true;
		
		for(let i = 0; i < this.platforms.positions.length - 1; i += 1) {
			let id = i + 1; // Increment by 1 to skip the first platform - It will stay empty as a starting one
			let minCurPossiblePos = game.level.platforms.positions[id][0];
			let maxCurPossiblePos = game.level.platforms.positions[id][1];

			this.buildings.count[id] = game.rnd.integerInRange(1, 3);			

			for(let j = 0; j < this.buildings.count[id]; j += 1) {
				let position = game.rnd.integerInRange(minCurPossiblePos, maxCurPossiblePos);
				let building = new Building(j, position);
				building.create();
				this.buildings.list.push(building);
			}		
		}
	}

	addEnemies() {
		this.enemies.gameObjects.enableBody = true;
		this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

		for(let i = 0; i < this.platforms.positions.length - 1; i += 1) {
			let id = i + 1; // Increment by 1 to skip the first platform - It will stay empty as a starting one
			let minCurPossiblePos = game.level.platforms.positions[id][0];
			let maxCurPossiblePos = game.level.platforms.positions[id][1];

			this.enemies.count[id] = 1; //game.rnd.integerInRange(1, 3);

			for(let j = 0; j < this.enemies.count[id]; j += 1) {
				let position = game.rnd.integerInRange(minCurPossiblePos, maxCurPossiblePos);
				let enemy = new Enemy('Enemy ' + j, {
						iddle: 'enemy_first_iddle',
						moving: 'enemy_first_walk',
						jumping: 'enemy_first_jump',
						attacking: 'enemy_first_attack'
					}, new Phaser.Point(position, 0), 5, 8, 100, 100
				);

				this.enemies.list.push(enemy);
				this.enemies.gameObjects.add(enemy.gameObject);
			}
		}
	}

	addWeather() {
	    this.addSnow();
		this.addClouds();	    
	};

	addSnow() {
	    this.weather.snow.width = game.world.width;

	    this.weather.snow.makeParticles('snowflake');
	    
	    this.weather.snow.minParticleScale = .01;
	    this.weather.snow.maxParticleScale = .05;

	    this.weather.snow.setYSpeed(50, 200);
	    this.weather.snow.setXSpeed(-30, 30);
	    this.weather.snow.position.y = 100;

	    this.weather.snow.start(false, 3500, 30);	
	};

	addClouds() {
		for(let cloud of this.weather.clouds) {
			cloud.anchor.setTo(.5);
			cloud.fixedToCamera = true;
		}
	}

	addClutter(platform) {
		let min = platform.midPiecesCount.chosen / 2;
		let max = platform.midPiecesCount.chosen;
		let numberOfItems = game.rnd.integerInRange(min, max);
		let clutterList = null;

		this.clutter.list.push(game.add.group());
		clutterList = this.clutter.list[this.clutter.list.length - 1];

		for(let i = 0; i < numberOfItems; i += 1) {
			console.log(platform.midPieces[i].position.x);
			let start = platform.midPieces[i].position.x;
			let end = platform.midPieces[i].position.x + platform.midPieces[i].width;

			let itemIndex = game.rnd.integerInRange(0, this.clutter.items.length - 1);
			let selecteItem = this.clutter.items[itemIndex];
			let x = game.rnd.integerInRange(start, end);
			let y = game.height - settings.tileSize / 2 - game.cache.getImage(selecteItem).height;
			let item = clutterList.create(x, y, selecteItem)

			item.anchor.x = .5;
		}
	}

	reorderLayers() {
		game.world.sendToBack(this.holes.gameObjects);

		for(let clutter of this.clutter.list) {
			game.world.sendToBack(clutter);
		}	
		
		for(let background of game.ui.backgroundParallax) {
			game.world.sendToBack(background);
		}	
		

		for(let cloud of this.weather.clouds) {
			game.world.sendToBack(cloud);
		}			

		game.world.sendToBack(game.ui.background);
		game.world.setBounds(0, 0, this.platforms.lastPlatformPosition, game.height);		
	}

	update() {
		for(let i = 0; i < this.buildings.list.length; i += 1) {
			let building = this.buildings.list[i];
			building.update();
		}

		for(let i = 0; i < this.enemies.list.length; i += 1) {
			let enemy = this.enemies.list[i];
			enemy.update();
		}		

		this.updateWeather();
	}

	updateWeather() {
		if(game.time.now > this.weather.updateTime) {
			for(let cloud of this.weather.clouds) {
				let lightningChance = game.rnd.integerInRange(0, 4);

				if(lightningChance > 2) {
					// let lightning = game.add.sprite(cloud.position.x - game.cache.getImage('lightning_cloud').width / 2, 50, 'lightning_cloud');
					let lightning = game.add.sprite(cloud.position.x - 275, 100, 'lightning_cloud');
					let lightningAnimation = lightning.animations.add('strike', null, 12, false);
					
					lightning.animations.play('strike');
					game.camera.flash(0xfefefe, 500);

					lightningAnimation.onComplete.add(function() {
						lightning.destroy();
					});						
				}
			}

			this.weather.updateTime = game.time.now + Phaser.Timer.SECOND * 10;
		}
	}
}