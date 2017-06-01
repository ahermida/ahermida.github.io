/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

{
  let pushAlongX = (() => {
    var _ref = _asyncToGenerator(function* (i) {
      let x = 0;
      let add = 10;
      while (x < 12000) {
        if (x == 2200) {
          add += 200;
          i.classList.remove('visible');
          i.classList.add('fade');
        }
        yield wait(0);
        i.style.left = `${i.x + add}px`;
        x++;
      }
    });

    return function pushAlongX(_x) {
      return _ref.apply(this, arguments);
    };
  })();

  let renderWater = (() => {
    var _ref3 = _asyncToGenerator(function* () {
      let x = 0;
      const tileSize = 10;
      const rows = 8;
      const waterColors = ["#0f5e9c", "#2389da", "#1ca3ec", "#5abcd8", "#74ccf4"];
      while (x < width) {
        yield wait(0);
        for (let i = 0; i < rows; i++) {
          layerCtx.fillStyle = waterColors[Math.floor(Math.random() * waterColors.length)];
          layerCtx.fillRect(x, height - tileSize * (i + 1), tileSize, tileSize);
        }
        x += tileSize;
      }
    });

    return function renderWater() {
      return _ref3.apply(this, arguments);
    };
  })();

  //set up game loop on load


  //set up RAF
  const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  //setup canvas
  const $canvas = document.getElementById("canvas");
  const $layer = document.getElementById("canvlayer");
  const $fps = document.getElementById("fps");
  const $score = document.getElementById("score");
  const $time = document.getElementById("time");
  const $weather = document.getElementById("weather");
  const $boat = document.getElementById("broat");
  const ctx = $canvas.getContext("2d");
  const layerCtx = $layer.getContext("2d");

  //canvas h & w
  const width = window.innerWidth - 10;
  const height = window.innerHeight - 10;

  //use to keep state of keypresses (like if they're pressing up, down, or both)
  const keys = [];

  //keep track of box entities
  const boxes = [];

  //lets us stop the gameloop
  let stop = false;

  //for frame tracking
  let frame = 0;
  let fps = 0;
  let lastFrame = Date.now();
  const img = new Image();
  img.src = "coin.png";
  let score = 0;

  //rate at which player slows
  const friction = .9;
  const gravity = .6;

  //game state
  const player = {
    x: 70,
    y: 175,
    width: 15,
    height: 15,
    speed: 4,
    velX: 0,
    velY: 0,
    jumping: true,
    grounded: false,
    score: 0
  };

  //add some boxes
  boxes.push({
    x: 30,
    y: 240,
    width: 90,
    height: 10
  });

  boxes.push({
    x: 310,
    y: height - 200,
    width: 85,
    height: 10
  });

  boxes.push({
    x: 405,
    y: height - 350,
    width: 70,
    height: 10
  });

  boxes.push({
    x: 520,
    y: height - 250,
    width: 80,
    height: 15,
    onCollision: () => {
      if (!boxes[5]) {
        boxes[5] = {
          x: 540,
          y: height - 390,
          width: 70,
          height: 10
        };
        boxes[6] = {
          x: 670,
          y: height - 310,
          width: 80,
          height: 10,
          onCollision: () => {
            if (!boxes[7]) boxes[7] = {
              x: 850,
              y: height - 330,
              width: 60,
              height: 10
            };
          }
        };
      }
    }
  });
  boxes.push(null, null, null, null, null //reserve space for these conditionals

  //add some more boxes
  );boxes.push(null);

  const coin = {
    x: boxes[3].x + 28,
    y: boxes[3].y - 46,
    width: 30,
    height: 30,
    on: true,
    onCollision() {
      const index = () => Math.floor(Math.random() * 6 + 1);

      //since we have null boxes, there's a good chance this won't work at first try
      //so I kind of brute forced it
      let i = index();
      while (!boxes[i]) i = index();
      const b = boxes[i];
      coin.x = b.x + 28;
      coin.y = b.y - 46;
      score++;
    }
  };

  const lava = {
    width,
    height: 20,
    x: 0,
    y: height - 20,
    onCollision: () => {
      player.x = 70;
      player.y = 175;
      player.velX = 0;
      player.velY = 0;
      stop = true; //stop the game and pause,
      //restart in 50ms with neat little animation
      setTimeout(() => {
        stop = false;
        start();
      }, 50);
    }
    //set canvas dimensions
  };$canvas.width = width;
  $canvas.height = height;
  $layer.width = width;
  $layer.height = height;

  //react to collision with other boxes
  function reactCollision(p, b) {
    b.forEach(box => {
      if (box) {
        const col = collision(p, box);
        if (col) moveCol(p, col); //if collision, move player appropriately
      }
    });
  }
  function moveCol(p, col) {
    switch (col) {
      case 't':
        p.velY = 0;
        break;
      case 'l':
        p.velX = 0;
        p.jumping = false;
        break;
      case 'r':
        p.velX = 0;
        p.jumping = false;
        break;
      case 'b':
        p.jumping = false;
        p.grounded = true;
        p.velY = 0;
    }
  }

  function collision(shapeA, shapeB) {
    // get the vectors to check against
    const vX = shapeA.x + shapeA.width / 2 - (shapeB.x + shapeB.width / 2);
    const vY = shapeA.y + shapeA.height / 2 - (shapeB.y + shapeB.height / 2);
    // add the half widths and half heights of the objects
    const hWidths = shapeA.width / 2 + shapeB.width / 2;
    const hHeights = shapeA.height / 2 + shapeB.height / 2;

    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      if (shapeB.onCollision) {
        shapeB.onCollision();
      }
      const oX = hWidths - Math.abs(vX);
      const oY = hHeights - Math.abs(vY);
      if (oX >= oY) {
        if (vY > 8) {
          shapeA.y += oY;
          return 't';
        } else {
          shapeA.y -= oY;
          return 'b';
        }
      } else {
        if (vX > 0) {
          shapeA.x += oX;
          return 'l';
        } else {
          shapeA.x -= oX;
          return 'r';
        }
      }
    }
  }

  //move player
  function move() {

    //shift key gives player a boost
    if (keys[16]) {
      player.speed = 10;
    } else {
      player.speed = 5;
    }
    // ↑ key
    if (keys[38] || keys[87]) {
      if (!player.jumping) {
        jump();
      }
    }

    // → key and d
    if (keys[39] || keys[68]) {

      //instant turnaround if facing other way
      if (player.velX < 0) {
        player.velX = 0;
      }

      if (player.velX < player.speed) {
        player.velX++;
      }
    }

    // ← key or a
    if (keys[37] || keys[65]) {

      //instant turnaround if facing other way
      if (player.velX > 0) {
        player.velX = 0;
      }

      if (player.velX > -player.speed) {
        player.velX--;
      }
    }

    //factor that slows down player
    player.velX *= friction;
    if (player.grounded) player.velY = 0;

    // actually move player
    player.x += player.velX;
    player.y += player.velY;

    //don't escape canvas! (width-wise)
    if (player.x >= width - player.width) {
      player.x = width - player.width;
    } else if (player.x <= 0) {
      player.x = 0;
    }

    //don't escape vertically either
    if (player.y <= 0) {
      player.y = 0;
    } else if (player.y >= height - player.height) {
      player.y = height - player.height;
      player.jumping = false;
    }
  }

  //allow player to jump
  function jump() {

    //instant increase in velocity Y (go up)
    player.velY = -2 * player.speed;
    player.jumping = true;
    player.grounded = false;
  }

  function weight() {
    player.velY += gravity;
  }

  //just an opportunity to animate character into game
  function start() {

    //re-draw our player and canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    //fill in our platforms
    ctx.beginPath();
    boxes.forEach(box => {
      if (box) ctx.rect(box.x, box.y, box.width, box.height);
    });
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.fillRect(lava.x, lava.y, lava.width, lava.height);

    let bloop = (n, black) => {
      return () => {
        if (n == -2) {
          update();
        } else {
          //re-draw our player and canvas
          ctx.clearRect(player.x, player.y, player.width, player.height);
          ctx.fillStyle = black ? 'black' : 'white';
          ctx.fillRect(player.x, player.y, player.width, player.height);
          setTimeout(() => {
            //re-draw our player and canvas
            bloop(--n, !black)();
          }, 500);
        }
      };
    };
    setTimeout(bloop(3, false), 500);
  }
  //update the view every animation frame (game loop)
  function update() {

    if (score == 8) {
      water();
      score++;
    }
    //reposition our player
    move();

    //check if we're in the lava, if so, restart I guess?
    collision(player, lava);

    //check collision with coin
    if (coin.on) collision(player, coin);

    //will move player according to the hit with boxes
    reactCollision(player, boxes);

    //apply gravity
    weight();

    //we will assess this on every render
    player.grounded = false;

    //re-draw our player and coin
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    //fill in our platforms
    ctx.beginPath();
    boxes.forEach(box => {
      if (box) ctx.rect(box.x, box.y, box.width, box.height);
    });
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.fillRect(lava.x, lava.y, lava.width, lava.height);
    if (coin.on) ctx.drawImage(img, 44 * (Math.floor(frame / 3) % 10), 0, 44, 44, coin.x, coin.y, 25, 25);
    //update frame, fps
    frame++;
    fps = 1000 / (Date.now() - lastFrame); //1000ms / ms's since last frame
    lastFrame = Date.now();

    if (stop) return;

    // run through the loop again
    requestAnimationFrame(update);
  }

  function wait(delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  function bloopForever() {
    let bloop = (n, black) => {
      return () => {
        if (n == -2) {
          update();
        } else {
          //re-draw our player and canvas
          ctx.clearRect(player.x, player.y, player.width, player.height);
          ctx.fillStyle = black ? 'black' : 'white';
          ctx.fillRect(player.x, player.y, player.width, player.height);
          setTimeout(() => {
            //re-draw our player and canvas
            bloop(--n, !black)();
          }, 750);
        }
      };
    };
    setTimeout(bloop(10000, false), 500);
  }

  //starts end animation and triggers the game pause
  function toGame() {
    stop = true;
    setTimeout(() => {
      ctx.clearRect(player.x, player.y, player.width, player.height);
      ctx.clearRect(coin.x, coin.y, coin.width, coin.height);
    }, 50);
    delete boxes[boxes.length - 1];
    let label = document.getElementById('broatlabel');
    label.classList.remove('visible');
    label.classList.add('fade');
    pushAlongX($boat);
    const audio = new Audio('sicksong.mp4');
    audio.play();
    document.getElementById('goodbye').classList.remove('hide');
    setTimeout(() => {
      $boat.classList.add('hide');
      document.getElementById('goodbye').classList.add('visible');
    }, 14000);
  }

  function water() {
    stop = true;
    coin.on = false;
    $boat.classList.remove('hide');
    document.getElementById('broatlabel').classList.remove('hide');
    setTimeout(() => {
      boxes.push({
        x: 760,
        y: height - 50,
        width: 80,
        height: 15,
        onCollision() {
          toGame();
        }
      });
    }, 2000);
    //stop = true;
    setTimeout(_asyncToGenerator(function* () {
      document.getElementById('broatlabel').classList.add('visible');
      $boat.classList.add('visible');
      document.getElementById('lava').classList.add('fade');
      document.getElementById('wasd').classList.add('fade');
      document.getElementById('github').classList.add('moveUp');
      document.getElementById('fb').classList.add('moveUp');
      document.getElementById('resume').classList.add('moveUp');
      yield renderWater();
      stop = false;
      update();
    }), 50);
  }

  window.addEventListener("load", () => {
    if (document.documentElement.clientWidth > 880) {
      start();
    } else {
      player.x = 212;
      player.y = 54;
      player.height = 21;
      player.width = 14;
      bloopForever();
    }
  });

  //set state for key presses (in keys)
  document.body.addEventListener("keydown", e => keys[e.keyCode] = true);
  document.body.addEventListener("keyup", e => keys[e.keyCode] = false);
}

/***/ })
/******/ ]);