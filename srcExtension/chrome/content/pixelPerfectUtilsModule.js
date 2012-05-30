define([
    "firebug/lib/lib",
    "firebug/lib/trace",
    "pixelperfect/pixelPerfectFileModule"
],
function(FBL, FBTrace) {

// ********************************************************************************************* //
// Custom Module Implementation

Firebug.PixelPerfectUtilsModule = FBL.extend(Firebug.Module,
{
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function(owner)
    {
        Firebug.Module.initialize.apply(this, arguments);

        // TODO: Module initialization (there is one module instance per browser window)

        if (FBTrace.DBG_PIXELPERFECT)
            FBTrace.sysout("pixelPerfect; PixelPerfectUtilsModule.initialize");
    },

    shutdown: function()
    {
        Firebug.Module.shutdown.apply(this, arguments);

        if (FBTrace.DBG_PIXELPERFECT)
            FBTrace.sysout("pixelPerfect; PixelPerfectUtilsModule.shutdown");
    },

    createJsElement: function(url, doc) {
      var element = doc.createElement("script");
      element.type = "text/javascript";
      element.src = url;
      return element;
    },

    shortenFileNameTo: function(fileName, length, ellipsesStr) {
      if(fileName.length < length) {
        return fileName;
      } else {
          var positionOfExtension = fileName.indexOf('.');
          var extension = fileName.substring(positionOfExtension, fileName.length);
          var newFileName = fileName.substring(0, positionOfExtension-1);
          newFileName = fileName.substring(0, length-3);
          newFileName = newFileName + ellipsesStr + extension;
          return newFileName;
      }
    },
        
    roundNumber: function(num, dec){
      var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
      return result;
    },
        
    toggleStatusBar: function(bHide) {
      FirebugChrome.window.document.getElementById('ppStatusBar').hidden = bHide;
    },
    
    loadCss: function(url, doc) {
        if ( ! doc ) {
          doc = Firebug.currentContext.pixelperfectContext.browserDoc;
        }

        var newCss = doc.createElement("link");
        newCss.rel = "stylesheet";
        newCss.type = "text\/css";
        newCss.href = url;
        doc.body.appendChild(newCss);

        return newCss;
    },
    
    loadJs: function(url, doc) {
        if ( ! doc ) {
           doc = Firebug.currentContext.pixelPerfectContext.browserDoc;
        }

        var element = doc.createElement("script");
        element.src = url;
        doc.body.appendChild(element);

        return element;
    },
    
    loadRequiredJsIntoToMainBrowserOverlay: function() {
        var doc = window._content.document;
        var pageHead = doc.getElementsByTagName("head")[0];
        var scripts = ['dom-drag.js', 'publicDocumentEvents.js'];
        for(i=0; i<scripts.length; i++) {
            pageHead.appendChild(this.createJsElement('chrome://pixelperfect/content/browserscripts/' + scripts[i], doc));
        }
    },
    
    setVisibilityForOverlay: function(thePanelIsPixelPerfect) {
        var x = window.content;
        var pixelperfect = x.document.getElementById("pp_overlay");
        if(pixelperfect != null) {
          if(thePanelIsPixelPerfect) {
              pixelperfect.style.visibility = 'visible';
          } else  {
              pixelperfect.style.visibility = 'hidden';
          }
        }
    },
    
    buildEyeElementData: function(doc) {
     var currentOverlayFiles = Firebug.PixelPerfectFileModule.getCurrentOverlayFiles(),
           eyeElementData = [],
           currentOverlay;

      for (i = 0; i < currentOverlayFiles.length; i++) {
            eyeElementData.push(this.getOverlayElementLiteral(currentOverlayFiles[i]));
      }

      return eyeElementData;
    },
    
    getOverlayElementLiteral: function(overlayName) {
      var formattedID = overlayName.replace(/(\.|\s|-)/gi, "_").toLowerCase(),
         fileNameForDisplay = this.shortenFileNameTo(overlayName, 15, '***');



      return {id: formattedID, file: overlayName, displayLabel: fileNameForDisplay, thumbPath: 'chrome://pixelperfect/content/user_overlays/' + overlayName};
    },
    
    fireEyeClickEvent: function(eyeEleId, doc) {
      var fireOnThisEye = doc.getElementById(eyeEleId);
      if(fireOnThisEye != null && eyeEleId != undefined && eyeEleId != '') {
        var evObj = doc.createEvent('MouseEvents');
        evObj.initEvent( 'click', true, true );
        fireOnThisEye.dispatchEvent(evObj);
      }
    },
    
    /**
     * Get a handle to a service.
     * @param {string} className The class name.
     * @param {string} interfaceName The interface name.
     */
    CCSV: function(className, interfaceName) {
      var classObj = Components.classes[className];
      var ifaceObj = Components.interfaces[interfaceName];
      if (!classObj || !ifaceObj) {
        return null;
      }
      return classObj.getService(ifaceObj);
    },
    
    /**
     * Get the browser preferences object.
     */
    getPrefs: function() {
      return this.CCSV('@mozilla.org/preferences-service;1', 'nsIPrefBranch');
    },
    
    /**
     * Check if a boolean preference is set.  If so, return its value.
     * If not, return the default value passed as an argument.
     * @param {string} prefName The name of the preference to fetch.
     * @param {boolean} opt_defaultValue The default value to use if the
     *     pref is undefined or not a boolean.
     * @return {boolean} The preference value.
     */
    getBoolPref: function(prefName, opt_defaultValue) {
      var prefs = this.getPrefs();
      if (prefs.getPrefType(prefName) == prefs.PREF_BOOL) {
        return prefs.getBoolPref(prefName);
      } else {
        return opt_defaultValue || false;
      }
    },
    
    /**
     * Set a boolean preference.  Create the pref if necessary, and overwrite
     * an existing pref if necessary.
     * @param {string} prefName The name of the preference to set.
     * @param {boolean|undefined|null} value The value to set the pref to.
     */
    setBoolPref: function(prefName, value) {
      this.getPrefs().setBoolPref(prefName, value);
    }
});

// ********************************************************************************************* //
// Registration

Firebug.registerModule(Firebug.PixelPerfectUtilsModule);

return Firebug.PixelPerfectUtilsModule;

// ********************************************************************************************* //
});