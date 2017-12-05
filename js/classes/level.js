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
		this.emitter = null;
	}

	init() {
		this.addPlatforms();
		this.addWeather();
		this.addBuildings();
		this.addEnemies();
	}

	addPlatforms() {
		this.platforms.gameObjects.enableBody = true;

		for(var i = 0; i < this.platforms.count; i += 1) {
			let platform = new Platform(i, this.platforms.lastPlatformPosition);
			platform.create();
			this.platforms.list.push(platform);
		}

		game.world.sendToBack(this.holes.gameObjects);
		
		for(let i = game.ui.backgroundParallax.length; i > 0; i -= 1) {
			game.world.sendToBack(game.ui.backgroundParallax[game.ui.backgroundParallax.length - i]);
		}

		game.world.sendToBack(game.ui.background);
		game.world.setBounds(0, 0, this.platforms.lastPlatformPosition, game.height);
		game.log('Platforms: ', 'Created (' + this.platforms.count + ')', 'green');
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

		game.log('Buildings: ', 'Created (' + this.buildings.gameObjects.length + ')', 'green');
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
				let enemy = new Enemy(j, position);
				enemy.create();
				this.enemies.list.push(enemy);
			}

			game.log('Buildings: ', 'Created (' + this.enemies.gameObjects.length + ')', 'green');
		}
	}

	addWeather() {
	    this.addSnow();
	};

	addSnow() {
		this.emitter = game.add.emitter(game.world.centerX, 0, 200);

	    this.emitter.width = game.world.width;

	    this.emitter.makeParticles('snowflake');
	    
	    this.emitter.minParticleScale = .01;
	    this.emitter.maxParticleScale = .05;

	    this.emitter.setYSpeed(50, 200);
	    this.emitter.setXSpeed(-30, 30);

	    this.emitter.start(false, 3500, 30);	
	};

	update() {
		for(let i = 0; i < this.buildings.list.length; i += 1) {
			let building = this.buildings.list[i];
			building.update();
		}

		for(let i = 0; i < this.enemies.list.length; i += 1) {
			let enemy = this.enemies.list[i];
			enemy.update();
		}		
	}
}