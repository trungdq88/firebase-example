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
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      window.requestAnimationFrame(() => {
        this.players.forEach(player => {
          const position = this.getNewPosition(player);
          player.x = position.x;
          player.y = position.y;
          player.isColliding = false;
        });
        this.updateTree();
        // Check collision
        this.checkCollision();
        this.forceUpdate();
      });
    }, 1);

    firebaseDemoApp.database().ref('players').on('child_added', snapshot => {
      this.addPlayer(snapshot);
    });
  }

  getNewPosition(player) {
    const velocity = player.velocity;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let newX = player.x + speed * velocity.x / MAX_VELOCITY / SPEED_CONST;
    let newY = player.y + speed * velocity.y / MAX_VELOCITY / SPEED_CONST;
    if (newX > this.width - player.size || newX < 0) {
      newX = player.x;
    }
    if (newY > this.height - player.size || newY < 0) {
      newY = player.y;
    }
    return {
      x: newX,
      y: newY,
    };
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
