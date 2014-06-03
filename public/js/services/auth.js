'use strict';

angular.module('vikings')
    .factory('Auth', ['$http', '$cookieStore', 'Socket', function($http, $cookieStore, Socket){

        var accessLevels   = routingConfig.accessLevels,
            userRoles      = routingConfig.userRoles,
            currentUser    = $cookieStore.get('user') || { id : '', name: '', role: userRoles.public},
            currentLibrary = [],
            currentDeck    = [],
            observerCallbacks = {};

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function notifyObservers(){
            angular.forEach(observerCallbacks, function(callback){
                callback();
            });
        }

        Socket.on('library:get', function (data) {
            currentLibrary = data.library;
            currentDeck    = data.deck;
            notifyObservers();
        });

        return {
            authorize: function(accessLevel, role) {
                if(role === undefined) {
                    role = currentUser.role;
                }
                return accessLevel.bitMask & role.bitMask;
            },
            isLoggedIn: function(user) {
                if(user === undefined) {
                    user = currentUser;
                }
                return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
            },
            guest: function(user, success, error) {
                $http.post('/auth/guest', user).success(function(user){
                    changeUser(user);
                    success(user);
                }).error(error);
            },
            login: function(user, success, error) {
                $http.post('/login', user).success(function(user){
                    changeUser(user);
                    success(user);
                }).error(error);
            },
            register: function(user, success, error) {
                $http.post('/auth/register', user).success(function(res) {
                    changeUser(res);
                    success();
                }).error(error);
            },
            logout: function(success, error) {
                $http.post('/logout').success(function(){
                    changeUser({
                        id : '',
                        name: '',
                        role: userRoles.public
                    });
                    success();
                }).error(error);
            },
            registerObserverCallback : function(id, callback){
                observerCallbacks[id] = callback;
            },
            getDeck : function() {
                return currentDeck;
            },
            getLibrary : function() {
                return currentLibrary;
            },
            accessLevels : accessLevels,
            userRoles    : userRoles,
            user         : currentUser
        };
    }]);