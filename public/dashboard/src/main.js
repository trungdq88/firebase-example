const GameBoard = GameBoard || {};
const firebase = firebase || {};

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE',
  authDomain: 'fir-example-c2211.firebaseapp.com',
  databaseURL: 'https://fir-example-c2211.firebaseio.com',
  storageBucket: '',
};
firebase.initializeApp(config);

// Start the game
const game = new GameBoard();
game.init();

// Firebase binding when there is new player
firebase.database().ref('players').on('child_added', playerData => {
  const player = game.addPlayer(playerData);

  // Listener for player velocity change
  firebase.database().ref('players/' + player.id + '/velocity').on('value', velocityData => {
    player.velocity = velocityData.val();
  });
});
