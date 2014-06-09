var _            = require('underscore'),
    path         = require('path'),
    auth         = require('../models/auth.js'),
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
        // Authentification
        {
            path: '/auth/guest',
            httpMethod: 'POST',
            middleware: [auth.loginGuest(sessionStore)]
        },
        {
            path: '/auth/login',
            httpMethod: 'POST',
            middleware: [auth.loginUser(sessionStore)]
        },
        {
            path: '/auth/register',
            httpMethod: 'POST',
            middleware: [auth.registerUser(sessionStore)]
        },
        {
            path: '/logout',
            httpMethod: 'POST',
            middleware: [function(req, res) {

                req.session.destroy();
                res.cookie('user', JSON.stringify({
                    'id'  : '',
                    'name': '',
                    'role': userRoles.public
                }));

                res.redirect('/');
            }]
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

                //if user is not in session, set a public cookie
                if(!req.session.user) {
                    res.cookie('user', JSON.stringify({
                        'id'  : '',
                        'name': '',
                        'role': userRoles.public
                    }));
                }

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
}

