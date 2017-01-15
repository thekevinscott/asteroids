// Canvas Asteroids
//
// Copyright (c) 2010 Doug McInnes
//

console.log('** Welcome to Asteroids');
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  70: 'f',
  71: 'g',
  72: 'h',
  77: 'm',
  80: 'p'
}

KEY_STATUS = { keyDown:false };
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}

$(window).keydown(function (e) {
  KEY_STATUS.keyDown = true;
  if (KEY_CODES[e.keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[e.keyCode]] = true;
  }
}).keyup(function (e) {
  KEY_STATUS.keyDown = false;
  if (KEY_CODES[e.keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[e.keyCode]] = false;
  }
});

GRID_SIZE = 60;

Matrix = function (rows, columns) {
  var i, j;
  this.data = new Array(rows);
  for (i = 0; i < rows; i++) {
    this.data[i] = new Array(columns);
  }

  this.configure = function (rot, scale, transx, transy) {
    var rad = (rot * Math.PI)/180;
    var sin = Math.sin(rad) * scale;
    var cos = Math.cos(rad) * scale;
    this.set(cos, -sin, transx,
             sin,  cos, transy);
  };

  this.set = function () {
    var k = 0;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < columns; j++) {
        this.data[i][j] = arguments[k];
        k++;
      }
    }
  }

  this.multiply = function () {
    var vector = new Array(rows);
    for (i = 0; i < rows; i++) {
      vector[i] = 0;
      for (j = 0; j < columns; j++) {
        vector[i] += this.data[i][j] * arguments[j];
      }
    }
    return vector;
  };
};

GridNode = function () {
  this.north = null;
  this.south = null;
  this.east  = null;
  this.west  = null;

  this.nextSprite = null;

  this.dupe = {
    horizontal: null,
    vertical:   null
  };

  this.enter = function (sprite) {
    sprite.nextSprite = this.nextSprite;
    this.nextSprite = sprite;
  };

  this.leave = function (sprite) {
    var ref = this;
    while (ref && (ref.nextSprite != sprite)) {
      ref = ref.nextSprite;
    }
    if (ref) {
      ref.nextSprite = sprite.nextSprite;
      sprite.nextSprite = null;
    }
  };

  this.eachSprite = function(sprite, callback) {
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      callback.call(sprite, ref);
    }
  };

  this.isEmpty = function (collidables) {
    var empty = true;
    var ref = this;
    while (ref.nextSprite) {
      ref = ref.nextSprite;
      empty = !ref.visible || collidables.indexOf(ref.name) == -1
      if (!empty) break;
    }
    return empty;
  };
};

// borrowed from typeface-0.14.js
// http://typeface.neocracy.org
Text = {
  renderGlyph: function (ctx, face, char) {

    var glyph = face.glyphs[char];

    if (glyph.o) {

      var outline;
      if (glyph.cached_outline) {
        outline = glyph.cached_outline;
      } else {
        outline = glyph.o.split(' ');
        glyph.cached_outline = outline;
      }

      var outlineLength = outline.length;
      for (var i = 0; i < outlineLength; ) {

        var action = outline[i++];

        switch(action) {
          case 'm':
            ctx.moveTo(outline[i++], outline[i++]);
            break;
          case 'l':
            ctx.lineTo(outline[i++], outline[i++]);
            break;

          case 'q':
            var cpx = outline[i++];
            var cpy = outline[i++];
            ctx.quadraticCurveTo(outline[i++], outline[i++], cpx, cpy);
            break;

          case 'b':
            var x = outline[i++];
            var y = outline[i++];
            ctx.bezierCurveTo(outline[i++], outline[i++], outline[i++], outline[i++], x, y);
            break;
        }
      }
    }
    if (glyph.ha) {
      ctx.translate(glyph.ha, 0);
    }
  },

  renderText: function(text, size, x, y) {
    this.context.save();

    this.context.translate(x, y);
    //this.context.strokeStyle = 'white';
    this.context.fillStyle = 'white';

    var pixels = size * 72 / (this.face.resolution * 100);
    this.context.scale(pixels, -1 * pixels);
    this.context.beginPath();
    var chars = text.split('');
    var charsLength = chars.length;
    for (var i = 0; i < charsLength; i++) {
      this.renderGlyph(this.context, this.face, chars[i]);
    }
    this.context.fill();

    this.context.restore();
  },

  context: null,
  face: null
};

Game = {
  score: 0,
  totalAsteroids: 5,
  lives: 0,

  canvasWidth: 800,
  canvasHeight: 600,

  sprites: [],
  ship: null,
  bigAlien: null,

  nextBigAlienTime: null,


  spawnAsteroids: function (count) {
    if (!count) count = this.totalAsteroids;
    for (var i = 0; i < count; i++) {
      var roid = new Asteroid();
      roid.x = Math.random() * this.canvasWidth;
      roid.y = Math.random() * this.canvasHeight;
      while (!roid.isClear()) {
        roid.x = Math.random() * this.canvasWidth;
        roid.y = Math.random() * this.canvasHeight;
      }
      roid.vel.x = Math.random() * 4 - 2;
      roid.vel.y = Math.random() * 4 - 2;
      if (Math.random() > 0.5) {
        roid.points.reverse();
      }
      roid.vel.rot = Math.random() * 2 - 1;
      Game.sprites.push(roid);
    }
  },

  explosionAt: function (x, y) {
    var splosion = new Explosion();
    splosion.x = x;
    splosion.y = y;
    splosion.visible = true;
    Game.sprites.push(splosion);
  },

  FSM: {
    boot: function () {
      Game.spawnAsteroids(5);
      this.state = 'waiting';
    },
    waiting: function () {
      Text.renderText('Press Space to Start', 36, Game.canvasWidth/2 - 270, Game.canvasHeight/2);
      if (KEY_STATUS.space || window.gameStart) {
        KEY_STATUS.space = false; // hack so we don't shoot right away
        window.gameStart = false;
        this.state = 'start';
      }
    },
    start: function () {
      for (var i = 0; i < Game.sprites.length; i++) {
        if (Game.sprites[i].name == 'asteroid') {
          Game.sprites[i].die();
        } else if (Game.sprites[i].name == 'bullet' ||
                   Game.sprites[i].name == 'bigalien') {
          Game.sprites[i].visible = false;
        }
      }

      Game.score = 0;
      Game.lives = 2;
      Game.totalAsteroids = 2;
      Game.spawnAsteroids();

      Game.nextBigAlienTime = Date.now() + 30000 + (30000 * Math.random());

      this.state = 'spawn_ship';
    },
    spawn_ship: function () {
      Game.ship.x = Game.canvasWidth / 2;
      Game.ship.y = Game.canvasHeight / 2;
      if (Game.ship.isClear()) {
        Game.ship.rot = 0;
        Game.ship.vel.x = 0;
        Game.ship.vel.y = 0;
        Game.ship.visible = true;
        this.state = 'run';
      }
    },
    run: function () {
      for (var i = 0; i < Game.sprites.length; i++) {
        if (Game.sprites[i].name == 'asteroid') {
          break;
        }
      }
      if (i == Game.sprites.length) {
        this.state = 'new_level';
      }
      if (!Game.bigAlien.visible &&
          Date.now() > Game.nextBigAlienTime) {
        Game.bigAlien.visible = true;
        Game.nextBigAlienTime = Date.now() + (30000 * Math.random());
      }
    },
    new_level: function () {
      if (this.timer == null) {
        this.timer = Date.now();
      }
      // wait a second before spawning more asteroids
      if (Date.now() - this.timer > 1000) {
        this.timer = null;
        Game.totalAsteroids++;
        if (Game.totalAsteroids > 12) Game.totalAsteroids = 12;
        Game.spawnAsteroids();
        this.state = 'run';
      }
    },
    player_died: function () {
      if (Game.lives < 0) {
        this.state = 'end_game';
      } else {
        if (this.timer == null) {
          this.timer = Date.now();
        }
        // wait a second before spawning
        if (Date.now() - this.timer > 1000) {
          this.timer = null;
          this.state = 'spawn_ship';
        }
      }
    },
    end_game: function () {
      Text.renderText('GAME OVER', 50, Game.canvasWidth/2 - 160, Game.canvasHeight/2 + 10);
      if (this.timer == null) {
        this.timer = Date.now();
      }
      // wait 5 seconds then go back to waiting state
      if (Date.now() - this.timer > 5000) {
        this.timer = null;
        this.state = 'waiting';
      }

      window.gameStart = false;
    },

    execute: function () {
      this[this.state]();
    },
    state: 'boot'
  }

};

$(function () {
  const game = $('.game');
  const resizeCanvas = () => {
    canvas.attr('width', game.width());
    canvas.attr('height', game.height());
    Game.canvasWidth  = canvas.width();
    Game.canvasHeight = canvas.height();
  };

  const canvas = game.find('canvas');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, false);

  const context = canvas[0].getContext("2d");

  Text.context = context;
  Text.face = vector_battle;

  var gridWidth = Math.round(Game.canvasWidth / GRID_SIZE);
  var gridHeight = Math.round(Game.canvasHeight / GRID_SIZE);
  var grid = new Array(gridWidth);
  for (var i = 0; i < gridWidth; i++) {
    grid[i] = new Array(gridHeight);
    for (var j = 0; j < gridHeight; j++) {
      grid[i][j] = new GridNode();
    }
  }

  // set up the positional references
  for (var i = 0; i < gridWidth; i++) {
    for (var j = 0; j < gridHeight; j++) {
      var node   = grid[i][j];
      node.north = grid[i][(j == 0) ? gridHeight-1 : j-1];
      node.south = grid[i][(j == gridHeight-1) ? 0 : j+1];
      node.west  = grid[(i == 0) ? gridWidth-1 : i-1][j];
      node.east  = grid[(i == gridWidth-1) ? 0 : i+1][j];
    }
  }

  // set up borders
  for (var i = 0; i < gridWidth; i++) {
    grid[i][0].dupe.vertical            =  Game.canvasHeight;
    grid[i][gridHeight-1].dupe.vertical = -Game.canvasHeight;
  }

  for (var j = 0; j < gridHeight; j++) {
    grid[0][j].dupe.horizontal           =  Game.canvasWidth;
    grid[gridWidth-1][j].dupe.horizontal = -Game.canvasWidth;
  }

  var sprites = [];
  Game.sprites = sprites;

  // so all the sprites can use it
  Sprite.prototype.context = context;
  Sprite.prototype.grid    = grid;
  Sprite.prototype.matrix  = new Matrix(2, 3);

  var ship = new Ship();

  ship.x = Game.canvasWidth / 2;
  ship.y = Game.canvasHeight / 2;

  sprites.push(ship);

  ship.bullets = [];
  for (var i = 0; i < 100; i++) {
    var bull = new Bullet();
    ship.bullets.push(bull);
    sprites.push(bull);
  }
  Game.ship = ship;

  var bigAlien = new BigAlien();
  bigAlien.setup();
  sprites.push(bigAlien);
  Game.bigAlien = bigAlien;

  var extraDude = new Ship();
  extraDude.scale = 0.6;
  extraDude.visible = true;
  extraDude.preMove = null;
  extraDude.children = [];

  var i, j = 0;

  var paused = false;
  var showFramerate = false;
  var avgFramerate = 0;
  var frameCount = 0;
  var elapsedCounter = 0;

  var lastFrame = Date.now();
  var thisFrame;
  var elapsed;
  var delta;

  var canvasNode = canvas[0];

  // shim layer with setTimeout fallback
  // from here:
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (/* function */ callback, /* DOMElement */ element) {
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var mainLoop = function () {
    context.clearRect(0, 0, Game.canvasWidth, Game.canvasHeight);

    Game.FSM.execute();

    if (KEY_STATUS.g) {
      context.beginPath();
      for (var i = 0; i < gridWidth; i++) {
        context.moveTo(i * GRID_SIZE, 0);
        context.lineTo(i * GRID_SIZE, Game.canvasHeight);
      }
      for (var j = 0; j < gridHeight; j++) {
        context.moveTo(0, j * GRID_SIZE);
        context.lineTo(Game.canvasWidth, j * GRID_SIZE);
      }
      context.closePath();
      context.stroke();
    }

    thisFrame = Date.now();
    elapsed = thisFrame - lastFrame;
    lastFrame = thisFrame;
    delta = elapsed / 30;

    for (i = 0; i < sprites.length; i++) {

      sprites[i].run(delta);

      if (sprites[i].reap) {
        sprites[i].reap = false;
        sprites.splice(i, 1);
        i--;
      }
    }

    // score
    var score_text = ''+Game.score;
    Text.renderText(score_text, 21, Game.canvasWidth - 16 * score_text.length, 25);

    // extra dudes
    for (i = 0; i < Game.lives; i++) {
      context.save();
      extraDude.x = Game.canvasWidth - (8 * (i + 1));
      extraDude.y = 40;
      extraDude.configureTransform();
      extraDude.draw();
      context.restore();
    }

    if (showFramerate) {
      Text.renderText(''+avgFramerate, 24, Game.canvasWidth - 38, Game.canvasHeight - 2);
    }

    frameCount++;
    elapsedCounter += elapsed;
    if (elapsedCounter > 1000) {
      elapsedCounter -= 1000;
      avgFramerate = frameCount;
      frameCount = 0;
    }

    if (paused) {
      Text.renderText('PAUSED', 72, Game.canvasWidth/2 - 160, 120);
    } else {
      requestAnimFrame(mainLoop, canvasNode);
    }
  };

  mainLoop();

  $(window).keydown(function (e) {
    switch (KEY_CODES[e.keyCode]) {
      case 'f': // show framerate
        showFramerate = !showFramerate;
        break;
      case 'p': // pause
        paused = !paused;
        if (!paused) {
          // start up again
          lastFrame = Date.now();
          mainLoop();
        }
        break;
    }
  });
});

// vim: fdl=0
