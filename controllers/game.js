/**
 * Module dependencies.
 */
const main = require('../models/main.js')

const gameController = {}

/* Create a new game ****************************************************************************/
gameController.createGame = (socket, session, data) => {
  const p = main.getPlayer(session.user.id)

  // Player is not in play
  if (p && p.isAvailable()) {
    // Create a new game
    const g = main.setGame(data.name)
    // Add player to game
    g.setPlayer(p.id, p.name, p.deck, p.socketID)
    p.setPlaying(g.id)

    // quit main chat and join game chat
    socket
      .leave(main.name)
      .join(g.id)

    // Update game list for other players
    socket.broadcast.to(main.name).emit('lobby:gamelist', { gamelist: main.getPublicGamelist() })
    // Send Player Connection Succed + Player list + table list
    socket.emit('waitingGame')
  }
}

/* Game - User join game ************************************************************************/
gameController.joinGame = (io, socket, session, data) => {
  const g = main.getGame(data.gameId)

  if (g.isAvailable()) {
    // Get player
    const p = main.getPlayer(session.user.id)
    g.setPlayer(p.id, p.name, p.deck, p.socketID)
    p.setPlaying(g.id)
    g.setPlaying()

    socket
      .leave(main.name)
      .join(g.id)

    // Update game list for other players
    socket.broadcast.to(main.name).emit('lobby:gamelist', { gamelist: main.getPublicGamelist() })

    // Start Game for players
    io.to(g.player[0].socketID).emit('game:start', { gameId: g.id })
    io.to(g.player[1].socketID).emit('game:start', { gameId: g.id })
  }
}

/* Game - Get game information ******************************************************************/
gameController.getGameInfo = (socket, session, data) => {
  const g = main.getGame(data.gameId)

  if (g.isPlaying()) {
    // Get player
    const p = main.getPlayer(session.user.id)
    socket.emit('game:info', { game: g.exportGame(g.getPlayer(p.id)) })
  }
}

/* Game - User quit game ************************************************************************/
gameController.quitGame = (socket, session) => {
  const p = main.getPlayer(session.user.id)

  if (p && p.isPlaying()) {
    // get game
    const g = main.getGame(p.gameID)

    // re-init player
    p.setAvailable()

    socket.leave(g.id)
    socket.join(main.name)

    // Remove Player from Game
    g.removePlayer(p.id)

    // destroy if game is empty
    if (g.isOver()) {
      main.removeGame(g.id)
    } else {
      socket.broadcast.to(g.id).emit('game:opponentleft')
    }

    // Update game list
    socket.broadcast.to(main.name).emit('lobby:gamelist', { gamelist: main.getPublicGamelist() })
  }
}

/* Game - Phase 0 *******************************************************************************/
gameController.phase0Game = (io, socket, session, data) => {
  // get player & game
  const p = main.getPlayer(session.user.id)
  const g = main.getGame(p.gameID)

  g.setPhase0(p.id, data)

  // Update Game for Player 1
  io.to(g.player[0].socketID).emit('game:info', { game: g.exportGame(0) })
  // Update Game for Player 2
  io.to(g.player[1].socketID).emit('game:info', { game: g.exportGame(1) })
}

/* Game - Phase 1 *******************************************************************************/
gameController.phase1Game = (io, socket, session, data) => {
  // get player & game
  const p = main.getPlayer(session.user.id)
  const g = main.getGame(p.gameID)

  g.setPhase1(p.id, data)

  // Update Game for Player 1
  io.to(g.player[0].socketID).emit('game:info', { game: g.exportGame(0) })
  // Update Game for Player 2
  io.to(g.player[1].socketID).emit('game:info', { game: g.exportGame(1) })
}


/* Game - Phase 2 *******************************************************************************/
gameController.phase2Game = (io, socket, session, data) => {
  // get player & game
  const p = main.getPlayer(session.user.id)
  const g = main.getGame(p.gameID)

  g.setPhase2(p.id, data)

  // Update Game for Player 1
  io.to(g.player[0].socketID).emit('game:info', { game: g.exportGame(0) })
  // Update Game for Player 2
  io.to(g.player[1].socketID).emit('game:info', { game: g.exportGame(1) })

  // Game over
  if (g.isGameOver()) {
    const gameWinner = g.getWinner()
    const gameLoser  = (gameWinner + 1) % 2

    const winnerCard = main.getPlayer(g.player[gameWinner].id).getAPrice()

    io.to(g.player[gameWinner].socketID).emit('game:win', { gift: winnerCard })
    io.to(g.player[gameLoser].socketID).emit('game:lose')
  }
}

module.exports = gameController
