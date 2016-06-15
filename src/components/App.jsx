import React from 'react';
import GameBoard from './GameBoard/GameBoard.jsx'

export default () => {
  return (
    <div>
      Welcome!
      <GameBoard/>
      <button id="the-bootstrap-btn" className="btn btn-primary">It's bootstrap!</button>
    </div>
  )
};
