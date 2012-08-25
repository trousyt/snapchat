		
// Set up Socket.IO support and define valid events.
this.bind = function(io, fn) {
		console.log('Sockets waiting for connection...');
		
		// Define simple helper function to log events with correct formatting.
		var logEvent = function(event, message) {
			console.log(event+': '+message);
		}
				
  	io.sockets.on('connection', function (socket) {
			// Do anything on connection by default?
      logEvent('connection', 'Connection made, binding socket events...');
      
      // Handle built-in events.
      // ***********************
      socket.on('disconnect', function() {
          logEvent('disconnect', 'User disconnected');
      });
     
      socket.on('message', function(data) {
          logEvent('message', 'handling message: data'); 
      });
     
     
      // Handle custom events.
			// Most events follow this convention:
			//	1) Receive an event.
			//	2) Confirm receipt of that event with naming convention of recvd-{event}.
      // *********************
      socket.on('set-alias', function (alias, fn) {
					// TODO: Make sure no one else is using the same alias before setting it.
					//console.log(io.sockets);
					
          socket.set('alias', alias, function() {
              logEvent('set-alias', 'Set alias to \''+alias+'\'');

							// Acknowledge receipt.
							fn({ result:'success', alias: alias });
          });
      });
     
      // Event: send-message
      // Sends a message from the sender to all room participants.
      socket.on('send-message', function (msg, fn) {
					logEvent('send-message', 'Sending message to all: \''+msg+'\'');
					// TODO: Parse message for:
					//	change rooms
					//	direct message
					//	whois
					//	random message
	
					// Broadcast the message to everyone else.
					//socket.broadcast.emit(msg);
					
					// Acknowledge receipt.
					fn({ result: 'success' });
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
          socket.emit('recv-whois', [{name: 'John Doe', alias: 'jdoe'}, {name: 'Toddy Vilinatkis', alias: 'toddy'}]); //TEST
      });
     
      // Event: random-message
      // Emits a random message to the entire room from the requester.
      socket.on('send-random-message', function () {
          console.log('received event: random-message');
          socket.emit('recv-message', 'something');
      });
  });

	if (fn) fn();

}