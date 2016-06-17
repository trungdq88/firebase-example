// Libraries used
const firebase = firebase || {};
const Rx = Rx || {};

// View references
const screenLogin = document.getElementById('screen-login');
const screenLoading = document.getElementById('screen-loading');
const imgAvatar = document.getElementById('img-avatar');
const range = document.getElementById('range');
const target = document.getElementById('target');
const lblUsername = document.getElementById('lbl-username');
const btnFacebook = document.getElementById('btn-facebook');
const btnLogout = document.getElementById('btn-logout');

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCpQjFy_vv-bMZzel-NWu44v1vZGCL8uxE',
  authDomain: 'fir-example-c2211.firebaseapp.com',
  databaseURL: 'https://fir-example-c2211.firebaseio.com',
  storageBucket: '',
};
firebase.initializeApp(config);
const database = firebase.database();
const auth = firebase.auth();

// Observables for authenticate
const obsAuthStateChange = new Rx.Subject();
const obsAuthLoggedIn = obsAuthStateChange.filter(user => user !== null);
const obsAuthLoggedOut = obsAuthStateChange.filter(user => user === null);

// Authenticate logic
auth.onAuthStateChanged(user => {
  obsAuthStateChange.onNext(user);
});
firebase.auth().getRedirectResult().then(() => {
  screenLoading.style.display = 'none';
});

obsAuthLoggedIn.subscribe(() => {
  const user = auth.currentUser;
  lblUsername.innerText = user.displayName;
  imgAvatar.style.backgroundImage = `url('${user.photoURL}')`;
  screenLogin.style.display = 'none';
  screenLoading.style.display = 'none';
  database.ref(`players/${user.uid}`).update({
    'name': user.displayName,
    'avatar': user.photoURL,
    'velocity': { x: 0, y: 0 },
  });
});
obsAuthLoggedOut.subscribe(() => {
  lblUsername.innerText = 'Guest';
  screenLogin.style.display = 'flex';
  imgAvatar.style.backgroundImage = '';
});

Rx.Observable.fromEvent(btnFacebook, 'click')
.subscribe(() => auth.signInWithRedirect(new firebase.auth.FacebookAuthProvider()));
Rx.Observable.fromEvent(btnLogout, 'click')
.subscribe(() => auth.signOut());

// Joystick controller logic

// A sample fake touch event to align the target to the center
const sampleTouch = {
  preventDefault: () => {},
  touches: [{
    clientX: range.offsetLeft + range.offsetWidth / 2,
    clientY: range.offsetTop + range.offsetHeight / 2,
  }],
};

// Handle events
Rx.Observable.fromEvent(range, 'touchstart')
.startWith(sampleTouch)
.flatMap(() => Rx.Observable.fromEvent(range, 'touchmove')
    .startWith(sampleTouch)
    .takeUntil(Rx.Observable.fromEvent(range, 'touchend'))
    .concat(Rx.Observable.just(sampleTouch))
)
.map(e => {
  e.preventDefault();
  return {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
  };
})
.map(touch => {
  return {
    left: touch.x - target.offsetWidth / 2,
    top: touch.y - target.offsetHeight / 2,
  };
})
.map(pos => {
  let left = pos.left;
  let top = pos.top;
  const limitLeft = range.offsetWidth + range.offsetLeft - target.offsetWidth;
  const limitTop = range.offsetHeight + range.offsetTop - target.offsetHeight;
  if (pos.left < range.offsetLeft) left = range.offsetLeft;
  if (pos.left > limitLeft) left = limitLeft;
  if (pos.top < range.offsetTop) top = range.offsetTop;
  if (pos.top > limitTop) top = limitTop;
  return { left, top };
})
.map(pos => {
  target.style.opacity = 1;
  target.style.transform = `translate3d(${pos.left}px, ${pos.top}px, 0)`;

  return {
    x: (pos.left + target.offsetWidth / 2) - (range.offsetLeft + range.offsetWidth / 2),
    y: (pos.top + target.offsetHeight / 2) - (range.offsetTop + range.offsetHeight / 2),
  };
})
.debounce(10)
.filter(() => auth.currentUser !== null)
.subscribe(value => {
  database.ref(`players/${auth.currentUser.uid}`).update({ 'velocity': value });
});
