import React from 'react';
import './Player.less';

export default class Player extends React.Component {
  constructor(...args) {
    super(...args);
  }

  getStyles() {
    return {
      width: this.props.player.size * 2,
      height: this.props.player.size * 2,
      borderRadius: this.props.player.size,
      transform: 'translate3d(' + this.props.player.position.x + 'px,' + this.props.player.position.y + 'px,0)',
      backgroundImage: 'url("' + this.props.player.avatar + '")',
    };
  }

  render() {
    return (
      <div className="Player" style={this.getStyles()}></div>
    );
  }
}
