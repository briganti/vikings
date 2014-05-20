/**
 * Module dependencies.
 */
var express        = require('express'),
    connect        = require('connect'),
    cookie         = require('cookie'),
    app            = express(),
    server         = require('http').createServer(app),
    io             = require('socket.io').listen(server),
    path           = require('path'),
    /*routes         = require('./routes'),*/
    /*vikings        = require('./models/main.js'),*/
    port           = process.env.PORT || 61337,
    sessionStore   = new connect.middleware.session.MemoryStore(),
    sessionSecret  = "some private string",
    cookieParser   = express.cookieParser(sessionSecret),
    SessionSockets = require('session.socket.io'),
    sessionSockets = new SessionSockets(io, sessionStore, cookieParser);


// configure express
app.configure(function () {
    app.set('port',  port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(path.join(__dirname, 'client')));
    app.use(express.methodOverride());

    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(cookieParser);

    app.use(express.session({"store": sessionStore }));
    app.use(express.json());
    app.use(express.urlencoded());

    app.use(app.router);
});

/**
 * Routing
 */
require('./routes/index.js')(app, sessionStore);


/**
 * Configure Sockets
 */
io.set('log level', 2);
io.set('transports', [ 'websocket', 'xhr-polling' ]);
//io.set('close timeout', 10);

io.set('authorization', function (handshakeData, callback) {
    if (handshakeData.headers.cookie) {
        // Read cookies from handshake headers
        var cookies = cookie.parse(handshakeData.headers.cookie);
        // We're now able to retrieve session ID
        var sessionID;
        if (cookies['connect.sid'])
            sessionID = connect.utils.parseSignedCookie(cookies['connect.sid'], sessionSecret);
        // No session? Refuse connection
        if (!sessionID) {
            callback('No session', false);
        } else {
            // On récupère la session utilisateur, et on en extrait son username
            sessionStore.get(sessionID, function (err, session) {
                if (!err && session && session.user) {
                    // OK, on accepte la connexion
                    callback(null, true);
                } else {
                    // Session incomplète, ou non trouvée
                    callback(err || 'User not authenticated', false);
                }
            });
        }
    }
});


//Game controller
var mainCtrl  = require('./controllers/main.js'),
    gameCtrl  = require('./controllers/game.js');

sessionSockets.on('connection', function(err, socket, session){
    mainCtrl.connect(socket, session);

    // Main
    socket.on('disconnect',        function()    { mainCtrl.disconnect(socket, session); });
    socket.on('chat:sendMessage',  function(data){ mainCtrl.chatSendMessage(socket, session, data); });
    socket.on('lobby:getDeck',     function()    { mainCtrl.libraryGetDeck(socket, session); });
    socket.on('lobby:getGameList', function()    { mainCtrl.lobbyGetGameList(socket); });
    socket.on('library:get',       function()    { mainCtrl.libraryGet(socket, session); });
    socket.on('library:saveDeck',  function(data){ mainCtrl.librarySaveDeck(socket, session, data); });

    //Game
    socket.on('game:create',  function(data){ gameCtrl.createGame(socket, session, data); });
    socket.on('game:join',    function(data){ gameCtrl.joinGame(io, socket, session, data); });
    socket.on('game:info',    function(data){ gameCtrl.getGameInfo(socket, session, data); });
    socket.on('game:quit',    function()    { gameCtrl.quitGame(socket, session); });
    socket.on('game:phase0',  function(data){ gameCtrl.phase0Game(io, socket, session, data); });
    socket.on('game:phase1',  function(data){ gameCtrl.phase1Game(io, socket, session, data); });
    socket.on('game:phase2',  function(data){ gameCtrl.phase2Game(io, socket, session, data); });
});


//launch server
server.listen(port);
console.log('Express server listening on port ' + port);