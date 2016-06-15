import Firebase from 'firebase';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE",
  authDomain: "fir-example-c2211.firebaseapp.com",
  databaseURL: "https://fir-example-c2211.firebaseio.com",
  storageBucket: "fir-example-c2211.appspot.com",
};

export default Firebase.initializeApp(config);

