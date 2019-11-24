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

	CandyShop.fontSizeCache = undefined;

	function resizeFont(container)
	{
		if (CandyShop.fontSizeCache) {
			console.log('Using cache: ' + CandyShop.fontSizeCache);
			container.style.fontSize = CandyShop.fontSizeCache + 'px';
		} else {
			console.log('Not using cache: Container: ', container);
			var fontsize = 1000;
			container.style.fontSize = fontsize + 'px';
			while ((container.scrollWidth > container.offsetWidth) || (container.scrollHeight > container.offsetHeight)) {
				fontsize--;
				container.style.fontSize = fontsize + 'px';
				CandyShop.fontSizeCache = fontsize;
			}
			console.log('fontSizeCache POST ' + CandyShop.fontSizeCache);
		}
	}

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

			// Check if the message is intended for us and in the correct format
			var message = args.message;
			var regex = new RegExp('^(@' + _getNick() + ':)(.*)', 'ig');

			if (!regex.test(message)) {
				console.log('NO MATCH => RETURN');
				return args.message;
			}

			console.log('MESSAGE MATCHES PATTERN: ', message);

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

			var messageContent = message.replace(regex, '$2').trim();
			//console.log('MESSAGE CONTENT: "' + messageContent + '"');

			// Countdown: START
			if (messageContent.startsWith('start')) {
				if (!(container.message)) {
					container.message = "";
				}
				console.log('START TIMER');

				var timeStart = new Date();

				CandyShop.fontSizeCache = undefined;

				// Change the text in the container and display it without the user-name-prefix
				window.clearTimeout(updateTimeout);
				updateTimeout = window.setInterval(function() {
					console.log("TICK");

					var timeNow = new Date();
					var timeDiff = timeNow - timeStart;

					// Remaining time in seconds = ((60 minutes * 60 seconds per minute * 1000 msec per s) - timeDiff) / 1000
					var timeRemaining = ((60 * 60 * 1000) - timeDiff) / 1000;
					if (timeRemaining < 0) {
						timeRemaining = 0;
					}

					console.log('Elapsed: ' + timeDiff/1000 + ' Remaining: ' + timeRemaining);

					hours = parseInt(timeRemaining / 3600, 10);
					if ((timeRemaining % 3600) == 0) {
						minutes = 00;
					} else {
						minutes = parseInt(timeRemaining / 60, 10);
					}
					seconds = parseInt(timeRemaining % 60, 10);
					hours = hours < 10 ? "0" + hours : hours;
					minutes = minutes < 10 ? "0" + minutes : minutes;
					seconds = seconds < 10 ? "0" + seconds : seconds;

					var timeString = hours + ":" + minutes + ":" + seconds;

					if ((seconds == 30) || (seconds == 0) || (minutes < 3)) {
						Candy.Core.Action.Jabber.Room.Message(args.roomJid, "TIMER: " + timeString, "groupchat");
					}

					container.innerHTML = timeString + '<br />' + container.message;
					container.style.display = 'inline';

					//Now make the text as large as possible while still displaying the whole text
					//console.log('fontSizeCache PRE ' + fontSizeCache);
					resizeFont(container);
				}, 1000);

				return args.message;
			}

			// Countdown: RESET
			else if (messageContent.startsWith('reset')) {
				console.log('Reset TIMER');

				if (!(container.message)) {
					container.message = '';
				}

				clearInterval(updateTimeout);
				var timeString = "01:00:00";
				container.innerHTML = timeString + '<br />' + container.message;
				container.style.display = 'inline';
				resizeFont(container);
			}

			else {
				container.message = messageContent;
				CandyShop.fontSizeCache = undefined;
				if (container.innerHTML.startsWith("01:00:00")) {
					var timeString = "01:00:00";
					container.innerHTML = timeString + '<br />' + container.message;
					container.style.display = 'inline';
					resizeFont(container);
				}

				console.log('WE ARE TO DISPLAY IT FULLSCREEN');
			}
		});

	};

	return self;
}(CandyShop.fullscreendisplay || {}, Candy, jQuery));
