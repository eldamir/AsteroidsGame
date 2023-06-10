/**
 * Created by ruben on 12/12/14.
 */

/**
 * Spaceship
 * @param game The game that this ship belongs to
 * @param options Options for customizing the ships parameters
 */
function Spaceship(game, options) {
    if (!options)
        options = {};
    this.game = game;
    // The vector that determines the direction and speed of the this
    this.inertia = options.inertia || [0, 0];
    // The amount that inertia is incremented when UP is pressed
    this.inertia_modifier = options.inertia_modifier || .1;
    // The amount of degrees the this can turn when arrow keys are pressed
    this.rotation_modifier = options.rotation_modifier || 3.0;
    // The color of the this
    this.color = options.color || "blue";
    this.max_speed = options.max_speed || 6;
    this.scale = .5;
    this.radius = 32 * this.scale;

    this.rightKey = options.rightKey || 39;
    this.leftKey = options.leftKey || 37;
    this.upKey = options.upKey || 38;
    this.downKey = options.downKey || 40;
    this.fireKey = options.fireKey || 32;

    this.rightKeyPressed = false;
    this.leftKeyPressed = false;
    this.upKeyPressed = false;
    this.downKeyPressed = false;
    this.fireKeyPressed = false;
    this.readyToFire = 0;

    this.bullets = [];
    this.dead = false;

    // Prototype geometry
    // Draw the ship
    //this.geometry = new createjs.Shape();
    //this.geometry.graphics
    //    .beginFill(this.color);
    //this.geometry.graphics
    //    .moveTo(50, 50)
    //    .lineTo(40, 80)
    //    .lineTo(60, 80)
    //    .lineTo(50, 50);
    //this.geometry.width = 20;
    //this.geometry.height = 30;
    //this.geometry.regX = 50;
    //this.geometry.regY = 50 + this.geometry.height / 2;

    // Production geometry
    var spaceshipSheet = new createjs.SpriteSheet(this.game.preloader.queue.getResult("spaceship"));
    this.geometry = new createjs.Sprite(spaceshipSheet, "spaceship");
    this.geometry.x = this.game.stage.canvas.width / 2;
    this.geometry.y = this.game.stage.canvas.height / 2;
    this.geometry.scaleX = this.geometry.scaleY = this.scale;
    this.geometry.width = this.geometry.height = 64;
}

Spaceship.prototype.getCenter = function () {
    return {
        x: this.geometry.x,
        y: this.geometry.y
    }
};

// Sets new coordinates for the spaceship
Spaceship.prototype.handleKeys = function() {
    // handles keys
    this.readyToFire -= 1;
    if (this.rightKeyPressed)
        this.turn('right');
    if (this.leftKeyPressed)
        this.turn('left');
    if (this.upKeyPressed)
        this.accelerate();
    if (this.fireKeyPressed) {
        if (this.readyToFire < 0) {
            this.shoot();
            this.readyToFire = 15;
        }
    }
};

// Increases the ship's speed in the direction, that it is pointing
Spaceship.prototype.accelerate = function () {
    // increase inertia in the proper direction
    var current_speed = Math.sqrt(
        Math.pow(this.inertia[0], 2) +  Math.pow(this.inertia[1], 2)
    );
    var new_inertia = [
        this.inertia[0] + Math.sin(toRadians(this.geometry.rotation)) * this.inertia_modifier,
        this.inertia[1] - Math.cos(toRadians(this.geometry.rotation)) * this.inertia_modifier
    ];
    var new_speed = Math.sqrt(
        Math.pow(new_inertia[0], 2) +  Math.pow(new_inertia[1], 2)
    );

    if (new_speed < this.max_speed || new_speed < current_speed) {
        this.inertia = new_inertia;
    }
};

Spaceship.prototype.turn = function (direction) {
    if (direction == 'left') {
        this.geometry.rotation -= this.rotation_modifier;
    } else if (direction == 'right'){
        this.geometry.rotation += this.rotation_modifier;
    }
};

Spaceship.prototype.move = function () {
    // Move the ship according to its inertia
    this.geometry.x += this.inertia[0];
    this.geometry.y += this.inertia[1];
};

Spaceship.prototype.shoot = function () {
    var bullet = new Bullet(this);
    this.bullets.push(bullet);
    this.game.stage.addChild(bullet.geometry);
    var sound = createjs.Sound.play("bullet");
    sound.setVolume(.15);
};

Spaceship.prototype.killSelf = function () {
    this.dead = true;
    this.game.stage.removeChild(this);
};

Spaceship.prototype.keyDownHandler = function (event) {
    if (!this.dead) {
        switch (event.keyCode) {
            case (this.rightKey):  // Right
                this.rightKeyPressed = true;
                break;
            case (this.leftKey):  // Left
                this.leftKeyPressed = true;
                break;
            case (this.upKey):  // Up
                this.upKeyPressed = true;
                break;
            case (this.downKey):  // Down
                this.downKeyPressed = true;
                break;
            case (this.fireKey):  // Shoot
                this.fireKeyPressed = true;
                break;
            case (80):  // Pause
                this.game.ticksDisabled = !this.game.ticksDisabled;
                break;
            case (78):  // New game
                this.game.init();
                break;
            default:
                break;
        }
    }
};

Spaceship.prototype.keyUpHandler = function (event) {
    switch (event.keyCode) {
        case (this.rightKey):  // Right
            this.rightKeyPressed = false;
            break;
        case (this.leftKey):  // Left
            this.leftKeyPressed = false;
            break;
        case (this.upKey):  // Up
            this.upKeyPressed = false;
            break;
        case (this.downKey):  // Down
            this.downKeyPressed = false;
            break;
        case (this.fireKey):  // Shoot
            this.fireKeyPressed = false;
            break;
        default:
            break;
    }
};


/**
 * A bullet fires from a spaceship
 * @param ship The spaceship that fires the bullet
 */
function Bullet(ship) {
    this.owner = ship;
    this.game = ship.game;
    this.color = "red";
    this.velocity = 5;
    this.radius = 3;

    // The bullet's inertia is determined by the inertia of the ship that fires it
    // + the inertia from firing it
    this.inertia = [
        this.owner.inertia[0] / 2 + Math.sin(toRadians(this.owner.geometry.rotation)) * this.velocity,
        this.owner.inertia[1] / 2 - Math.cos(toRadians(this.owner.geometry.rotation)) * this.velocity
    ];

    this.geometry = new createjs.Shape();
    this.geometry.graphics
        .beginFill(this.color);
    this.geometry.graphics
        .drawCircle(this.owner.geometry.x, this.owner.geometry.y, this.radius);
    this.geometry.x = this.owner.geometry.x;
    this.geometry.y = this.owner.geometry.y;
    this.geometry.regX = this.owner.geometry.x;
    this.geometry.regY = this.owner.geometry.y;
    this.geometry.width = this.geometry.height = this.radius + 2; // TODO: Why + 2?
}

Bullet.prototype.getCenter = function () {
    return {
        x: this.geometry.x,
        y: this.geometry.y
    }
};

Bullet.prototype.move = function () {
    this.geometry.x += this.inertia[0];
    this.geometry.y += this.inertia[1];
};


/**
 * The asteroids that the spaceship will be shooting down
 * @param game The game that the asteroid belongs to
 * @param options Optional options to customize the asteroid
 */
function Asteroid(game, options) {
    this.game = game;
    if (!options)
        options = {};
    this.color = options.color || "black";
    this.scale = options.scale || 1;
    this.radius = this.scale * 18;
    this.initialPosition = options.initialPosition || [-20,.20];
    this.inertia = options.inertia || [1,1];
    this.level = options.level != undefined ? options.level : 1;  // if > 0, spawns children. All children's levels are this - 1

    // Prototype geometry
    //this.geometry = new createjs.Shape();
    //this.geometry.x = this.geometry.regX = this.initialPosition[0];
    //this.geometry.y = this.geometry.regY = this.initialPosition[1];
    //this.geometry.graphics.beginFill(this.color);
    //this.geometry.graphics
    //    .drawCircle(this.geometry.x, this.geometry.y, this.radius);
    //this.geometry.width = this.geometry.height = 64;

    // Production geometry
    var asteroids = new createjs.SpriteSheet(this.game.preloader.queue.getResult("asteroids"));
    this.geometry = new createjs.Sprite(asteroids, "asteroid1");
    this.geometry.x = this.initialPosition[0];
    this.geometry.y = this.initialPosition[1];
    this.geometry.scaleX = this.geometry.scaleY = this.scale;
    this.geometry.width = this.geometry.height = 64;
}

Asteroid.prototype.getCenter = function () {
    return {
        x: this.geometry.x,
        y: this.geometry.y
    }
};

Asteroid.prototype.move = function () {
    this.geometry.x += this.inertia[0];
    this.geometry.y += this.inertia[1];
};

Asteroid.prototype.spawnChildren = function () {
    if (this.level > 0) {
        var children = [];
        var childCount = getRandomInt(2,5);
        for (var i = 0; i < childCount; i++) {
            children.push(
                new Asteroid(
                    this.game,
                    {
                        scale: this.scale * 2/3,
                        inertia: getRandomlyRotatedVector(this.inertia),
                        initialPosition: [this.geometry.x, this.geometry.y],
                        level: this.level - 1
                    }
                )
            )
        }
        return children;
    }
    return []
};