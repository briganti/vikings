'use strict';

/* Controllers */

angular.module('vikings')
    .controller('homeCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
        $scope.user         = Auth.user;
        $scope.userRoles    = Auth.userRoles;
        $scope.accessLevels = Auth.accessLevels;
    }]);