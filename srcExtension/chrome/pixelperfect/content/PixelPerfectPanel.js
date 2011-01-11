FBL.ns(function() {
    with (FBL) {
        Firebug.PixelPerfectModule = extend(Firebug.Module,
        {
            // Called when browser starts.
            initialize: function() {
                this.initPrefs();
                this.addEventListeners();
                pixelPerfect.utils.toggleStatusBar(pixelPerfect.getPref("pixelPerfect.hidestatusbar"));
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
            	pixelPerfect.utils.fireEyeClickEvent("eye_" + pixelPerfect.getPrefValue("pixelPerfect.lastOverlayFileName"), FirebugContext.getPanel("pixelPerfect").document);
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
                if (pixelPerfect.getPref("pixelPerfect.hidewhenfocuslost")) {
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
                pixelPerfect.setPrefValue("pixelPerfect.lastXPos", xPos);
                pixelPerfect.setPrefValue("pixelPerfect.lastYPos", yPos);
                pixelPerfect.setPrefValue("pixelPerfect.opacity", opacity);
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
                this.panelNode.setAttribute("class", "container_12");
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
                return [
                    optionMenu("Hide statusbar info", "pixelPerfect.hidestatusbar"),
                    optionMenu("Hide overlay when inspecting", "pixelPerfect.hidewhenfocuslost")
                ];
            }
        });

        Firebug.registerModule(Firebug.PixelPerfectModule);
        Firebug.registerPanel(PixelPerfectPanel);
    }
});