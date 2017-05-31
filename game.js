'use strict';

{
  //set up RAF
  const requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame;

  //set as global
  window.requestAnimationFrame = requestAnimationFrame;

  //setup canvas
  const $canvas = document.getElementById("canvas");
  const $fps = document.getElementById("fps");
  const $score = document.getElementById("score");
  const $time = document.getElementById("time");
  const $weather = document.getElementById("weather");
  const ctx = $canvas.getContext("2d");

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

  const coin = {
    x: 660,
    y: 604,
    width: 30,
    height: 30,
    onCollision() {
      const index = () => Math.floor(Math.random() * 6 + 1);

      //since we have null boxes, there's a good chance this won't work at first try
      //so I kind of brute forced it
      let i = index();
      while (!boxes[i])
        i = index();
      const b = boxes[i];
      coin.x = b.x + 35;
      coin.y = b.y - 46;
      score++;
    }
  }

  //add some boxes
  boxes.push({
    x: 25,
    y: 240,
    width: 100,
    height: 15
  });

  boxes.push({
    x: 325,
    y: 550,
    width: 100,
    height: 20,
  });

  boxes.push({
    x: 505,
    y: 350,
    width: 100,
    height: 15
  });

  boxes.push({
    x: 625,
    y: 650,
    width: 100,
    height: 20,
    onCollision: () => {
      if (!boxes[5]) {
        boxes[5] = {
          x: 750,
          y: 580,
          width: 100,
          height: 15,
        };
        boxes[6] = {
          x: 660,
          y: 495,
          width: 100,
          height: 15,
          onCollision: () => {
            if (!boxes[7])
              boxes[7] = {
                x: 760,
                y: 420,
                width: 100,
                height: 15,
              }
          }
        };
      }
    }
  });
  boxes.push(null, null, null, null) //reserve space for these conditionals

  //add some more boxes
  boxes.push(null);

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
  //set canvas dimensions
  canvas.width = width;
  canvas.height = height;

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

    //re-draw our player and canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    //fill in our platforms
    ctx.beginPath();
    boxes.forEach((box) => {
      if (box)
        ctx.rect(box.x, box.y, box.width, box.height);
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
      }
    };
    setTimeout(bloop(3, false), 500);
  }
  //update the view every animation frame (game loop)
  function update() {

    //reposition our player
    move();

    //check if we're in the lava, if so, restart I guess?
    collision(player, lava);

    //check collision with coin
    collision(player, coin);

    //will move player according to the hit with boxes
    reactCollision(player, boxes);

    //apply gravity
    weight();

    //we will assess this on every render
    player.grounded = false;

    //re-draw our player and canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    //fill in our platforms
    ctx.beginPath();
    boxes.forEach((box) => {
      if (box)
        ctx.rect(box.x, box.y, box.width, box.height);
    });
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.fillRect(lava.x, lava.y, lava.width, lava.height);

    ctx.drawImage(
       img,
       44 * (Math.floor(frame / 3)  % 10),
       0,
       img.width / 10,
       img.height,
       coin.x,
       coin.y,
       coin.width,
       coin.height);
    //update frame, fps
    frame++;
    fps = 1000 / (Date.now() - lastFrame); //1000ms / ms's since last frame
    lastFrame = Date.now();

    if (stop)
      return;

    // run through the loop again
    requestAnimationFrame(update);
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



  //set up game loop on load
  window.addEventListener("load", () => {
    if(document.documentElement.clientWidth > 880) {
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