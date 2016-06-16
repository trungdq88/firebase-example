import React from 'react';

export default class Player extends React.Component {
  constructor(...args) {
    super(...args);
  }

  getStyles() {
    return {
      width: this.props.radius * 2,
      height: this.props.radius * 2,
      borderRadius: this.props.radius,
      background: 'red',
      top: this.props.position.y,
      left: this.props.position.x,
      position: 'absolute'
    }
  }

  render() {
    return (
      <div style={this.getStyles()}></div>
    )
  }
}