const mainModel = require('../../models/main.js')
const gameCtrl  = require('../../controllers/game.js')

// Mock sockets/io
const socket = {}
socket.broadcast = { to: jasmine.createSpy('to').and.returnValue(socket) }
socket.emit = jasmine.createSpy('emit').and.returnValue(socket)
socket.join = jasmine.createSpy('join').and.returnValue(socket)
socket.leave = jasmine.createSpy('leave').and.returnValue(socket)

const io = {}
io.to = jasmine.createSpy('to').and.returnValue(io)
io.emit = jasmine.createSpy('emit').and.returnValue(io)

// Internal game spies
const gameExportGameSpy   = jasmine.createSpy('gameSetPlayerSpy')
const gameGetPlayerSpy    = jasmine.createSpy('gameSetPlayerSpy')
const gameSetPlayerSpy    = jasmine.createSpy('gameSetPlayerSpy')
const gameSetPlayingSpy   = jasmine.createSpy('gameSetPlayingSpy')
const gameRemovePlayerSpy = jasmine.createSpy('gameRemovePlayerSpy')
const gameSetPhase0       = jasmine.createSpy('gameSetPhase0')
const gameSetPhase1       = jasmine.createSpy('gameSetPhase1')
const gameSetPhase2       = jasmine.createSpy('gameSetPhase2')

// Internal player spies
const playerSetAvailableSpy = jasmine.createSpy('playerSetAvailableSpy')
const playerSetPlayingSpy   = jasmine.createSpy('playerSetPlayingSpy')

const session = {
  user: {
    id: 123456,
  },
}

// Mock Main getPlayer
const mockMainGetPlayer = (options = {}) => {
  const { isAvailable, isPlaying } = options

  spyOn(mainModel, 'getPlayer').and.callFake(() => {
    return {
      id:           '123',
      name:         'bob',
      deck:         [1, 2, 3, 4, 5],
      socketID:     12,
      isAvailable:  () => { return isAvailable },
      isPlaying:    () => { return isPlaying },
      setAvailable: (...args) => { playerSetAvailableSpy.apply(null, args) },
      setPlaying:   (...args) => { playerSetPlayingSpy.apply(null, args) },
      getAPrice:    () => { return 'price' },
    }
  })
}

// Mock Main getGame
const mockMainGetGame = (options = {}) => {
  const { isAvailable, isPlaying, isOver, isGameOver } = options

  spyOn(mainModel, 'getGame').and.callFake(() => {
    return {
      id:     'gameId',
      player: [
        { id: '123', socketID: 12 },
        { id: '456', socketID: 13 },
      ],
      isAvailable:  () => { return isAvailable },
      isPlaying:    () => { return isPlaying },
      setPlayer:    (...args) => { gameSetPlayerSpy.apply(null, args) },
      getPlayer:    (...args) => { gameGetPlayerSpy.apply(null, args) },
      setPlaying:   (...args) => { gameSetPlayingSpy.apply(null, args) },
      removePlayer: (...args) => { gameRemovePlayerSpy.apply(null, args) },
      isOver:       () => { return isOver },
      setPhase0:    (...args) => { gameSetPhase0.apply(null, args) },
      setPhase1:    (...args) => { gameSetPhase1.apply(null, args) },
      setPhase2:    (...args) => { gameSetPhase2.apply(null, args) },
      isGameOver:   () => { return isGameOver },
      getWinner:    () => { return 0 },
      exportGame:   (...args) => {
        gameExportGameSpy.apply(null, args)
        return {}
      },
    }
  })
}

describe('gameCtrl', () => {
  afterEach(() => {
    // Reset all spies
    socket.broadcast.to.calls.reset()
    socket.emit.calls.reset()
    socket.join.calls.reset()
    socket.leave.calls.reset()

    io.to.calls.reset()
    io.emit.calls.reset()

    gameGetPlayerSpy.calls.reset()
    gameSetPlayerSpy.calls.reset()
    gameSetPlayingSpy.calls.reset()
    gameExportGameSpy.calls.reset()
    playerSetPlayingSpy.calls.reset()
  })

  /** ***********
   * createGame
   *************/
  describe('createGame', () => {
    beforeEach(() => {
      spyOn(mainModel, 'setGame').and.callFake(() => {
        return {
          id:        'gameId',
          setPlayer: (...args) => { gameSetPlayerSpy.apply(null, args) },
        }
      })
    })

    describe('when player is not available', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isAvailable: false })
        gameCtrl.createGame(socket, session, { name: 'myGame' })
      })

      it('doesn\'t create a game', () => {
        expect(mainModel.setGame).not.toHaveBeenCalled()
      })

      it('doesn\'t add player to the game', () => {
        expect(gameSetPlayerSpy).not.toHaveBeenCalled()
        expect(playerSetPlayingSpy).not.toHaveBeenCalled()
      })

      it('doesn\'t leave main room for game room', () => {
        expect(socket.leave).not.toHaveBeenCalled()
        expect(socket.join).not.toHaveBeenCalled()
      })

      it('doesn\'t update the game list for the main room', () => {
        expect(socket.broadcast.to).not.toHaveBeenCalled()
        expect(socket.emit).not.toHaveBeenCalled()
      })

      it('doesn\'t send player waitingGame', () => {
        expect(socket.emit).not.toHaveBeenCalled()
      })
    })

    describe('when player is available', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isAvailable: true })
        gameCtrl.createGame(socket, session, { name: 'myGame' })
      })

      it('creates a game', () => {
        expect(mainModel.setGame).toHaveBeenCalledWith('myGame')
      })

      it('adds player to the game', () => {
        expect(gameSetPlayerSpy).toHaveBeenCalledWith('123', 'bob', [1, 2, 3, 4, 5], 12)
        expect(playerSetPlayingSpy).toHaveBeenCalledWith('gameId')
      })

      it('leaves main room for game room', () => {
        expect(socket.leave).toHaveBeenCalledWith(mainModel.name)
        expect(socket.join).toHaveBeenCalledWith('gameId')
      })

      it('updates the game list for the main room', () => {
        expect(socket.broadcast.to).toHaveBeenCalledWith(mainModel.name)
        expect(socket.emit).toHaveBeenCalledWith(
          'lobby:gamelist',
          { gamelist: mainModel.getPublicGamelist() }
        )
      })

      it('sends player waitingGame', () => {
        expect(socket.emit).toHaveBeenCalledWith('waitingGame')
      })
    })
  })

  /** *********
   * joinGame
   ***********/
  describe('joinGame', () => {
    describe('when game is not available', () => {
      beforeEach(() => {
        mockMainGetGame({ isAvailable: false })
        gameCtrl.joinGame(io, socket, session, { gameId: '123' })
      })

      it('doesn\'t add player to the game and start', () => {
        expect(gameSetPlayerSpy).not.toHaveBeenCalled()
        expect(playerSetPlayingSpy).not.toHaveBeenCalled()
        expect(gameSetPlayingSpy).not.toHaveBeenCalled()
      })

      it('doesn\'t leave main room for game room', () => {
        expect(socket.leave).not.toHaveBeenCalled()
        expect(socket.join).not.toHaveBeenCalled()
      })

      it('doesn\'t update the game list for the main room', () => {
        expect(socket.broadcast.to).not.toHaveBeenCalled()
        expect(socket.emit).not.toHaveBeenCalled()
      })

      it('doesn\'t send players game:Start', () => {
        expect(io.to).not.toHaveBeenCalled()
      })
    })
    describe('when game is available', () => {
      beforeEach(() => {
        mockMainGetGame({ isAvailable: true })
        mockMainGetPlayer({ isAvailable: false })
        gameCtrl.joinGame(io, socket, session, { gameId: 'gameId' })
      })

      it('adds player to the game and start', () => {
        expect(gameSetPlayerSpy).toHaveBeenCalledWith('123', 'bob', [1, 2, 3, 4, 5], 12)
        expect(playerSetPlayingSpy).toHaveBeenCalledWith('gameId')
        expect(gameSetPlayingSpy).toHaveBeenCalled()
      })

      it('leaves main room for game room', () => {
        expect(socket.leave).toHaveBeenCalledWith(mainModel.name)
        expect(socket.join).toHaveBeenCalledWith('gameId')
      })

      it('updates the game list for the main room', () => {
        expect(socket.broadcast.to).toHaveBeenCalledWith(mainModel.name)
        expect(socket.emit).toHaveBeenCalledWith('lobby:gamelist', {
          gamelist: mainModel.getPublicGamelist(),
        })
      })

      it('sends players game:Start', () => {
        expect(io.to).toHaveBeenCalledWith(12)
        expect(io.to).toHaveBeenCalledWith(13)
        expect(io.emit.calls.count()).toBe(2)
        expect(io.emit).toHaveBeenCalledWith('game:start', { gameId: 'gameId' })
      })
    })
  })

  /** ************
   * getGameInfo
   **************/
  describe('getGameInfo', () => {
    describe('when game is not in a playing state', () => {
      beforeEach(() => {
        mockMainGetGame({ isPlaying: false })
        gameCtrl.getGameInfo(socket, session, { gameId: '123' })
      })

      it('doesn\'t send players game:info', () => {
        expect(socket.emit).not.toHaveBeenCalled()
      })
    })
    describe('when game is available', () => {
      beforeEach(() => {
        mockMainGetGame({ isPlaying: true })
        mockMainGetPlayer({ isAvailable: false })
        gameCtrl.getGameInfo(socket, session, { gameId: '123' })
      })

      it('sends players game:info', () => {
        expect(socket.emit).toHaveBeenCalledWith('game:info', { game: {} })
      })
    })
  })

  /** *********
   * quitGame
   ***********/
  describe('quitGame', () => {
    describe('when player is not in a playing state', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isPlaying: false })
        gameCtrl.quitGame(socket, session)
      })

      it('doesn\'t set the player as available', () => {
        expect(playerSetAvailableSpy).not.toHaveBeenCalled()
      })

      it('doesn\'t leave the game room for the main room', () => {
        expect(socket.leave).not.toHaveBeenCalled()
        expect(socket.join).not.toHaveBeenCalled()
      })

      it('doesn\'t remove the player from the game', () => {
        expect(gameRemovePlayerSpy).not.toHaveBeenCalled()
      })

      it('doesn\'t update the game list for the main room', () => {
        expect(socket.broadcast.to).not.toHaveBeenCalled()
        expect(socket.emit).not.toHaveBeenCalled()
      })
    })

    describe('when a player quit the game', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isPlaying: true })
        mockMainGetGame({ isPlaying: true })
        gameCtrl.quitGame(socket, session)
      })

      it('sets the player as available', () => {
        expect(playerSetAvailableSpy).toHaveBeenCalled()
      })

      it('leaves the game room for the main room', () => {
        expect(socket.leave).toHaveBeenCalledWith('gameId')
        expect(socket.join).toHaveBeenCalledWith(mainModel.name)
      })

      it('remove the player from the game', () => {
        expect(gameRemovePlayerSpy).toHaveBeenCalled()
      })

      it('updates the game list for the main room', () => {
        expect(socket.broadcast.to).toHaveBeenCalledWith(mainModel.name)
        expect(socket.emit).toHaveBeenCalledWith(
          'lobby:gamelist',
          { gamelist: mainModel.getPublicGamelist() }
        )
      })
    })
    describe('when the 1st player quit the game', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isPlaying: true })
        mockMainGetGame({ isPlaying: true, isOver: false })
        gameCtrl.quitGame(socket, session)
      })

      it('send to the other player a message \'opponentLeft\'', () => {
        expect(socket.broadcast.to).toHaveBeenCalledWith('gameId')
        expect(socket.emit).toHaveBeenCalledWith('game:opponentleft')
      })
    })
    describe('when the 2nd player quit the game', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isPlaying: true })
        mockMainGetGame({ isPlaying: true, isOver: true })
        spyOn(mainModel, 'removeGame')
        gameCtrl.quitGame(socket, session)
      })

      it('remove and close the game', () => {
        expect(mainModel.removeGame).toHaveBeenCalledWith('gameId')
      })
    })
  })

  /** *********
   * phase0Game
   ***********/
  describe('phase0Game', () => {
    beforeEach(() => {
      mockMainGetPlayer({ isPlaying: true })
      mockMainGetGame({ isPlaying: true })
      gameCtrl.phase0Game(io, socket, session, { gameId: '123' })
    })

    it('updates game to phase 0', () => {
      expect(gameSetPhase0).toHaveBeenCalledWith('123', { gameId: '123' })
    })

    it('sends players game:info', () => {
      expect(io.to).toHaveBeenCalledWith(12)
      expect(io.to).toHaveBeenCalledWith(13)
      expect(io.emit.calls.count()).toBe(2)
      expect(gameExportGameSpy).toHaveBeenCalledWith(0)
      expect(gameExportGameSpy).toHaveBeenCalledWith(1)
      expect(io.emit).toHaveBeenCalledWith('game:info', { game: {} })
    })
  })

  /** *********
   * phase1Game
   ***********/
  describe('phase1Game', () => {
    beforeEach(() => {
      mockMainGetPlayer({ isPlaying: true })
      mockMainGetGame({ isPlaying: true })
      gameCtrl.phase1Game(io, socket, session, { gameId: '123' })
    })

    it('updates game to phase 0', () => {
      expect(gameSetPhase1).toHaveBeenCalledWith('123', { gameId: '123' })
    })

    it('sends players game:info', () => {
      expect(io.to).toHaveBeenCalledWith(12)
      expect(io.to).toHaveBeenCalledWith(13)
      expect(io.emit.calls.count()).toBe(2)
      expect(gameExportGameSpy).toHaveBeenCalledWith(0)
      expect(gameExportGameSpy).toHaveBeenCalledWith(1)
      expect(io.emit).toHaveBeenCalledWith('game:info', { game: {} })
    })
  })

  /** *********
   * phase2Game
   ***********/
  describe('phase2Game', () => {
    describe('when is game is over', () => {
      beforeEach(() => {
        mockMainGetPlayer({ isPlaying: true })
        mockMainGetGame({ isPlaying: true, isGameOver: true })
        gameCtrl.phase2Game(io, socket, session, { gameId: '123' })
      })

      it('updates game to phase 0', () => {
        expect(gameSetPhase1).toHaveBeenCalledWith('123', { gameId: '123' })
      })

      it('sends players game:info', () => {
        expect(io.to).toHaveBeenCalledWith(12)
        expect(io.to).toHaveBeenCalledWith(13)
        expect(gameExportGameSpy).toHaveBeenCalledWith(0)
        expect(gameExportGameSpy).toHaveBeenCalledWith(1)
        expect(io.emit).toHaveBeenCalledWith('game:info', { game: {} })
      })

      it('sends winner game:win', () => {
        expect(io.to).toHaveBeenCalledWith(12)
        expect(io.emit).toHaveBeenCalledWith('game:win', { gift: 'price' })
      })

      it('sends loser game:lose', () => {
        expect(io.to).toHaveBeenCalledWith(13)
        expect(io.emit).toHaveBeenCalledWith('game:lose')
      })
    })
  })
})
