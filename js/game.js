// Define the settings for the game
var settings = {
	width: window.innerWidth < 480 ? 480 : window.innerWidth,
	height: window.innerHeight - 32 < 320 ? 320 : window.innerHeight,
	tileSize: 128,
	buttonSize: {
		h: 64,
		w: 1024
	},
	playerSize: {
		h: 264, //1056
		w: 179 // 715 			
	},
	towerSize: {
		h: 156,
		w: 174
	}
};

// Create the game object
var game = new Phaser.Game(settings.width, settings.height, Phaser.CANVAS, '');

// State management
game.state.add('Boot', stateBoot);
game.state.add('Load', stateLoad);
game.state.add('Menu', stateMenu);
game.state.add('Controls', stateControls);
game.state.add('Play', statePlay);
game.state.add('End', stateEnd);
game.state.add('Win', stateWin);

// Initiate from the boot state
game.state.start('Boot');


// Overwrite of the moveTo function to set the x and y velocities seperately
Phaser.Physics.Arcade.Body.prototype.moveTo = function (duration, distance, direction) {
    var speed = distance / (duration / 1000);

    if (speed === 0)
    {
        return false;
    }

    var angle;

    if (direction === undefined)
    {
        angle = this.angle;
        direction = this.game.math.radToDeg(angle);
    }
    else
    {
        angle = this.game.math.degToRad(direction);
    }

    distance = Math.abs(distance);

    this.moveDuration = 0;
    this.moveDistance = distance;

    if (this.moveTarget === null)
    {
        this.moveTarget = new Phaser.Line();
        this.moveEnd = new Phaser.Point();
    }

    this.moveTarget.fromAngle(this.x, this.y, angle, distance);

    this.moveEnd.set(this.moveTarget.end.x, this.moveTarget.end.y);

    this.moveTarget.setTo(this.x, this.y, this.x, this.y);

    //  Avoid sin/cos
    if (direction === 0 || direction === 180)
    {
        // this.velocity.set(Math.cos(angle) * speed, 0);
        this.velocity.x = Math.cos(angle) * speed;
    }
    else if (direction === 90 || direction === 270)
    {
        // this.velocity.set(0, Math.sin(angle) * speed);
        this.velocity.y = Math.sin(angle) * speed;
    }
    else
    {
        this.velocity.setToPolar(angle, speed);
    }

    this.isMoving = true;

    return true;
};

// Removing the Phaser header
Phaser.Game.prototype.showDebugHeader = function() {
  // Just a return statement to overwrite the default behaviour
  return;
};

// Custom contains method to explicitely check object containment in an array
Array.prototype.contains = Array.prototype.contains || function(obj) {
  var i, l = this.length;
  for (i = 0; i < l; i++)
  {
    if (this[i] == obj) return true;
  }
  return false;
};