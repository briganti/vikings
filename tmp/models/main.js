/**
 * Module dependencies.
 */
var player   = require('./player.js');
var game     = require('./game.js');
var utility  = require('./utility.js');
var uuid = require('node-uuid');

/**
 * Constructor
 */
var main = {
    name    : 'lobby',
    players : [],
    games   : []
};

/* Create a player ******************************************************************************/
main.setPlayer = function(id, name) {
    console.log('set player '+name);
    var p = new player(id, name);
    this.players.push(p);
};

/* Get a player *********************************************************************************/
main.getPlayer = function(id) {
    //For all stored player
    for(var i = 0; i < this.players.length; i++){
        //found
		if(this.players[i].id == id){
			return this.players[i];
		}
	}
    return false;
};
/* remove a player ******************************************************************************/
main.removePlayer = function(id) {
    console.log('WHATWHATWHATWHATWHATWHATWHAT');
    //For all stored players
    for(var i = 0; i < this.players.length; i++){
        //found
        if(this.players[i].id == id){
            this.players.remove(i);
        }
    }
};

/* Get public player list ***********************************************************************/
main.getPublicPlayerList = function() {
    var p, result = [];
    //For all stored players
    for(var i = 0; i < this.players.length; i++){
        p = this.players[i];
        //found
        if(p && (p.isAvailable()) || p.isPlaying()) {
            result.push(p.getPublicProfile());
        }
    }
    return result;
};

/* Create a new game ****************************************************************************/
main.setGame = function(name) {
    var g = new game(uuid.v1(), name);
    this.games.push(g);

    return g;
};

/* Remove game from list ************************************************************************/
main.removeGame = function(id) {
    //For all stored games
    for(var i = 0; i < this.games.length; i++){
        //found
        if(this.games[i].id == id){
            this.games.remove(i);
        }
    }
};

/* Get game by id *******************************************************************************/
main.getGame = function(gameId) {
    //For all stored games
    for(var i = 0; i < this.games.length; i++){
        //found
        if(this.games[i].id == gameId){
            return this.games[i];
        }
    }
    return false;
};

/* Get public game list *************************************************************************/
main.getPublicGamelist = function() {
    var list = [];
    for(var i = 0; i < this.games.length; i++){
        if(this.games[i].status != 'over') {
            list.push({
                id    : this.games[i].id,
                name  : this.games[i].name,
                p1    : this.games[i].player[0].id,
                p2    : this.games[i].player[1].id,
                state : this.games[i].status
            });
        }
    }
    return list;
};

module.exports = main;