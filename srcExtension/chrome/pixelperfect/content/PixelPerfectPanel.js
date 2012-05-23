FBL.ns(function() {
    with (FBL) {
    	var panelName = "pixelPerfect";
    	
        Firebug.PixelPerfectModule = extend(Firebug.Module,
        {
            // Called when browser starts.
            initialize: function() {
                this.initPrefs();
                this.addEventListeners();
                //pixelPerfect.utils.toggleStatusBar(Firebug.getPref(Firebug.prefDomain, "pixelPerfect.hidestatusbar"));
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
                //Firebug.Console.log("overlay movement listener");
                this.updateAbsolutePositionControls(evt.target.getAttribute("xPos"), evt.target.getAttribute("yPos"));
            },

            saveLastPositionListener: function(evt) {
                this.saveLastPosition(evt.target.getAttribute("xPos"), evt.target.getAttribute("yPos"),Firebug.currentContext.getPanel("pixelPerfect").document.getElementById("ctl-opacity-numbers").innerHTML);
            },
            
            reloadLastOverlayListener: function(evt) {
            	pixelPerfect.utils.fireEyeClickEvent("eye_" + Firebug.getPref(Firebug.prefDomain, "pixelPerfect.lastOverlayFileName"), Firebug.currentContext.getPanel("pixelPerfect").document);
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
                var newOverlayEyeData = pixelPerfect.utils.getOverlayElementLiteral(fileName);
                var args = {
                	item: newOverlayEyeData
		        };
		        var panel = Firebug.currentContext.getPanel(panelName);
		        
		        var existingEyeElement = panel.document.getElementById("li_" + newOverlayEyeData.id);
		        if(existingEyeElement == null) {
		        	pixelPerfectRep.newOverlayEyeTag.append(args, panel.document.getElementById("overlay-scroll"), pixelPerfectRep);
		        }
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

            pixelPerfectSwitchLayout: function(menuItem) {
                if ("List" == menuitem.label) {
                }
                else if ("Medium Icons" == menuitem.label) {
                }
                else if ("Large Icons" == menuitem.label) {
                }
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
            },
            
            initializeUI: function(detachArgs) {
            	
            }
        });

        function PixelPerfectPanel() {
        }

        PixelPerfectPanel.prototype = extend(Firebug.Panel,
        {
            name: panelName,
            title: 'Pixel Perfect',
            searchable: false,
            editable: false,

            initialize: function(context, doc) {
                Firebug.Panel.initialize.apply(this, arguments);
                pixelPerfect.utils.loadRequiredJsIntoToMainBrowserOverlay();
                
                // compose this into ui method
                var ppPanel = Firebug.currentContext.getPanel(panelName);
                var overlayEyeElements = pixelPerfect.utils.buildEyeElementData(ppPanel.document);
                
                var args = {
                	overlayEyeElements: overlayEyeElements
		        };
		        pixelPerfectRep.panelTag.append(args, this.panelNode, pixelPerfectRep);
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
					    
        /**
		 * Main Panel domplate
		 */
		var pixelPerfectRep = domplate(
		{
		    panelTag:
		    	DIV({class: "container_4"},
			    	DIV({id: "comp", class: "grid_2"},
			            H2("Overlays"),
			            DIV({id: "overlay-scroll"},
			            	FOR("item", "overlayEyeElements",
					            TAG("$newOverlayEyeTag", {item: "$item"})
					        )
			            )
			       ),
			   		DIV({id: "options", class: "grid_1"},
			    		H2("Options"),
			    		H3("Opacity"),
			    		DIV({id: "opacity-toggle"},
			    			DIV({id: "ctl-opacity-down", class: "bt-left", onclick: "$decreaseOpacity"}),
			    			DIV({id: "ctl-opacity-numbers", class: "numbers"}, "0.5"),
			    			DIV({id: "ctl-opacity-up", class: "bt-right", onclick: "$increaseOpacity"})
			    		),
			    		HR(),
			    		H3("Position (try dragging)"),
			    		DIV({id: "position-toggle-y"},
			    			DIV({class: "bt-left", onclick: "$leftArrowMove"}),
			    			DIV({id: "ctl-left-position", class: "numbers"}, "0"),
			    			DIV({class: "bt-right", onclick: "$rightArrowMove"})
			    		),
			    		DIV({id: "position-toggle-x"},
			    			DIV({class: "bt-up", onclick: "$topArrowMove"}),
			    			DIV({id: "ctl-top-position", class: "numbers"}, "0"),
			    			DIV({class: "bt-down", onclick: "$bottomArrowMove"})
			    		),
			    		DIV({id: "position-lock"},
			    			INPUT({id: "position-lock-chk", name: "position-lock", type: "checkbox", onclick: "$togglePositionLock"}),
			    			H3("Lock?")
			    		),
			    		HR(),
			    		DIV({id: "zindex-settings"},
			    			H3("Z-Index"),
			    			INPUT({id: "z-index-input", type: "text", value: "1000"}),
			    			BUTTON({id: "set-z-index-btn", name: "set-z-index", onclick: "$updateZIndex"}, "Update")
			    		)
		    		),
		    		DIV({id: "info", class: "grid_1"},
		    			H2("Getting Started"),
		    			P("Pixel Perfect is a firefox firebug extension that allows web developers to easily overlay a web composition over top of the developed html. Switching the composition on and off allows the developer to see how many pixels they are off while in development."),
		    			P("To get started, click on the 'Add overlay' button to add your design composition."),
		    			P("For more information, please refer to the 'Help' menu.")
			    	)
		    	),
		    overlayEyeTag:
			    LI({_myprop: "$item", id: "li_$item.id"},
	                DIV({class: "eye"},
	                	DIV({id: "eye_$item.id", class: "eye-off-img", dataId: "$item.file", onclick: "$toggleOverlay"})
	               	),
	            	DIV({class: "mini-comp"},
	            		IMG({width: "31", height: "23", src: "$item.thumbPath"})
	            	),
	            	DIV({class: "comp-location"}, "$item.displayLabel"),
	            	DIV({class: "comp-delete", dataParentId: "li_$item.id", dataEyeId: "eye_$item.id", dataFileName: "$item.file", onclick: "$deleteOverlay"})
	            ),
	        newOverlayEyeTag:
			    DIV({_myprop: "$item", class: "li_$item.id", onclick: "$toggleOverlay"},
			    	IMG({width: "31", height: "23", src: "$item.thumbPath", id: "eye_$item.id", dataId: "$item.file"})
	            ),
		    decreaseOpacity: function(event)
    		{
    			pixelPerfect.panelActions.decreaseOpacity();
    		},
		    increaseOpacity: function(event)
    		{
        		pixelPerfect.panelActions.increaseOpacity();
    		},
		    leftArrowMove: function(event)
    		{
    			pixelPerfect.panelActions.leftArrowMove();
    		},
		    rightArrowMove: function(event)
    		{
    			pixelPerfect.panelActions.rightArrowMove();
    		},
		    topArrowMove: function(event)
    		{
    			pixelPerfect.panelActions.topArrowMove();
    		},
		    bottomArrowMove: function(event)
    		{
    			pixelPerfect.panelActions.bottomArrowMove();
    		},
		    togglePositionLock: function(event)
    		{
    			pixelPerfect.panelActions.togglePositionLock(event.target);
    		},
		    updateZIndex: function(event)
    		{
    			pixelPerfect.panelActions.updateZIndex();
    		},
    		toggleOverlay: function(event)
    		{
                //Firebug.Console.log(event.target);
                //Firebug.Console.log("id => " + event.target.id + " :: dataId => " + event.target.getAttribute("dataId"));
    			pixelPerfect.panelActions.toggleOverlay(event.target.id, event.target.getAttribute("dataId"));
    		},
    		deleteOverlay: function(event)
    		{
    			pixelPerfect.panelActions.deleteOverlay(event.target.getAttribute("dataParentId"),event.target.getAttribute("dataEyeId"),event.target.getAttribute("dataFileName"));
    		}
		});
		
		Firebug.registerStylesheet("chrome://pixelperfect/content/pixelperfect.css");
        Firebug.registerPanel(PixelPerfectPanel);
        Firebug.registerModule(Firebug.PixelPerfectModule);
        
    }
});