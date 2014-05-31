'use strict';

angular.module('vikings')
    .controller('handCtrl',
        ['$rootScope', '$scope', '$modal', 'Socket', function($rootScope, $scope, $modal, Socket) {

            Socket.on('game:info', function (data) {
                $scope.updatePlayerHand(data.game.player.hand);
            });

            //Init player cards
            $scope.updatePlayerHand = function(hand) {
                if($scope.turn == $scope.playerId) {
                    for(var i=0; i< hand.length; i++) {
                        //castable
                        if($scope.phase == 0 && hand[i].type == 2) {
                            hand[i].cast = true;
                        }
                        //buffable
                        if(hand[i].type == 1) {
                            hand[i].buff = true;
                        }
                        //draggable (both bin (phase 0 & 1) and board)
                        if($scope.phase != 2 || (hand[i].type == 0 && $scope.isPlayable(hand[i]))) {
                            hand[i].drag = true;
                        }

                    }
                }
                $scope.setPlayerHand(hand);
            };

            $scope.viewCard = function(cardId) {
                $scope.modalInstanceViewCard = $modal.open({
                    templateUrl : 'modal/viewCard',
                    controller  : modalInstanceViewCard,
                    resolve : {
                        cardId : function () {
                            return cardId;
                        }
                    }
                });

                $scope.modalInstanceViewCard.result.then(function() {
                }, function () {
                    $scope.modalInstanceViewCard = null;
                });
            }

            $scope.castSpell = function(cardId) {
                Socket.emit('game:phase0', {'cardId' : cardId});
            }

            $scope.selectBuff = function(cardId) {
                if($scope.selectedBuff != cardId) {
                    $scope.setSelectedBuff(cardId);
                } else {
                    $scope.setSelectedBuff(null);
                }
            }

            $scope.modalInstanceViewCard = null;
        }]);


var modalInstanceViewCard = function ($scope, $modalInstance, cardId) {
    $scope.cardId = cardId;

    $scope.close = function () {
        $modalInstance.dismiss();
    };
};