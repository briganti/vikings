'use strict';

angular.module('vikings')
    .controller('gameCtrl',
        ['$rootScope', '$scope', '$location', '$modal', '$stateParams', 'Socket', function($rootScope, $scope, $location, $modal, $stateParams, Socket) {

            Socket.on('game:info', function (data) {
                $scope.game = data.game;

                $scope.playerId = data.game.playerId;

                $scope.phase    = data.game.phase;
                $scope.updateTurn(data.game.turn);

                $scope.opponentHand = data.game.opponent.hand;

                $scope.woodenDeck   = data.game.woodendeck;
                $scope.playerDeck   = data.game.player.deck;
                $scope.opponentDeck = data.game.opponent.deck;

                $scope.updateManaPool(data.game.player.mana);
            });

            Socket.on('game:win', function (data) {
                $scope.modalInstanceGameOver = $modal.open({
                    templateUrl : 'modal/gameOverWin',
                    controller  : modalInstanceGameOver,
                    resolve: {
                        cardId : function() {
                            return data.gift;
                        }
                    }
                });

                $scope.modalInstanceGameOver.result.then(function() {
                }, function () {
                    $scope.modalInstanceGameOver = null;
                    Socket.emit('game:quit');
                    $location.path('/play/');
                });
            });

            Socket.on('game:lose', function () {
                $scope.modalInstanceGameOver = $modal.open({
                    templateUrl : 'modal/gameOverLose',
                    controller  : modalInstanceGameOver,
                    resolve: {
                        cardId : function() {
                            return null;
                        }
                    }
                });

                $scope.modalInstanceGameOver.result.then(function() {
                }, function () {
                    $scope.modalInstanceGameOver = null;
                    Socket.emit('game:quit');
                    $location.path('/play/');
                });
            });

            //Modal Opponent Left
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
                        Socket.emit('game:quit');
                        $location.path('/play/');
                    });
                }
            });

            //update mana pool
            $scope.updateManaPool = function(mana) {
                var result = []
                for(var i = 1; i < 5; i++) {
                    if(mana[i] > 0) {
                        result.push({
                            type     : i,
                            quantity : mana[i]
                        });
                    }
                }
                $scope.manaPool = result;
            }

            //Init Turn
            $scope.updateTurn = function(turn) {
                $scope.turn = turn;
            };

            //Return true if card's requirment are meet
            $scope.isPlayable = function(card) {
                if(card.req.length > 0) {
                    for(var i = 0; i < card.req.length; i++) {
                        if ($scope.game.player.mana[card.req[i].color] < card.req[i].lvl) {
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
            $scope.game     = null;
            $scope.turn     = null;
            $scope.playerId = null;

            $scope.phase = 0;

            $scope.playerHand   = [];
            $scope.opponentHand = [];

            $scope.woodenDeck   = 0;
            $scope.playerDeck   = 0;
            $scope.opponentDeck = 0;

            $scope.manaPool = [];

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

            //Quit Game
            $scope.quitGame = function() {
                Socket.emit('game:quit');
                $location.path('/play/');
            }
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