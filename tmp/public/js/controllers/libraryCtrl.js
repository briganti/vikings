/* Library controller */
angular.module('vikings')
    .controller('LibraryCtrl',
        ['$rootScope', '$scope', '$location', 'Auth', 'Socket', function($rootScope, $scope, $location, Auth, Socket) {

            //Getting libraray & deck card from server
            Socket.on('library:get', function (data) {
                $scope.libraryCards = data.library;
                $scope.deckCards    = data.deck;
                //For all cards in library
                for(var i = 0; i < $scope.libraryCards.length; i++) {
                    //activate drag if nor selected in deck
                    if(!$scope.isCardInDeck($scope.libraryCards[i].id)) {
                        $scope.libraryCards[i].drag = true;
                    }
                }
            });

            $scope.getCardById = function (id) {
                for(var i = 0; i < $scope.libraryCards.length; i++) {
                    if (id == $scope.libraryCards[i].id ) {
                        return $scope.libraryCards[i];
                    }
                }
                return false;
            }

            //Check if Card id is in deck
            $scope.isCardInDeck = function (id) {
                for(var i = 0; i < $scope.deckCards.length; i++) {
                    if ($scope.deckCards[i] !== null && id == $scope.deckCards[i].id ) {
                        return true;
                    }
                }
                return false;
            }

            //Return an array of Card id for saving
            $scope.getDeckSavedFormat = function () {
                var result = [];
                var id = null;
                for(var i = 0; i < $scope.deckCards.length; i++) {
                    if ($scope.deckCards[i] === null) {
                        id = null;
                    } else {
                        id = $scope.deckCards[i].id;
                    }
                    result.push(id);
                }
                return result;
            }


            $scope.saveDeck = function () {
                Socket.emit('library:saveDeck', {
                    deck: $scope.getDeckSavedFormat()
                });
                Auth.deck = $scope.deckCards;
                $location.path('/play/');
            }

            $scope.libraryPage  = 0;
            $scope.deckCards    = Auth.deck;
            $scope.libraryCards = [];

            Socket.emit('library:get');

            //Dropping a library card on a deck case
            $scope.dropAction = function(cardId, cellId) {
                console.log(cardId, cellId);
                var libraryCard = $scope.getCardById(cardId);
                libraryCard.drag = false;
                $scope.deckCards[cellId] = {id : libraryCard.id};
                $scope.$apply();
            }
            $scope.dropHandler = $rootScope.$on('dropEvent', function (evt, dragged, dropped) {
                var libraryCard = $scope.getCardById(dragged);
                libraryCard.drag = false;
                $scope.deckCards[dropped] = {id : libraryCard.id};
                $scope.$apply();
            });

            //Removing a card from deck
            $scope.resetDragHandler = $rootScope.$on('resetdragEvent', function (evt, dragged) {
                $scope.getCardById(dragged).drag = true;
                //For all cards in deck
                for(var i = 0; i < $scope.deckCards.length; i++) {
                    //found => remove card
                    if($scope.deckCards[i] !== null && $scope.deckCards[i].id == dragged) {
                        $scope.deckCards[i] = null;
                    }
                }
                $scope.$apply();
            });

            //Destroy
            $scope.$on('$destroy', function() {
                Socket.removeAllListeners('library:get');
                $scope.dropHandler();
                $scope.resetDragHandler();
            });

        }]);