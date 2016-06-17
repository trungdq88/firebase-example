'use strict';

var GameBoard = GameBoard || {};
var firebase = firebase || {};

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE',
  authDomain: 'fir-example-c2211.firebaseapp.com',
  databaseURL: 'https://fir-example-c2211.firebaseio.com',
  storageBucket: ''
};
firebase.initializeApp(config);

// Start the game
var game = new GameBoard();
game.init();

// Firebase binding when there is new player
firebase.database().ref('players').on('child_added', function (playerData) {
  var player = {
    id: playerData.key,
    avatar: playerData.val().avatar,
    velocity: { x: 0, y: 0 }
  };

  // Add player to the game
  game.addPlayer(player);

  // Listener for player velocity change
  firebase.database().ref('players/' + player.id + '/velocity').on('value', function (velocityData) {
    player.velocity = velocityData.val();
  });
});