/*Game = require('./game.js');
Table = require('./table.js');*/
/*var uuid = require('node-uuid');*/

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var utility = {};

utility.generateId = function(){
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

/**utility.prototype.sendEventToAllPlayers = function(event,message,socket) {
	socket.emit(event, message);
};

utility.prototype.sendEventToAllPlayersButPlayer = function(event,message,socket) {
	socket.broadcast.emit(event, message);
};**/

/*utility.prototype.sendEventToSpecificPlayer = function(event,message,io,player) {
	io.sockets.socket(player.id).emit(event,message);
};

utility.prototype.sendEventToTable = function(event,message,io,table) {
	for(var i = 0; i < table.players.length; i++){
		io.sockets.socket(table.players[i].id).emit(event, message);
	}	
};

utility.prototype.sendEventToTableInPlay = function(event,message,io,table) {
	for (var i = 0; i < table.players.length; i++) {
		message.userId = table.players[i].id;
		message.userCard = table.players[i].card;
		message.userCardInStraight = table.players[i].cardInStraight;
		io.sockets.socket(table.players[i].id).emit(event, message);
	};
};*/

utility.sendEventToAllFreePlayers = function(event,message,io,players) {
	for(var i = 0; i < players.length; i++){
		if(players[i].status === "available"){
			io.sockets.socket(players[i].id).emit(event, message);
		}
	}
};

/*utility.prototype.sendEventToAllFreePlayersButPlayer = function(event,message,io,players,player) {
	for(var i = 0; i < players.length; i++){
		if(players[i].status === "available" && players[i].id != player.id){
			io.sockets.socket(players[i].id).emit(event, message);
		}
	}
};

utility.prototype.sendEventToSelectedPlayers = function(event,message,io,players) {
	for(var i = 0; i < players.length; i++){
		io.sockets.socket(players[i].id).emit(event, message);
	}
};

utility.prototype.createSampleTables = function(tableListSize) {
	var tableList = [];
	for(var i = 0; i < tableListSize; i++){
		var game = new Game();
		var table = new Table(uuid.v4());
		table.setName("jstanbul Room " + (i + 1));
		table.gameObj = game;
		table.state = "available";
		tableList.push(table);
	}
	return tableList;
};*/

module.exports = utility;