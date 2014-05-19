/**
 * Module dependencies.
 */
var main = require('../models/main.js');


var gameController = {};


/* Create a new game ****************************************************************************/
gameController.createGame = function(socket, session, data) {
    console.log('create game');
    var p = main.getPlayer(session.user.id);

    //Player is not in play
    if (p && p.isAvailable()) {

        // Create a new game
        var g = main.setGame(data.name);
        //Add player to game
        g.setPlayer(p.id, p.name, p.deck, p.socketID);
        p.setPlaying(g.id);

        //quit main chat and join game chat
        socket.leave(main.name)
            .join(g.id);

        //Update game list for other players
        socket.broadcast.to(main.name).emit('lobby:gamelist',{gamelist:main.getPublicGamelist()});
        //Send Player Connection Succed + Player list + table list
        socket.emit('waitingGame');
    }
};


/* Game - User join game ************************************************************************/
gameController.joinGame = function(io, socket, session, data) {
    var g = main.getGame(data.gameId);

    if(g.isAvailable()) {
        //Get player
        var p = main.getPlayer(session.user.id);
        g.setPlayer(p.id, p.name, p.deck, p.socketID);
        p.setPlaying(g.id);
        g.setPlaying();

        socket.leave(main.name)
            .join(g.id);

        //Update game list for other players
        socket.broadcast.to(main.name).emit('lobby:gamelist',{gamelist:main.getPublicGamelist()});

        //Start Game for players
        console.log(g.player[0].name, g.player[1].name);
        io.sockets.socket(g.player[0].socketID).emit('game:start',{gameId:g.id});
        io.sockets.socket(g.player[1].socketID).emit('game:start',{gameId:g.id});


        //io.sockets.socket(g.player[0].socketID).emit('game:start',{game:g.exportGame(0)});
        //Start Game for P2
        //io.sockets.socket(g.player[1].socketID).emit('game:start',{game:g.exportGame(1)});
    }
};


/* Game - Get game information ************************************************************************/
gameController.getGameInfo = function(socket, session, data) {
    var g = main.getGame(data.gameId);

    if(g.isPlaying()) {
        //Get player
        var p = main.getPlayer(session.user.id);
        socket.emit('game:info',{game:g.exportGame(g.getPlayer(p.id))});
    }
};

/* Game - User quit game ************************************************************************/
gameController.quitGame = function(socket, session) {
    var p = main.getPlayer(session.user.id);

    if(p && p.isPlaying()){
        //get game
        var g = main.getGame(p.gameID);

        //re-init player
        p.setAvailable();

        socket.leave(g.id);
        socket.join(main.name);

        //Remove Player from Game & destroy if game is empty
        if(g.removePlayer(p.id)) {
            main.removeGame(g.id);
        } else {
            console.log('opponent has left');
            socket.broadcast.to(g.id).emit('game:opponentleft');
        }

        //Update game list
        socket.broadcast.to(main.name).emit('lobby:gamelist',{games:main.getPublicGamelist()});
    }
};


/* Game - Phase 0 *******************************************************************************/
gameController.phase0Game = function(io, socket, session, data) {
    //get player & game
    var p = main.getPlayer(session.user.id);
    var g = main.getGame(p.gameID);

    g.setPhase0(p.id, data);

    //Update Game for Player 1
    io.sockets.socket(g.player[0].socketID).emit('game:info',{game:g.exportGame(0)})
    //Update Game for Player 2
    io.sockets.socket(g.player[1].socketID).emit('game:info',{game:g.exportGame(1)});
};


/* Game - Phase 1 *******************************************************************************/
gameController.phase1Game = function(io, socket, session, data) {
    console.log('gamePhase1');
    //get player & game
    var p = main.getPlayer(session.user.id);
    var g = main.getGame(p.gameID);

    g.setPhase1(p.id, data);

    //Update Game for Player 1
    io.sockets.socket(g.player[0].socketID).emit('game:info',{game:g.exportGame(0)});
    //Update Game for Player 2
    io.sockets.socket(g.player[1].socketID).emit('game:info',{game:g.exportGame(1)});
};


/* Game - Phase 2 *******************************************************************************/
gameController.phase2Game = function(io, socket, session, data) {
    //get player & game
    var p = main.getPlayer(session.user.id);
    var g = main.getGame(p.gameID);

    g.setPhase2(p.id, data);

    //Update Game for Player 1
    io.sockets.socket(g.player[0].socketID).emit('game:info',{game:g.exportGame(0)});
    //Update Game for Player 2
    io.sockets.socket(g.player[1].socketID).emit('game:info',{game:g.exportGame(1)});
};


module.exports = gameController;