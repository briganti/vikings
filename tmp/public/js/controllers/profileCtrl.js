'use strict';

angular.module('vikings')
    .controller('profileCtrl',
        ['$rootScope', '$scope', '$location', 'Auth', 'Socket', function($rootScope, $scope, $location, Auth, Socket) {

            Socket.on('lobby:getDeck', function (data) {
                $scope.deck = data.deck;
                Auth.deck   = data.deck;
            });

            $scope.name     = Auth.user.name;
            $scope.deck     = [];

            $scope.editDeck = function() {
                $location.path('/play/library');
            }

            Socket.emit('lobby:getDeck');
        }]);