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
    let position = player;
    let velocity = player.velocity;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let newX = position.x + speed * velocity.x / MAX_VELOCITY / SPEED_CONST;
    let newY = position.y + speed * velocity.y / MAX_VELOCITY / SPEED_CONST;
    if (newX > 1000 - player.size || newX < 0) {
      newX = position.x;
    }
    if (newY > 1000 - player.size || newY < 0) {
      newY = position.y;
    }
    return {
      x: newX,
      y: newY,
    };
  }


  collide(node) {
    var r1 = node.size;
    // nx1 = node.x - r,
    // nx2 = node.x + r,
    // ny1 = node.y - r,
    // ny2 = node.y + r;
    return function (quad, x1, y1, x2, y2) {
      // console.log(console.log(r1, r2));
      if (quad.point && quad.point !== node) {
        let r2 = quad.point.size;
        if (Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) <= (r1 + r2)) {
          // console.log('collide', x1, y1, x2, y2, r1, r2);
        }
      }

      // if(x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1) {
      //   console.log('hi');
      // }
      // return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }

  checkCollision() {
    var q = d3.geom.quadtree(this.players),
      i,
      n = this.players.length;


    // console.log(this.players[i]);
    for (i = 0; i < n; i++) {
      if (this.players[i]) {
        q.visit(this.collide(this.players[i]));
      }
    }
  }

  addPlayer(snapshot) {
    // console.log(snapshot);
    //Should listen to new player event
    let newPlayer = {
      id: snapshot.key,
      avatar: snapshot.val().avatar,
      size: 10,
      x: 250,
      y: 250,
      velocity: {x: 0, y: 0},
    };
    // console.log(snapshot.key);

    firebaseDemoApp.database().ref('players/' + newPlayer.id + '/velocity').on('value', (snapshot)=> {
      // console.log(snapshot.val(), newPlayer.id);
      // if (snapshot.val()) {
      // console.log(snapshot.val());
      newPlayer.velocity = snapshot.val() || {x: 0, y: 0};
      // }
    });

    this.players.push(newPlayer);
  }

  componentDidMount() {

    // this.addPlayer(0);
    // this.addPlayer(1);
    this.svg = d3.select(ReactDOM.findDOMNode(this));
    this.defs = this.svg.append('svg:defs');

    this.timer = setInterval(() => {
      window.requestAnimationFrame(() => {
        this.players.forEach((player, i) => {
          let newPosition = this.getNewPosition(player);
          player.x = newPosition.x;
          player.y = newPosition.y;
          d3.select('#id' + player.id)
            .attr('cx', player.x)
            .attr('cy', player.y);
        });
      });
      this.checkCollision();
    }, 1);


    firebaseDemoApp.database().ref('players').on('child_added', (snapshot)=> {
      // console.log(snapshot.val(), 'on');
      this.addPlayer(snapshot);
      this.drawCircle();

    });
  }

  drawCircle() {
    // console.log(this.players);
    // if (!this.playerAvatars) {
    this.defs
      .selectAll('pattern')
      .data(this.players)
      .enter()
      .append('svg:pattern')
      .attr("width", 60)
      .attr("height", 60)
      .attr('id', function (d) {
        return 'pattern' + d.id;
      })
      .attr('patternUnits', 'objectBoundingBox')
      .append('svg:image')
      .attr("width", 40)
      .attr("height", 40)
      .attr('xlink:href', d => { return d.avatar})
      .attr('x', 0)
      .attr('y', 0);

    this.playerAvatars = this.svg.selectAll('circle')
      .data(this.players, (d) => d.id)
      .enter()
      .append('circle')
      .attr('id', function (d) {
        return 'id' + d.id;
      })
      .attr('r', 20)
      .style("fill", (d) => 'url(#pattern' + d.id + ')')
      // .style('fill', 'green')
      .style('transform', 'translate3d(0,0,0)');
    // } else {
    //   this.playerAvatars
    //     .data(this.players, d => d.id)
    //     .enter()
    //     .append('circle')
    //     .attr('r', 10)
    //     .style('fill', 'green')
    //     .style('transform', 'translate3d(0,0,0)');
    // }
    // console.log(this.playerAvatars);

  }


  render() {
    return (
      <svg style={{width: 1000, height: 1000, border: '1px solid black'}}></svg>
    )
  }
}