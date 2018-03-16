# What is Fishing Social? #
A social network and content management system hybrid for building a local fishing guide website. A user system and news
feed that comes right out of the box. This system is still in beta. Built on Node.js and MongoDB. Uses a customized version of Bulma CSS for stylesheets.

# To-Do List #
1. ~~Remove font awesome dependency and switch to SVG icons...~~ Completed
2. Create admin panel... 5%
3. Clean up CSS for faster pageload... Not yet started
4. Change name of "Catch" model to fix reserved name issue... Not yet started
5. Add upload percentage progress... Not yet started
6. Add chat/message board feature... Not yet started
7. Add comment feature to catches... Not yet started


# Minor Improvements Needed #
1. ~~Link to specified location page from feed and catch page...~~ Completed
2. Finish change email function

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
