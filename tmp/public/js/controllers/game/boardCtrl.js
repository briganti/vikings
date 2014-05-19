'use strict';

angular.module('vikings')
    .controller('boardCtrl',
        ['$rootScope', '$scope', 'Socket', function($rootScope, $scope, Socket) {

            Socket.on('game:info', function (data) {
                console.log('Socket board');
                $scope.updateBoard(data.game.board);
            });

            //Init board cards
            $scope.updateBoard = function(board) {
                for(var i=0; i< board.length; i++) {
                    //cell is occupied
                    if(board[i]) {
                        var classes = [];
                        //owner has change
                        if($scope.board[i] && $scope.board[i].owner != board[i].owner) {
                            board[i].flip = true;
                        }
                        //Buff
                        if(board[i].status) {
                            if($scope.board[i]) {
                                classes.push(board[i].status);
                            } else {
                                board[i].buff = board[i].status;
                            }
                        }
                        board[i].classes = classes.join(' ');
                    }
                }
                $scope.board = board;
            };

            //Get allowed cards
            $scope.getBoardAllowed = function(cell) {
                var result = [];
                if(cell === null) {
                    for(var i= 0, ln = $scope.playerHand.length; i< ln; i++) {
                        if($scope.isPlayable($scope.playerHand[i]) && $scope.playerHand[i].type == 0) {
                            result.push($scope.playerHand[i].id);
                        }
                    }
                }
                return result;
            }

            $scope.board = [null,null,null,null,null,null,null,null,null];

        }]);
