const Player = require('./player.js')
const Game   = require('./game.js')
const uuid   = require('node-uuid')

class Main {

  constructor() {
    this.name = 'lobby'
    this.players = []
    this.games = []
  }

  /* Create a player **************************************************************************/
  setPlayer(id, name) {
    const p = new Player(id, name)
    this.players.push(p)
  }

  /* Get a player *****************************************************************************/
  getPlayer(id) {
    // For all stored player
    for (let i = 0; i < this.players.length; i++) {
      // found
      if (this.players[i].id === id) {
        return this.players[i]
      }
    }
    return false
  }

  /* remove a player **************************************************************************/
  removePlayer(id) {
    // For all stored players
    for (let i = 0; i < this.players.length; i++) {
      // found
      if (this.players[i].id === id) {
        this.players.splice(i, 1)
      }
    }
  }

  /* Get public player list *******************************************************************/
  getPublicPlayerList() {
    const result = []
    // For all stored players
    for (let i = 0; i < this.players.length; i++) {
      const p = this.players[i]
      // found
      if (p && (p.isAvailable()) || p.isPlaying()) {
        result.push(p.getPublicProfile())
      }
    }
    return result
  }

  /* Create a new game ************************************************************************/
  setGame(name) {
    const g = new Game(uuid.v1(), name)
    this.games.push(g)

    return g
  }

  /* Remove game from list ********************************************************************/
  removeGame(id) {
    // For all stored games
    for (let i = 0; i < this.games.length; i++) {
      // found
      if (this.games[i].id === id) {
        this.games.splice(i, 1)
      }
    }
  }

  /* Get game by id ***************************************************************************/
  getGame(gameId) {
    // For all stored games
    for (let i = 0; i < this.games.length; i++) {
      // found
      if (this.games[i].id === gameId) {
        return this.games[i]
      }
    }
    return false
  }

  /* Get public game list *********************************************************************/
  getPublicGamelist() {
    const list = []
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].status !== 'over') {
        list.push({
          id:    this.games[i].id,
          name:  this.games[i].name,
          p1:    this.games[i].player[0].id,
          p2:    this.games[i].player[1].id,
          state: this.games[i].status,
        })
      }
    }
    return list
  }
}

module.exports = new Main()
