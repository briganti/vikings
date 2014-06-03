'use strict';

// Declare app level module which depends on filters, and services
angular.module('vikings', ['ngCookies', 'ui.router', 'ui.bootstrap']).
    config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        var access = routingConfig.accessLevels;

        // Public routes
        $stateProvider
            .state('public', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.public
                }
            })
            .state('public.404', {
                url: '/404/',
                templateUrl: '404'
            });

        // Anonymous routes
        $stateProvider
            .state('anon', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.anon
                }
            })
            .state('anon.home', {
                url: '/',
                templateUrl: 'home'
            })
            .state('anon.auth', {
                url: '/auth/',
                templateUrl: 'auth'
            })
            .state('anon.auth.guest', {
                url: 'guest/',
                templateUrl: 'auth/guest',
                controller: 'GuestCtrl'
            })
            .state('anon.auth.login', {
                url: 'login/',
                templateUrl: 'auth/login',
                controller: 'LoginCtrl'
            }).state('anon.auth.register', {
                url: 'register/',
                templateUrl: 'auth/register',
                controller: 'RegisterCtrl'
            });

        // Regular user routes
        $stateProvider
            .state('user', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.user
                }
            })
            .state('user.home', {
                url: '/',
                templateUrl: 'home'
            })
            .state('user.play', {
                abstract: true,
                url: '/play/',
                templateUrl: 'play'
            })
            .state('user.play.home', {
                url: '',
                templateUrl: 'play/home'
            })
            .state('user.play.library', {
                url: 'library/',
                templateUrl: 'play/library'
            })
            .state('user.play.game', {
                url: 'game/:gameId',
                templateUrl: 'play/game'
            });

        // Admin routes
        $stateProvider
            .state('admin', {
                abstract: true,
                template: "<ui-view/>",
                data: {
                    access: access.admin
                }
            })
            .state('admin.admin', {
                url: '/admin/',
                templateUrl: 'admin',
                controller: 'AdminCtrl'
            });


        $urlRouterProvider.otherwise('/404');

        // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
        $urlRouterProvider.rule(function($injector, $location) {
            if($location.protocol() === 'file')
                return;

            var path = $location.path()
            // Note: misnomer. This returns a query object, not a search string
                , search = $location.search()
                , params
                ;

            // check to see if the path already ends in '/'
            if (path[path.length - 1] === '/') {
                return;
            }

            // If there was no search string / query params, return with a `/`
            if (Object.keys(search).length === 0) {
                return path + '/';
            }

            // Otherwise build the search string and return a `/?` prefix
            params = [];
            angular.forEach(search, function(v, k){
                params.push(k + '=' + v);
            });
            return path + '/?' + params.join('&');
        });

        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push(function($q, $location) {
            return {
                'responseError': function(response) {
                    if(response.status === 401 || response.status === 403) {
                        $location.path('/');
                    }
                    return $q.reject(response);
                }
            };
        });

    }])
    .run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (!Auth.authorize(toState.data.access)) {
                $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
                event.preventDefault();

                if(fromState.url === '^') {
                    if(Auth.isLoggedIn()) {
                        $state.go('user.play.home');
                    } else {
                        $rootScope.error = null;
                        $state.go('anon.auth.guest');
                    }
                }
            }
        });

    }]);