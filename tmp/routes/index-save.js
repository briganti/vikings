/*
 * Routing.
 */
//Homepage
/*exports.home = function(req, res){
  res.render('index', {
      'title'  : 'Welcome to Vikings',
      'bodyId' : 'pageHome',
      'logged' : false
  });
};
*/
//Login Page
exports.loginSetAuth = function(sessionStore, vikings) {
    return function(req, res, next){
        /*var options = {
            'username' : req.body.username,
            'error'    : '',
            'title'    : 'Register to Vikings',
            'bodyId'   : 'pageLogin',
            'logged'   : false
        };*/

        // User has not given a name
        if (!req.body.username) {
            return res.json(200, {"err": "User name is required"});
            /*res.render("login", options);*/
        // User's name is less than 3 characters
        } else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
            return res.json(200, {"err": "User name must have at least 3 alphanumeric characters"});
            /*res.render("login", options);*/
            // User has not changed username, accept it as-is (need more security)
            //} else if (req.body.nickname == req.session.username) {
             //res.redirect("/play");
        } else {
            // Validate if username is free
            sessionStore.all(function (err, sessions) {
                if (!err) {
                    for (var i=0; i<sessions.length; i++) {
                        var session = JSON.parse(sessions[i]);
                        if (session.user && session.user.name == req.body.username) {
                            err = "User name already used by someone else";
                            break;
                        }
                    }
                }
                if (err) {
                    return res.json(200,{"err": err});
                    /*res.render("login", options);*/
                } else {
                    //req.session.cookie.maxAge = 14 * 24 * 3600000;
                    //req.session.cookie.expires = false;
                    req.session.user = {
                        'id'   : req.body.username,
                        'name' : req.body.username
                    };
                    vikings.setPlayer(req.session.user.id);
                    /*res.redirect("/play");*/
                    res.cookie('user', JSON.stringify({
                        'username': req.body.username,
                        'role': {
                            "bitMask": 2,
                            "title": "user"
                        }
                    }));
                    res.json(200, { "role": {
                        "bitMask": 2,
                        "title": "user"
                    }, "username": req.body.username });
                    res.render('app', {
                        'title'  : 'Welcome to Vikings',
                        'bodyId' : 'pageHome',
                        'logged' : false
                    });
                }
            });
        }
    }
};
/*
exports.loginPage = function(req, res){
  res.render('login', {
      'title ' : 'Register to Vikings',
      'bodyId' : 'pageLogin',
      'logged' : false,
      'error'  : ''
  });
};

//Game Page
exports.lobbyIsAuth = function() {
    return function(req, res, next) {
        // User is authenticated, let him in
        if (req.session.user) {
            next();
        // Otherwise, we redirect him to login form
        } else {
            res.redirect("/login");
        }
    }
};
exports.lobbyPage = function(req, res){
  res.render('lobby', {
      'title'    : 'Play Vikings',
      'bodyId'   : 'pageGame',
      'logged'   : true,
      'username' : req.session.user.name
  });
};*/

/** Angular integration **/

exports.app = function(req, res){
    res.render('app', {
        'title'  : 'Welcome to Vikings',
        'bodyId' : 'pageHome',
        'logged' : false
    });
};

exports.home  = function(req, res){ res.render('partials/home');};
exports.login = function(req, res){ res.render('partials/auth/login');};