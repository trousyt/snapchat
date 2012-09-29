		/** Socket-init module
		 * Sets up Socket.IO support on the connection and defines valid events.
		 */
		this.bind = (function (io, fn) {
		    console.log('Sockets waiting for connection...');

		    // TODO:
		    //	Add functions to perform calls
		    //	To make bugs less likely because we don't have to explicitly pass an object with the right properties
		    //	Will also make everything more semantic than "socket.broadcast.on('blah').emit(...)" <-- Not clear that this means!
		    //		ie. sendMessage(alias, msg);

		    // Load custom functionality.
		    var rooms = require('./socket-rooms').instance,
		        commandParsers = require('./socket-cparsers').instance;

		    // Define simple helper function to log events with correct formatting.
		    var logEvent = function (event, message) {
		        console.log(event + ': ' + message);
		    }

		    // Define emitter methods.
		    // Uses closure to write to the correct socket.
		    var Emitter = function (socket) {
		        this.sendEventToRoom = function (event, data) {
		            socket.emit(event, data);
		        }
		        this.bcastEventToRoom = function (event, data) {
		            socket.broadcast.to(rooms.current(socket)).emit(event, data);
		        }

		        this.sendMessageToSocket = function (alias, msg) {
		            this.sendEventToRoom('recv-message', {
		                alias: alias,
		                msg: msg
		            });
		        }

		        this.bcastMessageToRoom = function (alias, msg) {
		            this.bcastEventToRoom('recv-message', {
		                alias: alias,
		                msg: msg
		            });
		        }

		        this.bcastUserLeftRoom = function (alias) {
		            this.bcastMessageToRoom(alias, 'Has left the room.');
		        }

		        this.bcastUserJoinedRoom = function (alias) {
		        	this.bcastMessageToRoom(alias, 'Has joined the room.');
		        }

		        return this;
		    }

		    /** 
				io.sockets.on('connection')
				Set up socket connections.
				*/
		    io.sockets.on('connection', function (socket) {

		        // Do anything on connection by default?
		        // TODO: Log that a new client connection was made?
		        logEvent('connection', 'Connection made, binding socket events...');

		        // Declare custom functionality functions that are
		        // to be used per-socket.
		        var emitter = new Emitter(socket);

		        // Handle built-in events.
		        // ***********************
		        // Event: disconnect
		        // Handle every disconnect event sent to this socket.
		        // Caveat: Doesn't always fire and can't make use of 
		        //	socket.get() method without problems.
		        socket.on('disconnect', function () {
		            logEvent('disconnect', 'User disconnected');
		            socket.get('alias', function(alias) {
		            	emitter.bcastUserLeftRoom(alias);
		            });
		        });

		        // Event: message
		        // Handle each and every message send to this socket.
		        socket.on('message', function (data) {
		            logEvent('message', 'handling message: data');
		        });


		        // Handle custom events.
		        // Most events follow this convention:
		        //	1) Receive an event.
		        //	2) Confirm receipt of that event with naming convention of recvd-{event}.
		        // *********************
		        // TODO: Custom event handlers defined here might be unecessary. Might move
		        // to a model where these are delegated to ActionDispatch and will all run
		        // through the 'message' object above. How hard this will make it to 'respond'
		        // to events with the callback method (using fn) is unknown at this point.

		        // Event: set-alias
		        // Sets the alias for the current socket.
		        socket.on('set-alias', function (alias, fn) {
		            // TODO: Make sure no one else is using the same alias before setting it.

		            socket.set('alias', alias, function () {
		                logEvent('set-alias', 'Set alias to \'' + alias + '\'');

		                // If user in no room, set to default room.
		                if (!rooms.current(socket)) {
		                    rooms.join(socket, rooms.defaults.roomName);
		                    emitter.bcastUserJoinedRoom(alias);
		                }

		                // Acknowledge receipt.
		                fn({
		                    result: 'success',
		                    alias: alias
		                });
		            });
		        });

		        // Event: send-message
		        // Sends a message from the sender to all room participants.
		        socket.on('send-message', function (msg, fn) {
		            logEvent('send-message', 'Sending message to all in room (\'' + rooms.current(socket) + '\'): \'' + msg + '\'');
		            // TODO: Parse message for:
		            //	change rooms
		            //	direct message
		            //	whois
		            //	random message
		            // Write library that can handle these and return expected object
		            // Write a libary that handles conversion to HTML encoding:
		            //	ie. newline to <br />
		            // Send time with the message to the client.

		            /* foo.parse(msg, function(return) {
									returns a value from fn passed to parse().
									loops through a bunch of 'plugin' parsers to check match of phrases and then executes a command.
								});
								*/

		            //commandParsers

		            // TODO:
		            // Do a check for prerequisites such as alias and room.
		            // If not set, return 'error' instead of 'success' status.

		            if (msg.match(/$room.+/)) {
		                logEvent('Matched room change');
		            }

		            // Broadcast the message to everyone else.
		            //socket.in(getRoom(socket)).emit(msg);
		            socket.get('alias', function (err, alias) {
		                // Broadcast the message to everyone else.
		                emitter.sendMessageToSocket(alias, msg);
		                emitter.bcastMessageToRoom(alias, msg);

		                // Acknowledge receipt.
		                fn({
		                    result: 'success'
		                });
		            });
		        });

		        // Event: send-private-message
		        // Sends a message from the sender to a specific room participant.
		        socket.on('send-private-message', function (to, msg) {
		            console.log('received event: post-private-message');
		        });

		        // Event: whois
		        // Sends the sender a list of known chat participants.
		        socket.on('send-whois', function () {
		            console.log('received event: whois');
		            socket.emit('recv-whois', [{
		                name: 'John Doe',
		                alias: 'jdoe'
		            }, {
		                name: 'Toddy Vilinatkis',
		                alias: 'toddy'
		            }]); //TEST
		        });

		        // Event: random-message
		        // Emits a random message to the entire room from the requester.
		        socket.on('send-random-message', function () {
		            console.log('received event: random-message');
		            socket.emit('recv-message', 'something');
		        });
		    });

		    // Invoke the callback.
		    if (fn) fn();
		})