import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import Player from '../Player/Player.js';
import firebaseDemoApp from '../../third-party/Firebase.js';

const MAX_VELOCITY = 80;
const SPEED_CONST = 150;

export default class GameBoard extends React.Component {
  constructor(...args) {
    super(...args);
    this.timer = null;
    this.players = [];
  }

  getNewPosition(player) {
    let position = player.position;
    let velocity = player.velocity;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let newX = position.x + speed * velocity.x / MAX_VELOCITY / SPEED_CONST;
    let newY = position.y + speed * velocity.y / MAX_VELOCITY / SPEED_CONST;
    if (newX > 500 - player.size * 2 || newX < 0) {
      newX = position.x;
    }
    if (newY > 500 - player.size * 2 || newY < 0) {
      newY = position.y;
    }
    return {
      x: newX,
      y: newY,
    };
  }

  addPlayer() {
    //Should listen to new player event
    let newPlayer = {
      id: 0,
      size: 20,
      position: {x: 250, y: 250},
      velocity: {x: 0, y: 0},
    };

    firebaseDemoApp.database().ref('players/player' + newPlayer.id + '/velocity').on('value', (snapshot)=> {
      newPlayer.velocity = snapshot.val();
    });

    this.players.push(newPlayer);
  }

  componentDidMount() {
    // this.svg = d3.select(ReactDOM.findDOMNode(this));
    // this.drawCircle();

    this.timer = setInterval(() => {
      window.requestAnimationFrame(() => {
        this.players.forEach((player)=> {
          player.position = this.getNewPosition(player)
        });
        this.forceUpdate();
        // this.players.forEach((player) => {
        //   player.position = this.getNewPosition(player.position, player.velocity);
        //   this.player0
        //     .attr('cx', player.position.x)
        //     .attr('cy', player.position.y);
        // });

      });
    }, 1);

    this.addPlayer();
    //
    // firebaseDemoApp.database().ref('players/player0/velocity').on('value', (snapshot)=> {
    //   this.players[0].velocity = snapshot.val();
    // let player = {
    //   verocity: snapshot.val(),
    // };
    // this.setState({
    //   players: [].concat([player])
    // })
    // });
  }

  drawCircle() {
    this.player0 = this.svg.append('circle')
      .attr('r', 10)
      .style('fill', 'green')
      .style('transform', 'translate3d(0,0,0)');
  }


  render() {
    return (
      <div style={{width: 500, height: 500, position: 'relative', border: '1px solid black'}}>
        {this.players.map((player) => (
          <Player key={player.id} radius="20" position={player.position}/>
        ))}
      </div>
    )
  }
}