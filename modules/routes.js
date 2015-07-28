// app/routes.js
module.exports = function (app, passport, apiFrequency) {
    var db = app.get('database');
    var config = app.get('config');
    apiFrequency.index = 0;
    apiFrequency.get_login = 0;
    apiFrequency.post_login = 0;
    apiFrequency.get_signup = 0;
    apiFrequency.post_signup = 0;
    apiFrequency.notes = 0;
    apiFrequency.list = 0;
    apiFrequency.add = 0;
    apiFrequency.update = 0;
    apiFrequency.delete = 0;
    apiFrequency.logout = 0;
    apiFrequency.status = 0;
    apiFrequency.facebookAuth = 0;

    db.getApiFrequency(function (err, row) {
        if (row) {
            apiFrequency.index = row.Index;
            apiFrequency.get_login = row.GetLogin;
            apiFrequency.post_login = row.PostLogin;
            apiFrequency.get_signup = row.GetSignup;
            apiFrequency.post_signup = row.PostSignup;
            apiFrequency.notes = row.Notes;
            apiFrequency.list = row.List;
            apiFrequency.add = row.Add;
            apiFrequency.update = row.Update;
            apiFrequency.delete = row.Delete;
            apiFrequency.logout = row.Logout;
            apiFrequency.status = row.Status;
            apiFrequency.facebookAuth = row.FacebookAuth;
        }
    });

    // =====================================
    // Request frequency
    // =====================================
    app.get('/status', function (req, res) {
        apiFrequency.status++;
        apiFrequency.totalCount = 0;
        for (var key in apiFrequency) {
            apiFrequency.totalCount += apiFrequency[apiFrequency];
        }
        res.json(apiFrequency);
    });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        apiFrequency.index++;
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        apiFrequency.get_login++;
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });

    // process the login form
    app.post('/login', updateLocalLogin, passport.authenticate('local-login', {
        successRedirect: '/notes', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the login page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        apiFrequency.get_signup++;
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    app.post('/signup', updateLocalSignup, passport.authenticate('local-signup', {
        successRedirect: '/notes', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // Notes ===============================
    // =====================================
    // render home page
    app.get('/notes', isLoggedIn, function (req, res) {
        apiFrequency.notes++;
        db.getNotesList(req.user.id, function (err, notes) { // get the notes out of databasec
            if (err) {
                res.render('notes.ejs', {
                    notes: []
                });
            } else {
                res.render('notes.ejs', {
                    notes: notes
                });
            }
        });
    });

    // fetch notes list for user
    app.get('/list', isLoggedIn, function (req, res) {
        apiFrequency.list++;
        db.getNotesList(req.user.id, function (err, notes) { // get the notes out of database
            if (err) {
                res.status(500).json(err);
            } else {
                res.json(notes);
            }
        });
    });

    // add note
    app.post('/add', isLoggedIn, function (req, res) {
        apiFrequency.add++;
        var params = req.body;
        db.addNote(req.user.id, params.title, params.note, function (err) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json('note added');
            }
        });
    });

    // update note
    app.post('/update', isLoggedIn, function (req, res) {
        apiFrequency.update++;
        var params = req.body;
        db.updateNote(req.user.id, params.note_id, params.title, params.note,  function (err) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json('note update');
            }
        });
    });

    // delete note
    app.post('/delete', isLoggedIn, function (req, res) {
        apiFrequency.delete++;
        var params = req.body;
        db.deleteNote(params.note_id, req.user.id, function (err) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json('note deleted');
            }
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        apiFrequency.logout++;
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // FACEBOOK INTEGRATION ===============
    // =====================================
    // check if facebook config is present
    if (config.facebookAuth.clientID.length && config.facebookAuth.clientSecret.length && config.facebookAuth.callbackURL.length) {
        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', {
            scope: 'email'
        }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback', updateFacebookLogin, passport.authenticate('facebook', {
            successRedirect: '/note',
            failureRedirect: '/'
        }));
    }

    function updateLocalLogin(req, res, next) {
        apiFrequency.post_login++;
        next();
    }

    function updateLocalSignup(req, res, next) {
        apiFrequency.post_signup++;
        next();
    }

    function updateFacebookLogin(req, res, next) {
        apiFrequency.facebookAuth++;
        next();
    }
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}