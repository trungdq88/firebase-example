import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import firebaseDemoApp from '../../third-party/Firebase.js';

const MAX_VELOCITY = 80;
const SPEED_CONST = 150;

export default class GameBoard extends React.Component {
  constructor(...args) {
    super(...args);
    this.timer = null;
    this.velocity = {x: 0, y: 0};
    this.position = {x: 250, y: 250};
  }

  getNewPosition() {
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    return {
      x: this.position.x + speed * this.velocity.x / MAX_VELOCITY / SPEED_CONST,
      y: this.position.y + speed * this.velocity.y / MAX_VELOCITY / SPEED_CONST,
    };
  }

  componentDidMount() {
    this.svg = d3.select(ReactDOM.findDOMNode(this));
    this.drawCircle();

    this.timer = setInterval(() => {
      window.requestAnimationFrame(() => {
        this.player0
          .attr('cx', this.position.x)
          .attr('cy', this.position.y);

        this.position = this.getNewPosition();
      });
    }, 1);

    firebaseDemoApp.database().ref('players/player0/velocity').on('value', (snapshot)=> {
      this.velocity = snapshot.val();
    });
  }

  drawCircle() {
    this.player0 = this.svg.append('circle')
      // .attr('cx', 250)
      // .attr('cy', 250)
      .attr('r', 10)
      .style('fill', 'green')
      .style('transform', 'translate3d(0,0,0)');
  }

  render() {
    return (
      <svg width="500" height="500"></svg>
    )
  }
}