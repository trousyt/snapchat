// Bootstrap all custom prototype augments.
require('./lib/prototype');

/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();
	
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
	//app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }))
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/chat', routes.chat);
app.get('/sandbox', routes.sandbox);

var server = http.createServer(app),
		io = require('socket.io').listen(server),
		sockets = require('./modules/socket-init');

server.listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));

	// Bind socket-io events to any new connections
	sockets.bind(io);

});

/**
 * Custom initialization.
 */
