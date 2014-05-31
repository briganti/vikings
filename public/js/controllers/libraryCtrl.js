/* Library controller */
angular.module('vikings')
    .controller('LibraryCtrl',
        ['$rootScope', '$scope', '$location', 'Auth', 'Socket', function($rootScope, $scope, $location, Auth, Socket) {

            //Get Card by Id in Library
            $scope.getCardById = function (id) {
                var card;

                for(var i = 0, ln = $scope.libraryCards.length; i < ln; i++) {
                    card = $scope.libraryCards[i];
                    if (id == card.id ) {
                        return card;
                    }
                }
                return false;
            }

            //Check if Card id is in deck
            $scope.isCardInDeck = function (id) {
                var card;

                for(var i = 0, ln = $scope.deckCards.length; i < ln; i++) {
                    card = $scope.deckCards[i];
                    if (card !== null && id == card.id ) {
                        return true;
                    }
                }
                return false;
            }

            //Return an array of Card id for saving
            $scope.getDeckSavedFormat = function () {
                var result = [],
                    card,
                    id = null;

                for(var i = 0, ln = $scope.deckCards.length; i < ln; i++) {
                    card = $scope.deckCards[i];
                    if (card === null) {
                        id = null;
                    } else {
                        id = card.id;
                    }
                    result.push(id);
                }
                return result;
            }

            //Save deck
            $scope.saveDeck = function () {
                Socket.emit('library:saveDeck', {
                    deck: $scope.getDeckSavedFormat()
                });
                $location.path('/play/');
            }

            $scope.libraryPage  = 0;
            $scope.deckCards    = Auth.getDeck();
            $scope.libraryCards = Auth.getLibrary();

            //For all cards in library
            for(var i = 0, ln = $scope.libraryCards.length; i < ln; i++) {
                //activate drag if nor selected in deck
                if(!$scope.isCardInDeck($scope.libraryCards[i].id)) {
                    $scope.libraryCards[i].drag = true;
                }
            }

            //Dropping a library card on a deck case
            $scope.dropAction = function(cardId, cellId) {
                var libraryCard = $scope.getCardById(cardId);
                libraryCard.drag = false;
                $scope.deckCards[cellId] = {id : libraryCard.id};
                $scope.$apply();
            }

            //Removing a card from deck
            $scope.resetDragHandler = $rootScope.$on('resetdragEvent', function (evt, dragged) {
                $scope.getCardById(dragged).drag = true;
                //For all cards in deck
                for(var i = 0, ln = $scope.deckCards.length; i < ln; i++) {
                    //found => remove card
                    if($scope.deckCards[i] !== null && $scope.deckCards[i].id == dragged) {
                        $scope.deckCards[i] = null;
                    }
                }
                $scope.$apply();
            });
        }]);