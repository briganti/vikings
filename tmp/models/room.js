Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function room(name){
	this.players = [];
	this.games = [];
	this.name = name;
};

room.prototype.addPlayer = function(playerID) {
	this.players.push(playerID);
};

room.prototype.removePlayer = function(playerID) {
	for(var i = 0; i < this.players.length; i++){
		if(this.players[i].id == playerID){
			this.players.remove(i);
			break;
		}
	} 
};

room.prototype.getPlayer = function(id) {
  for(var i = 0; i < this.players.length; i++){
		if(this.players[i].id == id){
			return this.players[i]
		}
	}
  return false;
};

room.prototype.addGame = function(game) {
	this.games.push(game);
};

room.prototype.removeGame = function(game) {
	var gameIndex = -1;
	for(var i = 0; i < this.games.length; i++){
		if(this.games[i].id == game.id){
			gameIndex = i;
			break;
		}
	}
  if(gameIndex>=0)
    this.games.remove(gameIndex);   
};

/*room.prototype.getPlayer = function(socketID) {
	var player = null;
	for(var i = 0; i < this.players.length; i++){
		if(this.players[i].socketID == socketID){
			player = this.players[i];
			break;
		}
	}
	return player;
};*/

room.prototype.getGamelist = function() {
  var list = [];
	for(var i = 0; i < this.games.length; i++){
    if(this.games[i].status !='over')
      list.push({id : this.games[i].id,
                name : this.games[i].name,
                p1 : this.games[i].player1,
                p2 : this.games[i].player2,
                state : this.games[i].state});
  }
  return list;
};

room.prototype.getGame = function(gameId) {
	var game = null;
	for(var i = 0; i < this.games.length; i++){
		if(this.games[i].id == gameId){
			game = this.games[i];
			break;
		}
	}
	return game;
};

/*room.prototype.getTableMessage = function() {
	var tableMessageList = [];
	for (var i = 0; i < this.tables.length; i++) {
		tableMessageList.push(this.tables[i].createMessageObject());
	};
	return tableMessageList;
};*/

module.exports = room;