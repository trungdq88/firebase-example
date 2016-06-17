'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var QuadTree = QuadTree || {};

var MAX_VELOCITY = 80;
var SPEED_CONST = 50;
var WEIGHT = 60;
var FOOD_SIZE = 12;
var FOOD_SCORE = 2;
var PLAYER_SIZE = 40;

var GameBoard = function () {
  function GameBoard() {
    _classCallCheck(this, GameBoard);

    // All game objects
    this.players = [];

    // Set viewport of the canvas and QuadTree
    this.width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 200;

    this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    this.quadTree = new QuadTree({
      x: 0, y: 0, width: this.width, height: this.height
    });
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d');

    // Cache object to reduce memory allocation inside game loop
    this._cache = {
      player: undefined,
      item: undefined,
      dx: undefined,
      dy: undefined,
      radii: undefined,
      collisions: undefined,
      colliding: undefined,
      speed: undefined,
      avatar: {}
    };
  }

  // Initialize the game


  _createClass(GameBoard, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var triggerLoop = function triggerLoop() {};
      // Game loop
      var gameLoop = function gameLoop() {
        for (var i = 0; i < _this.players.length; i++) {
          _this.setNewPosition(_this.players[i]);
        }
        _this.updateTree();
        _this.checkCollision();
        _this.render();
        triggerLoop(); // Recursive call
      };
      triggerLoop = function triggerLoop() {
        window.requestAnimationFrame(gameLoop);
      };
      triggerLoop();

      // Add "food"
      setInterval(function () {
        if (_this.players.length < 50) {
          _this.players.push({
            id: 'food-' + Math.random(),
            x: Math.floor(Math.random() * (_this.width - 20)),
            y: Math.floor(Math.random() * (_this.height - 20)),
            width: FOOD_SIZE,
            height: FOOD_SIZE,
            velocity: { x: 0, y: 0 },
            type: Math.random() > 0.9 ? 'red' : 'green'
          });
        }
      }, 2000);
    }

    // Set new player position based on player velocity

  }, {
    key: 'setNewPosition',
    value: function setNewPosition(player) {
      if (!player.velocity) return;
      this._cache.speed = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y);
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

    // Check and handle collisions

  }, {
    key: 'checkCollision',
    value: function checkCollision() {
      for (var j = 0; j < this.players.length; j++) {
        // Only check collision for players, because "food" never moves
        this._cache.player = this.players[j];
        if (this._cache.player.type !== 'player') continue;

        // Get objects from quad tree to check collision
        this._cache.collisions = this.quadTree.retrieve(this._cache.player);
        for (var i = 0; i < this._cache.collisions.length; i++) {
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

          this._cache.colliding = this._cache.dx * this._cache.dx + this._cache.dy * this._cache.dy < this._cache.radii * this._cache.radii;

          // Handle collision
          if (this._cache.colliding) {
            this._cache.player.isColliding = true;
            if (this._cache.item.type === 'red') {
              // "Explode"
              this.explode(this._cache.player);
              this.remove(this._cache.item);
              this.updateLeaderBoard();
            } else if (this._cache.player.height > this._cache.item.height) {
              // "Eat"
              this.bigger(this._cache.player, this._cache.item.height / (FOOD_SIZE / FOOD_SCORE));
              this.remove(this._cache.item);
              this.updateLeaderBoard();
            } else if (this._cache.player.height < this._cache.item.height) {
              // "Get eaten"
              this.bigger(this._cache.item, this._cache.player.height / (FOOD_SIZE / FOOD_SCORE));
              this.remove(this._cache.player);
              this.updateLeaderBoard();
            }
          }
        }
      }
    }

    // Get bigger when eat other object (food or other player)

  }, {
    key: 'bigger',
    value: function bigger(item, size) {
      if (item.height < 200) {
        item.height += size;
        item.width += size;
      }
    }

    // Get explode when hit "red" objects

  }, {
    key: 'explode',
    value: function explode(item) {
      for (var i = 0; i < (item.height - PLAYER_SIZE) / FOOD_SIZE; i++) {
        this.players.push({
          id: 'food-' + Math.random(),
          x: item.x + Math.floor(Math.random() * item.width),
          y: item.y + Math.floor(Math.random() * item.height),
          width: FOOD_SIZE,
          height: FOOD_SIZE,
          velocity: { x: 0, y: 0 },
          type: 'green'
        });
      }

      item.height = 40;
      item.width = 40;
    }

    // Disapear when get eaten

  }, {
    key: 'remove',
    value: function remove(item) {
      for (var i = 0; i < this.players.length; i++) {
        if (item === this.players[i]) this.players.splice(i, 1);
      }
    }

    // Rebuild the quad tree

  }, {
    key: 'updateTree',
    value: function updateTree() {
      this.quadTree.clear();
      this.quadTree.insert(this.players);
    }
  }, {
    key: 'updateLeaderBoard',
    value: function updateLeaderBoard() {
      var players = this.players.filter(function (player) {
        return player.type === 'player';
      });

      if (players.length === 1 && players[0].width > PLAYER_SIZE) {
        this.showWinner(players[0]);
      }

      players.sort(function (a, b) {
        return a.width < b.width;
      });

      var str = players.map(function (player) {
        return Math.round(player.width) + ' - ' + player.name;
      }).join('<br/>');

      document.getElementById('leaderboard').innerHTML = str;
    }
  }, {
    key: 'showWinner',
    value: function showWinner(player) {
      document.getElementById('winner').style.display = 'flex';
      document.getElementById('avatar').src = player.avatar;
      document.getElementById('username').innerText = player.name;
    }

    // Re-render the canvas

  }, {
    key: 'render',
    value: function render() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (var i = 0; i < this.players.length; i++) {
        this.context.save();
        this.drawCircle(this.players[i]);
        if (this.players[i].type === 'player') {
          this.drawPlayer(this.players[i]);
        }
        this.context.restore();
      }
    }
  }, {
    key: 'drawCircle',
    value: function drawCircle(player) {
      this.context.beginPath();
      this.context.arc(player.x, player.y, player.height / 2, 0, Math.PI * 2, true);
      this.context.fillStyle = player.type;
      this.context.fill();
      this.context.closePath();
      this.context.clip();
    }

    // Draw player and put avatar image

  }, {
    key: 'drawPlayer',
    value: function drawPlayer(player) {
      try {
        this.context.drawImage(this._cache.avatar[player.id], player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
      } catch (e) {
        console.log(e);
      } // Image failed to load
      this.context.beginPath();
      this.context.arc(0, 0, player.height / 2, 0, Math.PI * 2, true);
      this.context.clip();
      this.context.closePath();
    }

    // New player to the game

  }, {
    key: 'addPlayer',
    value: function addPlayer(player) {
      player.width = PLAYER_SIZE;
      player.height = PLAYER_SIZE;
      player.x = this.width / 2;
      player.y = this.height / 2;
      player.isColliding = false;
      player.type = 'player';

      this.players.push(player);
      this._cache.avatar[player.id] = document.createElement('img');
      this._cache.avatar[player.id].src = player.avatar;

      this.updateLeaderBoard();
    }
  }]);

  return GameBoard;
}();

window.GameBoard = GameBoard;