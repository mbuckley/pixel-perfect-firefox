var pixelPerfect = pixelPerfect ||
{};

if (typeof pixelPerfect.panelActions == "undefined") {
    pixelPerfect.panelActions = {};
}

pixelPerfect.panelActions = function(){
    // private
    var x = window.content;
    
    var opacity = 0.5;
    var overlayDivId = 'pp_overlay';
    
    // public
    return {
        directorySeperator: "",
        
        getPrefValue: function(name){
        
            const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
            const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
            const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
            const prefs = PrefService.getService(nsIPrefBranch2);
            const prefDomain = "extensions.firebug";
            
            //Check if this is global firefox preference.
            var prefName;
            if (name.indexOf("browser.") != -1) 
                prefName = name;
            else 
                prefName = prefDomain + "." + name;
            
            var type = prefs.getPrefType(prefName);
            if (type == nsIPrefBranch.PREF_STRING) {
                return prefs.getCharPref(prefName);
            }
            else 
                if (type == nsIPrefBranch.PREF_INT) {
                    return prefs.getIntPref(prefName);
                }
                else 
                    if (type == nsIPrefBranch.PREF_BOOL) {
                        return prefs.getBoolPref(prefName);
                    }
        },
        
        setPrefValue: function(name, value){
            const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
            const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
            const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
            const prefs = PrefService.getService(nsIPrefBranch2);
            const prefDomain = "extensions.firebug";
            
            //Check if this is global firefox preference.
            var prefName;
            if (name.indexOf("browser.") != -1) 
                prefName = name;
            else 
                prefName = prefDomain + "." + name;
            
            var type = prefs.getPrefType(prefName);
            if (type == nsIPrefBranch.PREF_STRING) {
                prefs.setCharPref(prefName, value);
            }
            else 
                if (type == nsIPrefBranch.PREF_INT) {
                    prefs.setIntPref(prefName, value);
                }
                else 
                    if (type == nsIPrefBranch.PREF_BOOL) {
                        prefs.setBoolPrefPref(prefName, value);
                    }
                    else 
                        if (type == nsIPrefBranch.PREF_INVALID) {
                            throw "Invalid preference: " + prefName;
                        }
        },
        
        // Wrapper for getting preferences with a default.
        // Returns undefined if the preference doesn't exist and no default is specified.
        getPref: function(name, defaultval){
            var val = this.getPrefValue(name);
            return ("undefined" == typeof(val) ? defaultval : val);
        },
        
        toggleOverlay: function(eyeDivId, overlayUrl){
        	var pixelperfect = x.document.getElementById(overlayDivId);
            var eyeDiv = document.getElementById(eyeDivId);
            var pageBody = x.document.getElementsByTagName("body")[0];
            
            var overlayUrlNoSpaces = overlayUrl.replace(/\s/g, "%20");
            var chromeToOverlayUrl = 'chrome://pixelperfect/content/user_overlays/' + overlayUrl;
            var chromeToOverlayUrlNoSpaces = 'chrome://pixelperfect/content/user_overlays/' + overlayUrlNoSpaces;
            
            
            if (pixelperfect == null) {
                this.turnOnOverlay(chromeToOverlayUrl, chromeToOverlayUrlNoSpaces, pageBody, overlayUrl);
                eyeDiv.setAttribute("class", "eye-on-img");
            }
            else {
                // hide overlay
                this.setPrefValue("pixelPerfect.lastXPos", this.findPixelPerfectXPos(overlayDivId));
                this.setPrefValue("pixelPerfect.lastYPos", this.findPixelPerfectYPos(overlayDivId));
                pageBody.removeChild(pixelperfect);
                this.setPrefValue("pixelPerfect.lastOverlayFileName", '');
                
                var currentOverlayBackgroundUrl = pixelperfect.style.background;
                
                
                // compose this if condition
                if (currentOverlayBackgroundUrl.indexOf(overlayUrlNoSpaces) == -1) {
                    //'clicking on a different overlay..turn off all other eyes, and turn on new overlay...
                    var overlayList = document.getElementById('overlay-list');
                    var lis = overlayList.getElementsByTagName("li");
                    
                    for (var i = 0; i < lis.length; i++) {
                        var currentEyeElement = lis[i];
                        var existingEyeDiv = currentEyeElement.getElementsByTagName("div")[1];
                        existingEyeDiv.setAttribute("class", "eye-off-img");
                    }
                    this.setPrefValue("pixelPerfect.lastXPos", '0');
                    this.setPrefValue("pixelPerfect.lastYPos", '0');
                    this.setPrefValue("pixelPerfect.opacity", '0.5');
                    this.turnOnOverlay(chromeToOverlayUrl, chromeToOverlayUrlNoSpaces, pageBody, overlayUrl);
                    eyeDiv.setAttribute("class", "eye-on-img");
                }
                else {
                    eyeDiv.setAttribute("class", "eye-off-img");
                }
            }
        },
        
        turnOnOverlay: function(chromeToOverlayUrl, chromeToOverlayUrlNoSpaces, pageBody, overlayUrl){
            var divPixelPerfect = x.document.createElement("div");
            divPixelPerfect.setAttribute("id", overlayDivId);
            
            imageDimensions = this.getImageDimensions(chromeToOverlayUrl);
            var width = imageDimensions[0];
            var height = imageDimensions[1];
            divPixelPerfect.setAttribute("style", "z-index: 1000");
            divPixelPerfect.style.background = 'url(' + chromeToOverlayUrlNoSpaces + ') no-repeat';
            divPixelPerfect.style.width = width;
            divPixelPerfect.style.height = height;
            divPixelPerfect.style.opacity = opacity;
            divPixelPerfect.style.MozOpacity = opacity;
            divPixelPerfect.style.position = 'absolute';
            divPixelPerfect.style.top = this.getPref("pixelPerfect.lastYPos") + 'px';
            divPixelPerfect.style.left = this.getPref("pixelPerfect.lastXPos") + 'px';
			divPixelPerfect.style.cursor = 'all-scroll';
            
            
            var draggableScriptId = "draggable_script";
            
            var existingDraggableScript = x.document.getElementById(draggableScriptId);
            this.removeChildElement(existingDraggableScript, pageBody);
            pageBody.appendChild(divPixelPerfect);
            
            // opacity
            var savedOpacity = this.getPref("pixelPerfect.opacity");
            opacity = this.roundNumber(savedOpacity, 1);
            this.updateOverlayOpacity();
            
            
            var draggablePP = x.document.createElement("script");
            draggablePP.setAttribute("type", "text/javascript");
            draggablePP.setAttribute("id", draggableScriptId);
            draggablePP.innerHTML = "var overlayDiv = document.getElementById('" + overlayDivId + "');Drag.init(overlayDiv);overlayDiv.onDrag = function(x, y){pixelPerfect.publicDocument.notifyPanelOverlayPositionHasChanged();};overlayDiv.onDragEnd = function(x, y){pixelPerfect.publicDocument.notifyPanelOverlayPositionHasChanged(); pixelPerfect.publicDocument.notifyToSaveLastPosition();};"

            
            this.appendScriptElementAsChild(draggablePP, pageBody);
            this.updatePanelDisplayOfXAndY(this.getPref("pixelPerfect.lastXPos"), this.getPref("pixelPerfect.lastYPos"));
            // save last overlay
            this.setPrefValue("pixelPerfect.lastOverlayFileName", overlayUrl);
        },
        
        appendScriptElementAsChild: function(scriptElement, parentElement){
            parentElement.appendChild(scriptElement);
        },
        
        removeChildElement: function(childElement, parentElement){
            if (childElement != null) {
                parentElement.removeChild(childElement);
            }
        },
        
        deleteOverlay: function(eyeLiId, eyeDivId, fileName){
            var eyeDiv = document.getElementById(eyeDivId);
            if (eyeDiv.className == "eye-on-img") {
                var pageBody = x.document.getElementsByTagName("body")[0];
                var pixelperfect = x.document.getElementById(overlayDivId);
                pageBody.removeChild(pixelperfect);
            }
            
            
            var eyeDiv = document.getElementById(eyeLiId);
            document.getElementById("overlay-list").removeChild(eyeDiv);
            this.deleteFile(fileName);
        },
        
        deleteFile: function(fileToDelete){
            // get a component for the file to copy
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            if (!file) 
                return false;
            var userOverlayPath = this.getFirefoxProfileRootFolder() + 'extensions' + this.directorySeperator + 'pixelperfectplugin@openhouseconcept.com' + this.directorySeperator + 'chrome/pixelperfect/content' + this.directorySeperator + 'user_overlays' + this.directorySeperator;
            
            file.initWithPath(userOverlayPath + fileToDelete);
            
            try {
                file.remove(false);
            } 
            catch (e) {
                alert(e);
            }
        },
        
        getImageDimensions: function(overlayUrl){
            var overlayImage = new Image();
            overlayImage.src = overlayUrl;
            var width = overlayImage.width;
            var height = overlayImage.height;
            
            if (width == null || width == '0' || height == null || height == '0') {
                width = '1280';
                height = '1024';
            }
            
            return [width + 'px', height + 'px'];
        },
        
        getFirefoxProfileRootFolder: function(){
            try {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            } 
            catch (e) {
                alert("Permission to save file was denied.");
            }
            // get the path to the user's home (profile) directory
            const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
            try {
                path = (new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path;
            } 
            catch (e) {
                alert("error");
            }
            // determine the file-separator
            if (path.search(/\\/) != -1) {
                this.initializeDirectorySeperator("\\");
                path = path + this.directorySeperator;
            }
            else {
                this.initializeDirectorySeperator("/");
                path = path + this.directorySeperator;
            }
            return path;
        },
        
        initializeDirectorySeperator: function(seperator){
            if (this.directorySeperator == null || this.directorySeperator == "") {
                this.directorySeperator = seperator;
            }
        },
        
        increaseOpacity: function(){
            var opacityNumber = document.getElementById('ctl-opacity-numbers');
            if (opacityNumber.innerHTML != "1") {
                opacity = (opacity + 0.1);
                opacity = this.roundNumber(opacity, 1);
                this.updateOverlayOpacity();
            }
        },
        
        decreaseOpacity: function(){
            var opacityNumber = document.getElementById('ctl-opacity-numbers');
            if (opacityNumber.innerHTML != "0") {
                opacity = (opacity - 0.1);
                opacity = this.roundNumber(opacity, 1);
                this.updateOverlayOpacity();
            }
        },
        
        updateOverlayOpacity: function(){
            var pixelperfect = x.document.getElementById(overlayDivId);
            pixelperfect.style.opacity = opacity;
            pixelperfect.style.MozOpacity = opacity;
            var opacityNumber = document.getElementById('ctl-opacity-numbers');
            opacityNumber.innerHTML = opacity;
            // persist opacity
            this.setPrefValue("pixelPerfect.opacity", opacity);
        },
        
        roundNumber: function(num, dec){
            var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
            return result;
        },
        
        leftArrowMove: function(){
            var newXPos = (this.findPixelPerfectXPos() - 1);
            this.moveX(newXPos);
        },
        
        rightArrowMove: function(){
            var newXPos = (this.findPixelPerfectXPos() + 1);
            this.moveX(newXPos);
        },
        
        topArrowMove: function(){
            var newYPos = (this.findPixelPerfectYPos() - 1);
            this.moveY(newYPos);
        },
        
        bottomArrowMove: function(){
            var newYPos = (this.findPixelPerfectYPos() + 1);
            this.moveY(newYPos);
        },
        
        moveX: function(xPos){
            this.moveElement(xPos, this.findPixelPerfectYPos());
        },
        
        moveY: function(yPos){
            this.moveElement(this.findPixelPerfectXPos(), yPos);
        },
        
        moveElement: function(xPos, yPos){
            this.updatePanelDisplayOfXAndY(xPos, yPos);
            this.setPrefValue("pixelPerfect.lastXPos", xPos);
            this.setPrefValue("pixelPerfect.lastYPos", yPos);
            
            pp_overlay = x.document.getElementById(overlayDivId);
            pp_overlay.style.top = yPos + 'px';
            pp_overlay.style.left = xPos + 'px';
            
        },
        
        findPixelPerfectXPos: function(){
            return this.findPixelPerfectPos()[0];
        },
        
        findPixelPerfectYPos: function(){
            return this.findPixelPerfectPos()[1];
        },
        
        findPixelPerfectPos: function(){
            return this.findPos(x.document.getElementById(overlayDivId));
        },
        
        findPos: function(obj){
            var curleft = curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
                while (obj = obj.offsetParent);
                return [curleft, curtop];
            }
        },
        
        updatePanelDisplayOfXAndY: function(xPos, yPos){
            var xPosNumber = document.getElementById('ctl-left-position');
            xPosNumber.innerHTML = xPos;
            
            var yPosNumber = document.getElementById('ctl-top-position');
            yPosNumber.innerHTML = yPos;
        }
        
        
    };
}();
