"use strict";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE",
  authDomain: "fir-example-c2211.firebaseapp.com",
  databaseURL: "https://fir-example-c2211.firebaseio.com",
  storageBucket: ""
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

var databaseRef = database.ref('players/player0');

var sampleTouch = {
  preventDefault: function preventDefault() {},
  touches: [{
    clientX: range.offsetLeft + range.offsetWidth / 2,
    clientY: range.offsetTop + range.offsetHeight / 2
  }]
};

Rx.Observable.fromEvent(range, 'touchstart').startWith(sampleTouch).flatMap(function (e) {
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
  target.style.transform = "translate3d(" + pos.left + "px, " + pos.top + "px, 0)";

  return {
    x: pos.left + target.offsetWidth / 2 - (range.offsetLeft + range.offsetWidth / 2),
    y: pos.top + target.offsetHeight / 2 - (range.offsetTop + range.offsetHeight / 2)
  };
}).debounce(10).subscribe(function (value) {
  databaseRef.update({ 'velocity': value });
});