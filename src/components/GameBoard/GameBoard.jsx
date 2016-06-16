import React from 'react';
import Player from '../Player/Player.js';
import firebaseDemoApp from '../../third-party/Firebase.js';
const QuadTree = window.QuadTree;

const MAX_VELOCITY = 80;
const SPEED_CONST = 150;

export default class GameBoard extends React.Component {
  constructor(...args) {
    super(...args);
    this.players = [];
    this.width = window.innerWidth
       || document.documentElement.clientWidth
       || document.body.clientWidth;

    this.height = window.innerHeight
       || document.documentElement.clientHeight
       || document.body.clientHeight;

    this.quadTree = new QuadTree({
      x: 0, y: 0, width: this.width, height: this.height,
    }, false, 7);

    this._cache = {
      player: undefined,
      item: undefined,
      dx: undefined,
      dy: undefined,
      radii: undefined,
      collisions: undefined,
      colliding: undefined,
      speed: undefined,
      nodes: {},
    };
  }

  componentDidMount() {
    const b = () => {
      for (let i = 0; i < this.players.length; i++) {
        this.setNewPosition(this.players[i]);
      }
      this.updateTree();
      // Check collision
      this.checkCollision();
      this.updateNodes();
    };
    const a = () => {
      window.requestAnimationFrame(b);
    };
    this.timer = setInterval(a, 1);

    firebaseDemoApp.database().ref('players').on('child_added', snapshot => {
      this.addPlayer(snapshot);
    });
  }

  setNewPosition(player) {
    this._cache.speed = Math.sqrt(player.velocity.x * player.velocity.x
      + player.velocity.y * player.velocity.y);
    this._cache.newX = player.x + this._cache.speed * player.velocity.x / MAX_VELOCITY / SPEED_CONST;
    this._cache.newY = player.y + this._cache.speed * player.velocity.y / MAX_VELOCITY / SPEED_CONST;
    if (this._cache.newX > this.width - player.size || this._cache.newX < 0) {
      this._cache.newX = player.x;
    }
    if (this._cache.newY > this.height - player.size || this._cache.newY < 0) {
      this._cache.newY = player.y;
    }

    player.x = this._cache.newX;
    player.y = this._cache.newY;
    player.isColliding = false;
  }

  checkCollision() {
    for (let j = 0; j < this.players.length; j++) {
      this._cache.player = this.players[j];
      this._cache.collisions = this.quadTree.retrieve(this._cache.player);
      for (let i = 0; i < this._cache.collisions.length; i++) {
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

        this._cache.colliding = ((this._cache.dx * this._cache.dx) + (this._cache.dy * this._cache.dy))
          < (this._cache.radii * this._cache.radii);

        if (!this._cache.player.isColliding) this._cache.player.isColliding = this._cache.colliding;
        if (!this._cache.item.isColliding) this._cache.item.isColliding = this._cache.colliding;
      }
    }
  }

  updateTree() {
    this.quadTree.clear();
    this.quadTree.insert(this.players);
  }

  updateNodes() {
    for (let i = 0; i < this.players.length; i++) {
      this._cache.nodes[this.players[i].id].style.transform = 'translate3d(' + this.players[i].x + 'px,' + this.players[i].y + 'px,0)';
      this._cache.nodes[this.players[i].id].style.border = this.players[i].isColliding ? '2px solid red' : '';
    }
  }

  addPlayer(snapshot) {
    // Should listen to new player event
    const newPlayer = {
      id: snapshot.key,
      avatar: snapshot.val().avatar,
      width: 40,
      height: 40,
      x: this.width / 2,
      y: this.height / 2,
      isColliding: false,
      velocity: { x: 0, y: 0 },
    };

    firebaseDemoApp.database().ref('players/' + newPlayer.id + '/velocity').on('value', snapshot1 => {
      newPlayer.velocity = snapshot1.val();
    });

    this.players.push(newPlayer);
    this.forceUpdate();
    this._cache.nodes[newPlayer.id] = document.getElementById('player-' + newPlayer.id);
  }

  render() {
    return (
      <div style={{ width: this.width, height: this.height }}>
        {this.players.map((player) => (
          <Player key={player.id} player={player}/>
        ))}
      </div>
    );
  }
}
