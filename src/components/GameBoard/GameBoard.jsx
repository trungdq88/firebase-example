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

    setInterval(() => {
      if (this.players.length < 50) {
        this.players.push({
          id: 'food-' + Math.random(),
          x: Math.floor(Math.random() * (this.width - 20)),
          y: Math.floor(Math.random() * (this.height - 20)),
          width: 10,
          height: 10,
          velocity: { x: 0, y: 0 },
          type: 'food',
        });
        this.forceUpdate();
      }
    }, 2000);
  }

  setNewPosition(player) {
    this._cache.speed = Math.sqrt(player.velocity.x * player.velocity.x
      + player.velocity.y * player.velocity.y);
    this._cache.newX = player.x + this._cache.speed * player.velocity.x / MAX_VELOCITY / SPEED_CONST;
    this._cache.newY = player.y + this._cache.speed * player.velocity.y / MAX_VELOCITY / SPEED_CONST;
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

        if (this._cache.colliding) {
          if (this._cache.player.height > this._cache.item.height) {
            this.bigger(this._cache.player, this._cache.item.height / 5);
            this.remove(this._cache.item);
          } else if (this._cache.player.height < this._cache.item.height) {
            this.bigger(this._cache.item, this._cache.player.height / 5);
            this.remove(this._cache.player);
          }

          this.forceUpdate();
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
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].type === 'food') continue;
      this._cache.nodes[this.players[i].id].style.transform = 'translate3d(' + (this.players[i].x - this.players[i].width / 2) + 'px,' + (this.players[i].y - this.players[i].height / 2) + 'px,0)';
      this._cache.nodes[this.players[i].id].style.border = this.players[i].isColliding ? '2px solid red' : '';
      this._cache.nodes[this.players[i].id].style.width = this.players[i].width + 'px';
      this._cache.nodes[this.players[i].id].style.height = this.players[i].height + 'px';
      this._cache.nodes[this.players[i].id].style.borderRadius = (this.players[i].height / 2) + 'px';
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
      type: 'player',
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
