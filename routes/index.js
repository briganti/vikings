var _            = require('underscore'),
    path         = require('path'),
    main         = require('../models/main.js'),
    uuid         = require('node-uuid'),
    userRoles    = require('../public/js/routingConfig').userRoles,
    accessLevels = require('../public/js/routingConfig').accessLevels;


module.exports = function(app, sessionStore) {

    var routes = [

        // Views
        {
            path: '/partials/*',
            httpMethod: 'GET',
            middleware: [function (req, res) {
                var requestedView = path.join('./', req.url);
                res.render(requestedView);
            }]
        },
        // Local Auth
        {
            path: '/auth/guest',
            httpMethod: 'POST',
            middleware: [loginSetAuth(sessionStore)]
        },
        {
            path: '/login',
            httpMethod: 'POST',
            middleware: []
        },
        {
            path: '/logout',
            httpMethod: 'POST',
            middleware: [/*AuthCtrl.logout*/]
        },

        // User resource
        {
            path: '/users',
            httpMethod: 'GET',
            middleware: [],
            accessLevel: accessLevels.admin
        },

        // All other get requests should be handled by AngularJS's client-side routing system
        {
            path: '/*',
            httpMethod: 'GET',
            middleware: [function(req, res) {
                var id = '', role = userRoles.public, name = '';
                if(req.session.user) {
                    id   = req.session.user.id;
                    name = req.session.user.name;
                    role = req.session.user.role;
                }
                res.cookie('user', JSON.stringify({
                    'id'  : id,
                    'name': name,
                    'role': role
                }));

                res.render('app');
            }]
        }
    ];

    _.each(routes, function(route) {
        route.middleware.unshift(ensureAuthorized);
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });


    function ensureAuthorized(req, res, next) {
        var role;
        if(!req.session.user) role = userRoles.public;
        else role = req.session.user.role;

        var accessLevel = _.findWhere(routes, { path: req.route.path }).accessLevel || accessLevels.public;

        if(!(accessLevel.bitMask & role.bitMask)) return res.send(403);
        return next();
    }

    function loginSetAuth(sessionStore) {
        return function(req, res){

            // User has not given a name
            if (!req.body.username) {
                return res.json(200, {"err": "User name is required"});
                // User's name is less than 3 characters
            } else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
                return res.json(200, {"err": "User name must have at least 3 alphanumeric characters"});
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
                    } else {
                        var oUser = {
                            'id'   : uuid.v1(),
                            'name' : req.body.username,
                            "role": {
                                "bitMask": 2,
                                "title": "user"
                            }
                        };

                        req.session.user = oUser;
                        main.setPlayer(oUser.id, oUser.name);
                        res.json(200, oUser);
                    }
                });
            }
        }
    }
}

