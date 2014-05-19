angular.module('vikings').directive("drag", ["$rootScope", function ($rootScope) {

    function dragStart(evt, element, dragStyle) {
        element.addClass(dragStyle);
        if(evt.originalEvent) {
            evt = evt.originalEvent;
        }
        evt.dataTransfer.setData("id", evt.target.id);
        evt.dataTransfer.effectAllowed = 'move';
    };

    function dragEnd(evt, element, dragStyle) {
        element.removeClass(dragStyle);
    };

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.dragStyle = attrs["dragstyle"];
            element.bind('dragstart', function (evt) {
                $rootScope.draggedElement = parseInt(scope.cardid);
                dragStart(evt, element, scope.dragStyle);
            });
            element.bind('dragend', function (evt) {
                evt.preventDefault();
                dragEnd(evt, element, scope.dragStyle);
            });
        },
        scope: {
            cardid:'@'
        }
    }
}]);

angular.module('vikings').directive("drop", ['$rootScope', function ($rootScope) {

    function dragEnter(evt, element, dropStyle) {
        evt.preventDefault();
        if($rootScope.draggedElement !== null) {
            element.addClass(dropStyle);
        }
    };

    function dragLeave(evt, element, dropStyle) {
        element.removeClass(dropStyle);
    };

    function dragOver(evt) {
        evt.preventDefault();
    };

    function doDrop(evt, scope, element, attrs) {
        evt.preventDefault();
        element.removeClass(scope.dropStyle);

        if(attrs.dropAllowed) {
            scope.dropAllowed = JSON.parse(attrs.dropAllowed);
            if( scope.dropAllowed.indexOf($rootScope.draggedElement) != -1) {
                scope.onDrop({cardId : $rootScope.draggedElement, cellId : attrs["drop"]});
                $rootScope.draggedElement = null;
            }
        } else {
            scope.onDrop({cardId : $rootScope.draggedElement, cellId : attrs["drop"]});
            $rootScope.draggedElement = null;
        }
    };

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.dropStyle   = "dropping";

            if(attrs.dropAllowed) {
                scope.dropAllowed = JSON.parse(attrs.dropAllowed);
            } else {
                scope.dropAllowed = 'any';
            }

            element.bind('dragenter', function (evt) { dragEnter(evt, element, scope.dropStyle); });
            element.bind('dragleave', function (evt) { dragLeave(evt, element, scope.dropStyle); });
            element.bind('dragover',  dragOver);
            element.bind('drop',      function (evt) { doDrop(evt, scope, element, attrs); });
        },
        scope: {
            drop: '@',
            onDrop: '&'
        }
    }
}]);


angular.module('vikings')
    .directive("resetdrag", ["$rootScope", function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (evt) {
                    $rootScope.draggedElement = null;
                    $rootScope.$broadcast('resetdragEvent', scope.cardid);
                });
            },
            scope: {
                cardid:'@'
            }
        }
    }]);