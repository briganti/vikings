'use strict';

angular.module('vikings')
    .factory('Auth', function($http, $cookieStore){

        var accessLevels = routingConfig.accessLevels,
            userRoles    = routingConfig.userRoles,
            currentUser  = $cookieStore.get('user') || { id : '', name: '', role: userRoles.public},
            currentDeck  = [null,null,null,null,null,null,null,null,null];

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

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
            register: function(user, success, error) {
                $http.post('/register', user).success(function(res) {
                    changeUser(res);
                    success();
                }).error(error);
            },
            login: function(user, success, error) {
                $http.post('/login', user).success(function(user){
                    changeUser(user);
                    success(user);
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
            accessLevels: accessLevels,
            userRoles: userRoles,
            user: currentUser,
            deck: currentDeck
        };
    });