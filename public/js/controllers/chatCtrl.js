'use strict';

angular.module('vikings')
    .controller('ChatCtrl',
        ['$rootScope', '$scope', 'Users', 'Auth', 'Socket', function($rootScope, $scope, Users, Auth, Socket) {

            Socket.on('chat:sendMessage', function (message) {
                message.time = new Date().getTime();
                $scope.messages.push(message);
            });

            $scope.name     = Auth.user.name;
            $scope.messages = [];

            //send a Message
            $scope.sendMessage = function () {
                Socket.emit('chat:sendMessage', {
                    message: $scope.message
                });

                // add the message to our model locally
                $scope.messages.push({
                    user: $scope.name,
                    text: $scope.message,
                    time: new Date().getTime()
                });

                // clear message box
                $scope.message = '';
            };

        }]);