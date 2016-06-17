const firebase = firebase || {};
const QuadTree = QuadTree || {};

const MAX_VELOCITY = 80;
const SPEED_CONST = 150;
const WEIGHT = 60;
const FOOD_SIZE = 12;
const FOOD_SCORE = 2;
const PLAYER_SIZE = 40;

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE',
  authDomain: 'fir-example-c2211.firebaseapp.com',
  databaseURL: 'https://fir-example-c2211.firebaseio.com',
  storageBucket: '',
};
firebase.initializeApp(config);

class GameBoard {
  constructor() {
    this.players = [];
    this.width = window.innerWidth
       || document.documentElement.clientWidth
       || document.body.clientWidth;

    this.height = window.innerHeight
       || document.documentElement.clientHeight
       || document.body.clientHeight;

    this.quadTree = new QuadTree({
      x: 0, y: 0, width: this.width, height: this.height,
    });

    this._cache = {
      player: undefined,
      item: undefined,
      dx: undefined,
      dy: undefined,
      radii: undefined,
      collisions: undefined,
      colliding: undefined,
      speed: undefined,
      avatar: {},
    };

    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d');
  }

  init() {
    const b = () => {
      for (let i = 0; i < this.players.length; i++) {
        this.setNewPosition(this.players[i]);
      }
      this.updateTree();
      this.checkCollision();
      this.updateNodes();
    };
    const a = () => {
      window.requestAnimationFrame(b);
    };
    this.timer = setInterval(a, 1);

    firebase.database().ref('players').on('child_added', snapshot => {
      this.addPlayer(snapshot);
    });

    setInterval(() => {
      if (this.players.length < 50) {
        this.players.push({
          id: 'food-' + Math.random(),
          x: Math.floor(Math.random() * (this.width - 20)),
          y: Math.floor(Math.random() * (this.height - 20)),
          width: FOOD_SIZE,
          height: FOOD_SIZE,
          velocity: { x: 0, y: 0 },
          type: Math.random() > 0.9 ? 'red' : 'green',
        });
      }
    }, 2000);
  }

  setNewPosition(player) {
    if (!player.velocity) return;
    this._cache.speed = Math.sqrt(player.velocity.x * player.velocity.x
      + player.velocity.y * player.velocity.y);
    this._cache.newX = player.x + this._cache.speed * player.velocity.x / MAX_VELOCITY / SPEED_CONST / (player.height / WEIGHT);
    this._cache.newY = player.y + this._cache.speed * player.velocity.y / MAX_VELOCITY / SPEED_CONST / (player.height / WEIGHT);
    if (this._cache.newX > this.width - player.width / 2) {
      this._cache.newX = this.width - player.width / 2;
    }
    if (this._cache.newX < player.width / 2) {
      this._cache.newX = player.width / 2;
    }
    if (this._cache.newY > this.height - player.height / 2) {
      this._cache.newY = this.height - player.height / 2;
    }
    if (this._cache.newY < player.height / 2) {
      this._cache.newY = player.height / 2;
    }

    player.x = this._cache.newX;
    player.y = this._cache.newY;
    player.isColliding = false;
  }

  checkCollision() {
    for (let j = 0; j < this.players.length; j++) {
      this._cache.player = this.players[j];
      if (this._cache.player.type !== 'player') continue;
      this._cache.collisions = this.quadTree.retrieve(this._cache.player);
      for (let i = 0; i < this._cache.collisions.length; i++) {
        this._cache.item = this._cache.collisions[i];
        if (this._cache.player === this._cache.item) {
          continue;
        }
        if (this._cache.player.isColliding) {
          continue;
        }
        this._cache.dx = this._cache.player.x - this._cache.item.x;
        this._cache.dy = this._cache.player.y - this._cache.item.y;
        this._cache.radii = this._cache.player.height / 2 + this._cache.item.height / 2;

        this._cache.colliding = ((this._cache.dx * this._cache.dx) + (this._cache.dy * this._cache.dy))
          < (this._cache.radii * this._cache.radii);

        if (this._cache.colliding) {
          this._cache.player.isColliding = true;
          if (this._cache.item.type === 'red') {
            this.resetSize(this._cache.player);
            this.remove(this._cache.item);
          } else if (this._cache.player.height > this._cache.item.height) {
            this.bigger(this._cache.player, this._cache.item.height / (FOOD_SIZE / FOOD_SCORE));
            this.remove(this._cache.item);
          } else if (this._cache.player.height < this._cache.item.height) {
            this.bigger(this._cache.item, this._cache.player.height / (FOOD_SIZE / FOOD_SCORE));
            this.remove(this._cache.player);
          }
        }
      }
    }
  }

  bigger(item, size) {
    if (item.height < 200) {
      item.height += size;
      item.width += size;
    }
  }

  resetSize(item) {
    for (let i = 0; i < (item.height - PLAYER_SIZE) / FOOD_SIZE; i++) {
      this.players.push({
        id: 'food-' + Math.random(),
        x: item.x + Math.floor(Math.random() * item.width),
        y: item.y + Math.floor(Math.random() * item.height),
        width: FOOD_SIZE,
        height: FOOD_SIZE,
        velocity: { x: 0, y: 0 },
        type: 'green',
      });
    }

    item.height = 40;
    item.width = 40;
  }

  remove(item) {
    for (let i = 0; i < this.players.length; i++) {
      if (item === this.players[i]) this.players.splice(i, 1);
    }
  }

  updateTree() {
    this.quadTree.clear();
    this.quadTree.insert(this.players);
  }

  updateNodes() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.players.length; i++) {
      this.context.save();
      this.drawCircle(this.players[i]);
      if (this.players[i].type === 'player') {
        this.drawPlayer(this.players[i]);
      }
      this.context.restore();
    }
  }

  drawCircle(player) {
    this.context.beginPath();
    this.context.arc(player.x, player.y, player.height / 2, 0, Math.PI * 2, true);
    this.context.fillStyle = player.type;
    this.context.fill();
    this.context.closePath();
    this.context.clip();
  }

  drawPlayer(player) {
    try {
      this.context.drawImage(this._cache.avatar[player.id], player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    } catch (e) { console.log(e); } // Image failed to load
    this.context.beginPath();
    this.context.arc(0, 0, player.height / 2, 0, Math.PI * 2, true);
    this.context.clip();
    this.context.closePath();
  }

  addPlayer(snapshot) {
    // Should listen to new player event
    const newPlayer = {
      id: snapshot.key,
      avatar: snapshot.val().avatar,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      x: this.width / 2,
      y: this.height / 2,
      isColliding: false,
      velocity: { x: 0, y: 0 },
      type: 'player',
    };

    firebase.database().ref('players/' + newPlayer.id + '/velocity').on('value', snapshot1 => {
      newPlayer.velocity = snapshot1.val();
    });

    this.players.push(newPlayer);
    this._cache.avatar[newPlayer.id] = document.createElement('img');
    this._cache.avatar[newPlayer.id].src = newPlayer.avatar;
  }

}

new GameBoard().init();
