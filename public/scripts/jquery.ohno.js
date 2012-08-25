/** jQuery.OhNo
	* Author: Troy Parkinson
	* Usage: Create object with new keyword, add validation checks via addValidation(selector, fn, args) method.
	*		Custom validator functions can be added with the addValidatorFunction(name, validator) method.
	*		Call validate() to start the validation. Optionally, you can also hook the function onto a form element using bindForm(element).
	*		Alternatively, you can just call validate() on a jQuery selector and chain the calls.
	* Dependencies: jQuery 1.4+, prototype.js
	*/	
function OhNoValidation(options) {
	/** TODO
	  * (X) Implement addValidation options for alias, message, and severity.
		* (X) Implement addValidation option for alertContainer.
		* Finish render function.
	  */
	
	// Define instance vars.
	var validations = [], validators = [], alerts = [], isValidated = false;
	var that = this;
	var opts = {
		wrapper: '#alerts',
		wrapperClass: 'validation',
		errorClass: 'error',
		warningClass: 'warning',
		wrapperHeader: '',
		render: true,
		afterValidated: function() {}
	}

	// log function
	// Define function to log to console in a standard format.
	function log(str) {
		if (typeof(DEBUG) !== 'undefined') {
			if (DEBUG) {
				console.log(Date.now()+': '+str);
			}
		} else {
			console.log(Date.now()+': '+str);
		}
	}
	
	// Handle passed options and replace default values.
	for (var opt in options) {
		if (opts[opt]) {
			opts[opt] = options[opt];
		}
	}
	
	// option function
	// Getter for the options hash.
	var option = function(option) {
		if (opts[option]) {
			return opts[option];
		}
	}
	
	// setOption function
	// Setter for the options hash.
	var setOption = function(option, value) {
		if (opts[option]) {
			opts[option] = value;
		}
	}
	
	// addValidatorFunction function
	//	Define function to add validator functions to array.
	// Function should have the signature: function(selector, name, options)
	//	selector: element selector
	//	name: alias for validator function
	//	options: additional options passed to validator function
	//	returns: a boolean value indicating success (t) or failure (f)
	var addValidatorFunction = function(name, validator) {
		if (typeof(validator) == 'function') {
			validators.push({ name:name, fn: validator });
		} else {
			log('addValidatorFunction: Can not add non-function object!');
		}
	}
	
	// addValidation function
	// Define function to add validation items to array.
	// Return: Instance of this object to allow for chaining.
	var addValidation = function(selector, name, options) {
		validations.push({
			selector: selector,
			options: options || {},
			name: name
		})
		
		return this;
	}
	
	// renderAlertTag function
	// Define a function to render the standard alert tag.
	var renderAlertTag = function(alert) {
		return '<div class="'+alert.severity+'">'+alert.message+'</div>';
	}
	
	// Render function
	// Define function to render the validations in the browser.
	var render = function() {
		// Output the necessary wrapper div with content divs for each individual severity message.
		// This needs to hook onto another existing div (or use an existing div with the same ID
		// as wrapper). Maybe validate could accept a callback function that would handle where to render at
		// and would bypass the default render function.
		// Q: What if every error needs to be rendered before/after the selector element?
		//	A: Set options on addValidation to selector of the error div used (alertContainer:)
				
		// Only auto-render if we've been instructed to.
		if (opts.render) {
			
			// Remove all previous alerts from under the default wrapper.
			if ($(opts.wrapper)) {
				$(opts.wrapper).empty();
			}
			
			// Iterate through alerts.
			for (var i in alerts) {
				var alert = alerts[i];
				var alertTag = renderAlertTag(alert);
				var renderInDefault = true;
				var el;
				
				if (alert.alertContainer) {
					// Add the alert to this container.
					// If selector returns nothing, then render in default container.
					el = $(alert.alertContainer);
					if (el) {
						log('render: Rendering \''+alert.message+'\' in alertContainer \''+alert.alertContainer+'\'');
						renderInDefault = false;
						el.html(alertTag);
					}
				}
				
				if (renderInDefault) {
					// Add the alert to the default container.
					el = $(opts.wrapper);
					if (el) {
						log('render: Rendering \''+alert.message+'\' in default container \''+opts.wrapper+'\'');
						el.prepend(opts.wrapperHeader);
						el.append(alertTag);
					}
				}
			}
		}
	}
	
	// Validate function
	// Define function to iterate through all validations and validate them.
	var validate = function(callback) {
		var ret = true;
		var vf;
		//alerts = [];	// TODO: Remove all elements from the array. Not working like this!
		
		// Iterate through validations.
		for(var i in validations) {
			var validation = validations[i];
			
			// Iterate through validators.
			// Get the matching validator function hash.
			for (var j in validators) {
				var validator = validators[j];
				
				if (validator.name === validation.name) {
					vf = validator.fn;
					log('validate: Got validator function \''+validator.name+'\'');
				}
			}
			
			if (!vf) {
				log('validate: Could not find matching validator function \''+validation.name+'\'');
			} else {		
				// Call the validator function, passing context and args.
				// The function will return false if not valid and true if it is.				
				log('validate: Calling validator function');
				var imret = vf.apply(that, [validation.selector, validation.name, validation.options]);
				ret = ret && imret;
				
				if (!imret) {
					// Validation failed; Construct alert hash with options.
					var alias = validation.options.alias ? validation.options.alias : '';
					var o = {
						severity: validation.options.severity ? validation.options.severity : 'error',
						message: validation.options.message ? validation.options.message.replace('{alias}', alias) : alias+' can not be empty!'
					}
					
					if (validation.options.alertContainer) {
						o.alertContainer = validation.options.alertContainer;
					}
					
					alerts.push(o);
				}
			}
		}
		
		// Call the callback.
		if (callback) {
			callback.apply(this, [ret]);
		}
		
		// Call the afterValidated callback.
		if (opts.afterValidated) {
			opts.afterValidated.apply(this, [ret]);
		}
		
		// Call the render function.
		if (!ret) {
			render();
		}
		
		// Return an overall evaluation of whether valid or not.
		isValidated = ret;
		return ret;
	}
	
	// Add default validator functions.
	addValidatorFunction('presence', function(selector, name, options) {
		var el = $(selector);
		if (el.length) {
			var val = el.val();
			if (String.prototype.trim) {
				if (el.val().trim() !== '') {
					return true;
				}
			}
		}
		
		return false;
	});
	
	// bindForm function
	// Define function to bind to a form's submit event.
	var bindForm = function(selector) {
		log('bindForm: Got selector \''+selector+'\'');
		$(selector).submit(function() {
			return validate();
		})
	}
	
	// Return a hash with only the methods we want exposed.
	return {
		setOption: setOption,
		addValidatorFunction: addValidatorFunction,
		addValidation: addValidation,
		bindForm: bindForm,
		validate: validate,
		alerts: alerts,
		isValidated: isValidated
	}
};


// Add support for jQuery $(selector) function.
jQuery.fn.addValidation = function(name, options) {
	// Create new instance and add the validation.
	var ohno = new OhNoValidation();
	ohno.addValidation('#'+this.attr('id'), name, options);
		
	// Allow for chaining.
	return ohno;
}