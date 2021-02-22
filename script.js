const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");
let start = true;
let LEFT = false,
  RIGHT = false,
  UP = false,
  DOWN = false,
  SHOOT = false,
  keyAllowed = {},
  bullets = [],
  alive = true,
  particles = [],
  speed = 5;

let enemies = [],
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
  // setTimeout(() => {
  //   UP = false;
  // }, 175);
  else if (e.keyCode == 40) DOWN = false;
  else if (e.keyCode == 32) keyAllowed[e.which] = true;
};

document.onfocus = (e) => {
  if (e.keyCode == 32) keyAllowed = {};
};

const distance = (x1, y1, s1, x2, y2, s2) => {
  if (
    /*square hitboxes */
    (x1 + s1 >= x2 && x1 <= x2 + s2 && y1 + s1 >= y2 && y1 <= y2 + s2) ||
    /*horizonta*/
    (x1 + s1 >= x2 - s2 / 2 &&
      x1 <= x2 + s2 + s2 / 2 &&
      y1 + s1 < y2 + 10 &&
      y1 > y2 - 10) ||
    (x1 + s1 >= x2 - s2 / 2 &&
      x1 <= x2 + s2 + s2 / 2 &&
      y1 + s1 < y2 + s2 + 10 &&
      y1 > y2 + s2 - 10) ||
    /*vertical*/
    (x1 + s1 >= x2 - 10 &&
      x1 <= x2 + 10 &&
      y1 + s1 > y2 - s2 / 2 &&
      y1 < y2 + s2 / 2) ||
    (x1 + s1 >= x2 + s2 - 10 &&
      x1 <= x2 + s2 + 10 &&
      y1 + s1 > y2 - s2 / 2 &&
      y1 < y2 + s2 / 2)
  ) {
    return true;
  }
};

const distanceHash = () => {
  if (x1 + s1 >= x2 && x1 <= x2 + s2 && y1 + s1 >= y2 && y1 <= y2 + s2) {
    console.log(123);
  }
};

class Player {
  constructor(x, y, deg, rotation_speed, size) {
    this.x = x;
    this.y = y;
    this.deg = deg;
    this.rt_speed = rotation_speed;
    this.size = size;
    this.center = [];
  }
  draw() {
    c.save();
    c.translate(this.x + this.size, this.y + this.size / 2);
    c.rotate(this.deg);
    c.translate(-(this.x + this.size), -(this.y + this.size / 2));
    c.beginPath();
    c.moveTo(this.x, this.y);
    c.lineTo(this.x + this.size, this.y + this.size / 2); //góra
    c.lineTo(this.x, this.y + this.size); //dol
    c.lineTo(this.x, this.y); //lewo

    c.stroke();
    c.closePath();
    c.restore();
  }
  update() {
    if (LEFT) {
      this.deg -= (Math.PI / 180) * this.rt_speed;
      if (speed >= 6) {
        speed -= 0.075;
      }
    }
    if (RIGHT) {
      this.deg += (Math.PI / 180) * this.rt_speed;
      if (speed >= 6) {
        speed -= 0.075;
      }
    }
    if (UP) {
      this.x += speed * Math.cos(this.deg);
      this.y += speed * Math.sin(this.deg);
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
      if (speed <= 8) {
        speed += 0.05;
      }
      for (let i = 0; i < 3; i++) {
        const particle = new Particle(
          this.x + this.size,
          this.y + this.size / 2,
          this.deg,
          5,
          Math.random() * 0.05,
          Math.random() * 2
        );
        particles.push(particle);
      }
    } else speed = 5;

    enemies.forEach((e, i) => {
      if (distance(this.x, this.y, this.size, e.x, e.y, e.size)) {
        if (e.size === 120) {
          for (let i = 0; i < 2; i++) {
            const orb = new Orb(e.x + e.size / 2, e.y + e.size / 2, 0, 90, 5);
            enemies.push(orb);
          }
        }
        if (e.size === 90) {
          for (let i = 0; i < 2; i++) {
            const orb = new Orb(e.x + e.size / 2, e.y + e.size / 2, 0, 60, 5);
            enemies.push(orb);
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
        // bullets.splice(bullets.indexOf(b), 1);
        setTimeout(() => {
          start = false;
          console.log(alive);
        }, 2000);
        alive = false;
      }
    });

    this.draw();
  }
  shoot() {
    if (SHOOT) {
      const bullet = new Bullet(
        this.x + this.size,
        this.y + this.size / 2,
        this.deg,
        3,
        10
      );
      bullets.push(bullet);
      setTimeout(() => {
        SHOOT = false;
      }, 5);
    }
    for (var i = bullets.length - 1; i >= 0; i--) {
      var blt = bullets[i];
      if (
        blt.x < 0 ||
        blt.x > canvas.widht ||
        blt.y < 0 ||
        blt.y > canvas.height
      ) {
        bullets.splice(i, 1);
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
      bullets.forEach((b) => {
        if (distance(b.x, b.y, b.size, e.x, e.y, e.size)) {
          if (e.size === 120) {
            for (let i = 0; i < 2; i++) {
              const orb = new Orb(b.x, b.y, 0, 90, 5);
              enemies.push(orb);
            }
          }
          if (e.size === 90) {
            for (let i = 0; i < 2; i++) {
              const orb = new Orb(b.x, b.y, 0, 60, 5);
              enemies.push(orb);
            }
          }
          for (let j = 0; j < 32; j++) {
            const explosion = new Explosion(
              e.x + e.size / 2,
              e.y + e.size / 2,
              5,
              (Math.round(Math.random()) ? 1 : -1) * Math.random() * 3 + 1,
              (Math.round(Math.random()) ? 1 : -1) * Math.random() * 3 + 1,
              Math.random() * 2
            );
            explosions.push(explosion);
          }
          enemies.splice(i, 1);
          bullets.splice(bullets.indexOf(b), 1);
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
    this.x -= speed * Math.cos(this.deg);
    this.y -= speed * Math.sin(this.deg);
    this.size -= this.decrease;
    this.draw();
  }
}

class Orb {
  constructor(x, y, deg, size) {
    this.x = x;
    this.y = y;
    this.speed_x = 1 * (Math.round(Math.random()) ? 1 : -1);
    this.speed_y = 1 * (Math.round(Math.random()) ? 1 : -1);
    this.deg = deg;
    this.rotate = 0.5 * (Math.round(Math.random()) ? 1 : -1) * (Math.PI / 180);
    this.size = size;
    this.hashOffSet = 2;
  }
  draw() {
    if (
      enemies[enemies.length - 1].speed_x *
        enemies[enemies.length - 2].speed_x ===
      1
    ) {
      enemies[enemies.length - 1].speed_x * -1;
    }
    if (
      enemies[enemies.length - 1].speed_y *
        enemies[enemies.length - 2].speed_y ===
      1
    ) {
      enemies[enemies.length - 1].speed_y * -1;
    }
    c.save();
    c.beginPath();
    c.fillStyle = "black";
    c.lineWidth = 20;
    c.lineCap = "round";
    c.translate(this.x + this.size / 2, this.y + this.size / 2);
    c.rotate(this.deg);
    c.translate(-(this.x + this.size / 2), -(this.y + this.size / 2));
    c.moveTo(this.x, this.y - this.size / this.hashOffSet);
    c.lineTo(this.x, this.y + this.size + this.size / this.hashOffSet);
    c.moveTo(this.x + this.size, this.y - this.size / this.hashOffSet);
    c.lineTo(
      this.x + this.size,
      this.y + this.size + this.size / this.hashOffSet
    );
    c.moveTo(this.x - this.size / this.hashOffSet, this.y);
    c.lineTo(this.x + this.size + this.size / this.hashOffSet, this.y);
    c.moveTo(this.x - this.size / this.hashOffSet, this.y + this.size);
    c.lineTo(
      this.x + this.size + this.size / this.hashOffSet,
      this.y + this.size
    );
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
    this.speed = speed;
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
    this.size -= 0.05;
    this.draw();
  }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 0, 6, 20);

let x, y;
for (let i = 0; i < 5; i++) {
  x = Math.floor(Math.random() * canvas.width) + 1;
  y = Math.floor(Math.random() * canvas.height) + 1;
  if (x > 100 || x < canvas.widht - 100) {
    x = Math.floor(Math.random() * canvas.width) + 1;
    const orb = new Orb(x, y, 0, 120);
    enemies.push(orb);
  } else {
    const orb = new Orb(x, y, 0, 120);
    enemies.push(orb);
  }
}

function animateGame() {
  requestAnimationFrame(animateGame);
  if (!start) {
    enemies = [];
    start = true;
    alive = true;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    if (enemies.length === 0 && alive) {
      for (let i = 0; i < 5; i++) {
        const orb = new Orb(
          Math.floor(Math.random() * canvas.width) + 1,
          Math.floor(Math.random() * canvas.height) + 1,
          0,
          120
        );
        enemies.push(orb);
      }
    }
  }
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (enemies.length < 4 && alive) {
    const orb = new Orb(
      Math.floor(Math.random() * canvas.width) + 1,
      Math.floor(Math.random() * canvas.height) + 1,
      0,
      120
    );
    enemies.push(orb);
  }
  alive && player.update();
  alive && player.shoot();
  particles.forEach((p) => {
    p.update();
  });
  enemies.forEach((e) => {
    e.update();
  });
  explosions.forEach((x) => {
    x.update();
  });
}

animateGame();
