/**
 * Module dependencies.
 */
var main  = require('../models/main.js');
var cards = require('../models/cards.js');

var mainController = {};

/* User connect to server ***********************************************************************/
mainController.connect = function(socket, session) {
    //Get player
    var p1 = main.getPlayer(session.user.id);

    //Player not already logged
    if(p1.socketID == null) {
        //update socket id
        p1.socketID = socket.id;

        //Join main room
        socket.join(main.name);

        //User's connection lags (less than 3s)
        if(p1.isDisconnected()) {
            clearTimeout(p1.timeOutId);
        //User has reconnect
        } else {
            //socket.broadcast.to(main.name).emit('newUserOnline', {message:"Player is online", user:p1.getPublicProfile()});
            socket.broadcast.to(main.name).emit('users:add', {user:p1.getPublicProfile()});
        }

        //Player is now avalaible
        p1.setAvailable();

        //Send Player Connection Succed + Player list
        //socket.emit('welcome', {message:"Connection Succed", users: main.getPublicPlayerList()});
        socket.emit('users:list', {users: main.getPublicPlayerList()});
    } else {
        //Send player he disconnected (eg: open another tab)
        socket.emit('alreadylogged', {});
    }
}

/* User disconnect from server ******************************************************************/
mainController.disconnect = function(socket, session) {
    //Check player status whether she is in table or game
    var p1 = main.getPlayer(session.user.id);

    if(p1 && p1.socketID == socket.id) {
        //set Disconnect rules
        socket.leave(main.name);
        p1.setDisconnected();

        p1.timeOutId = setTimeout(function() {
            (function(socket, session, p1) {
                if(p1.isPlaying()){
                    var g = main.getGame(p1.gameID);

                    //re-init player
                    p1.setAvailable();
                    socket.leave(g.id);

                    //Remove Player from Game & destroy if game is empty
                    if(g.removePlayer(p1.id)){
                        main.removeGame(g.id);
                        socket.broadcast.to(main.name).emit('updateGameList', {games: main.getPublicGamelist()});
                    }
                }

                //guest => destroy session
                if(p1.type == 'guest') {
                    main.removePlayer(p1.id);
                    session.destroy();
                } else {
                    p1.setLeft();
                }
                socket.broadcast.to(main.name).emit('users:remove', {message:"A player is offline", user:p1.getPublicProfile()});
            })(socket, session, p1);
        }, 5000);
    }
}

/**
 * Chat : send message
 */
mainController.chatSendMessage = function(socket, session, data) {
    var p1 = main.getPlayer(session.user.id);
    if(p1) {
        //Send Message to the Available Players
        if(p1.isAvailable()){
            socket.broadcast.to(main.name).emit('chat:sendMessage',{user:p1.name, text:data.message});
        //Send Message to the same Table Players
        } else if(p1.isPlaying()){
            socket.broadcast.to(p1.gameID).emit('chat:sendMessage',{user:p1.name, text:data.message});
        }
    }
};

/**
 * Lobby : get gamelist
 */
mainController.lobbyGetGameList = function(socket) {
    socket.emit('lobby:gamelist',{gamelist:main.getPublicGamelist()});
};

/**
 * Profile : get user librairy & deck
 */
mainController.libraryGet = function(socket, session) {
    var p1 = main.getPlayer(session.user.id);
    socket.emit('library:get', { library: cards.getCardsFullInfo(p1.librairy) , deck: cards.getCardsFullInfo(p1.deck)});
};

/**
 * Profile : save user deck
 */
mainController.librarySaveDeck = function(socket, session, data) {
    var p1 = main.getPlayer(session.user.id);
    p1.deck = data.deck;
};

module.exports = mainController;