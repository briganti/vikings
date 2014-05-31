'use strict';

angular.module('vikings')
    .controller('gameCtrl',
        ['$rootScope', '$scope', '$location', '$modal', '$stateParams', 'Socket', function($rootScope, $scope, $location, $modal, $stateParams, Socket) {

            Socket.on('game:info', function (data) {
                $scope.playerId   = data.game.playerId;
                $scope.opponentId =  data.game.opponentId;

                $scope.player   = data.game.player;
                $scope.opponent = data.game.opponent;

                $scope.phase  = data.game.phase;
                $scope.turn   = data.game.turn;

                $scope.woodenDeck   = data.game.woodendeck;

                $scope.manaPool   = $scope.updateManaPool(data.game.player.mana);
                $scope.manaPoolOp = $scope.updateManaPool(data.game.opponent.mana);
            });


            //update mana pool
            $scope.updateManaPool = function(mana) {
                var result = [];

                for(var i = 1; i < 5; i++) {
                    if(mana[i] > 0) {
                        result.push({
                            type     : i,
                            quantity : mana[i]
                        });
                    }
                }
                return result;
            }

            //Return true if card's requirment are meet
            $scope.isPlayable = function(card) {
                var cardRequire,
                    ln = card.req.length;

                if(ln > 0) {
                    for(var i = 0; i < ln; i++) {
                        cardRequire = card.req[i];
                        if ($scope.player.mana[cardRequire.color] < cardRequire.lvl) {
                            return false;
                        }
                    }
                }
                return true;
            }

            //Set Player Hand From Ctrl Hand
            $scope.setPlayerHand = function(hand) {
                $scope.playerHand = hand;
            }

            //Set Selected Buff Card From Ctrl Hand
            $scope.setSelectedBuff = function(cardId) {
                $scope.selectedBuff = cardId;
            };

            $scope.gameId   = $stateParams.gameId;
            $scope.playerId   = null;
            $scope.opponentId = null;

            $scope.player   = null;
            $scope.opponent = null;

            $scope.turn  = null;
            $scope.phase = 0;

            $scope.playerHand   = [];
            $scope.woodenDeck   = 0;

            $scope.manaPool   = [];
            $scope.manaPoolOp = [];

            $scope.selectedBuff = null;

            $scope.modalInstanceOpponentLeft = null;
            $scope.modalInstanceGameOver     = null;

            Socket.emit('game:info', {gameId : $scope.gameId});

            //On drop (Board)
            $scope.dropAction = function(cardId, cellId) {
                Socket.emit('game:phase2', {
                    'cellId' : cellId,
                    'cardId' : cardId,
                    'buffId' : $scope.selectedBuff
                });
                $scope.selectedBuff = null;
            }

            //Popin Game Over
            Socket.on('game:win', function (data) {
                $scope.showGameOverModal('gameOverWin', data.gift);
            });
            Socket.on('game:lose', function () {
                $scope.showGameOverModal('gameOverLose', null);
            });
            $scope.showGameOverModal = function(modalName, cardId) {
                $scope.modalInstanceGameOver = $modal.open({
                    templateUrl : 'modal/' + modalName,
                    controller  : modalInstanceGameOver,
                    resolve: {
                        cardId : function() {
                            return cardId;
                        }
                    }
                });

                $scope.modalInstanceGameOver.result.then(function() {
                }, function () {
                    $scope.modalInstanceGameOver = null;
                    $scope.quitGame();
                });
            }

            //Popin Opponent Left
            Socket.on('game:opponentleft', function () {
                //GameOver modal not shown
                if($scope.modalInstanceGameOver === null) {
                    $scope.modalInstanceOpponentLeft = $modal.open({
                        templateUrl : 'modal/opponentleft',
                        controller  : modalInstanceOpponentLeft
                    });

                    $scope.modalInstanceOpponentLeft.result.then(function() {
                    }, function () {
                        $scope.modalInstanceOpponentLeft = null;
                        $scope.quitGame();
                    });
                }
            });

            //Quit Game
            $scope.quitGame = function() {
                Socket.emit('game:quit');
                $location.path('/play/');
            }

            //Destroy
            $scope.$on('$destroy', function () {
                Socket.removeAllListeners('game:win');
                Socket.removeAllListeners('game:lose');
                Socket.removeAllListeners('game:opponentleft');
                Socket.removeAllListeners('game:info');
            });


        }])
    .filter('range', function(){
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
                input.push(i);
            return input;
        };
    });

var modalInstanceOpponentLeft = function ($scope, $modalInstance) {
    $scope.quit = function () {
        $modalInstance.dismiss();
    };
};

var modalInstanceGameOver = function ($scope, $modalInstance, cardId) {
    $scope.cardId = cardId;

    $scope.quit = function () {
        $modalInstance.dismiss();
    };
};