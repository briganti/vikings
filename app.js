const express        = require('express')
const path           = require('path')
const expressSession = require('express-session')
const redis          = require('redis')
const RedisStore     = require('connect-redis')(expressSession)
const bodyParser     = require('body-parser')

// We're stuck with bluebird promises until
// https://github.com/NodeRedis/node_redis/issues/864 is resolved
const Promise = require('bluebird')
Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const app    = express()
const server = require('http').createServer(app)
const io     = require('socket.io')(server)
const ios    = require('socket.io-express-session')

const port = process.env.PORT || 8080

const routing  = require('./routes/index.js')
const mainCtrl = require('./controllers/main.js')
const gameCtrl = require('./controllers/game.js')

// Redis client
const redisInit = () => {
  const client = redis.createClient('6379', 'redis')
  return client.getAsync('ready')
    .then(() => {
      return Promise.resolve(client)
    }
  )
}

// Once redis init
redisInit().then((client) => {
  const session = expressSession({
    store:             new RedisStore({ client }),
    rolling:           true,
    secret:            'keyboard cat',
    resave:            true,
    saveUninitialized: false,
    unset:             'destroy',
    cookie:            { maxAge: 60 * 5 * 1000 }, // 5 minutes until session is destroyed
  })

  io.use(ios(session))

  // Express middlewares
  app.use(session)
  app.set('port', port)
  app.set('views', `${__dirname}/views`)
  app.set('view engine', 'jade')
  // for parsing application/json
  app.use(bodyParser.json())
  // for parsing application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static(path.join(__dirname, 'public')))

  // Routing
  app.use('/', routing)
  // routing(app, client)

  // Socket handling
  io.on('connection', (socket) => {
    const socketSession = socket.handshake.session

    mainCtrl.connect(socket, socketSession)

    // Main
    socket.on('disconnect',            () => { mainCtrl.disconnect(socket, socketSession) })
    socket.on('chat:sendMessage',  (data) => {
      mainCtrl.chatSendMessage(socket, socketSession, data)
    })
    socket.on('lobby:getGameList',     () => { mainCtrl.lobbyGetGameList(socket) })
    socket.on('library:get',           () => { mainCtrl.libraryGet(socket, socketSession) })
    socket.on('library:saveDeck',  (data) => {
      mainCtrl.librarySaveDeck(socket, socketSession, data)
    })

    // Game
    socket.on('game:create', (data) => { gameCtrl.createGame(socket, socketSession, data) })
    socket.on('game:join',   (data) => { gameCtrl.joinGame(io, socket, socketSession, data) })
    socket.on('game:info',   (data) => { gameCtrl.getGameInfo(socket, socketSession, data) })
    socket.on('game:quit',       () => { gameCtrl.quitGame(socket, socketSession) })
    socket.on('game:phase0', (data) => { gameCtrl.phase0Game(io, socket, socketSession, data) })
    socket.on('game:phase1', (data) => { gameCtrl.phase1Game(io, socket, socketSession, data) })
    socket.on('game:phase2', (data) => { gameCtrl.phase2Game(io, socket, socketSession, data) })
  })

  server.listen(port)
})

console.log(`Express server listening on port ${port}`)
