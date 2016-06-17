'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_VELOCITY = 80;
var SPEED_CONST = 150;
var WEIGHT = 60;
var FOOD_SIZE = 10;
var PLAYER_SIZE = 40;

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE',
  authDomain: 'fir-example-c2211.firebaseapp.com',
  databaseURL: 'https://fir-example-c2211.firebaseio.com',
  storageBucket: ''
};
firebase.initializeApp(config);

var GameBoard = function () {
  function GameBoard() {
    _classCallCheck(this, GameBoard);

    this.players = [];
    this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    this.quadTree = new QuadTree({
      x: 0, y: 0, width: this.width, height: this.height
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
      avatar: {}
    };

    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context = this.canvas.getContext('2d');
  }

  _createClass(GameBoard, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var b = function b() {
        for (var i = 0; i < _this.players.length; i++) {
          _this.setNewPosition(_this.players[i]);
        }
        _this.updateTree();
        _this.checkCollision();
        _this.updateNodes();
      };
      var a = function a() {
        window.requestAnimationFrame(b);
      };
      this.timer = setInterval(a, 1);

      firebase.database().ref('players').on('child_added', function (snapshot) {
        _this.addPlayer(snapshot);
      });

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
  }, {
    key: 'setNewPosition',
    value: function setNewPosition(player) {
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
  }, {
    key: 'checkCollision',
    value: function checkCollision() {
      for (var j = 0; j < this.players.length; j++) {
        this._cache.player = this.players[j];
        if (this._cache.player.type !== 'player') continue;
        this._cache.collisions = this.quadTree.retrieve(this._cache.player);
        for (var i = 0; i < this._cache.collisions.length; i++) {
          this._cache.item = this._cache.collisions[i];
          if (this._cache.player === this._cache.item) {
            continue;
          }
          if (this._cache.player.isColliding && this._cache.item.isColliding) {
            continue;
          }
          this._cache.dx = this._cache.player.x - this._cache.item.x;
          this._cache.dy = this._cache.player.y - this._cache.item.y;
          this._cache.radii = this._cache.player.height / 2 + this._cache.item.height / 2;

          this._cache.colliding = this._cache.dx * this._cache.dx + this._cache.dy * this._cache.dy < this._cache.radii * this._cache.radii;

          if (this._cache.colliding) {
            if (this._cache.item.type === 'red') {
              this.resetSize(this._cache.player);
              this.remove(this._cache.item);
            } else if (this._cache.player.height > this._cache.item.height) {
              this.bigger(this._cache.player, this._cache.item.height / FOOD_SIZE);
              this.remove(this._cache.item);
            } else if (this._cache.player.height < this._cache.item.height) {
              this.bigger(this._cache.item, this._cache.player.height / FOOD_SIZE);
              this.remove(this._cache.player);
            }
          }
        }
      }
    }
  }, {
    key: 'bigger',
    value: function bigger(item, size) {
      if (item.height < 200) {
        item.height += size;
        item.width += size;
      }
    }
  }, {
    key: 'resetSize',
    value: function resetSize(item) {
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
  }, {
    key: 'remove',
    value: function remove(item) {
      for (var i = 0; i < this.players.length; i++) {
        if (item === this.players[i]) this.players.splice(i, 1);
      }
    }
  }, {
    key: 'updateTree',
    value: function updateTree() {
      this.quadTree.clear();
      this.quadTree.insert(this.players);
    }
  }, {
    key: 'updateNodes',
    value: function updateNodes() {
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
  }, {
    key: 'drawPlayer',
    value: function drawPlayer(player) {
      this.context.drawImage(this._cache.avatar[player.id], player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);

      this.context.beginPath();
      this.context.arc(0, 0, player.height / 2, 0, Math.PI * 2, true);
      this.context.clip();
      this.context.closePath();
    }
  }, {
    key: 'addPlayer',
    value: function addPlayer(snapshot) {
      // Should listen to new player event
      var newPlayer = {
        id: snapshot.key,
        avatar: snapshot.val().avatar,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        x: this.width / 2,
        y: this.height / 2,
        isColliding: false,
        velocity: { x: 0, y: 0 },
        type: 'player'
      };

      firebase.database().ref('players/' + newPlayer.id + '/velocity').on('value', function (snapshot1) {
        newPlayer.velocity = snapshot1.val();
      });

      this.players.push(newPlayer);
      this._cache.avatar[newPlayer.id] = document.createElement('img');
      this._cache.avatar[newPlayer.id].src = newPlayer.avatar;
    }
  }]);

  return GameBoard;
}();

new GameBoard().init();