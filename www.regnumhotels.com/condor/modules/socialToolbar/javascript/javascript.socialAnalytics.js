/****

SMO Toolbar & Analytics integration
by Matias

Features
- Tracks Facebook likes, unlikes, shares. Twitter tweets.
- Toolbar interaction
- Automatically detects multiple tracking objects, trigger same events to all of them
- Supports both legacy and async code versions 
- Check for _gat global object to be present

Important:
- Requires Jquery
- Include after Jquery (Obvious)

Future plans:
- Add opt_url for twitter

****/

jQuery(document).ready(function() {


var debug = true; // Debug mode
var delay = 1000; // Delay in msecs after JQuery ready loads

// Non social buttons to be tracked
var smoInteractionsCategory = 'Toolbar-Interaction';
var smoInteractionsButtons = ['win_open_1', 'win_open_2', 'win_open_3','win_open_4', 'mail_button', 'minimize', 'maximize'];
var smoInteractionsAction = ['fb-btn', 'twitter-btn', 'youtube-btn', 'tripadvisor-btn', 'mail_button', 'bar-minimize', 'bar-maximize','pinterest-btn'];


		function broadcastEvents(type, param1, param2)
		{
			// Get all trackers
			var trackerObjects = _gat._getTrackers();

			// Loop through all trackers, broadcast one social event to each
			var i = trackerObjects.length;
			while(i--)
			//for(i=0; i<trackerObjects.length; i++)
			{
			
				if(type=='social')
				{
					trackerObjects[i]._trackSocial(param1, param2);
					if(debug==true)console.log('Social event broadcasted to tracker ' + i + ': ' + param1 + '->' + param2);
				}
				
				if(type=='event')
				{
					trackerObjects[i]._trackEvent(param1, param2);
					if(debug==true)console.log('Event broadcasted to tracker ' + i + ': ' + param1 + '->' + param2);
				}
			}
		}
		
		function loadFBTracking()
		{
				// FB object needs to be created
				if(typeof FB != 'undefined') 
				{
					FB.Event.subscribe('edge.create', function(targetUrl) {
						broadcastEvents('social', 'facebook', 'like');
					});
					FB.Event.subscribe('edge.remove', function(targetUrl) {
						broadcastEvents('social', 'facebook', 'unlike');
					});
					FB.Event.subscribe('message.send', function(targetUrl) {
						broadcastEvents('social', 'facebook', 'send');
					});
					if(debug==true)console.log('FB tracking setup');
				}
		}
		
		function trackTwitter(intent_event) {
   		 if (intent_event) {
				broadcastEvents('social', 'twitter', 'tweet');
    		}
  		}

		function checkGatReady() {

			// Check for GAT global object to be defined (A.K, there is some analytics on the page)		
			if(typeof _gat != 'undefined')
			{
				if(debug==true)console.log('GAT found!');
			
				// Load FB tracking
				loadFBTracking();
				
				// Twitter tracking. Own ready method that waits for js to load
 				twttr.ready(function (twttr) {
    				//event bindings
    				twttr.events.bind('tweet', trackTwitter);
					if(debug==true)console.log('TWITTER tracking setup');
  				});
				
                                //pinterest
                                jQuery("#pinterest-btn").bind('click',function(){
                                    broadcastEvents('social', 'pinterest', 'click');
                                });
                                
                                //facebook
                                 jQuery("#fb-btn-share").bind('click',function(){
                                    broadcastEvents('social', 'facebook', 'send');
                                });
                                
                                if(debug==true)console.log('Pinterest tracking setup');


                               // The other buttons
		               for(var z=0; z<smoInteractionsButtons.length; z++)
				{
					var targetAnchor = '#'+'social_toolbar_'+smoInteractionsButtons[z];
				
					jQuery(targetAnchor).bind('click', { id: z}, function(event){
						var data = event.data;	
						var category = smoInteractionsCategory;
						var action = smoInteractionsAction[data.id];
                                              
        					broadcastEvents('event', category, action);
					});
				}
			}
			else
			{
				if(debug==true)console.log('GAT not detected, will not load Social tracking');
			}
		}
		
		// Timer to wait for GAT global object to be created.. Jquery.ready is not enough
		gattimer = setTimeout(checkGatReady,delay);

});
