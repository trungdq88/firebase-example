import React from 'react';

export default class Player extends React.Component {
  constructor(...args) {
    super(...args);
  }

  getStyles() {
    // console.log('translate3d(' + this.props.position.x + ',' + this.props.position.y + ',0)');
    return {
      width: this.props.player.size * 2,
      height: this.props.player.size * 2,
      borderRadius: this.props.player.size,
      background: 'red',
      transform: 'translate3d(' + this.props.player.position.x + 'px,' + this.props.player.position.y + 'px,0)',
      backgroundImage: 'url("'+this.props.player.avatar+'")',
    // top: this.props.position.y,
    // left: this.props.position.x,
    // position: 'absolute'
  }
  }

  render() {
    return (
      <div style={this.getStyles()}></div>
    )
  }
}