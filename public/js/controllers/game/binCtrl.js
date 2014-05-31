'use strict';

angular.module('vikings')
    .controller('binCtrl',
        ['$rootScope', '$scope', 'Socket', function($rootScope, $scope, Socket) {

            Socket.on('game:info', function () {
                $scope.binDrop    = $scope.isBinDroppable();
                $scope.binAllowed = $scope.getBinAllowedDroppable();
            });

            //Activate bin for player
            $scope.isBinDroppable = function() {
                if($scope.turn == $scope.playerId && $scope.phase != 2) {
                    return true;
                }
                return false;
            }
            //Get Bin droppables
            $scope.getBinAllowedDroppable = function() {
                var result = [];
                for(var i = 0, ln = $scope.playerHand.length; i< ln;  i++) {
                    result.push($scope.playerHand[i].id);
                }
                return result;
            }

            $scope.binDrop    = false;
            $scope.binAllowed = [];

            $scope.dropAction = function(cardId) {
                if(cardId) {
                    Socket.emit('game:phase1', {'cardId' : cardId});
                }
            }
        }]);
