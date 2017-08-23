/*  This file is an architectural nightmare!  The variables below are
 *  in the gobal scope and hence can't be relied on to represent any one
 *  particular image over time (or even at a given time, for that matter).
 *  They need to be encapsulated properly, and passed around as arguments
 *  to the various functions here which use them.  It's probably quite
 *  straightforward to recode this, when somebody has time.  OOP FTW!
 */
var baseImageObj;                               //The crop that was first clicked to switch
var imageSwitchTargetImage      = false;		//The particular crop we are switching at the moment
var imageSwitchTargetMethod     = false;    	//The method we are using to switch the image (scale/crop) - we do only crops!
var imageSwitchSourceImage      = new Object;   //Information about the source image, not a real dom node
var imageSwitchEditImage        = false;    	//The  image we are using to show the editing process
var imageSwitchCurrentScale     = 0;			//The scale of the image we are editng at the moment 0 - 100
var imageSwitchCurrentMoveDirection = false;    //If a user clicked a button, which way to move the image
var imageSwitchCurrentMovePixels = 1;			//How many pixels we move the image when the user holds don a direction button
var imageSwitchCancelCustomFunction = null;     //Add a custom function when the cancel button is pressed
var imageSwitchAfterCropCustomFunction = null;  //Add a custom function when after the image is cropped
var imageAltTexts = []; 						//Alt text array for images
var altTextRequired = false; 					//Option to make alt text required
var imageListDialogObj; 						//Copy of alt text popup box object when gets opened

var oH,oW;										// These Store the Original Height & Width of Target Image
var zoomScaler = 0;								// This is a scaler used for ZOOM functionlity
var flagEnableOut,flagEnableIn = false;
//Steps 

/* Preview the image about to be switched */
function mediaManagerStep_imageSwitchPreview()
{
	dojo.byId('imageSwitchPreviewScreen').style.visibility = 'visible';
	dojo.byId('imageSwitchPreviewImageHolder').innerHTML = '<img src="' + imageSwitchTargetImage.editSrc + '?refresh=' + Math.random() + '" style="height:' + imageSwitchTargetImage.editHeight + 'px;width:' + imageSwitchTargetImage.editWidth + 'px;" />';
}


/* Crop an image */
function mediaManagerStep_imageCrop()
{
	dojo.byId('imageCropScreen').style.visibility		   = 'visible';
}

//Methods

//SmartQ #2163: Show a crops screen which allows the user to manipulate
// both parent and thumb crops of a parent-thumb editable image.
function showCropsScreen() {
        var widget = dijit.byId("imageCropsList");
        if (widget) {
            widget.destroy();
            widget = null;
        }
        var imageCropsList = condor.popSocketDialog(
            'imageCropsList', //widgetId
            'Edit Image Cropped Versions', //window title
            'imageSwitch', //module 
            'imageCropsList', //socket
            {
                src: imageSwitchTargetImage.src,
                width: parseInt(imageSwitchTargetImage.width),
                height: parseInt(imageSwitchTargetImage.height),
                parentSrc: imageSwitchTargetImage.parentSrc,
                parentWidth: parseInt(imageSwitchTargetImage.parentWidth),
                parentHeight: parseInt(imageSwitchTargetImage.parentHeight),
				alt: imageSwitchTargetImage.alt // passed alt parameter to socket and widget
            }, //GET vars as object
            760,         //window width
            500        //window height
        );
        dojo.connect(imageCropsList, "onLoad", function() {
            //[Anton says: sigh. If switching to Edit Mode loaded a stylesheet instead of manually
            // restyling elements, it wouldn't be necessary to rerun the manual restyling for
            // content returned by sockets.
            //
            //Hide anything with the class .showInViewMode
            //And show anything with the class .showInEditMode - in particular show the alt text icons
            dojo.query(".showInViewMode").style("display","none");
            dojo.query(".showInEditMode").style("display","block");
        });
        //When the crops screen is closed, refresh the image thumb on the page if it needs
        // updating due to having been changed inside the screen.
        //
        //[Anton says: given the slowness of the socket call that determines whether an update is
        // needed, it's tempting to perform the update regardless of it being necessary.  That
        // would only make sense if there's no "updating" message or similar, of course.  I decided
        // not to take that approach though, since I think having the message is good UX.]
        //
        //[Anton says: it would be nicer if the popup could listen to the status changes of its
        // contents and could pass that info back to here instead of us needing to do a
        // socket call now to find out.  Or even better, if the on-page crop were the same
        // programmatic object as the corresponding crop in the crop list, then refreshing the
        // one in the crop list would cause the one on the page to refresh at the same time.
        // OOP FTW!  I didn't have time to make that improvement though.]
        dojo.connect(imageCropsList, "onCancel", function(){
        dojo.xhrPost({
                url: prepSocketCall('imageSwitch', 'imageUrlIsStale'),
                method: "POST",
                handleAs: "json",
                content: {
                    imageUrl: baseImageObj.src
                },
                load: function(response) {
                    if (response.result == 'success') {
                        if (response.isStale == 1) {
                            var popupMessageLoading = new condor.general.PopupMessage({message: 'Updating...'});
                            baseImageObj.refresh();
                            popupMessageLoading.close();
//***** [Anton thinks condor.refreshPendingItemsCounters(); is needed here, as per imageSwitchApplyCrop() function (below).  Though in any case, wouldn't it make more sense for refresh() to worry about keeping the counters up-to-date?
//*****  Actually, I don't think imageSwitchApplyCrop should be updating counters for parent images in parent-thumb situation where parent doesn't necessarily appear on the page.]
                        }
                    } else {
                        alert('Error encountered when trying to refresh the image. (Socket responded with \''+response.message+'\'.)');
                    }
                }
                ,error: function(type, error) {
                    alert('Error encountered when trying to refresh the image.  (Socket didn\'t respond.)');
                }
            });
        });
}


/* Image Switch Set Up */
function imageSwitch(imageObj, imageSwitchMethod)
{
	imageSwitchTargetMethod    = imageSwitchMethod; // Hey, we don't do scales, only crops
	imageSwitchTargetImage     = imageObj;
	
    var showCropsScreen = false; //for SmartQ#2163, don't open Crops Screen; open Media Manager's Image Preview screen instead

    //Configure the "target image" to be one of the crops corresponding to the imageObj:
    // in the case that the imageObj has two corresponding crops (thumb and parent), the
    // target image is the parent (since it's the parent that the user modifies and then
    // the thumb is generated automatically); otherwise, the target image is the unique
    // crop corresponding to the imageObj.
    if (imageSwitchTargetImage.parentSrc != "" && imageSwitchTargetImage.multiEdit=="true") {
		imageSwitchTargetImage.editWidth  = parseInt(imageSwitchTargetImage.parentWidth);
		imageSwitchTargetImage.editHeight = parseInt(imageSwitchTargetImage.parentHeight);
		imageSwitchTargetImage.editSrc    = imageSwitchTargetImage.parentSrc;
		
		imageSwitchTargetImage.thumbWidth    = imageSwitchTargetImage.width;
		imageSwitchTargetImage.thumbHeight    = imageSwitchTargetImage.height;
		imageSwitchTargetImage.createThumb    = 1;

        //(SmartQ #2163) We want to show crops screen if the thumb is not a placeholder,
        // which, in a parent-thumb situation, is equivalent to the thumb having a
        // corresponding known master image
        var cropsListShowing = !!dijit.byId("imageCropsList");
        if (!cropsListShowing && imageSwitchTargetImage.hasMaster=="true") {
            showCropsScreen = true;
        }
        /* Anton notes:
         *  baseImageObj is the argument to this function; it's the image that was
         *  clicked that resulted in the crops screen to be shown. It's needed in
         *  the showCropsScreen function above, where imageSwitchTargetImage cannot
         *  be used as things currently stand because it lies in the global scope
         *  and thus gets modified (by this current function) to represent one of
         *  the crops in the crop screen as soon as that crop is clicked.
         *  See comment at the top of this file.
         */
        baseImageObj = imageObj;
    } else {
		/*
		* Getting Width & Height of the target image using present Image Object & assigning the same
		* to SwichTargetImage.
		*/
		imageSwitchTargetImage.width = parseInt(imageObj.containerNode.style.width);
		imageSwitchTargetImage.height = parseInt(imageObj.containerNode.style.height);
		
		imageSwitchTargetImage.editWidth  = parseInt(imageSwitchTargetImage.width);
		imageSwitchTargetImage.editHeight = parseInt(imageSwitchTargetImage.height);
		imageSwitchTargetImage.editSrc    = imageSwitchTargetImage.src;
		
		imageSwitchTargetImage.thumbWidth    = 0;
		imageSwitchTargetImage.thumbHeight    = 0;
		imageSwitchTargetImage.createThumb    = 0;
    }
	
	if(imageSwitchTargetImage.editHeight > 500){
		flagEnableIn = true;
		document.getElementById('zoomInOut').style.display="block";
		document.getElementById('imageSwitchSliderBox').style.display="none";		
	}else{
		flagEnableIn = false;
		flagEnableOut = false;
		document.getElementById('zoomInOut').style.display="none";
		document.getElementById('imageSwitchSliderBox').style.display="block";
	}
	
    if (showCropsScreen) {
        this.showCropsScreen();
    } else {
		showMediaManager();
	    //Show the "target image" in the preview screen:
		mediaManagerStep('imageSwitchPreview');

		dojo.connect(mediaManagerBox, "minimizeWindow", function(){
			imageSwitchCancel();
		});


		mediaManagerOnLoadFiles = function(previews)
		{
			//Filter out all of the previews that are too small
			for (var i = 0; i < previews.length; i ++)
			{
				preview = previews[i];
				imageSwitchCheckPreview(preview);
			}
		}

		mediaManagerOnAddPreview = function(preview)
		{
			imageSwitchCheckPreview(preview);
		}

		mediaManagerOnSelectPreview = function(preview)
		{
			var itemType = preview.getAttribute('itemType');
			
			if (itemType == 'image')
			{
				mediaManagerAddOption('Select Image', condor.condorBaseHREF + 'modules/mediaManager/images/button.goNext.jpg', 'zoomScaler=0;oH=imageSwitchTargetImage.editHeight;oW=imageSwitchTargetImage.editWidth;imageSwitchBeginCrop()');
			}
		}

		//selectOriginalMediaFile(imageSwitchTargetImage.editSrc);

		if(mediaManagerSelectedPreview)
		{
			mediaManagerSelectPreview(mediaManagerSelectedPreview);
		}


		//SET UP THE IMAGE MANIPULATION SCREEN

		dijit.byId('imageSwitchSlider').setValue(0);

		//This lets you drag the control box arround	
		var controls = new dojo.dnd.Moveable("imageCropControlBox", {handle: "imageSwitchContolBoxHeader"});

		var mouseHandler = new dojo.dnd.Moveable("imageCropImageMouseHandler");

		dojo.connect(mouseHandler, 'onMoveStart', function(mover){
			dojo.byId('imageCropImageHolder').style.display = 'none';
			mouseHandler.node.className  = 'showImageCropImageMouseHandler';
			dojo.byId('imageCropBlockTop').className    = "imageSwitchBlockImageMoving";
			dojo.byId('imageCropBlockLeft').className   = "imageSwitchBlockImageMoving";
			dojo.byId('imageCropBlockRight').className  = "imageSwitchBlockImageMoving";
			dojo.byId('imageCropBlockBottom').className = "imageSwitchBlockImageMoving";
		});

		dojo.connect(mouseHandler, 'onMoveStop', function(mover){
			mouseHandler.node.className 		= 'hideImageCropImageMouseHandler';
			dojo.byId('imageCropImageHolder').style.display = 'block';
			imageSwitchSetImageToMouseHandler();
			imageSwitchKeepInBox();
			dojo.byId('imageCropBlockTop').className    = "imageSwitchBlockImageStatic";
			dojo.byId('imageCropBlockLeft').className   = "imageSwitchBlockImageStatic";
			dojo.byId('imageCropBlockRight').className  = "imageSwitchBlockImageStatic";
			dojo.byId('imageCropBlockBottom').className = "imageSwitchBlockImageStatic";
		});
    }
}


function imageSwitchEditAltText(id)
{
	condor.popTaskWindow('editAltText', 'Edit alt text', 'imageSwitch', 'editItem',{item: id} , 800, 400)
}

function imageSwitchSetImageToMouseHandler()
{
	var imageMouseHandler 		  			= dojo.byId('imageCropImageMouseHandler');

	imageSwitchEditImage.style.left  		= imageMouseHandler.offsetLeft 	+ 'px';
	imageSwitchEditImage.style.top   		= imageMouseHandler.offsetTop  	+ 'px';
}


function imageSwitchBeginCrop()
{
	//Go to the crop screen
	mediaManagerStep('imageCrop');
		
	//Set the current preview as our source image
	imageSwitchSourceImage.src    = mediaManagerSelectedPreview.getAttribute('imageSrc');
	imageSwitchSourceImage.height = mediaManagerSelectedPreview.getAttribute('imageHeight');
	imageSwitchSourceImage.width  = mediaManagerSelectedPreview.getAttribute('imageWidth');

	// set the original size as the edit size if none specified
	imageSwitchTargetImage.editHeight = imageSwitchTargetImage.editHeight || imageSwitchSourceImage.height;
	imageSwitchTargetImage.editWidth = imageSwitchTargetImage.editWidth || imageSwitchSourceImage.width;
	
	dojo.byId('imageCropImageHolder').innerHTML = '<img id="imageSwitchEditImage" src="' + imageSwitchSourceImage.src + '" />';
	dojo.byId('imageCropImageMouseHandler').innerHTML = '<img src="' + imageSwitchSourceImage.src + '" width="100%" height="100%" />';
	
	imageSwitchEditImage = dojo.byId('imageSwitchEditImage');			

	imageSwitchDrawCropBox();
	imageSwitchScaleImage(0);
   
	/* Center the image */
	var cropBox 				  = dojo.byId('imageCropBox');
	imageSwitchEditImage.style.top  = imageSwitchEditImage.offsetTop  + ((cropBox.offsetTop - imageSwitchEditImage.offsetTop) / 2) + 'px';
	imageSwitchEditImage.style.left = imageSwitchEditImage.offsetLeft + ((cropBox.offsetLeft - imageSwitchEditImage.offsetLeft) / 2) + 'px';
	imageSwitchSetMouseHandler();
	
	// display Next button and hide Go button in image crop box
	dojo.byId('imageSwitchAltTextApprove').style.display = "block";
	dojo.byId('imageSwitchApprove').style.display = "none";
	dojo.byId('imageReviewAltText').style.display = "none";

}


/* scale is 0 to 100, 0 being the smallest possible image size, 100 being the full size of the source image */
function imageSwitchScaleImage(scale)
{
	if(imageSwitchEditImage == false)
	{
		return;
	}
	
	imageSwitchCurrentScale = scale;
	
	//Note the prvious height and width of the image we are editing
	var origHeight       = imageSwitchEditImage.height;
	var origWidth        = imageSwitchEditImage.width;
	
	var widthRatio       = imageSwitchSourceImage.width  / imageSwitchTargetImage.editWidth;
	var heightRatio      = imageSwitchSourceImage.height / imageSwitchTargetImage.editHeight;
	
	var minRatio         = (widthRatio < heightRatio) ? widthRatio : heightRatio;
	
	imageSwitchEditImage.style.width  = Math.round(imageSwitchSourceImage.width  - ((imageSwitchSourceImage.width - (imageSwitchSourceImage.width   / minRatio))  * (100 - scale) / 100)) + 'px';   
	imageSwitchEditImage.style.height = Math.round(imageSwitchSourceImage.height - ((imageSwitchSourceImage.height - (imageSwitchSourceImage.height  / minRatio))  * (100 - scale) / 100)) + 'px'; 
	imageSwitchEditImage.width  	  = Math.round(imageSwitchSourceImage.width  - ((imageSwitchSourceImage.width - (imageSwitchSourceImage.width   / minRatio))  * (100 - scale) / 100));   
	imageSwitchEditImage.height       = Math.round(imageSwitchSourceImage.height - ((imageSwitchSourceImage.height - (imageSwitchSourceImage.height  / minRatio))  * (100 - scale) / 100)); 
	imageSwitchEditImage.style.top    = imageSwitchEditImage.offsetTop   + (origHeight - imageSwitchEditImage.height) / 2 + 'px';
	imageSwitchEditImage.style.left   = imageSwitchEditImage.offsetLeft  + (origWidth  - imageSwitchEditImage.width)  / 2 + 'px';
	
	imageSwitchKeepInBox();
}	

function imageSwitchSetMouseHandler()
{	
	/* Position the mouse handler */
	var imageMouseHandler 		  	= dojo.byId('imageCropImageMouseHandler');
	imageMouseHandler.style.left  	= imageSwitchEditImage.offsetLeft 	+ 'px';
	imageMouseHandler.style.top   	= imageSwitchEditImage.offsetTop  	+ 'px';
	imageMouseHandler.style.width 	= imageSwitchEditImage.offsetWidth  + 'px';
	imageMouseHandler.style.height  = imageSwitchEditImage.offsetHeight + 'px';
}

/* Move the edit image */

function imageSwitchMove()
{

	if(imageSwitchCurrentMoveDirection)
	{
		switch(imageSwitchCurrentMoveDirection)
		{
			case 'up':imageSwitchEditImage.style.top = imageSwitchEditImage.offsetTop + imageSwitchCurrentMovePixels + 'px';break;
			case 'down':imageSwitchEditImage.style.top = imageSwitchEditImage.offsetTop - imageSwitchCurrentMovePixels + 'px';break;
			case 'left':imageSwitchEditImage.style.left = imageSwitchEditImage.offsetLeft + imageSwitchCurrentMovePixels + 'px';break;
			case 'right':imageSwitchEditImage.style.left = imageSwitchEditImage.offsetLeft - imageSwitchCurrentMovePixels + 'px';break;
			
		}
		
		imageSwitchKeepInBox();
		setTimeout('imageSwitchMove()', 40);
		
		/* Make it move faster if someone holds the button down */
		imageSwitchCurrentMovePixels += 3;
	}
}

/* Begin the image moving */
function imageSwitchStartMove(dir)
{
	imageSwitchCurrentMoveDirection = dir;
	setTimeout('imageSwitchMove()', 40);
	imageSwitchCurrentMovePixels = 1;	
}

/* End the image moving */
function imageSwitchEndMove(dir)
{
	imageSwitchCurrentMoveDirection = false;
}

/* Keep the edit image in the box */
function imageSwitchKeepInBox()
{
	var cropBox 				  = dojo.byId('imageCropBox');

	if(imageSwitchEditImage.offsetLeft > cropBox.offsetLeft)
	{
		imageSwitchEditImage.style.left =  cropBox.offsetLeft + 'px';
	} 
	
	if(imageSwitchEditImage.offsetTop > cropBox.offsetTop)
	{
		imageSwitchEditImage.style.top = cropBox.offsetTop + 'px';
	} 
	
	var rightSide  = imageSwitchEditImage.offsetLeft + imageSwitchEditImage.offsetWidth;
	var rightLimit = cropBox.offsetWidth + cropBox.offsetLeft;
	
	if(rightSide < rightLimit)
	{
		imageSwitchEditImage.style.left =  imageSwitchEditImage.offsetLeft + rightLimit - rightSide + 'px';
	} 
	
	var bottomSide  = imageSwitchEditImage.offsetTop + imageSwitchEditImage.offsetHeight;
	var bottomLimit = cropBox.offsetHeight + cropBox.offsetTop;
	
	if(bottomSide < bottomLimit)
	{
		imageSwitchEditImage.style.top =  imageSwitchEditImage.offsetTop + bottomLimit - bottomSide + 'px';
	}
	
	/* Move the mouse handler div to be in the same place as the image */
	imageSwitchSetMouseHandler();

}


/* Position all of the divs for switching */
function imageSwitchDrawCropBox()
{
	var cropScreen   		      = dojo.byId('imageCropScreen');
	var cropBlockTop 		      = dojo.byId('imageCropBlockTop');
	var cropBlockLeft 		      = dojo.byId('imageCropBlockLeft');
	var cropBlockRight 		      = dojo.byId('imageCropBlockRight');
	var cropBlockBottom 	      = dojo.byId('imageCropBlockBottom');
	var cropBox 				  = dojo.byId('imageCropBox');
	
/* START Fixed Bug #119 - Initialize all the below style attributes to empty */	
	cropBlockLeft.style.width 	  = '';
	cropBlockLeft.style.height    = '';
	cropBlockRight.style.width 	  = '';
	cropBlockRight.style.height   = '';
	cropBlockTop.style.height	  = '';
	cropBlockTop.style.width      = '';
	cropBlockTop.style.left		  = '';
	cropBlockBottom.style.height  = '';
	cropBlockBottom.style.width   = '';
	cropBlockBottom.style.left	  = '';
	cropBox.style.height          = '';
	cropBox.style.width           = '';
	cropBox.style.left            = '';
	cropBox.style.top             = '';
	/* END Fixed Bug #119 - Initialize all the below style attributes to empty */

	/* Size and position the blocking elements */
	
	if(zoomScaler > 0){
		cropBlockLeft.style.width 	  = '4px';
	}else{
		cropBlockLeft.style.width 	  = Math.floor((cropScreen.offsetWidth - imageSwitchTargetImage.editWidth) / 2) + 'px';
	}
	cropBlockLeft.style.height    = cropScreen.offsetHeight + 'px';
	cropBlockRight.style.width 	  = (cropScreen.offsetWidth - imageSwitchTargetImage.editWidth - cropBlockLeft.offsetWidth) + 'px';
	cropBlockRight.style.height   = cropScreen.offsetHeight + 'px';
	cropBlockTop.style.height	  = Math.floor((cropScreen.offsetHeight - imageSwitchTargetImage.editHeight) / 2) + 'px';
	cropBlockTop.style.width      = imageSwitchTargetImage.editWidth + 'px';
	cropBlockTop.style.left		  = cropBlockLeft.offsetWidth + 'px';
	cropBlockBottom.style.height  = (cropScreen.offsetHeight - imageSwitchTargetImage.editHeight - cropBlockTop.offsetHeight) + 'px';
	cropBlockBottom.style.width   = imageSwitchTargetImage.editWidth + 'px';
	cropBlockBottom.style.left	  = cropBlockLeft.offsetWidth + 'px';
	cropBox.style.height          = imageSwitchTargetImage.editHeight - 2 + 'px';
	cropBox.style.width           = imageSwitchTargetImage.editWidth - 2 + 'px';
	cropBox.style.left            = cropBlockLeft.offsetWidth  + 'px';
	cropBox.style.top             = cropBlockTop.offsetHeight  + 'px';
	
}


//See if the item is acceptable
function imageSwitchCheckPreview(preview)
{
	var itemType = preview.getAttribute('itemType');
			
	if(itemType == 'folder')
	{
		//Fine
	}
	else if (itemType == 'image') 
	{
		if(preview.getAttribute('imageHeight') < imageSwitchTargetImage.editHeight ||  preview.getAttribute('imageWidth') < imageSwitchTargetImage.editWidth)
		{
			preview.className = 'mediaManagerPreviewDisabled';
		}
		else	
		{
			preview.className = 'mediaManagerPreviewNormal';
		}
	}
	else
	{
		preview.className = 'mediaManagerPreviewDisabled';
	}
}

//Cancel Switching an image
function imageSwitchCancel()
{	
	//Allow for other events to happen on cancel.
	if(typeof(imageSwitchCancelCustomFunction) == 'function')
	{
		imageSwitchCancelCustomFunction();
	}
	else
	{
		with(mediaManagerBox.domNode.style){
	        left = '-1900px';
	    }	    
		//hideMediaManager();
		zoomScaler = 0;
		mediaManagerBox.hide();
	}
}


function imageSwitchApplyCrop()
{
	if (imageSwitchAfterCropCustomFunction) { 
		imageSwitchAfterCropCustomFunction();
	} else {
		hideMediaManager();
		var popupMessageSaving = new condor.general.PopupMessage({message: 'Saving...'});
	}

	if(zoomScaler > 0){
		if(imageSwitchTargetImage.editHeight < 500){
			zoomIn();
		}
		zoomScaler =0;
		flagEnableOut,flagEnableIn = false;
	}
	//Send a request for content
	var socketVars = new Object
	dojo.xhrPost({
		url: prepSocketCall('imageSwitch', 'imageCropAndScale', socketVars)
		,content: {
			method					: 'crop',

			newWidth				: imageSwitchTargetImage.editWidth,
			newHeight				: imageSwitchTargetImage.editHeight,

			oldWidth				: imageSwitchSourceImage.width,
			oldHeight				: imageSwitchSourceImage.height,

			thumbWidth				: imageSwitchTargetImage.width,
			thumbHeight				: imageSwitchTargetImage.height,
			createThumb				: imageSwitchTargetImage.createThumb,

			sourceImage				: imageSwitchSourceImage.src,
			targetImage				: imageSwitchTargetImage.editSrc,
			targetThumbImage		: imageSwitchTargetImage.src,

			offsetTop				: dojo.byId('imageCropBlockTop').offsetHeight - imageSwitchEditImage.offsetTop,
			offsetLeft				: dojo.byId('imageCropBlockLeft').offsetWidth - imageSwitchEditImage.offsetLeft,

			oldWidthChanged			: imageSwitchEditImage.width,
			oldHeightChanged		: imageSwitchEditImage.height,
			
			imageAltText			: imageSwitchTargetImage.alt,		// parameter passed to socket for current page language alt text
			allLangAltText			: JSON.stringify(imageAltTexts),	// passed alt text in all languages to socket
		}
		,handleAs: "json"
		,load: function(response) {
			if(response.success == 1) {
				imageSwitchTargetImage.hasMaster = "true";
				imageSwitchTargetImage.refresh();
				if (imageSwitchTargetImage.parentSrc != "" && imageSwitchTargetImage.multiEdit=="true") {
					showCropsScreen();
				}
			} else {
				alert('There was an error cropping the image');
			}
		}
		,error: function(type, error) {
			alert('There was an error and the image could not be cropped properly.');
		}
		,handle: function() {
			if (popupMessageSaving) {
				popupMessageSaving.close();
			}
			condor.refreshPendingItemsCounters();
		}
	});
}


/**
 * Approves the image
 */
function imageSwitchApprove(imageWidget)
{
    /**
     * [Anton says: I don't believe the condition below is ever true, that
     * is, that the codebase ever calls this function with an empty/null
     * imageWidget. Indeed, the only place I can locate which calls this
     * function at all is /condor/js/dojosource/condor/mediaManager/EditImageMenuOptions.js
     */
	if (!imageWidget) {
		imageWidget = imageSwitchTargetImage;
	}

    var imageUrl = imageWidget.src;
    var thumbUrl = null;

	dojo.xhrPost({
		url: prepSocketCall('imageSwitch', 'approve'),
		
		content: {
			imageUrl: imageUrl,
			thumbUrl: thumbUrl
		},
		
		handleAs: "json",
		
		load: function(response) {
			if (response.result == 'success') {
				new condor.general.PopupMessage({message: 'Image approved!', autoClose: 1000});
				hideMediaManager();
				imageWidget.refresh();
				condor.refreshPendingItemsCounters();
			} else {
				alert('There was an error approving the image. (Socket responded with \''+response.message+'\'.)');
			}
		},
		
		error: function(type, error) {
			alert('There was an error approving the image. (Socket didn\'t respond.)');
		}		
	});
}

/**
 * Rejects the image
 */
function imageSwitchReject(imageWidget)
{
    var imageUrl = imageWidget.src;
    var thumbUrl = null;
	
	dojo.xhrPost({
		url: prepSocketCall('imageSwitch', 'reject'),
		
		content: {
			imageUrl: imageUrl,
			thumbUrl: thumbUrl
		},
		
		handleAs: "json",
		
		load: function(response) {
			if (response.result == 'success') {
				imageWidget.refresh();
				new condor.general.PopupMessage({message: 'Image reverted', autoClose: 1000});
				condor.refreshPendingItemsCounters();
			} else {
				alert('There was an error rejecting the image. (Socket responded with \''+response.message+'\'.)');
			}
		},
		
		error: function(type, error) {
			alert('There was a general error rejecting the image');
		}		
	});
}

function selectOriginalMediaFile(imageUrl)
{
	dojo.xhrGet({
		url: prepSocketCall('imageSwitch', 'getOriginalMediaPath'),
		
		content: {
			imagePath: imageUrl
		},
		
		handleAs: "json",
		
		load: function(response) {
			if (response.result == 'success') {
				mediaManagerSelectedFile = response.mediaFile.relativeMediaPath;
			} else {
				console.log('There was an error looking for image origin: '+response.message);
			}
		},
		
		error: function(type, error) {
			console.log('There was a general error looking for image origin');
		}	
	});
}

/**
 * Opens a dialog box where images are listed and their alt text can be edited in all languages
 */
function openImagesAltTextEditDialog(filter) {

	// check if alt text is required
	if(altTextRequired) {		
		// if 'imageList' widget is already register, remove the widget
		var imagesListObj = dojo.byId('imagesList');
		if(imagesListObj){
			dijit.byId('imagesList').destroy();
		}
		
		var dialog = condor.openDialog('imagesList', 'Images List', 'imageSwitch', 'getPageImagesList', filter);
		dojo.connect(dialog, "onLoad", dialog, function(e){
			expandAllTextBlocks(); // Inside javascript.texEdit.js file
			getImagesAltTexts();
			imageListDialogObj = dialog;
			
			// add OK button in alt text pop-up
			var imagesListObj = dojo.byId('imagesList');
			dojo.place('<div id="textOkOnly"><span class="dijitReset dijitInline dijitButtonNode"><span class="dijitReset dijitInline dijitButtonText" onclick="saveImagesAltTextsPopup()">OK</span></span></div>', imagesListObj);
			imagesListObj.style.height = "550px";
		});
		
	} else {
		var dialog = condor.openDialog('imagesList', 'Images List', 'imageSwitch', 'getPageImagesList', filter);
		dojo.connect(dialog, "onLoad", dialog, function(e){
			expandAllTextBlocks(); // Inside javascript.texEdit.js file
		});
	}	
}

/**
 * Opens a dialog box where images are listed and can be managed (edit/approve etc.)
 * You can filter for page, version (pending) etc.
 */
function openImagesListDialog(filter) {
	var dialog = condor.openDialog('imagesList', 'Images List', 'imageSwitch', 'imagesList', filter);
}

/**
 * Opens a dialog box for image switch where image is listed with alt text.
 * Here alt text can be edited in all languages.
 */
function openCropImagesAltTextEditDialog() {
	// make alt text requires
	altTextRequired = true;
	openImagesAltTextEditDialog({imageSwitchId: imageSwitchTargetImage.imageSwitchId});
}

/**
* function to create array of alt text for the image in all languages
*/
function getImagesAltTexts() {
	imageAltTexts = [];
	dojo.query(".textListBodyText > span > span[ class ^= textSwitchHolder ]").forEach(function(elem) {
		var mainParentDiv = elem.parentNode.parentNode.parentNode;
		var mainTargetImageDiv = elem.parentNode.parentNode.parentNode.parentNode;
		var langkey = dojo.getAttr(elem, 'lang');
		var altText = '';
		if(dojo.hasClass(mainParentDiv, 'empty')) {
			imageAltTexts.push({'langCode' : langkey, 'altText' : altText});

		} else {
			altText = elem.innerHTML;
			altText = altText.replace(/^\s+|\s+$/gm, '');
			imageAltTexts.push({'langCode' : langkey, 'altText' : altText});
		}

		// assign current page language alt text to image object from alt text edit pop-up
		if(imageSwitchTargetImage.lang == langkey) {
			imageSwitchTargetImage.alt = altText;
		}

		// show the crop preview image in alt text edit pop-up box
		dojo.query('> div[ class = header ] > img[ class = image ]', mainTargetImageDiv).forEach(function(elemimg) {
			dojo.attr(elemimg, 'src', imageSwitchSourceImage.src);
		});
	});
}

/**
* function to check for required alt text in at least one language
*/
function checkImagesAltTexts() {
	var isEmpty = true;
	dojo.forEach(imageAltTexts, function(item, index){
		var altText = item.altText;
		altText = altText.replace(/^\s+|\s+$/gm, '');
		if(altText != '') {
			isEmpty = false;
		}
	});

	if(condor.disableReqAltText == 1) {
		return false;
	} else {
		return isEmpty;
	}
}

/**
* function to update the new alt text in array after changes in alt text edit popup
*/
function updateImageAltTextsinArray(langkey, altText) {
	dojo.forEach(imageAltTexts, function(item, index){
		if(item.langCode == langkey) {
			imageAltTexts[index].altText = altText;
		}

		// update current page language alt text to image object from alt text edit pop-up
		if(imageSwitchTargetImage.lang == langkey){
			imageSwitchTargetImage.alt = altText;
		}
	});
}

/**
* function to check alt text for at least one language is set and change the Next button to Go if alt text value is present.
*/
function saveImagesAltTextsPopup() {
	if(checkImagesAltTexts()) {
		altTextRequired = true;
		alert("Provide alt text for at least one language");

	} else {
		// trigger onCancel event of dialog box
		imageListDialogObj.onCancel();
		imageListDialogObj = null;		
		altTextRequired = false;
		dojo.byId('imageSwitchAltTextApprove').style.display = "none"; // Hide Next button
		dojo.byId('imageSwitchApprove').style.display = "block"; // Show Go button to proceed for image crop
		dojo.byId('imageReviewAltText').style.display = "block"; // Show Review Alt Text link
	}
}


function zoomOut(){	
	if(flagEnableIn){

		if(imageSwitchTargetImage.editHeight > 500 || imageSwitchTargetImage.editWidth > 930){
			zoomScaler = (460/imageSwitchTargetImage.editHeight) * 100;

			var aspRatio = imageSwitchTargetImage.editWidth/imageSwitchTargetImage.editHeight;
			imageSwitchTargetImage.editHeight = 460;
			imageSwitchTargetImage.editWidth = aspRatio * imageSwitchTargetImage.editHeight;
		}
		
		var x = (imageSwitchEditImage.offsetLeft * zoomScaler * -1)/100;
		var y = (imageSwitchEditImage.offsetTop * zoomScaler * -1)/100;
		
		imageSwitchBeginCrop();
		dojo.byId('imageCropBox').style.left = x + imageSwitchEditImage.offsetLeft + 'px';
		dojo.byId('imageCropBox').style.top = y + imageSwitchEditImage.offsetTop + 'px';

		flagEnableOut = true;
		flagEnableIn = false;

		document.getElementById('imageSwitchChooseOther').style.display="none";
	}else{
		return false;
	}
}

function zoomIn(){

	if(flagEnableOut){
		imageSwitchTargetImage.editHeight=oH;
		imageSwitchTargetImage.editWidth=oW;
		
		var x = (((dojo.byId('imageCropBox').offsetLeft - imageSwitchEditImage.offsetLeft)*100)/zoomScaler);
		var y = (((dojo.byId('imageCropBox').offsetTop - imageSwitchEditImage.offsetTop)*100)/zoomScaler);
		imageSwitchBeginCrop();
		dojo.byId('imageCropImageMouseHandler').style.left = parseInt(x * -1)+'px';
		dojo.byId('imageSwitchEditImage').style.left = parseInt(x * -1)+'px';

		dojo.byId('imageCropImageMouseHandler').style.top = parseInt(y * -1)+'px';
		dojo.byId('imageSwitchEditImage').style.top = parseInt(y * -1)+'px';
		
		flagEnableOut = false;
		flagEnableIn = true;

		document.getElementById('imageSwitchChooseOther').style.display="block";
	}else{
		return false;
	}
}