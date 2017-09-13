'use strict';

{
  //set up RAF
  const requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame;

  //setup canvas
  const $canvas = document.getElementById("canvas");
  const $fps = document.getElementById("fps");
  const $score = document.getElementById("score");
  const $time = document.getElementById("time");
  const $weather = document.getElementById("weather");
  const $boat = document.getElementById("broat");
  const ctx = $canvas.getContext("2d");
  const audio = new Audio('sicksong.mp4');
  const cache = document.createElement("canvas");
  const cache2 = document.createElement("canvas");
  let drawWater = false;

  //canvas h & w
  const width = window.innerWidth - 10;
  const height = window.innerHeight - 10;
  $canvas.height = height;
  $canvas.width = width;
  cache.height = height;
  cache.width = width;
  cache2.height = height;
  cache2.width = width;

    //use to keep state of keypresses (like if they're pressing up, down, or both)
  const keys = [];

  //keep track of box entities
  class Boxes {
    constructor() {
      this.pos = [];
      this._b = [];
    }
    push(i) {

      //add boxes
      this._b.push(i);

      //first x (going left to right)
      const x1 = Math.floor((i.x / width) *  10);

      //second x
      const x2 = Math.floor(((i.x + i.width) / width) * 10);

      //first y (going left to right)
      const y1 = Math.floor((i.y / height) * 10);

      //second y
      const y2 = Math.floor(((i.y + i.height) / height) * 10);

      const min = x1 + y1;
      const max = x2 + y2;
      for (let j = min; j <= max; j++) {
        if (!this.pos[j])
          this.pos[j] = [];
        this.pos[j].push(i);
      }

      redraw = true;
    }

    getBoxes() {
      return this._b;
    }

    //get objects near player
    getNear(p) {


      //first x (going left to right)
      const x1 = Math.floor((p.x / width) *  10);

      //second x
      const x2 = Math.floor(((p.x + p.width) / width) * 10);

      //first y (going left to right)
      const y1 = Math.floor((p.y / height) * 10);

      //second y
      const y2 = Math.floor(((p.y + p.height) / height) * 10);

      const min = x1 + y1;
      const max = x2 + y2;
      const s = new Set();
      for (let i = min; i <= max; i++) {
        if (this.pos[i])
          this.pos[i].forEach(item => s.add(item));
      }

      //get array and return it from the set
      return Array.from(s);
    }
  }

  //actually make the boxes class
  const boxes = new Boxes();

  //lets us stop the gameloop
  let stop = false;

  //little optimization allowing us to redraw boxes only if need-be
  let redraw = true;
  let redrawWater = false;

  //for frame tracking
  let frame = 0;
  let fps = 0;
  let lastFrame = Date.now();
  let score = 0;


  //rate at which player slows
  const friction = .9;
  const gravity = .6;

  //game state
  const player = {
    x : 70,
    y : 175,
    width : 15,
    height : 15,
    speed: 4,
    velX: 0,
    velY: 0,
    jumping: true,
    grounded: false,
    score: 0,
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
    height: 10,
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
      if (!this.collided) {
        this.collided = true;
        boxes.push({
          x: 540,
          y: height - 390,
          width: 70,
          height: 10,
        });
        boxes.push({
          x: 670,
          y: height - 310,
          width: 80,
          height: 10
        });
      }
    }
  });

  const coin = {
    colors: ['#42F679', '#286DBB', '#B64CC1', '#C14C7C', '#4C51C1'],
    color: '#42F679',
    x: boxes.getBoxes()[3].x + 28,
    y: boxes.getBoxes()[3].y - 46,
    width: 15,
    height: 15,
    on: true,
    onCollision() {
      const index = () => Math.floor(Math.random() * 6 + 1);
      coin.color = coin.colors[Math.floor(Math.random() * 5)];
      //since we have null boxes, there's a good chance this won't work at first try
      //so I kind of brute forced it
      let i = index();
      while (!boxes.getBoxes()[i])
        i = index();
      const b = boxes.getBoxes()[i];
      coin.x = b.x + b.width / 2 - coin.width / 2;
      coin.y = b.y - 46;
      score++;
    }
  }

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
      setTimeout(()=> {
        stop = false;
        start();
      }, 50)
    },
  }

  //react to collision with other boxes
  function reactCollision(p, b) {
    b.forEach(box => {
      if (box) {
        const col = collision(p, box);
        if (col)
          moveCol(p, col); //if collision, move player appropriately
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
    const vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2));
    const vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2));
        // add the half widths and half heights of the objects
    const hWidths = (shapeA.width / 2) + (shapeB.width / 2);
    const hHeights = (shapeA.height / 2) + (shapeB.height / 2);

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
    if (player.grounded)
         player.velY = 0;

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

    if (!redraw) {
      ctx.drawImage(cache, 0, 0);
    }
    //re-draw our player and canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    //fill in our platform
    ctx.fillStyle = "red";
    if (!drawWater)
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
      }
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
    if (coin.on)
      collision(player, coin);

    //will move player according to the hit with boxes
    reactCollision(player, boxes.getNear(player));

    //apply gravity
    weight();

    //we will assess this on every render
    player.grounded = false;

    //clear map
    ctx.clearRect(0, 0, width, height);

    if (redraw) {

      //fill in our platforms
      ctx.fillStyle = "black";
      ctx.beginPath();
      boxes.getBoxes().forEach((box) => {
        if (box) {
          ctx.rect(box.x, box.y, box.width, box.height);
        }
      });
      redraw = false;
      ctx.fill();
      cache.getContext('2d').drawImage(canvas, 0, 0);
    } else {
      ctx.drawImage(cache, 0, 0);
      if (drawWater)
        ctx.drawImage(cache2, 0, 0);
    }

    ctx.fillStyle = "black";

    //draw player, but only if we're above water
    if (!drawWater || player.y < height - 80)
      ctx.fillRect(player.x, player.y, player.width, player.height);

    //draw lava
    ctx.fillStyle = "red";
    if (!drawWater)
      ctx.fillRect(lava.x, lava.y, lava.width, lava.height);
    if (coin.on) {
      ctx.fillStyle = coin.color;
      ctx.fillRect(
        coin.x,
        coin.y,
        coin.width,
        coin.height,
      );
    }
    //update frame, fps
    frame++;
    fps = 1000 / (Date.now() - lastFrame); //1000ms / ms's since last frame
    lastFrame = Date.now();

    if (stop)
      return;

    // run through the loop again
    requestAnimationFrame(update, $canvas);
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
      }
    };
    setTimeout(bloop(10000, false), 500);
  }

  //starts end animation and triggers the game pause
  function toGame() {
    ctx.drawImage(cache2, 0, 0);
    ctx.drawImage(cache, 0, 0);
    let label = document.getElementById('broatlabel');
    label.classList.remove('visible');
    label.classList.add('fade');
    pushAlongX($boat);
    audio.play();
    stop = true;
    document.getElementById('goodbye').classList.remove('hide');
    setTimeout(() => {
      $boat.classList.add('hide');
      document.getElementById('goodbye').classList.add('visible');
    }, 14000);
  }

  async function pushAlongX(i) {
    let x = 0;
    let add = 10;
    while (x < 12000) {
      if (x == 2200) {
        add += 200;
        i.classList.remove('visible');
        i.classList.add('fade');
      }
      await wait(0);
      i.style.left = `${i.x + add}px`;
      x++;
    }
  }

  function water() {
    drawWater = true;
    coin.on = false;
    $boat.classList.remove('hide');
    document.getElementById('broatlabel').classList.remove('hide');
    setTimeout(() => {
      boxes.push({
        x: 760,
        y: height - 55,
        width: 80,
        height: 15,
        onCollision() {
          toGame();
        }
      });
    }, 2000);
    setTimeout(async () => {
      document.getElementById('broatlabel').classList.add('visible');
      $boat.classList.add('visible');
      document.getElementById('lava').classList.add('fade');
      document.getElementById('wasd').classList.add('fade');
      document.getElementById('github').classList.add('moveUp');
      document.getElementById('fb').classList.add('moveUp');
      document.getElementById('resume').classList.add('moveUp');
      await renderWater();
    }, 50);
  }

  async function renderWater() {
    let x = 0;
    const tileSize = 10;
    const rows = 8;
    const waterColors = ["#0f5e9c", "#2389da", "#1ca3ec", "#5abcd8", "#74ccf4"];
    let cacheCtx = cache2.getContext('2d');
    while (x < width) {
      await wait(0);
      for (let i = 0; i < rows; i++) {
        let fs = waterColors[Math.floor(Math.random() * waterColors.length)];
        ctx.fillStyle = fs;
        cacheCtx.fillStyle = fs;
        ctx.fillRect(x, height - (tileSize * (i + 1)), tileSize, tileSize);
        cacheCtx.fillRect(x, height - (tileSize * (i + 1)), tileSize, tileSize);
      }
      x += tileSize;
    }
    //draw the blue first
    cache.getContext('2d').drawImage(cache2, 0, 0);
  }


  //set up game loop on load
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
