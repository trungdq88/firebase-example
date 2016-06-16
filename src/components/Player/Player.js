import React from 'react';
import './Player.less';

export default class Player extends React.Component {
  constructor(...args) {
    super(...args);
  }

  shouldComponentUpdate() {
    return false;
  }

  getStyles() {
    return {
      width: this.props.player.width,
      height: this.props.player.height,
      borderRadius: this.props.player.width / 2,
      transform: 'translate3d(' + this.props.player.x + 'px,' + this.props.player.y + 'px,0)',
      backgroundImage: 'url("' + this.props.player.avatar + '")',
      border: this.props.player.isColliding ? '2px solid red' : '',
    };
  }

  render() {
    return (
      <div id={'player-' + this.props.player.id} className="Player" style={this.getStyles()}></div>
    );
  }
}
