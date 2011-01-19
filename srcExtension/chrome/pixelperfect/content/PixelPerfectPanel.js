FBL.ns(function() {
    with (FBL) {
        Firebug.PixelPerfectModule = extend(Firebug.Module,
        {
            // Called when browser starts.
            initialize: function() {
                this.initPrefs();
                this.addEventListeners();
                pixelPerfect.utils.toggleStatusBar(Firebug.getPref(Firebug.prefDomain, "pixelPerfect.hidestatusbar"));
            },

            initPrefs: function() {
                // Read persistent options and set them in our pixelPerfect object.
                pixelPerfect.prefs = {};
            },

            addEventListeners: function() {
                document.addEventListener("overlayMovementEvent", function(evt) { Firebug.PixelPerfectModule.overlayMovementListener(evt);}, false, true);
                document.addEventListener("saveLastPositionEvent", function(evt) { Firebug.PixelPerfectModule.saveLastPositionListener(evt);}, false, true);
                document.addEventListener("reloadLastOverlayEvent", function(evt) { Firebug.PixelPerfectModule.reloadLastOverlayListener(evt);}, false, true);
            },

            overlayMovementListener: function(evt) {
                this.updateAbsolutePositionControls(evt.target.getAttribute("xPos"), evt.target.getAttribute("yPos"));
            },

            saveLastPositionListener: function(evt) {
                this.saveLastPosition(evt.target.getAttribute("xPos"), evt.target.getAttribute("yPos"),FirebugContext.getPanel("pixelPerfect").document.getElementById("ctl-opacity-numbers").innerHTML);
            },
            
            reloadLastOverlayListener: function(evt) {
            	pixelPerfect.utils.fireEyeClickEvent("eye_" + Firebug.getPref(Firebug.prefDomain, "pixelPerfect.lastOverlayFileName"), FirebugContext.getPanel("pixelPerfect").document);
            },

            updateAbsolutePositionControls: function(xPos, yPos) {
                var xPosNumber = FirebugContext.getPanel("pixelPerfect").document.getElementById("ctl-left-position");
                xPosNumber.innerHTML = xPos;

                var yPosNumber = FirebugContext.getPanel("pixelPerfect").document.getElementById("ctl-top-position");
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
                var PixelPerfectExtensionButtons = browser.chrome.$("fbPixelPerfectPanelButtons");
                if (Firebug.getPref(Firebug.prefDomain, "pixelPerfect.hidewhenfocuslost")) {
                    pixelPerfect.utils.setVisibilityForOverlay(isPixelPerfectExtension);
                }
                collapse(PixelPerfectExtensionButtons, !isPixelPerfectExtension);
            },

            addOverlay: function()
            {
                var sourceFile = pixelPerfect.fileUtils.chooseFile();
                var fileName = pixelPerfect.fileUtils.copyFile(sourceFile);
                pixelPerfect.utils.createOverlayEyeElement(fileName, FirebugContext.getPanel("pixelPerfect").document);
            },

            onClickIcon: function(context, event, ele)
            {
                if (event.button != 0) {
                    return;
                }
                else if (isControl(event)) {
                    Firebug.toggleDetachBar(true);
                }
                else {
                    Firebug.toggleBar();
                    Firebug.tabBrowser.selectedBrowser.chrome.selectPanel('pixelPerfect');
                }
            },

            saveLastPosition: function(xPos, yPos, opacity) {
                Firebug.setPref(Firebug.prefDomain, "pixelPerfect.lastXPos", xPos);
                Firebug.setPref(Firebug.prefDomain, "pixelPerfect.lastYPos", yPos);
                Firebug.setPref(Firebug.prefDomain, "pixelPerfect.opacity", opacity);
            },

            pixelPerfectHelp: function(menuitem) {
                if ("Pixel Perfect Home" == menuitem.label) {
                	gBrowser.selectedTab = gBrowser.addTab("http://openhouseconcept.com/projects/pixelperfect/");
                }
                else if ("File an issue" == menuitem.label) {
                    gBrowser.selectedTab = gBrowser.addTab("https://github.com/openhouseconcept/PixelPerfect/issues");
                }
                else if ("Send Feedback" == menuitem.label) {
                    gBrowser.selectedTab = gBrowser.addTab("http://openhouseconcept.com/projects/pixelperfect/contact");
                }
            }
        });

        function PixelPerfectPanel() {
        }

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
                if(existingEle != undefined) {
                	doc.removeChild(existingEle);
                	existingEle.parentNode.removeChild(existingEle);
                }
                
                this.panelNode = doc.createElement("div");
                this.panelNode.setAttribute("id", "pixelperfect-wrapper");
                this.panelNode.ownerPanel = this;
                this.panelNode.innerHTML = pixelPerfect.fileUtils.readPanelHTML();
                doc.body.appendChild(this.panelNode);

                pixelPerfect.utils.loadCss("chrome://pixelperfect/content/pixelperfect.css", this.document);
                pixelPerfect.utils.loadJs("chrome://pixelperfect/content/panelActions.js", this.document);

                pixelPerfect.utils.loadRequiredJsIntoToMainBrowserOverlay();
                var currentOverlayFiles = pixelPerfect.fileUtils.getCurrentOverlayFiles();
                for (i = 0; i < currentOverlayFiles.length; i++) {
                    var currentOverlay = currentOverlayFiles[i];
                    pixelPerfect.utils.createOverlayEyeElement(currentOverlay, this.document);
                }
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
                    nol10n: true,  // Use the label as-is, rather than looking in a
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
                 *     preference.
                 */
                var buildToggleBoolPrefFn = function(prefName) {
                  return function() {
                    var oldValue = pixelPerfect.utils.getBoolPref(prefName);
                    pixelPerfect.utils.setBoolPref(prefName, !oldValue);
                  };
                };
                
                addMenuOption('Hide Statusbar Icon', buildToggleBoolPrefFn(hideStatusBarPref), pixelPerfect.utils.getBoolPref(hideStatusBarPref));
                addMenuOption('Hide Overlay When Inspecting', buildToggleBoolPrefFn(hideWhenFocusLostPref), pixelPerfect.utils.getBoolPref(hideWhenFocusLostPref));
                
                return menuOptions;
                
            }
        });

        Firebug.registerModule(Firebug.PixelPerfectModule);
        Firebug.registerPanel(PixelPerfectPanel);
    }
});