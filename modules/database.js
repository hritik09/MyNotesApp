var sqlite3  = require('sqlite3').verbose();
var fs = require("fs");
var file = __dirname + "/../database/" + "MyNotesApp.db";
var exists = fs.existsSync(file);

if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var db = new sqlite3.Database(file);


db.serialize(function() {
    if(!exists){
        // create user table
        db.run("CREATE TABLE User (user_id INTEGER PRIMARY KEY, email VARCHAR(255), password VARCHAR(255), " +
            "CONSTRAINT 'unique_email' UNIQUE (email))");
        // create notes table
        db.run("CREATE TABLE Notes (note_id INTEGER PRIMARY KEY, user_id INTEGER, title VARCHAR(255), note TEXT, " +
            "created_timestamp REAL, updated_timestamp REAL, FOREIGN KEY (user_id) REFERENCES User (user_id) ON DELETE CASCADE, " +
            "CONSTRAINT 'unique_constraint' UNIQUE (user_id, title))");
        db.run("CREATE TABLE ApiFrequency (`index` INTEGER DEFAULT 0, `get_login` INTEGER DEFAULT 0, `post_login` INTEGER DEFAULT 0, " +
            "`get_signup` INTEGER DEFAULT 0, `post_signup` INTEGER DEFAULT 0, `notes` INTEGER DEFAULT 0, `list` INTEGER DEFAULT 0, " +
            "`add` INTEGER DEFAULT 0, `update` INTEGER DEFAULT 0, `delete` INTEGER DEFAULT 0, `logout` INTEGER DEFAULT 0, " +
            "`status` INTEGER DEFAULT 0, `facebook_auth` INTEGER DEFAULT 0 )");
        db.run("INSERT INTO ApiFrequency (`index`) VALUES (0)");
    }else{
        console.log('initializing db through the file');
    }
});


var database = {};

database.createUser = function (email, password, cb) {
    db.run("INSERT INTO User (email, password) VALUES (?, ?)", [email, password], cb);
};

database.getUserById = function (userId, cb) {
    db.get("select * from User where user_id = ?", userId, cb);
};

database.getUserByEmail = function (email, cb) {
    db.get("Select * from User where email = ?", email, cb)
};

database.updatePassword = function (email, password, cb) {
    db.run("UPDATE User SET password = ? where email = ?", [password, email], cb)
}

//database.createUser('ram1 ', "shyam", "hritik@gmail.com", function(err){
//    console.log(this.lastID);
//});

database.addNote= function (userId, title, note, cb) {
    db.run("INSERT INTO Notes (user_id, title, note, created_timestamp) VALUES (?, ?, ?, ?)", [userId, title, note, new Date().getTime()], cb);
};


database.deleteNote= function (userId, id, cb) {
    db.run("DELETE FROM Notes WHERE user_id = ? AND note_id = ?", [userId, id], cb);
};

database.updateNote= function (userId, id, title, note, cb) {
    db.run("UPDATE Notes SET note = ?, title = ?, updated_timestamp = ? WHERE user_id = ? AND note_id = ?", [note, title, new Date().getTime(), userId, id], cb);
};

database.getNotesList = function (userId, cb) {
    db.all("select * from Notes where user_id = ?", [userId], cb);
};

database.getApiFrequency = function (cb) {
    db.get("select * from ApiFrequency", [], cb);
};

database.updateApiFrequency = function (index, getLogin, postLogin, getSignup, postSignup, notes, list, add, update, del, logout, status, facebookAuth, cb) {
    db.run("UPDATE TABLE ApiFrequency SET `index` = ? , `get_login` = ? , `post_login` = ? , " +
            "`get_signup` = ? , `post_signup` = ? , `notes` = ? , `list` = ? , " +
            "`add` = ? , `update` = ? , `delete` = ? , `logout` = ? , " +
            "`status` = ? , `facebook_auth` = ?", [index, getLogin, postLogin, getSignup, postSignup, notes, list, add, update, del, logout, status, facebookAuth], cb);
};

module.exports = database;
