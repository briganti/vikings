var config    = require("../conf/config.js"),
    mysql     = require('mysql'),
    main      = require('../models/main.js'),
    uuid      = require('node-uuid'),
    userRoles = require('../public/js/routingConfig').userRoles;

var auth = {};


/* Check Username *******************************************************************************/
auth.checkUsername = function(sessionStore, username) {
    // User has not given a name
    if (!username) {
        throw  {msg : "Username is required"};
    }

    // User's name is less than 3 characters
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

/* Get User From Database *******************************************************************/
auth.getUser = function (username, password) {
    /*new mysql.createConnection(config.db).connect(function(err) {
     if (err) {
     throw {msg :'CONNECTION error: ' + err};
     }
     // On est connecté ! Mettre ici le code
     console.log('YES connected');
     });*/
};

/* Guest login ******************************************************************************/
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
            return res.json(200, {"err": e.msg});
        }
    }
};

/* Guest login ******************************************************************************/
auth.loginUser = function (sessionStore) {
    return function(req, res){
        var username = req.body.username;
            pwd      = req.body.password;

        try {
            auth.checkUsername(sessionStore, username);
            auth.getUser(username);

            var id = uuid.v1();
            auth.setSessionAndCookie(req, res, id, username, userRoles.user)

            main.setPlayer(id, username);
            res.json(200);

        } catch(e) {
            return res.json(200, {"err": e.msg});
        }
    }
}

module.exports = auth;