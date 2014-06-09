var config    = require("../conf/config.js"),
    mysql     = require('mysql'),
    crypto    = require('crypto'),
    main      = require('../models/main.js'),
    uuid      = require('node-uuid'),
    userRoles = require('../public/js/routingConfig').userRoles;

var auth = {
    db : mysql.createConnection(config.db)
};

/* Check Username *******************************************************************************/
auth.checkUsername = function(sessionStore, username) {
    // User has not given a name
    if (!username) {
        throw  {msg : "Username is required"};
    }

    // Username is less than 3 characters
    if (!username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
        throw {msg : "Username must have at least 3 alphanumeric characters"};
    }

    //username is free (guest no using it)
    var session;
    sessionStore.all(function (err, sessions) {
        if (!err) {
            for (var i= 0, ln = sessions.length; i < ln; i++) {
                session = JSON.parse(sessions[i]);
                if (session.user && session.user.name == username) {
                    throw {msg : "Username already used by someone else"};
                }
            }
        }
    });
};

/* Check Passwords ******************************************************************************/
auth.checkPasswords = function(password, password2) {
    // Password has not been given
    if (!password) {
        throw  {msg : "Password is required"};
    }

    // Password is less than 6 characters
    if (!password.match(/^[a-zA-Z0-9\-_]{6,}$/)) {
        throw {msg : "Password must have at least 6 alphanumeric characters"};
    }

    // Passwords don't match
    if (password !== password2) {
        throw {msg : "Passwords don't match each other"};
    }
};

/* Set user session and cookie ******************************************************************/
auth.setSessionAndCookie = function (req, res, id, username, role) {
    var oUser = {
        id   : id,
        name : username,
        role : role
    };

    req.session.user = oUser;
    res.cookie('user', JSON.stringify(oUser));
};

/* Get User From Database ***********************************************************************/
auth.getUser = function (username, Callback) {
    var query = "SELECT * FROM users WHERE name LIKE '"+username+"'";

    auth.db.query(query, function(err, rows){
        if(err)	{
            throw err;
        }
        Callback(rows);
    });
};

/* Insert User In Database **********************************************************************/
auth.insertUser = function (id, username, password, Callback) {
    var query = "INSERT INTO users (uuid, name, pwd) VALUES ('"+id+"', '"+username+"', '"+password+"');";

    auth.db.query(query, function(err, rows){
        if(err)	{
            throw err;
        }
        Callback(rows);
    });
};

/* Error Handler ********************************************************************************/
auth.errorHandler =  function(res, error) {
    res.json(400, {"error": error})
}

/* Guest login **********************************************************************************/
auth.loginGuest = function (sessionStore) {
    return function(req, res){
        var username = req.body.username;

        try {
            auth.checkUsername(sessionStore, username);

            var id = uuid.v1();
            auth.setSessionAndCookie(req, res, id, username, userRoles.user)

            main.setPlayer(id, username);
            res.json(200);

        } catch(e) {
            auth.errorHandler(res, e.msg);
        }
    }
};

/* User login ***********************************************************************************/
auth.loginUser = function (sessionStore) {
    return function(req, res){
        var username = req.body.username,
            password = req.body.password;

        try {
            auth.checkUsername(sessionStore, username);
            auth.getUser(username, function(dbUser) {

                if(dbUser.length !== 1) {
                    auth.errorHandler(res, "Username not registered");
                } else {
                    var dbUser = dbUser[0];
                    var cryptedPwd = crypto.createHash('sha1').update(password).digest("hex");

                    if(dbUser.pwd === cryptedPwd) {
                        auth.setSessionAndCookie(req, res, dbUser.id, username, userRoles.user)
                        main.setPlayer(dbUser.id, username);
                        res.json(200);
                    } else {
                        auth.errorHandler(res, "Username not registered");
                    }
                }
            });
        } catch(e) {
            auth.errorHandler(res, e.msg);
        }
    }
};

/* User Register ********************************************************************************/
auth.registerUser = function (sessionStore) {
    return function(req, res){
        var username  = req.body.username,
            password  = req.body.password,
            password2 = req.body.password2;

        try {
            auth.checkUsername(sessionStore, username);
            auth.checkPasswords(password, password2);
            auth.getUser(username, function(dbUser) {

                if(dbUser.length > 0) {
                    auth.errorHandler(res, "Username already used by someone else");
                } else {
                    var id = uuid.v1();
                    var cryptedPwd = crypto.createHash('sha1').update(password).digest("hex");

                    auth.insertUser(id, username, cryptedPwd, function() {
                        auth.setSessionAndCookie(req, res, id, username, userRoles.user)
                        main.setPlayer(id, username);
                        res.json(200);
                    });
                }
            });
        } catch(e) {
            auth.errorHandler(res, e.msg);
        }
    }
};

module.exports = auth;