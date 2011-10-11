var pixelPerfect = pixelPerfect || {};
if ( typeof pixelPerfect.utils == "undefined") {
	pixelPerfect.utils = {};
}

pixelPerfect.utils = function () {
        // private
        var createJsElement = function(url, doc) {
            var element = doc.createElement("script");
            element.src = url;
            return element;
        }
        
        var overlayDivId = 'pp_overlay';
        
        // public
        return {             
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
                    pageHead.appendChild(createJsElement('chrome://pixelperfect/content/browserscripts/' + scripts[i], doc));
                }
            },
            
            setVisibilityForOverlay: function(thePanelIsPixelPerfect) {
                var x = window.content;
                var pixelperfect = x.document.getElementById(overlayDivId);
                if(pixelperfect != null) {
                  if(thePanelIsPixelPerfect) {
                      pixelperfect.style.visibility = 'visible';
                  } else  {
                      pixelperfect.style.visibility = 'hidden';
                  }
                }
            },
            
            createOverlayEyeElement: function(fileName, doc) {
            	var liId = "li_eye_" + fileName;
                var currentEyeElement = doc.getElementById(liId);
                if(currentEyeElement == null) {
                  var liElt = doc.createElement('li');

                  liElt.setAttribute("id", liId);

                  var outerEye = doc.createElement('div');
                  outerEye.setAttribute('class', 'eye');

                  var innerEye = doc.createElement('div');
                  innerEye.setAttribute("class", "eye-off-img");
                  innerEye.setAttribute("id", "eye_" + fileName);
                  innerEye.setAttribute("onclick", "pixelPerfect.panelActions.toggleOverlay('eye_" + fileName + "','" + fileName + "');");


                  outerEye.appendChild(innerEye);

                  liElt.appendChild(outerEye);

                  var minicomp = doc.createElement('div');
                  minicomp.setAttribute("class", "mini-comp");

                  var minicompimg = doc.createElement("img");
                  minicompimg.setAttribute("width", "31");
                  minicompimg.setAttribute("height", "23");
                  minicompimg.setAttribute("alt", "");
                  minicompimg.setAttribute("src", "chrome://pixelperfect/content/user_overlays/" + fileName);

                  minicomp.appendChild(minicompimg);
                  liElt.appendChild(minicomp);

                  var comploc = doc.createElement('div');
                  comploc.setAttribute("class", "comp-location");
                  var fileNameForDisplay = this.shortenFileNameTo(fileName, 15, '***');
                  comploc.innerHTML = fileNameForDisplay;
                  liElt.appendChild(comploc);

                  var compdel = doc.createElement("div");
                  compdel.setAttribute("class", "comp-delete");
                  compdel.setAttribute("onclick", "pixelPerfect.panelActions.deleteOverlay('" + liId + "','eye_" + fileName + "','" + fileName + "');");
                  liElt.appendChild(compdel);

                  var overlayList = doc.getElementById('overlay-list');
                  overlayList.appendChild(liElt);
                }
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
              return pixelPerfect.utils.CCSV('@mozilla.org/preferences-service;1', 'nsIPrefBranch');
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
              var prefs = pixelPerfect.utils.getPrefs();
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
              pixelPerfect.utils.getPrefs().setBoolPref(prefName, value);
            }
        };	
}();