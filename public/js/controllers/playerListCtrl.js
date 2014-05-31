'use strict';

angular.module('vikings')
    .controller('PlayerListCtrl',
        ['$rootScope', '$scope', 'Users', function($rootScope, $scope, Users) {

            var updatePlayerList = function() {
                $scope.playerList = Users.getAllUsers();
            }

            $scope.playerList = Users.getAllUsers();

            Users.registerObserverCallback(updatePlayerList);
        }]);