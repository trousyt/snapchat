/**
 * Function.pretty_print
 * Prints all properties and methods of an object.
 * Arguments:
 * only_local (optional): Only print non-inherited members.
 */
if (Function.prototype.pretty_print != 'function') {
	Function.prototype.pretty_print = function(only_local) {
		// Handle param defaults
		only_local = typeof only_local !== 'undefined' ? only_local : false;
	
		// Define print helper function
		var that = this;
		var print = function(p) { console.log(p+'('+typeof(p)+'):'+that[p]) };
	
		for(var p in this) {
			if (p !== 'undefined') print(p);
		}
	}
}

/**
 * String.trim()
 * Removes leading and trailing spaces or tabs from a string.
 */
if (String.prototype.trim != 'function') {
	String.prototype.trim = function() {
		return this.replace(/^[ \t]+|[ \t]+$/g, '');
	}
}
