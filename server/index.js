const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const passport = require('passport');

// Create the server and choose a port to bind to
const app = express();
const port = process.env.PORT || 3001;

// Include middlewares
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(helmet());
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));

require('./config/passport')(passport);

app.use(passport.initialize());

// CHANGE THIS TO YOUR URL
const public_url = "http://example.llc.washington.edu";

app.use(passport.initialize());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', public_url);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use('/static', express.static('public'));

// Add route controllers. Most of the server logic is puleed in here
const mountRoutes = require('./routes');

mountRoutes(app);

// If in production, serve
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(port, () => console.log(`Server ready, application available on port ${port}`));
