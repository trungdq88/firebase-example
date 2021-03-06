# Firebase Example

A web application to demonstrate Firebase features:

- Realtime Database
- Authentication
- Hosting

See Firebase example with Realtime Database, Authentication, Storage and Hosting: https://github.com/trungdq88/firebase-checkin

**Gameplay**: similar to the famous agar.io game, but with controller, built with Firebase Realtime Database.

This game is design to play in a presentation for demonstration purpose.

![demo](https://cloud.githubusercontent.com/assets/4214509/16274391/9f0dd236-38cf-11e6-967d-81474aae77ca.gif)

- Dashboard: https://fir-example-c2211.firebaseapp.com/dashboard/
- Controller: https://fir-example-c2211.firebaseapp.com/controller/ (should be visited on phones or tablets)

*Notice:* game logic is calculated at client side in the dashboard screen, so if there is more than 1 dashboard screen opened, they will not sync!

# Development

Source placed in `/public/dashboard/src` and `/public/controller/src`.

Build:

```bash
npm run build
```

Deploy
```bash
firebase deploy
```
