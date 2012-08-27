
/** Socket-rooms module
	* Defines room functionality that's used to supplement socket.io. It makes finding the current room name
	* of the socket an easier task. It also handles the logic of joining rooms.
	* This function is immediately executed and returns an object.
	*/
this.instance = (function() {
	var that = {}, rooms = [];
	
	// Define room defaults.
	that.defaults = {
			roomName: 'The Snack Shack'
	};
		
	/** get method
		* Iterates through the rooms array and finds the matching socket's room name.
		* socket: The current socket of the user.
		* returns: The current socket's room name, or empty string ('') if not found.
		*/
	that.get = function(socket) {
		for (var i in rooms) {
			if (rooms[i].socket === socket) {
				return rooms[i].room;
			}
		}
		return '';
	}
	
	/** join method
		* Joins a new room on the current socket. If the user is in a room already, it leaves it first.
		* socket: The current socket of the user.
		* room: The new room name to join.
		*/
	that.join = function(socket, room) {
		// Leave previous room, if in one.
		var curRoom = this.get(socket);
		if (curRoom) {
			socket.leave(curRoom);
			// TODO: Broadcast message that user left the room.
			socket.broadcoast.emit('recv-message', { alias: '', msg: 'The user left the room'});
		}
		
		// Join the new room and keep track of this.
		socket.join(room);
		// TODO: Broadcast message that user entered the room
		console.log('Joining room '+room);
		rooms.push({ socket: socket, room: room });
	}
	
	return that;
}());