/* Module dependencies **************************************************************************/
var cards   = require('./cards.js');


function ai(id, name){
	this.id             = id;
    this.socketID       = null;
	this.name           = name;
    this.type           = 'ai';
	this.gameID         = -1;
	this.status         = "available";
    this.room           = "available";
	this.librairy       = cards.getMyStarterDeck();
    this.deck           = this.librairy.slice(0);
	this.cardInStraight = [];
};


ai.prototype.getPublicProfile = function(){
    var ai = {
        id     : this.id,
        name   : this.name,
        status : this.status
    };

	return ai;
};

/**
 * Available
 **/
ai.prototype.setAvailable = function(){
    this.gameID = "";
	this.status = "available";
};
ai.prototype.isAvailable = function(){
	return this.status === "available";
};

/**
 *  Playing
 **/
ai.prototype.setPlaying = function(gId){
    this.gameID = gId;
	this.status = "playing";
};
ai.prototype.isPlaying = function(){
	return this.status === "playing";
};

/**
 * Disconnected
 **/
ai.prototype.setDisconnected = function(){
	this.status   = "disconnected";
    this.socketID = null;
};
ai.prototype.isDisconnected = function(){
	return this.status === "disconnected";
};

/**
 * Left
 */
ai.prototype.setLeft = function(){
    this.status = "left"
}

/**
 * Get a random card as a price
 */
ai.prototype.getAPrice = function(){
    var gift = cards.getARandomCard(this.librairy);
    if(gift) {
        this.librairy.push(gift);
    }
    return gift;
}

module.exports = ai;