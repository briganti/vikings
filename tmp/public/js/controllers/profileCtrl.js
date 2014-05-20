'use strict';

angular.module('vikings')
    .controller('profileCtrl',
        ['$rootScope', '$scope', '$location', 'Auth', 'Socket', function($rootScope, $scope, $location, Auth, Socket) {

            var updateLibraryAndDeck = function() {
                $scope.deck          = Auth.getDeck();
                $scope.libraryLength = Auth.getLibrary().length;
            };

            $scope.editDeck = function() {
                $location.path('/play/library');
            };

            $scope.name          = Auth.user.name;
            $scope.deck          = Auth.getDeck();
            $scope.libraryLength = Auth.getLibrary().length;

            Auth.registerObserverCallback(updateLibraryAndDeck);

            Socket.emit('library:get');
        }]);