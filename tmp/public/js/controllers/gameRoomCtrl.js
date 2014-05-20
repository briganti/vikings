'use strict';

angular.module('vikings')
    .controller('gameRoomCtrl',
        ['$rootScope', '$scope', '$location', '$modal', 'Auth', 'Users', 'Socket', function($rootScope, $scope, $location, $modal, Auth, Users, Socket) {

            Socket.on('lobby:gamelist', function (data) {
                var selectedGameFound = false;

                $scope.gameList.length = [];

                if(data.gamelist) {
                    for (var i = 0; i < data.gamelist.length; i++) {
                        $scope.gameList.push({
                            id    : data.gamelist[i].id,
                            p1    : Users.getUser(data.gamelist[i].p1),
                            p2    : Users.getUser(data.gamelist[i].p2),
                            state : data.gamelist[i].state
                        });

                        if($scope.selectedGame && data.gamelist[i].id == $scope.selectedGame.id) {
                            selectedGameFound = true;
                        }
                    }
                }

                if(!selectedGameFound) {
                    $scope.selectedGame = null;
                }
            });

            Socket.on('game:start', function (data) {
                if($scope.modalWaitingPlayer) {
                    $scope.modalWaitingPlayer.dismiss();
                }
                $location.path('/play/game/'+data.gameId);
            });


            $scope.newGame = function () {
                Socket.emit('game:create', {name : 'test'});

                $scope.modalWaitingPlayer = $modal.open({
                    templateUrl: 'modal/waitingplayer',
                    controller: modalInstanceWaitingPlayer
                });

                $scope.modalWaitingPlayer.result.then(function() {
                }, function (data) {
                    $scope.modalWaitingPlayer = null;
                    if(data == 'cancel') {
                        Socket.emit('game:quit');
                    }
                });
            };

            $scope.join = function () {
                Socket.emit('game:join', {'gameId' : $scope.selectedGame.id});
            }

            $scope.canJoin = function () {
                if ($scope.isDeckReady() && $scope.selectedGame && $scope.selectedGame.state == 'available')  {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.isDeckReady = function () {
                var deck = Auth.getDeck();
                for(var i = 0; i < deck.length; i++) {
                    if(deck[i] === null) {
                        return false;
                    }
                }
                return true;
            }

            $scope.game               = [];
            $scope.gameList           = [];
            $scope.selectedGame       = null;
            $scope.modalWaitingPlayer = null;

            Socket.emit('lobby:getGameList');
        }]);

var modalInstanceWaitingPlayer = function ($scope, $modalInstance) {

    $scope.ok = function () {};
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
