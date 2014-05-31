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

    function canDrop(scope) {
        var canIDrop = false;

        if(scope.dropMandatory !== false) {
            if( scope.dropMandatory.indexOf($rootScope.draggedElement) != -1) {
                canIDrop = true;
            }
        } else {
            canIDrop = true;
        }
        return canIDrop;
    };

    function dragEnter(evt, scope, element) {
        evt.preventDefault();
        if(canDrop(scope)) {
            element.addClass(scope.dropStyle);
        }
    };

    function dragLeave(evt, scope, element) {
        element.removeClass(scope.dropStyle);
    };

    function dragOver(evt) {
        evt.preventDefault();
    };

    function doDrop(evt, scope, element) {
        evt.preventDefault();
        element.removeClass(scope.dropStyle);

        if(canDrop(scope)) {
            scope.onDrop({cardId : $rootScope.draggedElement, cellId : scope.drop});
            $rootScope.draggedElement = null;
        }
    };

    return {
        restrict: 'A',
        link: function (scope, element) {
            scope.dropStyle     = "dropping";
            scope.dropMandatory = false;

            element.bind('dragenter', function (evt) { dragEnter(evt, scope, element); });
            element.bind('dragleave', function (evt) { dragLeave(evt, scope, element); });
            element.bind('dragover',  dragOver);
            element.bind('drop',      function (evt) { doDrop(evt, scope, element); });

            scope.$watch('dropAllowed', function(dropAllowed) {
                if(dropAllowed) {
                    scope.dropMandatory = JSON.parse(dropAllowed);
                } else {
                    scope.dropMandatory = false;
                }
            });
        },
        scope: {
            drop        : '@',
            dropAllowed : '@',
            onDrop      : '&'
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