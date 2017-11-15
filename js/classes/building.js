class Building {
	constructor(id, position) {
		this._id = id;		
		this.position = position;
		this.gameObject = game.level.buildings.gameObjects.create(this.position, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
		this.health = {
			max: 100,
			current: 100
		};
		this.info = {
			health: null
		};		
	}

	create() {
		this.gameObject.name = 'Building ' + this._id;
		this.gameObject.instance = this;
		this.gameObject.body.immovable = true;
	}

	update() {
		let nextFrame = (this.health.max - this.health.current) / game.player.damage;

		if(this.health.current <= 0) {
			this.kill();
			return;
		}		
		
		this.gameObject.frame = nextFrame;		
	}

	recieveDmg(dmg) {
		if(this.health.current > 0) {
			this.health.current -= dmg;
		}
	}

	kill() {
		let index = game.level.buildings.gameObjects.children.indexOf(this.gameObject);

		game.level.buildings.gameObjects.remove(this.gameObject);
		game.level.buildings.list.splice(index, 1);
			
		index = game.player.targets.indexOf(this.gameObject);		
		game.player.targets.splice(index, 1);	

		this.info.health.destroy();
		this.gameObject.destroy();		
		game.player.score.buildings += 1;					
	}
}