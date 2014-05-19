'use strict';

angular.module('vikings')
    .factory('Users', ['Auth', 'Socket', function(Auth, Socket) {
        var currentUsers = [];
        var observerCallbacks = [];

        Socket.on('users:list', function (data) {
            console.log('users:list', data.users);
            for(var i = 0; i < data.users.length; i++) {
                if(Auth.user.id != data.users[i].id) {
                    currentUsers.push(data.users[i]);
                }
            }
            notifyObservers();
        });
        Socket.on('users:add', function (data) {
            console.log('users:add', data.user);
            currentUsers.push(data.user);
            notifyObservers();
        });
        Socket.on('users:remove', function (data) {
            console.log('users:remove', data.user);
            for(var i = 0; i < currentUsers.length; i++) {
                if(currentUsers[i].id == data.user.id) {
                    currentUsers.splice(i, 1);
                    break;
                }
            }
            notifyObservers();
        });

        function notifyObservers(){
            angular.forEach(observerCallbacks, function(callback){
                callback();
            });
        }

        return {
            getUser: function(id) {
                var user = null;
                if(id !== null) {
                    for(var i = 0; i < currentUsers.length; i++) {
                        if(currentUsers[i].id == id) {
                            user = currentUsers[i];
                            break;
                        }
                    }
                }
                return user;
            },

            getAllUsers: function() {
                return currentUsers;
            },

            registerObserverCallback : function(callback){
                observerCallbacks.push(callback);
            }
        }
    }]);
