'use strict';

// Libraries used
var firebase = firebase || {};
var Rx = Rx || {};

// View references
var screenLogin = document.getElementById('screen-login');
var screenLoading = document.getElementById('screen-loading');
var imgAvatar = document.getElementById('img-avatar');
var range = document.getElementById('range');
var target = document.getElementById('target');
var lblUsername = document.getElementById('lbl-username');
var btnFacebook = document.getElementById('btn-facebook');
var btnLogout = document.getElementById('btn-logout');

// Initialize Firebase
var config = {
  apiKey: 'AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE',
  authDomain: 'fir-example-c2211.firebaseapp.com',
  databaseURL: 'https://fir-example-c2211.firebaseio.com',
  storageBucket: ''
};
firebase.initializeApp(config);
var database = firebase.database();
var auth = firebase.auth();

// Observables for authenticate
var obsAuthStateChange = new Rx.Subject();
var obsAuthLoggedIn = obsAuthStateChange.filter(function (user) {
  return user !== null;
});
var obsAuthLoggedOut = obsAuthStateChange.filter(function (user) {
  return user === null;
});

// Authenticate logic
auth.onAuthStateChanged(function (user) {
  obsAuthStateChange.onNext(user);
});
firebase.auth().getRedirectResult().then(function () {
  screenLoading.style.display = 'none';
});

obsAuthLoggedIn.subscribe(function () {
  var user = auth.currentUser;
  lblUsername.innerText = user.displayName;
  imgAvatar.style.backgroundImage = 'url(\'' + user.photoURL + '\')';
  screenLogin.style.display = 'none';
  screenLoading.style.display = 'none';
  database.ref('players/' + user.uid).update({
    'name': user.displayName,
    'avatar': user.photoURL,
    'velocity': { x: 0, y: 0 }
  });
});
obsAuthLoggedOut.subscribe(function () {
  lblUsername.innerText = 'Guest';
  screenLogin.style.display = 'flex';
  imgAvatar.style.backgroundImage = '';
});

Rx.Observable.fromEvent(btnFacebook, 'click').subscribe(function () {
  return auth.signInWithRedirect(new firebase.auth.FacebookAuthProvider());
});
Rx.Observable.fromEvent(btnLogout, 'click').subscribe(function () {
  return auth.signOut();
});

// Joystick controller logic

// A sample fake touch event to align the target to the center
var sampleTouch = {
  preventDefault: function preventDefault() {},
  touches: [{
    clientX: range.offsetLeft + range.offsetWidth / 2,
    clientY: range.offsetTop + range.offsetHeight / 2
  }]
};

// Handle events
Rx.Observable.fromEvent(range, 'touchstart').startWith(sampleTouch).flatMap(function () {
  return Rx.Observable.fromEvent(range, 'touchmove').startWith(sampleTouch).takeUntil(Rx.Observable.fromEvent(range, 'touchend')).concat(Rx.Observable.just(sampleTouch));
}).map(function (e) {
  e.preventDefault();
  return {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
}).map(function (touch) {
  return {
    left: touch.x - target.offsetWidth / 2,
    top: touch.y - target.offsetHeight / 2
  };
}).map(function (pos) {
  var left = pos.left;
  var top = pos.top;
  var limitLeft = range.offsetWidth + range.offsetLeft - target.offsetWidth;
  var limitTop = range.offsetHeight + range.offsetTop - target.offsetHeight;
  if (pos.left < range.offsetLeft) left = range.offsetLeft;
  if (pos.left > limitLeft) left = limitLeft;
  if (pos.top < range.offsetTop) top = range.offsetTop;
  if (pos.top > limitTop) top = limitTop;
  return { left: left, top: top };
}).map(function (pos) {
  target.style.opacity = 1;
  target.style.transform = 'translate3d(' + pos.left + 'px, ' + pos.top + 'px, 0)';

  return {
    x: pos.left + target.offsetWidth / 2 - (range.offsetLeft + range.offsetWidth / 2),
    y: pos.top + target.offsetHeight / 2 - (range.offsetTop + range.offsetHeight / 2)
  };
}).debounce(10).filter(function () {
  return auth.currentUser !== null;
}).subscribe(function (value) {
  database.ref('players/' + auth.currentUser.uid).update({ 'velocity': value });
});