/**
 * Created by ruben on 12/12/14.
 */

function Preloader(game) {
    this.game = game;
    this.queue = undefined;
}

Preloader.prototype.load_queue = function () {
    this.queue = new createjs.LoadQueue();
    this.queue.installPlugin(createjs.Sound);
    this.queue.on('progress', this.onLoad(), this);
    this.queue.on('complete', this.onLoadComplete());
    this.queue.loadManifest([
        // Sprites
        {id: "asteroids", src: "media/sprites/asteroid.json"},
        {id: "spaceship", src: "media/sprites/spaceship.json"},
        {id: "explosion", src: "media/sprites/explosion.json"},
        // Backgrounds
        {id: "background", src: "media/images/space_background.jpg"},
        {id: "background1", src: "media/images/space_background1.jpg"},
        // Sounds
        {id: "atmosphere", src: "media/sounds/atmosphere.mp3"},
        {id: "bullet", src: "media/sounds/bullet_fired.wav"},
        //{id: "asteroidDestroyed", src: "media/sounds/asteroid_destroyed.wav"},
        {id: "asteroidDestroyed1", src: "media/sounds/asteroid_destroyed1.wav"},
        {id: "explosionSound", src: "media/sounds/explosion.wav"},
        {id: "explosionSound1", src: "media/sounds/explosion1.wav"}
    ]);
};

Preloader.prototype.onLoad = function () {
    var game = this.game;
    return function (e) {
        game.onLoadProgress(e);
    }
};

Preloader.prototype.onLoadComplete = function () {
    var game = this.game;
    return function (e) {
        game.onLoadComplete(e);
    }
};