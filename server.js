// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 8080;
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./modules/database.js');
var config = require('./config.js');

var apiFrequency = {};

// set up our express application
app.set('database', db);
app.set('config', config);

require('./modules/passport')(app, passport); // pass passport for configuration
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('views', path.join(__dirname, 'views')); // Path for view files
app.set('view engine', 'ejs'); // set up ejs for templating

app.use(express.static(path.join(__dirname, 'public'))); // Path for the static files

// required for passport
app.use(session({
    secret: 'shadi.com'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./modules/routes.js')(app, passport, apiFrequency); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('Server is listening on port ' + port);

process.on('exit', function(code) {

    console.log('About to exit with code:', code);
    db.updateApiFrequency(apiFrequency.index, apiFrequency.get_login, apiFrequency.post_login, apiFrequency.get_signup,
        apiFrequency.post_signup, apiFrequency.notes, apiFrequency.list, apiFrequency.add, apiFrequency.update,
        apiFrequency.delete, apiFrequency.logout, apiFrequency.status, apiFrequency.facebookAuth);
});
