class Level {
	constructor() {
		this.platforms = {
			count: game.rnd.integerInRange(3, 7),
			lastPlatformPosition: 0,
			positions: [],
			list: [],
			gameObjects: game.add.group()
		};
		this.buildings = {
			count: 0,
			list: [],
			gameObjects: game.add.group()
		};
		this.enemies = {
			count: 0,
			list: [],
			gameObjects: game.add.group()
		};
	}

	init() {
		this.addPlatforms();
		// this.addBuildings()
		// this.addEnemies();
	}

	addPlatforms() {
		this.platforms.gameObjects.enableBody = true;

		for(var i = 0; i < this.platforms.count; i += 1) {
			let platform = new Platform(i, this.platforms.lastPlatformPosition);
			platform.create();
			this.platforms.list.push(platform);
		}

		game.world.setBounds(0, 0, this.platforms.lastPlatformPosition, game.height);
		game.log('Platforms: ', 'Created (' + this.platforms.count + ')', 'green');
	}
}