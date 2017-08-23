gaTracking = function(){}

// Adds cross-domain and event tracking to <a> elements linking to specified foreign domain
// Should be executed when the dom has been created and after ajax content has been loaded
gaTracking.tagHyperlinks = function(tracker, domain) {	
	if (typeof _gaq !== 'undefined') {
		_gaq.push(function() {
			var gat = _gat._getTrackerByName(tracker);
			var hyperlinks = document.getElementsByTagName('a');
			for (var i = 0; i < hyperlinks.length; i++) {
				var link = hyperlinks[i];
				if (link.href.match(domain)) {
					
					if (!link._ga_crossDomainTrackingEnabled) {
						// Add cookie params to url (as fragment)
						link.href = gat._getLinkerUrl(link.href); // The argument to _getLinkerUrl has been modified for SmartQ#2537
						link._ga_crossDomainTrackingEnabled = true;
					}
					
					// Add event tracking on click (supported in some browsers)
					if (link.addEventListener) {
						link.addEventListener('click', function() {
							_gaq.push([tracker+'._trackEvent', 'Links to '+domain, 'Click', this.className]);
						}, false);
					}
				}
			}
		});
	}else if(typeof ga != 'undefined'){ // GA Universal
		var hyperlinks = document.getElementsByTagName('a');
			for (var i = 0; i < hyperlinks.length; i++) {
				var link = hyperlinks[i];
				if (link.href.match(domain)) {
					link.addEventListener('click', function() {
						ga('send', 'event','Booking Engine', 'Click', 'Link to '+domain, 1,{'nonInteraction': 'true',hitCallback: function() {window.location = hrefLink;}});
					}, false);
				}
			}
	}

}

// Adds cross domain and event tracking to <form> elements submitting to specified foreign domain
gaTracking.tagForms = function(tracker, domain, allowChangeMethod) {
	if (typeof _gaq !== 'undefined') {
		var forms = document.getElementsByTagName('form');
		for (var i = 0; i < forms.length; i++) {
			var form = forms[i];
			if (!form._gaTrackingTagged && form.action.match(domain)) {
				var onsubmit = form.onsubmit || function(){};
				form.onsubmit = function(event){
					if (onsubmit(event) === false) {
						return false;
					}
					// Gather all fields
					var fields = [];
					for (var j = 0; j < this.elements.length; j++) {
						var field = this.elements[j];
						if (field.name) {
							if (typeof field.selectedIndex != 'undefined'){
								var option = field.options[field.selectedIndex];
								var value = option.value ? option.value : option.text;
								fields.push(field.name+'='+value); // IE8 seems to require this method
							} else {
								fields.push(field.name+'='+field.value);
							}
						}
					}
					// Add field values to form action query
					var query = fields.join('&');
					this.action = this.action.split(/[?#]/)[0] + '?' + query;
					// Add cross domain tracking parameters using async method and hash appending
					_gaq.push([tracker+'._linkByPost', this]);
					// Add event tracking
					_gaq.push([tracker+'._trackEvent', 'Links to '+domain, 'Click', 'booking-mask']);
					// Change method to post
					if(allowChangeMethod){
						this.method = 'post'; // Changing to post to fix IE problem and not overwrite constructed query string
					}
					return true; // Let the form submit naturally
				}
				form._gaTrackingTagged = true;
			}
		}
	}else if(typeof ga != 'undefined'){ // GA Universal
		var forms = document.getElementsByTagName('form');
		for (var i = 0; i < forms.length; i++) {
			var form = forms[i];
			if (form.action.match(domain)) {
				var onsubmit = form.onsubmit || function(){};
				form.onsubmit = function(event){
					if (onsubmit(event) === false) {
						return false;
					}
					// Gather all fields
					var fields = [];
					for (var j = 0; j < this.elements.length; j++) {
						var field = this.elements[j];
						if (field.name) {
							if (typeof field.selectedIndex != 'undefined'){
								var option = field.options[field.selectedIndex];
								var value = option.value ? option.value : option.text;
								fields.push(field.name+'='+value); // IE8 seems to require this method
							} else {
								fields.push(field.name+'='+field.value);
							}
						}
					}
					// Add field values to form action query
					var query = fields.join('&');
					this.action = this.action.split(/[?#]/)[0] + '?' + query;
					// Change method to post
					if(allowChangeMethod){
						this.method = 'post';
					}
					
					ga('send', 'event','Booking Form', 'Form Submit', 'Link to '+domain, 1,{'nonInteraction': 'true',hitCallback: function() {form.submit();}})
					 // Changing to post to fix IE problem and not overwrite constructed query string
					return true; // Let the form submit naturally
				}
			}
		}
	}
}

// Adds event and pageview tracking of local resources (residing on same domain), which appear not to be html documents
gaTracking.tagDownloads = function(tracker, domain) {
	if (typeof _gaq !== 'undefined') {
		var links = document.getElementsByTagName('a');
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (link.href.match(domain) && !link.href.match(/\.html?($|#|\?)/i)) {
				if (link.addEventListener) {
					link.addEventListener('click', function() {
						_gaq.push([tracker+'._trackEvent', 'Downloads', 'Click', this.href]);
					}, false);
				}
			}
		}
	}else if(typeof ga != 'undefined'){ // GA Universal
		var links = document.getElementsByTagName('a');
		for (var i = 0; i < links.length; i++) {
			var link = links[i];
			if (link.href.match(domain) && !link.href.match(/\.html?($|#|\?)/i)) {
				if (link.addEventListener) {
					link.addEventListener('click', function() {						
						ga('send', 'event','Downloads', 'Click', 'Link to '+domain, 1,{'nonInteraction': 'true',hitCallback: function() {window.location = hrefLink;}});
					}, false);
				}
			}
		}
	}
}