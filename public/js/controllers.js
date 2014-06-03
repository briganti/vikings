'use strict';

/* Controllers */

angular.module('vikings')
    .controller('NavCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
        $scope.user         = Auth.user;
        $scope.userRoles    = Auth.userRoles;
        $scope.accessLevels = Auth.accessLevels;

        $scope.logout = function() {
            Auth.logout(function() {
                $location.path('/');
            }, function() {
                $rootScope.error = "Failed to logout";
            });
        };
    }]);


angular.module('vikings')
    .controller('GuestCtrl',
        ['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

            $scope.rememberme = true;
            $scope.guest = function() {
                Auth.guest({
                        username: $scope.username
                    },
                    function(res) {
                        if(res.err) {
                            $rootScope.error = res.err;
                        } else {
                            if($rootScope.$$phase) {
                                window.location = '/';
                            } else {
                                $location.path('/');
                                $rootScope.$apply()
                            }
                        }
                    },
                    function(err) {
                        $rootScope.error = "Failed to login as a guest";
                    });
            };
        }]);


angular.module('vikings')
    .controller('LoginCtrl',
        ['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

            $scope.rememberme = true;
            $scope.login = function() {
                Auth.login({
                        username: $scope.username,
                        password: $scope.password,
                        rememberme: $scope.rememberme
                    },
                    function() {
                        $location.path('/');
                    },
                    function(err) {
                        $rootScope.error = "Failed to login";
                    });
            };

        }]);

angular.module('vikings')
    .controller('RegisterCtrl',
        ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {

            $scope.register = function() {
                Auth.register({
                        username  : $scope.username,
                        password  : $scope.password,
                        password2 : $scope.password2
                    },
                    function() {
                        if($rootScope.$$phase) {
                            window.location = '/';
                        } else {
                            $location.path('/');
                            $rootScope.$apply()
                        }
                    },
                    function(err) {
                        $rootScope.error = err;
                    });
            };
        }]);

angular.module('vikings')
    .controller('AdminCtrl',
        ['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
            $scope.loading = true;
            $scope.userRoles = Auth.userRoles;

            Users.getAll(function(res) {
                $scope.users = res;
                $scope.loading = false;
            }, function(err) {
                $rootScope.error = "Failed to fetch users.";
                $scope.loading = false;
            });

        }]);