/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Jannis Achstetter <kripton@kripserver.net>
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.fullscreendisplay
 * Shows incoming messages to specified users starting with @ + username as large as the browser's content area, overlaying everything else. 
 */
CandyShop.fullscreendisplay = (function(self, Candy, $) {
	/** Object: _options
	 * Options for this plugin's operation
	 *
	 * Options:
	 *   (Array of String) fullscreenUsers - The usernames for which to display the messages as fullscreen
	 */
	var _options = {
		fullscreenUsers: ['band']
	};
	
	var _getNick = function() {
		return Candy.Core.getUser().getNick();
	};

	var fontSizeCache = undefined;
	
	/** Function: init
	 * Initialize the fullscreendisplay plugin
	 * Bind to after-Show
	 *
	 * Parameters:
	 *   (Object) options - The options to apply to this plugin
	 */
	self.init = function(options) {
		// apply the supplied options to the defaults specified
		$.extend(true, _options, options);
		
		// Create the div that is hidden by default
		var container = document.createElement('div');
		container.setAttribute('id', 'candy-fullscreendisplay-message');
		document.body.appendChild(container);
		
		var updateTimeout = window.setInterval(function() {}, 500);

		// bind to the after-Show event
		$(Candy).on('candy:view.message.after-show', function(e, args) {
			console.log('FSM MESSAGE: ' + args.message);
			console.log('FSM MESSAGE SPLIT: ' + args.message.split("|")[2]);
			
			// Check if the message is intended for us and in the correct format
			//var message = args.message.split("|")[2]
			var message = args.message;
			var regex = new RegExp('^(@' + _getNick() + ':)(.*)', 'ig');
//			console.log('FSM Regex test: ' + regex.test(message));
			if (!regex.test(message)) {
				console.log('NO MATCH => RETURN');
				return args.message;
			}
			
			console.log('MESSAGE MATCHES PATTERN');
		  
			// Check if we are in the list of users to display the message in fullscreen
			var match = false;
			options.fullscreenUsers.forEach(function(name) {
				console.log('FSM! We are:' + _getNick().toLowerCase() + ' checking against ' + name);
				if (name.toLowerCase() == _getNick().toLowerCase()) {
					match = true;
				}
			});
			if (!match) {
				return args.message;
			}
			
			console.log('WE ARE TO DISPLAY IT FULLSCREEN');

			fontSizeCache = undefined;
			
			// Change the text in the container and display it without the user-name-prefix
			window.clearTimeout(updateTimeout);
			updateTimeout = window.setInterval(function() {
			  console.log("TICK");
			  
			  var now = new Date();
			  var hours = now.getHours();
			  if (hours < 10) hours = "0" + hours;
			  var minutes = now.getMinutes();
			  if (minutes < 10) minutes = "0" + minutes;
			  var seconds = now.getSeconds();
			  if (seconds < 10) seconds = "0" + seconds;
			  var timeString = hours + ":" + minutes + ":" + seconds;
			  
			  container.innerHTML = timeString + " " + message.replace(regex, '$2');
			  container.style.display = 'inline';
			
			  // Now make the text as large as possible while still displaying the whole text
			  //console.log('fontSizeCache PRE ' + fontSizeCache);
			  if (fontSizeCache) {
				//console.log('Using cache!');
			  	container.style.fontSize = fontSizeCache + 'px';
			  } else {
				  //console.log('Not using cache');
				  var fontsize = 1000;
				  container.style.fontSize = fontsize + 'px';
				  while ((container.scrollWidth > container.offsetWidth) || (container.scrollHeight > container.offsetHeight)) {
				    fontsize--;
				    container.style.fontSize = fontsize + 'px';
				    fontSizeCache = fontsize;
				  }
				  //console.log('fontSizeCache POST ' + fontSizeCache);
			  }
			}, 1000);
			
			return args.message;
		});
	};

	return self;
}(CandyShop.fullscreendisplay || {}, Candy, jQuery));
