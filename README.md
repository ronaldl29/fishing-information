# What is Fishing Social? #
A social network and content management system hybrid for building a local fishing guide website. A user system and news
feed that comes right out of the box. This system is still in beta. Built on Node.js and MongoDB. Uses a customized version of Bulma CSS for stylesheets.

# Requirements #
1. Node.js 8.9
2. MongoDB 3.4

# Known Bugs #
1. When using MongoDB 3.6, the catch won't be added to specified location. MongoDB 3.4 is recommended at this time.

# Installation #
1. Register for Google ReCAPTCHA and add desired domain (if localhost, localhost URL as well)
2. Navigate to ReCAPTCHA section in `App.js` and fill in with key provided from Step 1.
2. Navigate to `// Setup Express Session` and edit `ADD YOUR KEY` to your desired secret key
3. Run `npm install`
4. Navigate to `localhost:3000` and register an account
5. Open MongoDB console and find created account
6. Change `isAdmin: false` and change to `isAdmin: true`
7. You have finished installation!
