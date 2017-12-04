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
			health: null,
			icon: null
		};		
		this.emitter = {
			smoke: null,
			stones: null
		};
	}

	create() {
		this.gameObject.name = 'Building ' + this._id;
		this.gameObject.instance = this;
		this.gameObject.body.immovable = true;

		this.emitter.smoke = game.add.emitter(this.gameObject.x + settings.towerSize.w / 2, this.gameObject.y + settings.towerSize.h - 20, 100);
		this.emitter.smoke.makeParticles('smoke_puff');
		this.emitter.smoke.gravity = 500;	

		this.emitter.stones = game.add.emitter(this.gameObject.x + settings.towerSize.w / 2, this.gameObject.y + settings.towerSize.h - 20, 100);
		this.emitter.stones.makeParticles('stone');
		this.emitter.stones.gravity = 500;			
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
			this.emitter.smoke.start(true, 1000, null, 2);
			this.emitter.stones.start(true, 1000, null, 10);
		}
	}

	kill() {
		let index = game.level.buildings.gameObjects.children.indexOf(this.gameObject);

		game.level.buildings.gameObjects.remove(this.gameObject);
		game.level.buildings.list.splice(index, 1);
			
		index = game.player.targets.indexOf(this.gameObject);		
		game.player.targets.splice(index, 1);	

		index = game.player.targetsQueue.indexOf(this.gameObject);		
		game.player.targetsQueue.splice(index, 1);		

		game.level.buildings.gameObjects.remove(this.gameObject);				

		this.info.health.destroy();
		this.info.icon.destroy();
		this.gameObject.destroy();		
		game.player.score.buildings += 1;					
	}
}