/**
 * Created by ruben on 12/1/2014.
 */
console.log("loading mini-project.js");

function Game() {
    this.score = 0;
    this.highscore = 0;
    this.level = 1;
    this.gameOver = false;  // If true, ignore keys
    this.guiElements = {
        finalScoreText: "",  // Displayed when Game Over
        scoreBox: undefined, // Displayed in the top right corner at all times
        levelBox: undefined,  // Displayed in the top left corner at all times
        progressBar: undefined,  // Displayed in the top left corner at all times
        highscoreBox: undefined  // Displayed in the top left corner at all times
    };
    this.sounds = {
        atmosphere: undefined
    };
    this.ticksDisabled = false;
    this.stage = undefined;
    this.player = undefined;
    this.preloader = undefined;
    this.asteroids = [];
}

Game.prototype.onLoadProgress = function (e) {
    this.updateProgressBar(e.progress * 100);
};

Game.prototype.onLoadComplete = function (e) {
    console.log("Loading done");
    this.init();
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", this.onTick());
};

Game.prototype.preload = function () {
    this.stage = new createjs.Stage("main_canvas");
    this.setupProgressBar();
    this.preloader = new Preloader(this);
    this.preloader.load_queue();
};

Game.prototype.init = function() {
    console.log("Initializing");
    this.setupStage();
    this.setupPlayer();
    this.setupAsteroids();
    this.setupScoreBox();
    this.setupLevelBox();
    this.setupHighscoreBox();

    window.onkeydown = this.keyDownEvent();
    window.onkeyup = this.keyUpEvent();
};

Game.prototype.setupStage = function () {
    this.guiElements.finalScoreText = "";
    this.asteroids = [];
    this.level = 1;
    this.stage = new createjs.Stage("main_canvas");
    this.stage.addChild(new createjs.Bitmap(this.preloader.queue.getResult("background1")));
    this.ticksDisabled = false;
    try {
        this.sounds.atmosphere.stop();
    } catch (e){}
    this.sounds.atmosphere = new createjs.Sound.play("atmosphere");
};

Game.prototype.setupPlayer = function () {
    try {
        this.stage.removeChild(this.player);
    } catch (e) {
        console.log("Could not remove player")
    }
    this.player = new Spaceship(this);
    this.player.geometry.x = this.stage.canvas.width / 2;
    this.player.geometry.y = this.stage.canvas.height / 2;
    this.gameOver = false;
    this.score = 0;
    this.stage.addChild(this.player.geometry);
};

Game.prototype.setupAsteroids = function () {
    var aroid = new Asteroid(this, {
        level: this.level,
        scale: Math.pow(1.20, this.level)
    });
    this.stage.addChild(aroid.geometry);
    this.asteroids.push(aroid);
};

Game.prototype.setupScoreBox = function () {
    var scoreBox = new createjs.Text("", "20px Arial", "#009900");
    var padding = 15;
    scoreBox.textAlign = "right";
    scoreBox.x = this.stage.canvas.width - padding;
    scoreBox.y = padding;
    this.guiElements.scoreBox = scoreBox;
    this.stage.addChild(this.guiElements.scoreBox);
};

Game.prototype.setupLevelBox = function () {
    var levelBox= new createjs.Text("", "20px Arial", "#009900");
    var padding = 15;
    levelBox.textAlign = "left";
    levelBox.x = padding;
    levelBox.y = padding;
    this.guiElements.levelBox = levelBox;
    this.stage.addChild(this.guiElements.levelBox);
};

Game.prototype.setupHighscoreBox = function () {
    var highscoreBox = new createjs.Text("", "20px Arial", "#009900");
    var padding = 15;
    highscoreBox.textAlign = "left";
    highscoreBox.x = padding;
    highscoreBox.y = this.stage.canvas.height - padding - 20;
    this.guiElements.highscoreBox = highscoreBox;
    this.stage.addChild(this.guiElements.highscoreBox);
};

Game.prototype.updateHighscoreBox = function () {
    this.guiElements.highscoreBox.text = "Highscore: " + this.highscore;
};

Game.prototype.setupProgressBar = function () {
    var progressBar= new createjs.Text("Loading: ----------", "20px Arial", "#009900");
    progressBar.textAlign = "center";
    progressBar.x = this.stage.canvas.width / 2;
    progressBar.y = this.stage.canvas.height / 2;
    this.guiElements.progressBar = progressBar;
    this.stage.addChild(this.guiElements.progressBar);
};

Game.prototype.updateProgressBar = function (progress) {
    var text = "Loading: ";
    for (var i = 0; i < progress / 10; i++) {
        text += "#"
    }
    for (var i = 0; i < 10 - progress / 10; i++) {
        text += "-"
    }
    console.log(text);
    this.guiElements.progressBar.text = text;
    this.stage.update();
};

Game.prototype.movePlayer = function () {
    // If moved out of screen, enter screen on opposite side
    if (this.player.geometry.x > this.stage.canvas.width)
        this.player.geometry.x = 0;
    if (this.player.geometry.x < 0)
        this.player.geometry.x = this.stage.canvas.width;
    if (this.player.geometry.y > this.stage.canvas.height)
        this.player.geometry.y = 0;
    if (this.player.geometry.y < 0)
        this.player.geometry.y = this.stage.canvas.height;

    this.player.move();

    // move the ships bullets
    for (var i=0;i<this.player.bullets.length;i++) {
        this.player.bullets[i].move();

        // If moved out of screen, remove it
        if (this.player.bullets[i].geometry.x > this.stage.canvas.width
            || this.player.bullets[i].geometry.x < 0
            || this.player.bullets[i].geometry.y > this.stage.canvas.height
            || this.player.bullets[i].geometry.y < 0) {
            this.stage.removeChild(this.player.bullets[i].geometry);
            this.player.bullets.splice(i, 1);
        }
    }
};

Game.prototype.moveAsteroids = function () {
    for (var i=0;i<this.asteroids.length;i++) {
        this.asteroids[i].move();
        var offScreenModifier = 30;
        // If moved out of screen, enter screen on opposite side
        if (this.asteroids[i].geometry.x > this.stage.canvas.width + offScreenModifier)
            this.asteroids[i].geometry.x = 0 - offScreenModifier;
        if (this.asteroids[i].geometry.x < 0 - offScreenModifier)
            this.asteroids[i].geometry.x = this.stage.canvas.width + offScreenModifier;
        if (this.asteroids[i].geometry.y > this.stage.canvas.height + offScreenModifier)
            this.asteroids[i].geometry.y = 0 - offScreenModifier;
        if (this.asteroids[i].geometry.y < 0 - offScreenModifier)
            this.asteroids[i].geometry.y = this.stage.canvas.height + offScreenModifier;
    }
};

Game.prototype.keyDownEvent = function (event) {
    var game = this;
    return function (e) {
        game.player.keyDownHandler(e);
    }
};

Game.prototype.keyUpEvent = function (event) {
    var game = this;
    return function (e) {
        game.player.keyUpHandler(e);
    }
};

Game.prototype.onTick = function (e) {
    var game = this;
    return function (e) {
        // If the game has ticksEnabled, stop ticking
        if (!game.ticksDisabled) {
            try {
                if (!game.gameOver) {
                    game.player.handleKeys();
                }
                game.movePlayer();
                game.moveAsteroids();
                game.checkHits();
                game.updateScoreBox();
                game.updateLevelBox();
                game.updateHighscoreBox();

                game.stage.update(e);
            } catch (e) {
                game.ticksDisabled = true;
                console.log("The game crashed ¯\\_(ツ)_/¯");
                game.guiElements.finalScoreText = "That's a bug! sorry ¯\\_(ツ)_/¯";
                var scoreFlag = new createjs.Text(game.guiElements.finalScoreText, "20px Arial", "#990000");
                scoreFlag.textAlign="center";
                scoreFlag.x = game.stage.canvas.width / 2;
                scoreFlag.y = game.stage.canvas.height / 2;
                game.stage.addChild(scoreFlag);
                game.stage.update();
                console.log(e.stack);
                throw e;
            }
        }
    }
};

Game.prototype.updateScoreBox = function () {
    this.guiElements.scoreBox.text = "score: " + this.score;
};

Game.prototype.updateLevelBox = function () {
    this.guiElements.levelBox.text = "Level: " + this.level;
};

Game.prototype.checkHits = function () {
    var hits = [];
    for (var asteroid_i = 0; asteroid_i < this.asteroids.length; asteroid_i++) {
        // Check if asteroid and bullets collide
        for (var bullet_i = 0; bullet_i < this.player.bullets.length; bullet_i++) {
            var asteroid = this.asteroids[asteroid_i];
            var bullet = this.player.bullets[bullet_i];
            if (hitTest(bullet, asteroid)) {
                hits.push([bullet_i, asteroid_i])
            }
        }

        // Check if asteroid and player collide
        if (hitTest(this.player, this.asteroids[asteroid_i])) {
            this.setGameOver();
            return;
        }
    }

    // Update the stage
    for (var i = 0; i < hits.length; i++) {
        var bullet = hits[i][0] - i;
        var asteroid = hits[i][1] - i;
        this.destroyAsteroidWithBullet(asteroid, bullet)
    }
};

Game.prototype.destroyAsteroidWithBullet = function (asteroid, bullet) {
    // Remove bullet from game
    try {
        this.stage.removeChild(this.player.bullets[bullet].geometry);
        this.player.bullets.splice(bullet, 1);
    } catch (e) {
        if (!e instanceof TypeError) {
            throw e;
        }
    }

    // Break the asteroid
    var children = this.asteroids[asteroid].spawnChildren();
    this.stage.removeChild(this.asteroids[asteroid].geometry);
    var sound = createjs.Sound.play("asteroidDestroyed1");
    sound.setVolume(.3);
    this.asteroids.splice(asteroid, 1);
    this.score += 1;
        for (var i = 0; i < children.length; i++) {
        var obj = children[i];
        this.asteroids.push(obj);
        this.stage.addChild(obj.geometry);
    }

    // If there are no asteroids left, create some new ones
    if (this.asteroids.length == 0) {
        this.level += 1;
        this.setupAsteroids();
    }
};

Game.prototype.setGameOver = function () {
    if (!this.guiElements.finalScoreText) {
        this.stage.removeChild(this.guiElements.scoreBox);
        this.guiElements.finalScoreText = "Game Over | score: " + this.score;
        console.log(this.guiElements.finalScoreText);
        this.gameOver = true;
        if (this.score > this.highscore) {
            this.highscore = this.score;
        }

        this.stage.removeChild(this.player.geometry);
        var explosion = new createjs.SpriteSheet(this.preloader.queue.getResult("explosion"));
        var prev_geometry = this.player.geometry;
        this.player.geometry = new createjs.Sprite(explosion, "explosion");
        this.player.geometry.x = prev_geometry.x;
        this.player.geometry.y = prev_geometry.y;
        var game = this;
        this.player.geometry.on('animationend', function () {
            game.stage.removeChild(game.player.geometry);
        });
        this.stage.addChild(this.player.geometry);
        createjs.Sound.play("explosionSound1");
        this.sounds.atmosphere.stop();

        var scoreFlag = new createjs.Text(this.guiElements.finalScoreText, "20px Arial", "#009900");
        scoreFlag.textAlign="center";
        scoreFlag.x = this.stage.canvas.width / 2;
        scoreFlag.y = this.stage.canvas.height / 2;
        this.stage.addChild(scoreFlag);
    }
};

var game;
function newGame() {
    game = new Game();
    game.preload();
}

function hitTest(obj1, obj2) {
    if (obj1.radius && obj2.radius) {
        // Calculate the distance between the objects.
        a = Math.abs(obj1.geometry.x - obj2.geometry.x);
        b = Math.abs(obj1.geometry.y - obj2.geometry.y);
        distance = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));  // Pythagoras
        // Since they are round, they collide if distance is less than radius1 + radius2
        return distance < obj1.radius + obj2.radius
    }
    return false;
}