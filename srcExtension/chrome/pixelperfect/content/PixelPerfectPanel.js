FBL.ns(function() { with (FBL) {

// ********************************************************************************************* //
// PixelPerfectModule

Firebug.PixelPerfectModule = extend(Firebug.Module,
{
    // Called when browser starts.
    initialize: function() {
        this.initPrefs();
        this.addEventListeners();

        pixelPerfect.utils.toggleStatusBar(Firebug.getPref(Firebug.prefDomain,
            "pixelPerfect.hidestatusbar"));
    },

    initPrefs: function() {
        // Read persistent options and set them in our pixelPerfect object.
        pixelPerfect.prefs = {};
    },

    addEventListeners: function() {
        document.addEventListener("overlayMovementEvent", function(evt) {
            Firebug.PixelPerfectModule.overlayMovementListener(evt);}, false, true);
        document.addEventListener("saveLastPositionEvent", function(evt) {
            Firebug.PixelPerfectModule.saveLastPositionListener(evt);}, false, true);
        document.addEventListener("reloadLastOverlayEvent", function(evt) {
            Firebug.PixelPerfectModule.reloadLastOverlayListener(evt);}, false, true);
    },

    overlayMovementListener: function(evt) {
        this.updateAbsolutePositionControls(evt.target.getAttribute("xPos"),
            evt.target.getAttribute("yPos"));
    },

    saveLastPositionListener: function(evt) {
        this.saveLastPosition(evt.target.getAttribute("xPos"), evt.target.getAttribute("yPos"),
            Firebug.currentContext.getPanel("pixelPerfect").document.getElementById("ctl-opacity-numbers").innerHTML);
    },

    reloadLastOverlayListener: function(evt) {
        pixelPerfect.utils.fireEyeClickEvent("eye_" + Firebug.getPref(Firebug.prefDomain,
            "pixelPerfect.lastOverlayFileName"), Firebug.currentContext.getPanel("pixelPerfect").document);
    },

    updateAbsolutePositionControls: function(xPos, yPos) {
        var xPosNumber = Firebug.currentContext.getPanel("pixelPerfect").document.getElementById("ctl-left-position");
        xPosNumber.innerHTML = xPos;

        var yPosNumber = Firebug.currentContext.getPanel("pixelPerfect").document.getElementById("ctl-top-position");
        yPosNumber.innerHTML = yPos;
    },

    saveLastPosition: function(xPos, yPos, opacity) {
        Firebug.PixelPerfectModule.saveLastPosition(xPos, yPos, opacity);
    },

    // When an option changes, this is called.
    updateOption: function(name, value) {
        if ("pixelPerfect.hidestatusbar" == name) {
            pixelPerfect.utils.toggleStatusBar(value);
        }
    },

    shutdown: function()
    {
        if (Firebug.getPref('defaultPanelName') == 'pixelPerfect') {
            Firebug.setPref('defaultPanelName', 'console');
        }
    },

    showPanel: function(browser, panel)
    {
        var isPixelPerfectExtension = panel && panel.name == "pixelPerfect";
        var PixelPerfectExtensionButtons = Firebug.chrome.$("fbPixelPerfectPanelButtons");
        if (Firebug.getPref(Firebug.prefDomain, "pixelPerfect.hidewhenfocuslost")) {
            pixelPerfect.utils.setVisibilityForOverlay(isPixelPerfectExtension);
        }
        collapse(PixelPerfectExtensionButtons, !isPixelPerfectExtension);
    },

    addOverlay: function()
    {
        var sourceFile = pixelPerfect.fileUtils.chooseFile();
        var fileName = pixelPerfect.fileUtils.copyFile(sourceFile);
        pixelPerfect.utils.createOverlayEyeElement(fileName,
            Firebug.currentContext.getPanel("pixelPerfect").document);
    },

    onClickIcon: function(context, event, ele)
    {
         if (typeof FirebugContext !== 'undefined' || typeof Firebug.currentContext !== 'undefined') {
            Firebug.toggleBar(undefined, "pixelPerfect");
            return;
        }
    },
    
    saveLastPosition: function(xPos, yPos, opacity) {
        Firebug.setPref(Firebug.prefDomain, "pixelPerfect.lastXPos", xPos);
        Firebug.setPref(Firebug.prefDomain, "pixelPerfect.lastYPos", yPos);
        Firebug.setPref(Firebug.prefDomain, "pixelPerfect.opacity", opacity);
    },

    pixelPerfectHelp: function(menuitem) {
        if ("Pixel Perfect Home" == menuitem.label) {
            gBrowser.selectedTab = gBrowser.addTab("http://pixelperfectplugin.com/");
        }
        else if ("File an issue" == menuitem.label) {
            gBrowser.selectedTab = gBrowser.addTab("https://github.com/openhouseconcept/PixelPerfect/issues");
        }
        else if ("Send Feedback" == menuitem.label) {
            gBrowser.selectedTab = gBrowser.addTab("http://pixelperfectplugin.com/");
        }
    }
});

// ********************************************************************************************* //
// PixelPerfectPanel

function PixelPerfectPanel() {}
PixelPerfectPanel.prototype = extend(Firebug.Panel,
{
    name: "pixelPerfect",
    title: 'Pixel Perfect',
    searchable: false,
    editable: false,

    initialize: function(context, doc) {
        this.context = context;
        this.document = doc;
        var existingEle = this.document.getElementById("pixelperfect-wrapper");

        if (existingEle != undefined) {
            doc.removeChild(existingEle);
            existingEle.parentNode.removeChild(existingEle);
        }

        this.panelNode = doc.createElement("div");
        this.panelNode.setAttribute("id", "pixelperfect-wrapper");
        this.panelNode.ownerPanel = this;
        this.panelNode.innerHTML = pixelPerfect.fileUtils.readPanelHTML();
        doc.body.appendChild(this.panelNode);

        pixelPerfect.utils.loadCss("chrome://pixelperfect/content/pixelperfect.css", this.document);

        // Now properly exposed to Firebug UI through Mozilla API.
        // See: https://blog.mozilla.org/addons/2012/08/20/exposing-objects-to-content-safely/
        //pixelPerfect.utils.loadJs("chrome://pixelperfect/content/panelActions.js", this.document);

        pixelPerfect.utils.loadRequiredJsIntoToMainBrowserOverlay();
        var currentOverlayFiles = pixelPerfect.fileUtils.getCurrentOverlayFiles();
        for (i = 0; i < currentOverlayFiles.length; i++) {
            var currentOverlay = currentOverlayFiles[i];
            pixelPerfect.utils.createOverlayEyeElement(currentOverlay, this.document);
        }

        this.exposePanelActions();
    },

    exposePanelActions: function()
    {
        // Create panel actions object for the current page.
        var panelActions = PanelActionsFactory(this.document, window.content);

        var exposedPixelPerfect = {__exposedProps__: {}};
        exposedPixelPerfect.__exposedProps__["panelActions"] = "r";
        exposedPixelPerfect.__defineGetter__("panelActions", function() {
            return panelActions;
        });

        // Expose panel actions to the content (Firebug UI, panel.html)
        var contentView = getContentView(this.document.defaultView);
        contentView.pixelPerfect = exposedPixelPerfect;
    },

    getOptionsMenuItems: function() {
        var menuOptions = [];

        /**
* Given a menu item name and a function, add a menu item which calls that
* function when selected.
*
* @param {string} label The text of the menu item.
* @param {Function} onSelectMenuItem Called when the menu item is selected.
* @param {boolean} checked Whether the menu item should be checked.
* @param {boolean?} opt_disabled Whether the menu item should be disabled.
*/
        var addMenuOption = function(label, onSelectMenuItem, checked, opt_disabled) {
          var menuItemObj = {
            label: label,
            nol10n: true, // Use the label as-is, rather than looking in a
                           // properties file.
            command: onSelectMenuItem,
            type: 'checkbox',
            checked: checked,
            disabled: Boolean(opt_disabled)
          };
          menuOptions.push(menuItemObj);
        };

        var hideStatusBarPref = 'extensions.firebug.pixelPerfect.hidestatusbar';
        var hideWhenFocusLostPref = 'extensions.firebug.pixelPerfect.hidewhenfocuslost';

        /**
* @param {string} prefName The name of a boolean preference.
* @return {Function} A function that will toggle the value of that
* preference.
*/
        var buildToggleBoolPrefFn = function(prefName) {
          return function() {
            var oldValue = pixelPerfect.utils.getBoolPref(prefName);
            pixelPerfect.utils.setBoolPref(prefName, !oldValue);
          };
        };

        // addMenuOption('Hide Statusbar Icon', buildToggleBoolPrefFn(hideStatusBarPref), pixelPerfect.utils.getBoolPref(hideStatusBarPref));
        // addMenuOption('Hide Overlay When Inspecting', buildToggleBoolPrefFn(hideWhenFocusLostPref), pixelPerfect.utils.getBoolPref(hideWhenFocusLostPref));
        addMenuOption('Add Overlay', Firebug.PixelPerfectModule.addOverlay, false);
        return menuOptions;
    }
});

// ********************************************************************************************* //
// Registration

/**
* Creates instance of panel actions object that is injected into Firebug UI scope (panel.html)
*
* @param document Firebug UI document (panel.html)
* @param x The current page window object.
*/
function PanelActionsFactory(document, x)
{
    // xxxHonza: the |document| argument should be renamed to |doc|, so it
    // doesn't collide with the global variable.

    // private
    var opacity = 0.5,
        overlayDivId = 'pp_overlay',
        overlayLocked = false;

    // public
    return {
        getPrefValue: function(name){

            const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
            const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
            const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
            const prefs = PrefService.getService(nsIPrefBranch2);
            const prefDomain = "extensions.firebug";

            //Check if this is global Firefox preference.
            var prefName;
            if (name.indexOf("browser.") != -1)
                prefName = name;
            else
                prefName = prefDomain + "." + name;

            var type = prefs.getPrefType(prefName);

            if (type == nsIPrefBranch.PREF_STRING) {
                return prefs.getCharPref(prefName);
            }
            else {
                if (type == nsIPrefBranch.PREF_INT) {
                    return prefs.getIntPref(prefName);
                }
                else {
                    if (type == nsIPrefBranch.PREF_BOOL) {
                        return prefs.getBoolPref(prefName);
                    }
               }
           }
        },

        setPrefValue: function(name, value){
            const PrefService = Components.classes["@mozilla.org/preferences-service;1"];
            const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
            const nsIPrefBranch2 = Components.interfaces.nsIPrefBranch2;
            const prefs = PrefService.getService(nsIPrefBranch2);
            const prefDomain = "extensions.firebug";

            // Check if this is global Firefox preference.
            var prefName;
            if (name.indexOf("browser.") != -1)
                prefName = name;
            else {
                prefName = prefDomain + "." + name;
            }

            var type = prefs.getPrefType(prefName);
            if (type == nsIPrefBranch.PREF_STRING) {
                prefs.setCharPref(prefName, value);
            }
            else {
                if (type == nsIPrefBranch.PREF_INT) {
                    prefs.setIntPref(prefName, value);
                }
                else {
                    if (type == nsIPrefBranch.PREF_BOOL) {
                        prefs.setBoolPref(prefName, value);
                    }
                    else {
                        if (type == nsIPrefBranch.PREF_INVALID) {
                            throw "Invalid preference: " + prefName;
                        }
                    }
                }
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
                    this.setPrefValue("pixelPerfect.zIndex", '1000');
                    this.setPrefValue("pixelPerfect.overlayLocked", false);
                    this.turnOnOverlay(chromeToOverlayUrl, chromeToOverlayUrlNoSpaces, pageBody, overlayUrl);
                    eyeDiv.setAttribute("class", "eye-on-img");
                }
                else {
                    eyeDiv.setAttribute("class", "eye-off-img");
                }
            }
        },

        turnOnOverlay: function(chromeToOverlayUrl, chromeToOverlayUrlNoSpaces, pageBody, overlayUrl) {
            var divPixelPerfect = x.document.createElement("div");
            divPixelPerfect.setAttribute("id", overlayDivId);
            
            // updateZIndex from pref
            var zIndexTextInputEle = document.getElementById('z-index-input');
            var savedZIndex = this.getPref("pixelPerfect.zIndex");
            zIndexTextInputEle.value = savedZIndex;

            imageDimensions = this.getImageDimensions(chromeToOverlayUrl);
            var width = imageDimensions[0];
            var height = imageDimensions[1];
            divPixelPerfect.setAttribute("style", "z-index: " + zIndexTextInputEle.value);
            divPixelPerfect.style.background = 'url(' + chromeToOverlayUrlNoSpaces + ') no-repeat';
            divPixelPerfect.style.width = width;
            divPixelPerfect.style.height = height;

            divPixelPerfect.style.opacity = opacity;
            divPixelPerfect.style.MozOpacity = opacity;
            divPixelPerfect.style.position = 'absolute';
            divPixelPerfect.style.top = this.getPref("pixelPerfect.lastYPos") + 'px';
            divPixelPerfect.style.left = this.getPref("pixelPerfect.lastXPos") + 'px';
            divPixelPerfect.style.cursor = 'all-scroll';

            var draggableScriptId = "draggable-script";
            
            var existingDraggableScript = x.document.getElementById(draggableScriptId);
            this.removeChildElement(existingDraggableScript, pageBody);
            pageBody.appendChild(divPixelPerfect);

            // update overlayLocked Attribute from pref
            var overlayLockedChkEle = document.getElementById('position-lock-chk');
            overlayLocked = this.getPref("pixelPerfect.overlayLocked");
            this.updateDragStatus();
            this.togglePointerEvents();
            overlayLockedChkEle.checked = overlayLocked;

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
            var deleteFile = this.getFirefoxProfileRootFolder().clone();
            deleteFile.append('extensions');
            deleteFile.append('pixelperfectplugin@openhouseconcepts.com');
            deleteFile.append('chrome');
            deleteFile.append('pixelperfect');
            deleteFile.append('content');
            deleteFile.append('user_overlays');
            deleteFile.append(fileToDelete);
            try {
                deleteFile.remove(false);
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
            // get the nsIFile obj => user's home (profile) directory
            const DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1", "nsIProperties");
            var nsIFileObj;
            try {
                nsIFileObj = (new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile);
            }
            catch (e) {
                alert("error");
            }
            return nsIFileObj;
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

        togglePositionLock: function(chkEle) {
          overlayLocked = chkEle.checked;
          this.updateDragStatus();
          this.togglePointerEvents();
          this.setPrefValue("pixelPerfect.overlayLocked", overlayLocked);
        },

        updateZIndex: function(zIndexInputEle) {
          var ppOverlayEle = x.document.getElementById(overlayDivId);
          ppOverlayEle.style.zIndex = zIndexInputEle.value;
          this.setPrefValue("pixelPerfect.zIndex", zIndexInputEle.value);
        },

        togglePointerEvents: function () {
            var pp_overlay = x.document.getElementById(overlayDivId);
            var pointerEventsVal = (overlayLocked) ? 'none' : 'auto';
            pp_overlay.style.pointerEvents = pointerEventsVal;
        },

        updateDragStatus: function() {
          var pageBody = x.document.getElementsByTagName("body")[0];
          //remove previous
          var updateDragStatusScriptID = "update-drag-status";
          var existingDragStatusScript = x.document.getElementById(updateDragStatusScriptID);
          this.removeChildElement(existingDragStatusScript, pageBody);
          
          // add new drag status (which will lock/unlock dragging based on state of overlayLocked instance)
          var dragStatusScript = x.document.createElement("script");
          dragStatusScript.setAttribute("type", "text/javascript");
          dragStatusScript.setAttribute("id", updateDragStatusScriptID);
          dragStatusScript.innerHTML = "Drag.disabled = " + overlayLocked;
          
          this.appendScriptElementAsChild(dragStatusScript, pageBody);
        },

        moveX: function(xPos){
            this.moveElement(xPos, this.findPixelPerfectYPos());
        },

        moveY: function(yPos){
            this.moveElement(this.findPixelPerfectXPos(), yPos);
        },

        moveElement: function(xPos, yPos){
            if(!overlayLocked) {
              this.updatePanelDisplayOfXAndY(xPos, yPos);
              this.setPrefValue("pixelPerfect.lastXPos", xPos);
              this.setPrefValue("pixelPerfect.lastYPos", yPos);
              
              pp_overlay = x.document.getElementById(overlayDivId);
              pp_overlay.style.top = yPos + 'px';
              pp_overlay.style.left = xPos + 'px';
            }
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
        },

        // exposed for access from content scope (Firebug UI)
        // See: https://blog.mozilla.org/addons/2012/08/20/exposing-objects-to-content-safely/
        __exposedProps__: {
            "toggleOverlay": "rw",
            "deleteOverlay": "rw",
            "increaseOpacity": "rw",
            "decreaseOpacity": "rw",
            "leftArrowMove": "rw",
            "rightArrowMove": "rw",
            "topArrowMove": "rw",
            "bottomArrowMove": "rw",
            "togglePositionLock": "rw",
            "updateZIndex": "rw",
        },
    };
};

// ********************************************************************************************* //
// Registration

Firebug.registerModule(Firebug.PixelPerfectModule);
Firebug.registerPanel(PixelPerfectPanel);

// ********************************************************************************************* //
}});