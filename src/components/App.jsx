import React from 'react';
import ReactDOM from 'react-dom';
import firebaseDemoApp from '../third-party/Firebase.js';
import GameBoard from './GameBoard/GameBoard.jsx'

function drawCircle() {
  // console.log(ReactDOM.findDOMNode(this));
  var canvas = document.getElementById('myCanvas');
  var context = canvas.getContext('2d');
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var radius = 70;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = '#003300';
  context.stroke();
}

export default () => {
  // firebaseDemoApp.database().ref('players/player0/velocity').on('value', (snapshot)=> {
  //   console.log(snapshot.val());
  // });

  // drawCircle();

  return (
    <div>
      Welcome!
      <GameBoard/>
      <button id="the-bootstrap-btn" className="btn btn-primary">It's bootstrap!</button>
    </div>
  )
};
