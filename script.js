const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

window.addEventListener("resize", ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})

let START = true,
SCORE = 0;

const score = document.getElementById("score");
const score_over = document.getElementById("score-over");

setInterval(()=>{
  if( document.getElementById('again').style.display === "block" && document.getElementById('info-over').style.display === "block"){
    document.getElementById('again').style.display = "none";
  } else { 
    document.getElementById('again').style.display = "block";
  }
},500)

//PLAYER
let LEFT = false,
  RIGHT = false,
  UP = false,
  DOWN = false,
  SHOOT = false,
  BULLETS = [],
  ALIVE = true,
  FRICTION = 0.01,
  particles = [],
  keyAllowed = {};

//ENEMIES
let enemies = [],
  x,
  y,
  explosions = [];

onkeydown = (e) => {
  if (e.keyCode == 37) LEFT = true;
  else if (e.keyCode == 39) RIGHT = true;
  else if (e.keyCode == 38) UP = true;
  else if (e.keyCode == 40) DOWN = true;
  else if (e.keyCode == 32) {
    if (keyAllowed[e.which] === false) return;
    keyAllowed[e.which] = false;
    SHOOT = true;
  }
};
onkeyup = (e) => {
  if (e.keyCode == 37) LEFT = false;
  else if (e.keyCode == 39) RIGHT = false;
  else if (e.keyCode == 38) UP = false;
  else if (e.keyCode == 40) DOWN = false;
  else if (e.keyCode == 32) keyAllowed[e.which] = true;
};

document.onfocus = (e) => {
  if (e.keyCode == 32) keyAllowed = {};
};

const distance = (x1, y1, s1, x2, y2, s2) => {
  let dis_x = x1 - x2;
  let dis_y = y1 - y2;
  let radii_sum = s1 + s2;
  if (
    dis_x * dis_x + dis_y * dis_y <=
    radii_sum * radii_sum
  ) {
    return true;
  }
};

class Player {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.r = 0;
    this.size = size;
  }
  draw() {
    c.save();
    c.translate(this.x + this.size / 2, this.y + this.size / 2);
    c.rotate(this.r);
    c.translate(-(this.x + this.size / 2), -(this.y + this.size / 2));
    c.beginPath();
    c.lineWidth = Math.random() > 0.9 ? 2 : 1;
    c.moveTo(this.x, this.y);
    c.lineTo(this.x + this.size, this.y + this.size / 2); //top
    c.lineTo(this.x, this.y + this.size); //bot
    c.lineTo(this.x, this.y); //left
    c.stroke();
    c.closePath();
    c.restore();
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    let SPEED = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    let ANGLE = Math.atan2(this.vy, this.vx);

    if (SPEED > FRICTION) {
      SPEED -= FRICTION;
    } else {
      SPEED = 0;
    }
    if (SPEED > 8) SPEED = 8;

    this.vx = Math.cos(ANGLE) * SPEED;
    this.vy = Math.sin(ANGLE) * SPEED;

    if (this.x > canvas.width + this.size) {
      this.x = -this.size;
    } else if (this.x < -this.size) {
      this.x = canvas.width + this.size;
    }
    if (this.y > canvas.height + this.size) {
      this.y = -this.size;
    } else if (this.y < -this.size) {
      this.y = canvas.height + this.size;
    }

    if (LEFT) {
      this.r -= 0.05;
    }

    if (RIGHT) {
      this.r += 0.05;
    }

    if (UP) {
      this.vx += this.ax;
      this.vy += this.ay;
      this.ax = Math.cos(this.r) * 0.05;
      this.ay = Math.sin(this.r) * 0.05;

      for (let i = 0; i < 2; i++) {
        const particle = new Particle(
          this.x +
            this.size / 2 +
            Math.cos(this.r) * -Math.round(Math.random() * 14 + 10),
          this.y +
            this.size / 2 +
            Math.sin(this.r) * -Math.round(Math.random() * 14 + 10),
          this.r,
          5,
          8,
          Math.random() * 2 + 0.2
        );
        particles.push(particle);
      }
    } else {
      this.ax = this.ay = 0;
      SPEED = 0;
    }

    enemies.forEach((e, i) => {
      if (distance(this.x, this.y, this.size, e.x, e.y, e.size)) {
        if (e.size === 120) {
          for (let i = 0; i < 2; i++) {
            const enemy = new Enemy(
              e.x + e.size / 2,
              e.y + e.size / 2,
              0,
              90,
              5
            );
            enemies.push(enemy);
            
          }
        }
        if (e.size === 90) {
          for (let i = 0; i < 2; i++) {
            const enemy = new Enemy(
              e.x + e.size / 2,
              e.y + e.size / 2,
              0,
              60,
              5
            );
            enemies.push(enemy);
              
          }
        }
        for (let j = 0; j < 32; j++) {
          const explosion = new Explosion(
            this.x + this.size / 2,
            this.y + this.size / 2,
            5,
            (Math.round(Math.random()) ? 1 : -1) * Math.random() * 3 + 1,
            (Math.round(Math.random()) ? 1 : -1) * Math.random() * 3 + 1,
            Math.random() * 2
          );
          explosions.push(explosion);
        }
        enemies.splice(i, 1);
        ALIVE = false;
      }
    });

    this.draw();
  }

  shoot() {
    if (SHOOT) {
      const bullet = new Bullet(
        this.x + this.size,
        this.y + this.size / 2,
        this.r,
        3,
        15
      );
      BULLETS.push(bullet);
      setTimeout(() => {
        SHOOT = false;
      }, 5);
    }
    for (var i = BULLETS.length - 1; i >= 0; i--) {
      var blt = BULLETS[i];
      if (
        blt.x < 0 ||
        blt.x > canvas.widht ||
        blt.y < 0 ||
        blt.y > canvas.height
      ) {
        BULLETS.splice(i, 1);
      }
      blt.update();
    }
  }
}

class Bullet {
  constructor(x, y, deg, size, speed) {
    this.x = x;
    this.y = y;
    this.deg = deg;
    this.size = size;
    this.speed = speed;
  }
  draw() {
    c.beginPath();
    c.fillStyle = "lightblue";
    c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    c.fill();
  }
  update() {
    this.x += this.speed * Math.cos(this.deg);
    this.y += this.speed * Math.sin(this.deg);
    this.draw();
    enemies.forEach((e, i) => {
      BULLETS.forEach((b) => {
        if (distance(b.x, b.y, b.size, e.x, e.y, e.size)) {
          if (e.size === 120) {
            for (let i = 0; i < 2; i++) {
              const enemy = new Enemy(b.x, b.y, 0, 90, 5);
              enemies.push(enemy);
            }
            SCORE +=60
          }
          if (e.size === 90) {
            for (let i = 0; i < 2; i++) {
              const enemy = new Enemy(b.x, b.y, 0, 60, 5);
              enemies.push(enemy);
            }
            SCORE +=90
          }
          if (e.size === 60) {
            SCORE += 120;
          }
          for (let j = 0; j < 32; j++) {
            const explosion = new Explosion(
              b.x,
              b.y,
              5,
              (Math.round(Math.random()) ? 1 : -1) * Math.random() * 3 + 1,
              (Math.round(Math.random()) ? 1 : -1) * Math.random() * 3 + 1,
              Math.random() * 2
            );
            explosions.push(explosion);
          }
          enemies.splice(i, 1);
          BULLETS.splice(BULLETS.indexOf(b), 1);
        }
      });
    });
  }
}

class Particle {
  constructor(x, y, deg, size, speed, decrease) {
    this.x = x;
    this.y = y;
    this.deg = deg;
    this.size = size;
    this.speed = speed;
    this.decrease = decrease;
  }
  draw() {
    c.beginPath();
    c.strokeStyle = "black";
    c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    c.stroke();
  }
  update() {
    particles.forEach((p, i) => {
      if (p.size < 2) {
        particles.splice(i, 1);
      }
    });
    this.x -= this.speed * Math.cos(this.deg);
    this.y -= this.speed * Math.sin(this.deg);
    this.size -= this.decrease;
    this.draw();
  }
}

class Enemy {
  constructor(x, y, deg, size) {
    this.x = x;
    this.y = y;
    this.speed_x = 1 * (Math.round(Math.random()) ? 1 : -1);
    this.speed_y = 1 * (Math.round(Math.random()) ? 1 : -1);
    this.deg = deg;
    this.rotate = 0.2 * (Math.round(Math.random()) ? 1 : -1) * (Math.PI / 180);
    this.size = size;
    this.hashOffSet = 2;
    this.a = (2 * Math.PI) / 6;
  }
  draw() {
    c.save();
    c.beginPath();
    c.fillStyle = "black";
    c.lineWidth = 20;
    c.translate(this.x, this.y);
    c.rotate(this.deg);
    c.translate(-this.x, -this.y);
    c.moveTo(
      this.x + this.size * Math.cos(0),
      this.y + this.size * Math.sin(0)
    );

    for (let side = 0; side < 7; side++) {
      c.lineTo(
        this.x + this.size * Math.cos((side * 2 * Math.PI) / 6),
        this.y + this.size * Math.sin((side * 2 * Math.PI) / 6)
      );
    }
    c.strokeStyle = "#000000";
    c.lineWidth = Math.random() > 0.9 ? 2 : 1;
    c.stroke();
    c.closePath();
    c.restore();
  }
  update() {
    this.deg += this.rotate;
    this.x = this.x + this.speed_x;
    this.y = this.y + this.speed_y;
    if (this.x > canvas.width + this.size) {
      this.x = -this.size;
    } else if (this.x < -this.size) {
      this.x = canvas.width + this.size;
    }
    if (this.y > canvas.height + this.size) {
      this.y = -this.size;
    } else if (this.y < -this.size) {
      this.y = canvas.height + this.size;
    }
    this.draw();
  }
}

class Explosion {
  constructor(x, y, size, speed_x, speed_y, decrease) {
    this.x = x;
    this.y = y;
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.size = size;
    this.speed = 6;
    this.decrease = decrease;
  }
  draw() {
    c.beginPath();
    c.fillStyle = "black";
    c.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    c.fill();
  }
  update() {
    explosions.forEach((e, i) => {
      if (e.size < 0.05) {
        explosions.splice(i, 1);
      }
    });
    this.x += this.speed_x;
    this.y += this.speed_y;
    if (this.speed_x > 0) this.speed_x -= 0.02;
    else this.speed_x += 0.02;
    if (this.speed_y > 0) this.speed_y -= 0.02;
    else this.speed_y += 0.02;

    if (this.size > 0.05) this.size -= 0.05;
    this.draw();
  }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 20);

for (let i = 0; i < 7; i++) {
  if (Math.random < 0.5) {
    x = Math.random() < 0.5 ? 0 - 120 : canvas.width + 120;
    y = Math.random * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? 0 - 120 : canvas.height + 120;
  }

  const enemy = new Enemy(x, y, 0, 120);
  enemies.push(enemy);
}

function animateGame() {
  requestAnimationFrame(animateGame);
  if(SHOOT && !ALIVE){
    setTimeout(()=>{START = false;},1000);
  }
  if(!ALIVE){
    document.getElementById('info-over').style.display = "block";
    score.style.display = "none"
  } else {
    document.getElementById('info-over').style.display = "none";
    score.style.display = "block"
  }
  if (!START) {
    UP = false;
    enemies = [];
    START = true;
    ALIVE = true;
    BULLETS = [];
    SCORE = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.vx = 0;
    player.vy = 0;
    player.r = 0;

    if (enemies.length === 0 && ALIVE) {
      for (let i = 0; i < 4; i++) {
        if (Math.random < 0.5) {
          x = Math.random() < 0.5 ? 0 - 120 : canvas.width + 120;
          y = Math.random * canvas.height;
        } else {
          x = Math.random() * canvas.width;
          y = Math.random() < 0.5 ? 0 - 120 : canvas.height + 120;
        }

        const enemy = new Enemy(x, y, 0, 120);
        enemies.push(enemy);
      }
    }
  }
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (enemies.length < 3 && ALIVE) {
    if (Math.random < 0.5) {
      x = Math.random() < 0.5 ? 0 - 120 : canvas.width + 120;
      y = Math.random * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - 120 : canvas.height + 120;
    }
    const enemy = new Enemy(x, y, 0, 120);
    enemies.push(enemy);
  }

  if (
    enemies[enemies.length - 1].speed_x *
      enemies[enemies.length - 2].speed_x ===
    1 && enemies[enemies.length - 1].speed_y *
    enemies[enemies.length - 2].speed_y ===
  1
  ) {
    enemies[enemies.length - 2].speed_x * -1;
  }

  ALIVE && player.update();
  ALIVE && player.shoot();

  particles.forEach((p) => {
    p.update();
  });
  enemies.forEach((e) => {
    e.update();
  });
  explosions.forEach((x) => {
    x.update();
  });
  score.innerHTML = `SCORE: ${SCORE}`;
  score_over.innerHTML = `SCORE: ${SCORE}`
}

animateGame();
