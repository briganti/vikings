/* Module dependencies **************************************************************************/
var cards   = require('./cards.js');


function player(id, name){
	this.id             = id;
    this.socketID       = null;
    this.timeOutId      = null;
	this.name           = name;
    this.type           = 'guest';
	this.gameID         = -1;
	this.status         = "disconnected";
    this.room           = "available";
	this.librairy       = cards.getMyStarterDeck();
    this.deck           = this.librairy;//[null,null,null,null,null,null,null,null,null];
	this.cardInStraight = [];
};


player.prototype.getPublicProfile = function(){
    var player = {
        id     : this.id,
        name   : this.name,
        status : this.status
    };

	return player;
};

/**
 * Available
 **/
player.prototype.setAvailable = function(){
    this.gameID = "";
	this.status = "available";
};
player.prototype.isAvailable = function(){
	return this.status === "available";
};

/**
 *  Playing
 **/
player.prototype.setPlaying = function(gId){
    this.gameID = gId;
	this.status = "playing";
};
player.prototype.isPlaying = function(){
	return this.status === "playing";
};

/**
 * Disconnected
 **/
player.prototype.setDisconnected = function(){
	this.status   = "disconnected";
    this.socketID = null;
};
player.prototype.isDisconnected = function(){
	return this.status === "disconnected";
};

/**
 * Left
 */
player.prototype.setLeft = function(){
    this.status = "left"
}

module.exports = player;