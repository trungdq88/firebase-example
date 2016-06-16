import React from 'react';
import Player from '../Player/Player.js';
import firebaseDemoApp from '../../third-party/Firebase.js';

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
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      window.requestAnimationFrame(() => {
        this.players.forEach(player => {
          player.position = this.getNewPosition(player);
        });
        this.forceUpdate();
      });
    }, 1);

    firebaseDemoApp.database().ref('players').on('child_added', snapshot => {
      this.addPlayer(snapshot);
    });
  }

  getNewPosition(player) {
    const position = player.position;
    const velocity = player.velocity;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let newX = position.x + speed * velocity.x / MAX_VELOCITY / SPEED_CONST;
    let newY = position.y + speed * velocity.y / MAX_VELOCITY / SPEED_CONST;
    if (newX > this.width - player.size * 2 || newX < 0) {
      newX = position.x;
    }
    if (newY > this.height - player.size * 2 || newY < 0) {
      newY = position.y;
    }
    return {
      x: newX,
      y: newY,
    };
  }

  addPlayer(snapshot) {
    // Should listen to new player event
    const newPlayer = {
      id: snapshot.key,
      avatar: snapshot.val().avatar,
      size: 20,
      position: { x: this.width / 2, y: this.height / 2 },
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
