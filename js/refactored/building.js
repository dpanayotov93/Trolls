class Building {
	constructor(id, position) {
		this._id = id;		
		this.position = position;
		this.gameObject = game.level.buildings.gameObjects.create(this.position, game.world.height - settings.towerSize.h * 1.9, 'tower_first');
		this.health = 100;
	}

	create() {
		this.gameObject.name = 'Building ' + this._id;
		this.gameObject.health = 100; // TODO: Move this to the class object when the enemy class is done
		this.gameObject.body.immovable = true;
	}
}