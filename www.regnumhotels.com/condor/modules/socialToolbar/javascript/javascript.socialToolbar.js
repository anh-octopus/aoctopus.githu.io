var socialtoolbar = (function(){
	var speed = 300;
        var lastWindow;
	var left_buttons = new Array(); 
        var left_label = new Array();  

	// settings stored in array in json format
	var global_data = new Array();
	var global_settings;



	// call this function to initialize the toolbar
	// params: (general_settings, data_left, data_right) - settings in json format   ,  module_path - path to condor module
	function toolbar_init(general_settings, data_left, data_right, module_path) {
	 
                         
      	// define social media buttons here
	
	// html code replaced with each social media javascript
        left_label[0] = 'twitter';
        left_label[1] = 'gplus';
        left_label[2] = 'pinterest';
        left_label[3] = 'facebook';
        
		var fb_url = 'https://www.facebook.com/sharer/sharer.php?u='+location.href;
		left_buttons[0]='<a href="https://twitter.com/share" class="twitter-share-button">Tweet</a>'; 
		left_buttons[1]='<div class="g-plusone" data-size="medium" data-width="300"></div>'; 
		left_buttons[2]="<a id=\"pinterest-btn\" href=\"#\" onclick=\"javascript:void((function(){var e=document.createElement('script');e.setAttribute('type','text/javascript');e.setAttribute('charset','UTF-8');e.setAttribute('src','../../assets.pinterest.com/js/pinmarklet2a3b.js?r='+Math.random()*99999999);document.body.appendChild(e)})());\"><img border=\"0\" src=\""+module_path+"/themes/default/images/PinExt.png\" title=\"Pin It\" /></a>";
		//left_buttons[3]='<div class="fb-like" data-send="true" data-layout="button_count" data-width="90" data-show-faces="false"></div>'; 
		left_buttons[3]='<div class="fb-btn" ><a id="fb-btn-share" href="#" onclick="return window.open(\''+fb_url+'\',\'Share\',\'width=550,height=400\');"><img src="'+module_path+'/themes/default/images/facebook_btn.png"/></a> </div>'; 


		//#16659 : SMO toolbar widget fails with JQuery 2.4.1
		//To fix ticket #16659, commented below 3 lines 		
		//if (jQuery.browser.msie && jQuery.browser.version=="6.0"){
		//	return; // IE6 - currently not supported
		//}

		// modern browsers

                    global_settings = eval("(" + general_settings + ")");
    
		
		if (global_settings == null || global_settings.toolbar_enabled != 1 )
		{
			return;
		}
			 
		
		global_settings.module_path =  module_path;
		global_data['data_left'] = data_left; 
		global_data['data_right'] = data_right;
		
		var content = build_content();
                var layout = global_settings.layout;
                var borderStyle = "";
                var toolbarSize = "";
                
                if (global_settings.rounded == 1 ){
                    borderStyle = "stRounded";
                }
                
                //Layout 1 - Horizontal
                if (layout==1 && global_settings.toolbarSize){
                    var size = parseInt(global_settings.toolbarSize);

					if (screen.width >= size) {
						sizeInPercent = (size/screen.width)*100;
						size = Math.round(sizeInPercent)+'%';
					} else {
						size = '100%';
					}

					toolbarSize = 'style="width:'+size+'; margin:0 auto; position:relative;"';
				} else {
					if ((isMobile == 1 || isTablet == 1) && layout==1) {
						var size = '100%';
					} else if(layout == 1){
						sizeInPercent = (960/screen.width)*100;
						var size = Math.round(sizeInPercent)+'%';
					}

					toolbarSize = 'style="width:'+size+'; margin:0 auto; position:relative;"';
				}
                
                if (layout == 1 && global_settings.extend == 1){
                    jQuery('body').append(
						'<!-- facebook -->'+
						'<div id="fb-root"></div>'+
                        '<div id="socialToolbarContainer" class="stLayout'+layout+' '+borderStyle+' stExtended">' + 
                                '<div id="socialToolbarBackground"></div>'+
								'<div id="socialToolbarHolder" '+toolbarSize+'>' +
									'<div id="socialToolbarInner" class="box-shadow inner_toolbar">'+content+'</div>' + // full toolbar
									'<div id="socialToolbarInnerMin" class="box-shadow inner_toolbar minimized" ><a href="#" onclick="{socialtoolbar.maximize(); return false;}" id="social_toolbar_maximize"><div style="float:left;"><span class="stdButton">'+socialToolbarSettings.minimzedLabelHorizontal+'</span></div> <span class="icon">&nbsp;</span></a></div>' + // minimized version
								'</div>' +
                        '</div>');          
                }else{
                    jQuery('body').append(
					'<!-- facebook -->'+
					'<div id="fb-root"></div>'+
					'<div id="socialToolbarContainer" class="stLayout'+layout+' '+borderStyle+'" style="width:'+size+';">' + 
                            '<div id="socialToolbarBackground"></div>'+
							'<div id="socialToolbarHolder">' +
                            '<div id="socialToolbarInner" class="box-shadow inner_toolbar">'+content+'</div>' + // full toolbar
                            '<div id="socialToolbarInnerMin" class="box-shadow inner_toolbar minimized" ><a href="#" onclick="{socialtoolbar.maximize(); return false;}" id="social_toolbar_maximize"><div style="float:left;"><span class="stdButton">'+socialToolbarSettings.minimzedLabelHorizontal+'</span></div> <span class="icon">&nbsp;</span></a></div>' + // minimized version
							'</div>' +
                    '</div>');
                }
	
                    if (window.PIE) {
                            jQuery('#socialToolbarContainer').each(function() {
                                    PIE.attach(this);
                            });
                    }
                
		//Layout 1 - Default (Horizontal)
                if (layout == 1){
                    //if the last session was minimized, keep it in that way
                    if (jQuery.cookie("socialToolbarMin")==1) {
						jQuery("#socialToolbarContainer").addClass("clean");
						jQuery("#socialToolbarHolder").addClass("clean");
						jQuery("div.contentLeft").addClass("clean");
						jQuery("div.contentRight").addClass("clean");
						jQuery("#socialToolbarInner").css({bottom:"-100px"});
						jQuery("#socialToolbarInnerMin").css({bottom:"-5px"});
						if (isMobile == 1) {
							jQuery("#socialToolbarInnerMin").css({bottom:"10px"});
						}
                    }
                }else{
                    var socialHeight  = jQuery("#socialToolbarContainer").height();
                    var newTop = socialHeight/2;
                    jQuery("#socialToolbarContainer").css("margin-top","-"+newTop+"px");
                }
                
                
                //SocialToolbar Bottom fix
                if (jQuery("#socialToolbarContainer").length != 0){
                    var paddingBottom = parseInt(jQuery("#footer").css("padding-bottom"));
                    if (paddingBottom < 80){
                            jQuery("#footer").css('padding-bottom','80px');
                    }         
                }
                if (layout==1 && global_settings.minimized){
                    socialtoolbar.minimize(); 
                }
                
                //IE hover fix
                jQuery(".shareContainer").click(function(){
					if (isMobile == 1) {
						jQuery("#socialToolbarInner .shareLeft .contentLeft").css('width', screen.width-2);
						jQuery("#socialToolbarInner .shareLeft .contentLeft").css('bottom', jQuery("#socialToolbarContainer").height()+45);
					}

                    jQuery(".shareRight .contentLeft").toggle();
                    jQuery(".shareLeft .contentLeft").toggle();
                    jQuery("#SocialToolbarActiveWindow").hide();
                });
                

	  
	}
	 
	 

	function maximize() {
            
            jQuery("#socialToolbarContainer").animate({bottom:"-100"},speed,function(){
                
                jQuery("#socialToolbarContainer").removeClass("clean");
                jQuery("div.contentLeft").removeClass("clean");
                jQuery("div.contentRight").removeClass("clean");
                jQuery("span.shareContainer").removeClass("clean");
                jQuery("#socialToolbarInnerMin").css({bottom:"-100px"});
                jQuery("#socialToolbarInner").removeAttr('style');
                
                jQuery("#socialToolbarContainer").animate({bottom:"0"},speed,function(){
                     jQuery.cookie("socialToolbarMin", null, {path: '/'});
                });
            });
           
           
	}

	function minimize() {
            jQuery("#SocialToolbarActiveWindow").hide();
            closeShare();
            jQuery("#socialToolbarContainer").animate({bottom:"-100"},speed,function(){
                jQuery("#socialToolbarContainer").addClass("clean");
                jQuery("div.contentLeft").addClass("clean");
                jQuery("div.contentRight").addClass("clean");
                jQuery("span.shareContainer").addClass("clean");
                jQuery("#socialToolbarInner").css({bottom:"-100px"});
				jQuery("#socialToolbarInnerMin").css({bottom:"-5px"});
				if (isMobile == 1) {
					jQuery("#socialToolbarInnerMin").css({bottom:"10px"});
				}
                jQuery("#socialToolbarContainer").animate({bottom:"0"},speed,function(){
                     jQuery.cookie("socialToolbarMin", "1", {path: '/'});
                });
            });
            
           
	}
	 
	// build the toolbar
	function build_content() {
            var layout = global_settings.layout;
            var content,left,right;

            left  = '<div class="contentLeft">'+ build_left_content() +'</div>';

			if (isMobile == 1 && layout == 1) {
				right = '<div class="contentRight mobileRight icons-middle"><div class="icons">'+ build_right_content() +'</div></div>';
			} else if (layout == 1 && global_settings.toolbar_label ) {
				right = '<div class="contentRight"><span class="labelRightContent">'+socialToolbarSettings.labelRightContent+'</span>'+ build_right_content() +'</div>';
			} else {
				right = '<div class="contentRight">'+ build_right_content() +'</div>';
			}

            //Layout 1 - Default (Horizontal) - issue with getting the share label to load from the text/translate database on other sites
            if (layout == 1){
				if(isMobile == 1){
					content = '<div class="shareLeft"><span class="shareContainer">[+]</span>'+left+'</div>'+right;
				} else if (global_settings.share_tooltip == 1 || isTablet == 1 || screen.width <= 480) {
					content = '<div class="shareLeft"><span class="shareContainer">[+]&nbsp;&nbsp;'+socialToolbarSettings.shareLabelHorizontal+'</span>'+left+'</div>'+right;
				} else {
					content = left+right;
				}
			} else {
				if (isMobile == 1) {
					content = right+'<div class="shareRight"><span class="shareContainer">[+]</span>'+left+'</div>';
				} else{
					content = right+'<div class="shareRight"><span class="shareContainer">[+]&nbsp;&nbsp;'+socialToolbarSettings.shareLabelVertical+'</span>'+left+'</div>';            		
				}
			}

			return content;
	}
	
	// function that's building left side of the toolbar
	function build_left_content() {

            var buttons_content='';
            // extract data from json
            var obj = eval("(" + global_data['data_left'] + ")");

            //add label
             if (global_settings.layout==1 && global_settings.toolbar_label && global_settings.share_tooltip != 1 && isMobile != 1){
                buttons_content = '<li class="labelLeftContent">'+socialToolbarSettings.labelLeftContent+'</li>';
             }
            
            if (global_settings.recommend_email==1) buttons_content += '<li class="mailButton" id="social_toolbar_mail_button"><a href="#" onclick="{socialtoolbar.mail_win_init(this); return false;}"><img src="'+global_settings.module_path+'/themes/default/images/sm_ico_0.png" border="0" /></a></li>';

            var x, i = left_buttons.length, buttonsContent = new Array(i);
            while(i--) {
                    x='recommend_'+i;
                    // check if button is enabled
                    if (obj[x]==1)
                            buttonsContent[i] = '<li class="leftButton '+left_label[i]+'">'+left_buttons[i]+'</li>';
            }

            var content = '<ul>'+buttons_content + buttonsContent.join("")+'</ul>';
	   return  content;

	}	

	
	function build_right_content() {

            var layout = global_settings.layout;
            var right_content = '';

            // convert settings into object
            var obj = eval("(" + global_data['data_right'] + ")");
            var onlyIcons = "",iconPreset = "";

            if (global_settings.only_icons == 1){
                onlyIcons = " only-icons";
            }
            //if right side display uses labels, turn on tooltip for left side share tool
           //Change the icons preset
             switch(parseInt(global_settings.icon_preset)){
               case 1:
                   iconPreset = "";
               break;
               case 2:
                   iconPreset = "circle";
               break;
               case 3:
                   iconPreset = "flat";
               break;
               default:
                   iconPreset = "";
               break;
               
            }

           
            var i=0;	
            for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                                    i++; 
                                    if (obj[key].enabled==1)  {
                                            json_settings = JSON.stringify(obj[key]); // window settings in json format
                                            json_settings=encodeURIComponent(json_settings);

                                            //Layout 1 - Default (Horizontal)
                                            if (layout == 1){
												right_content=right_content+'<div class="socialToolbarButtonRight '+iconPreset+'"><a href="#" onclick="{socialtoolbar.win_init_'+i+'(\''+json_settings+'\',this); return false;}" id=social_toolbar_win_open_'+i+'><span class="stdButton'+onlyIcons+'"><b class="'+key.toLowerCase()+'" ></b>'+'<span class="icon_name">'+key+'</span></span></a></div>'; 
                                            }else{
                                                right_content += '<div class="socialToolbarButtonRight '+iconPreset+'"><a href="#" onclick="{socialtoolbar.win_init_'+i+'(\''+json_settings+'\',this); return false;}" id=social_toolbar_win_open_'+i+'><span class="stdButton'+onlyIcons+'"><b class="'+key.toLowerCase()+'" ></b></span></a></div>'; 

           
                                            }
                                    }	
                    }
            }

            return right_content+'<div class="socialToolbarControl"><a href="#" onclick="{socialtoolbar.minimize(); return false;}"  title="Minimize" id="social_toolbar_minimize"><span class="icon">&nbsp;</span></a></div>';
	}





	// open a single window
	// params: margin - in % - horizontal position of the window, margin_pos - left or right
	function win_open(win_id, win_title,content,win_width,win_height,element) {
            
            var innerId;
            var elementClass = jQuery(element).find("b").attr("class");
            
            //if already open, close the last one
            if (jQuery(element).parent().attr("id") !=  "social_toolbar_mail_button")
                closeShare();
            
            if (jQuery("#SocialToolbarActiveWindow").css("display") == "block" && 
                lastWindow != elementClass){
                jQuery("#SocialToolbarActiveWindow").hide();
            }
            
            //if is horizontal and extended, change the id
            if ( global_settings.layout == 1 && global_settings.extend == 1)
                  innerId = "#socialToolbarHolder";
                 else
                  innerId = "#socialToolbarContainer";
            
           
            //if the window already created, just update the content
            if (jQuery("#SocialToolbarActiveWindow").length > 0) { 
                jQuery("#SocialToolbarActiveWindow").css('width',win_width);
                jQuery("#SocialToolbarActiveWindow").css('height',win_height);
         
                jQuery("#SocialToolbarActiveWindow #SocialToolbarActiveWindowInner").html(content);
            }else{//if not, create it
               jQuery(innerId).append('<div id="SocialToolbarActiveWindow" style="width:'+win_width+'px;height:'+win_height+'px;">' +
                        '<div class="inner_window" id="SocialToolbarActiveWindowInner">'+content+'</div>' +
                '</div>');

            }
            
            var display = jQuery("#SocialToolbarActiveWindow").css("display");
            //if is the email windows, fix his position
            if (global_settings.layout == 1  && 
            jQuery(element).parent().attr("id") ==  "social_toolbar_mail_button"){
				//Add new ones
				jQuery("#SocialToolbarActiveWindow").css('right','auto');
				jQuery("#SocialToolbarActiveWindow").css('left',0);
				//jQuery("#SocialToolbarActiveWindow").css("display","none");
				jQuery("#SocialToolbarActiveWindow").css("display", display);
				if (global_settings.share_tooltip == 1 || isMobile == 1 || isTablet == 1) {
					jQuery("#SocialToolbarActiveWindow").css('bottom',jQuery(".contentLeft").height()*2+10);
				}

			} else {
                //Clean styles
				jQuery("#SocialToolbarActiveWindow").removeAttr("style");
				jQuery("#SocialToolbarActiveWindow").css("display", display);
				jQuery("#SocialToolbarActiveWindow").css('width',win_width);
				jQuery("#SocialToolbarActiveWindow").css('height',win_height);
			}

            //Tripadvisor Fix
            if ( elementClass == "tripadvisor"){
                jQuery("#SocialToolbarActiveWindowInner").css({'height':win_height+'px','overflow-y':'scroll'}); 
            }else{
                jQuery("#SocialToolbarActiveWindowInner").removeAttr("style");
            }
            
            
            //Store last windows call
            lastWindow = elementClass;

            //jQuery("#SocialToolbarActiveWindow").animate({bottom:"43"}).animate({bottom:"40" }) ;
            
            //close window when a mouse click is performed outside container
            jQuery(document).mouseup(function (e){if (jQuery(innerId).has(e.target).length === 0){socialtoolbar.win_close(); jQuery(".shareLeft .contentLeft").hide(); jQuery(".shareRight .contentLeft").hide();}});
            jQuery("#SocialToolbarActiveWindow").slideToggle(250, function(){});
            
            //add shadow for IE compatibility
            if (window.PIE) {
                    jQuery('#SocialToolbarActiveWindow').each(function() {
                            PIE.attach(this);
                    });
            }

	}
		
	
	// function responsible for closing all windows
	function win_close() {
		if (jQuery("#SocialToolbarActiveWindow").length > 0) { 
			jQuery("#SocialToolbarActiveWindow").fadeOut(function(){
				jQuery('#SocialToolbarActiveWindow').remove();
                                closeShare();
			});
	 
		}
	}
       
       function closeShare(){
             if (jQuery(".shareRight .contentLeft").css('display') == 'block')
                 jQuery(".shareRight .contentLeft").hide();
             
             if (jQuery(".shareLeft .contentLeft").css('display') == 'block') 
                 jQuery(".shareLeft .contentLeft").hide();
        }
		
// Define functions responsible for windows content

    // Facebook window
	function win_init_1(json_settings,element) {
		// extract data from json
		var obj = eval("(" + decodeURIComponent(json_settings) + ")");

                var displayType = "";
                switch(parseInt(global_settings.fb_type)){
                    case 1: // Show Stream
                        displayType = "show_faces=false&amp;stream=true";
                    break;
                    case 2: // Show Faces
                       displayType = "show_faces=true&amp;stream=false";
                    break;
                    default: // Show Stream
                       displayType = "show_faces=false&amp;stream=true";
                    break;
                }
                
		if (obj.enabled==1) {

               var content = '<iframe id="smo-facebook2" src="//www.facebook.com/plugins/likebox.php?href='+encodeURIComponent(obj.url)+'&amp;'+displayType+'&amp;header=false" scrolling="no" frameborder="0" style="border:none; overflow:hidden;" allowTransparency="false"></iframe>';
		       win_open(1,'Facebook',content,element);
		}
		
	}

	// Twitter window
	function win_init_2(json_settings,element) {
		// extract data from json
		//var w = 280,h=240;
		var tweets_links = '#07aeeb';
		var obj = eval("(" + decodeURIComponent(json_settings) + ")");
		
		var username = obj.username;
		
		if ( username != undefined) username= username.replace('@','');
		


		if (obj.enabled==1) {
   			var content = '<iframe id="smo-twitter" scrolling="no" frameborder="0" src="'+global_settings.module_path+'/helpers/twitter.php?username='+username+'&tweets_links='+tweets_links+'"></iframe> ';             
			win_open(2,'Twitter',content,element);
		}
	}

	// Youtube window
	function win_init_3(json_settings,element) {
                var video_id;
		// extract data from json
		var obj = eval("(" + decodeURIComponent(json_settings) + ")");
	 
		if (obj.enabled==1) {
		
			// format url
			var url_pattern=/http:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9-_\+]+)/gi;
			if (obj.url.match(url_pattern)==null) { // url in incorrect format
				
				var url_pattern=/youtube\.com\/watch\?v=([a-zA-Z0-9-_\+]+)/i;
				var matches = obj.url.match(url_pattern);
				if (matches!=null) {
					obj.url='http://www.youtube.com/embed/'+matches[1];
                                        video_id = matches[1];
				}
				else {
			 
					var url_pattern=/youtu\.be\/([a-zA-Z0-9-_\+]+)/i;
					var matches = obj.url.match(url_pattern);
					if (matches!=null) {
						obj.url='http://www.youtube.com/embed/'+matches[1];
                                                video_id = matches[1];
					}
				}
			
			}
			//#18163 : SM Toolbar - youTube video doesnt work in Chrome & IE
			if ( screen.width >= 600) {
				var content = '<iframe id="ytplayer" type="text/html" width="560" height="315" src="https://www.youtube.com/embed/'+video_id+'" frameborder="0"></iframe>';
				win_open(3,'Video',content,560, 320,element);
			}
			if ( screen.width <= 599) {
				var content = '<iframe id="ytplayer" type="text/html" width="230" height="205" src="https://www.youtube.com/embed/'+video_id+'" frameborder="0"></iframe>';
				win_open(3,'Video',content,230, 210, element);
			}
		}
	}
	
	// GooglePlus window
    function win_init_4(json_settings,element) {
        // extract data from json
        var obj = eval("(" + decodeURIComponent(json_settings) + ")");
        //var w = 280,h=240;
        var googleid = obj.googleid;
        var googleapikey = obj.googleapikey;
        if (obj.enabled==1) {
           var content = '<iframe id="smo-googleplus" scrolling="overflow-y" frameborder="0" src="'+global_settings.module_path+'/helpers/googleplus.php?googleid='+googleid+'&googleapikey='+googleapikey+'"></iframe> ';
            } else {
                var content ='Error: Incorrect profile URL';
            }
                       
            win_open(4,'GooglePlus',content,element);
                        

	}

    // Instagram window
    function win_init_5(json_settings,element) {
        // extract data from json
        var obj = eval("(" + decodeURIComponent(json_settings) + ")");
        //var w = 280,h=240;
        var userid = obj.userid;
		var accesstoken = obj.accesstoken;
		var clientid = obj.clientid;
        if (obj.enabled==1) {
           var content = '<iframe id="smo-instagram" scrolling="overflow-y" frameborder="0" src="'+global_settings.module_path+'/helpers/instagram.php?userid='+userid+'&clientid='+clientid+'&accesstoken='+accesstoken+'"></iframe> ';
            } else {
                var content ='Error: Incorrect profile URL';
            }
                       
            win_open(5,'Instagram',content,element);
    }

    // Tumblr window
    function win_init_6(json_settings,element) {
        // extract data from json
         var obj = eval("(" + decodeURIComponent(json_settings) + ")");
        //var w = 280,h=240;
        var tumblracct = obj.tumblracct;
        var tumblrapikey = obj.tumblrapikey;
        if (obj.enabled==1) {
                var content = '<iframe id="smo-tumblr" scrolling="overflow-y" frameborder="0" src="'+global_settings.module_path+'/helpers/tumblr.php?tumblracct='+tumblracct+'&tumblrapikey='+tumblrapikey+'"></iframe> ';
                 
            } else {
                var content ='Error: Incorrect profile URL';
            }
                       
            win_open(6,'Tumblr',content,element);
                        
    }
     // Tripadvisor window
    function win_init_7(json_settings,element) {
        // extract data from json
        var obj = eval("(" + decodeURIComponent(json_settings) + ")");
                //var w = 280, h = 240;
        if (obj.enabled==1) {
             
            var url_pattern=/http:\/\/www\.tripadvisor\.[a-zA-Z\.]+\/[a-zA-Z0-9-_\+]+-d([0-9]+)/i;
            var matches =obj.url.match(url_pattern);
            if (matches!=null) {
                var tripadvisor_id=matches[1];
                var content = '<iframe id="smo-tripadvisor1" scrolling="overflow-y" frameborder="0" src="'+global_settings.module_path+'/helpers/tripadvisor.php?id='+tripadvisor_id+'"></iframe> ';
                 
            } else {
                var content ='Error: Incorrect profile URL';
            }
                       
            win_open(7,'Tripadvisor',content,element);
                        
        }
    }
	// function initializing "email to a friend" window
	function mail_win_init( element ) {
		var w= 360, h=440;
		if ( screen.width <= 599) {
			w= 240; h=250;
		}
        var metaDescription = jQuery("meta[name=description]").attr("content");
        var fontColor = global_settings.fontColor;
                
		var content= '<div class="socialCloseButton" ><a onclick="socialtoolbar.win_close();">'+socialToolbarSettings.closeButton+'</a></div>';
                    
                content +='<iframe id="iframe_mail" scrolling="overflow-y" frameborder="0" width="'+w+'" height="'+h+'" src="'+global_settings.module_path+'/helpers/send_email.php?title='+encodeURI(document.title)+'&color='+global_settings.color+'&path='+global_settings.module_path+'&description='+metaDescription+'&&fColor='+fontColor+'&url='+encodeURI(document.URL)+'"></iframe>';
		win_open(0,'Email A Friend',content,w+20, h,element);
		
                if (global_settings.layout != 1 ){
                    jQuery("#socialToolbarContainer .inner_toolbar .shareRight .contentLeft").hide();
                }
                
	}

	
	return { // public methods
			toolbar_init: toolbar_init,
			
			mail_win_init: mail_win_init,		
			win_init_1: win_init_1,
			win_init_2: win_init_2,
			win_init_3: win_init_3,
			win_init_4: win_init_4,
			win_init_5: win_init_5,
            win_init_6: win_init_6,
            win_init_7: win_init_7,
			maximize: maximize,
			minimize: minimize,
	 
			win_close: win_close
		};

})();
 