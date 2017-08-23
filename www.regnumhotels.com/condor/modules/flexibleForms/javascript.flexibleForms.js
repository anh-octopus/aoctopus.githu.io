

var flexibleForms = (function(){

	 var socketName='dynamicFields';
	 
	 
	 
	  // fetch data via javascript/json
	 // elementId - child id, elementData- urlencoded json data of child
	 function changeElement(elementId,thisGlobal,elementData) {
	     
	 
		var parentValue;
		if (thisGlobal.value!=undefined) { // input, textarea ...
			parentValue = thisGlobal.value;
			 
		}	
		else if (thisGlobal.selectedIndex!= undefined) {
			parentValue = thisGlobal.options[thisGlobal.selectedIndex].value; // select 
		} 
	 

		elementData = unescape(elementData.replace(/\+/g," "));
		elementData = JSON.parse(elementData);
		 
		if (elementData['option'][thisGlobal.selectedIndex-1]['subOption']==undefined) { // textrea or input
		
			
			document.getElementById(elementId).value=elementData['option'][thisGlobal.selectedIndex-1];
		
		} else {
		 
			document.getElementById(elementId).options.length = 0;
			var nSubOptions = elementData['option'][thisGlobal.selectedIndex-1]['subOption'].length;
			var select = document.getElementById(elementId);
			
			for (i=0;i<nSubOptions;i++) {

				var opt = elementData['option'][thisGlobal.selectedIndex-1]['subOption'][i];
				select.options[select.options.length] = new Option(opt, opt);
			}
			
		}
 
		 
	 
	 }

	 
// call fetch data via socket	 
	 function changeElementSocket(elementId,thisGlobal) {
	      
		var parentValue;
		if (thisGlobal.value!=undefined) { // input, textarea ...
			parentValue = thisGlobal.value;
		}	
		else if (thisGlobal.selectedIndex!= undefined) {
			parentValue = thisGlobal.options[thisGlobal.selectedIndex].value; // select 
		} 
		
		// get current url
		var currentPage = document.URL.split('?');	
		var socketURL = currentPage[0]+'?socket=flexibleForms:dynamicFields&parentId='+thisGlobal.id+'&parentValue='+encodeURI(parentValue);


		
		// call socket
		
		var xmlhttp;
		if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}
		else { // code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.open("GET.html",socketURL,false);
		xmlhttp.send();

		
		xmlDoc=xmlhttp.responseXML;
		
 
		
		var x=xmlDoc.getElementsByTagName("value");
		
		// if more then 1 response then build the select list? or pick the last?
		var i = x.length, childValue = new Array(i);
		
		while(i--){
			childValue[i] = x[i].childNodes[0].nodeValue;
		}
		
		
		var x=xmlDoc.getElementsByTagName("action");
				
		var i = x.length, childAction = new Array(i);
		while(i--){
			childAction[i] = x[i].childNodes[0].nodeValue;
		}
		
		//alert(childAction[0]);
 
		if (childAction[0]=='HIDE') {
			document.getElementById(elementId).style.display ='none';
		}
		else {
			document.getElementById(elementId).style.display ='block';
		}
		
		document.getElementById(elementId).value=childValue[0];
		 
	 
	 }	 


	return {
			 changeElement: changeElement
		};

})();
 