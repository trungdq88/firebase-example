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
      transform: 'translate3d(' + (this.props.player.x - this.props.player.width / 2) + 'px,'
      + (this.props.player.y - this.props.player.height / 2) + 'px,0)',
      backgroundImage: this.props.player.avatar ? 'url("' + this.props.player.avatar + '")' : '',
      border: this.props.player.isColliding ? '2px solid red' : '',
    };
  }

  render() {
    if (this.props.player.type === 'player') {
      return (
        <div id={'player-' + this.props.player.id}
          className="Player" style={this.getStyles()}
        >
        </div>
      );
    }

    return (
      <div id={'food-' + this.props.player.id} className="Food" style={this.getStyles()}></div>
    );
  }
}
