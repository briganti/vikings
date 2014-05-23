'use strict';

angular.module('vikings')
    .directive('carditem', ['$animate', '$compile', '$timeout', function ($animate, $compile, $timeout) {
        var tplVoid       = '';

        var tplCard       = '<img src="/img/cards/{{content.id}}.png" cardid="{{content.id}}" />';
        var tplCardBack   = '<img src="/img/cards/back.png" />';
        var tplSpark      = '<span class="spark"></span>';

        var tplBtnView    = '<div class="btn-view" ng-click="onView({cardId : content.id})"></div>';
        var tplBtnCast    = '<div class="btn-cast" ng-click="onCast({cardId : content.id})" ></div>';
        var tplBtnBuff    = '<div class="btn-buff" ng-click="onBuff({cardId : content.id})" ></div>';

        var tplBoardStart = '<div class="p{{content.owner}} {{content.classes}}" >';
        var tplBoardCard  = '<img class="front" src="/img/cards/ico/{{content.card.id}}.png" /><img class="back" src="/img/cards/ico/{{content.card.id}}.png" />';
        var tplSmoke      = '<span class="smoke"></span>';
        var tplBoardEnd   = '</div>';

        var tplBtnRemove  = '<span resetdrag cardid="{{content.id}}">x</span>';

        var getTemplate = function(templateType, content) {
            var template = [tplVoid];

            switch(templateType) {
                case 'boardCard':
                    if(content !== null) {
                        template = [tplBoardStart, tplBoardCard];
                        if(content.status == 'hidden') {
                            template.push(tplSmoke, tplSmoke, tplSmoke, tplSmoke, tplSmoke);
                        }
                        template.push(tplBoardEnd);
                    }
                    break;
                case 'playerCard':
                    if(content ) {
                        template = [tplCard, tplBtnView];
                        if(content.cast === true) {
                            template.push(tplBtnCast);
                        }
                        if(content.buff === true) {
                            template.push(tplBtnBuff, tplSpark);
                        }
                    }
                    break;
                case 'opponentCard':
                    if(content === null) {
                        template = [tplCardBack];
                    } else {
                        template = [tplCard];
                    }
                    break;
                case 'libraryCard':
                    if(content && content.drag === false) {
                        template = [tplCard];
                    } else if(content) {
                        template = [tplCard];
                    }
                    break;
                case 'deckCard':
                    if(content !== null) {
                        template = [tplCard, tplBtnRemove];
                    }
                    break;
            }
            return template.join('');
        }

        return {
            restrict: "A",
            link: function(scope, element) {
                scope.$watch('content', function(content) {
                    element.html(getTemplate(scope.template, content));

                    if(content) {
                        if(content.drag) {
                            element.find('img').attr('drag', '');
                            element.find('img').attr("draggable", "true");
                        }else {
                            element.find('img').attr("draggable", "false");
                        }

                        //Animations
                        if(content.flip) {
                            $timeout(function(){$animate.addClass( element.find('div'), 'flipped')});
                        }
                        if(content.buff) {
                            $timeout(function(){$animate.addClass( element.find('div'), content.buff)});
                        }

                    }
                    $compile(element.contents())(scope);
                }, true);
            },
            scope: {
                content      : '=',
                template     : '@',
                onCast       : '&',
                onBuff       : '&',
                onView       : '&'
            }
        };
    }]);