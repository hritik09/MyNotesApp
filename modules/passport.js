var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(app, passport) {
    var db = app.get('database');
    var config = app.get('config');

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and deserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        db.getUserById(id, function (err, row) {
            var user = {};
            // selecttively adding parameters to usr so that password is not added to session
            user.id = row.user_id;
            user.email = row.email;
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {

            // asynchronous
            process.nextTick(function () {
                db.getUserByEmail(email, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));

                    if (user.password != password)
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                    // all is well, return user
                    else{
                        var usr = {};
                        // selecttively adding parameters to usr so that password is not added to session
                        usr.id = user.user_id;
                        usr.email = user.email;
                        return done(null, usr);
                    }

                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function (req, email, password, done) {
            // asynchronous
            process.nextTick(function () {

                //  Whether we're signing up or connecting an account, we'll need
                //  to know if the email address is in use.
                db.getUserByEmail(email, function (err, existingUser) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if there's already a user with that email
                    if (existingUser)
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                    // create the user
                    db.createUser(email, password, function (err) {
                        if(err)
                            return done(null, false, req.flash('signupMessage', 'server error, please try again'));

                        var user = {};
                        // selecttively adding parameters to usr so that password is not added to session
                        user.id = this.lastID;
                        user.email = email;

                        done(null, user);
                    });

                });
            });
        }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    if(config.facebookAuth.clientID.length && config.facebookAuth.clientSecret.length && config.facebookAuth.callbackURL.length){
        passport.use(new FacebookStrategy({

                clientID        : config.facebookAuth.clientID,
                clientSecret    : config.facebookAuth.clientSecret,
                callbackURL     : config.facebookAuth.callbackURL,
                passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

            },
            function(req, token, refreshToken, profile, done) {

                // asynchronous
                process.nextTick(function() {
                    var email = profile.emails[0].value;

                    db.getUserByEmail(email, function (err, existingUser) {

                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        if(existingUser){
                            var user = {};
                            // selecttively adding parameters to usr so that password is not added to session
                            user.id = existingUser.UserId;
                            user.email = email;

                            done(null, user);
                        }else{
                            // create the user
                            db.createUser(email, null, function (err) {
                                if(err)
                                    return done(null, false, req.flash('signupMessage', 'server error, please try again'));

                                var user = {};
                                // selecttively adding parameters to usr so that password is not added to session
                                user.id = this.lastID;
                                user.email = email;

                                done(null, user);
                            });
                        }
                    });
                });

            }));
    }
};