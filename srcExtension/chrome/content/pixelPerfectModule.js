define([
    "firebug/lib/object",
    "firebug/lib/trace",
    "pixelperfect/pixelPerfectFileModule",
    "pixelperfect/pixelPerfectUtilsModule",
    "pixelperfect/pixelPerfectPanel"
],
function(Obj, FBTrace) {

    // ********************************************************************************************* //
    // Custom Module Implementation

    Firebug.PixelPerfectModule = Obj.extend(Firebug.Module,
    {
        // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
        // Initialization

        initialize: function(owner)
        {
            Firebug.Module.initialize.apply(this, arguments);

             if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelPerfect; PixelPerfectModule.initialize");

            this.initPrefs();
            this.addEventListeners();

            // TODO: Module initialization (there is one module instance per browser window)

        },

        shutdown: function()
        {
            Firebug.Module.shutdown.apply(this, arguments);

            if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelPerfect; PixelPerfectModule.shutdown");
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
        },

        saveLastPositionListener: function(evt) {
            //this.saveLastPosition(evt.target.getAttribute("xPos"), evt.target.getAttribute("yPos"),Firebug.currentContext.getPanel("pixelPerfect").document.getElementById("ctl-opacity-numbers").innerHTML);
        },
        
        reloadLastOverlayListener: function(evt) {
            Firebug.PixelPerfectUtilsModule.fireEyeClickEvent("eye_" + Firebug.getPref(Firebug.prefDomain, "pixelPerfect.lastOverlayFileName"), Firebug.currentContext.getPanel("pixelperfect").document);
        },

        //@deprecated
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
                Firebug.PixelPerfectUtilsModule.toggleStatusBar(value);
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
                Firebug.PixelPerfectUtilsModule.setVisibilityForOverlay(isPixelPerfectExtension);
            }
            collapse(PixelPerfectExtensionButtons, !isPixelPerfectExtension);
        },

        addOverlay: function(pixelPerfectPanel)
        {
            var sourceFile = Firebug.PixelPerfectFileModule.chooseFile();

            var fileName = Firebug.PixelPerfectFileModule.copyFile(sourceFile);
            var newOverlayData = Firebug.PixelPerfectUtilsModule.getOverlayElementLiteral(fileName);

            if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelperfect; PixelPerfectModule.addOverlay");
            
            pixelPerfectPanel.PPTemplate.addOverlay(newOverlayData);
        },
        
        saveLastPosition: function(xPos, yPos, opacity) {
            Firebug.setPref(Firebug.prefDomain, "pixelPerfect.lastXPos", xPos);
            Firebug.setPref(Firebug.prefDomain, "pixelPerfect.lastYPos", yPos);
            Firebug.setPref(Firebug.prefDomain, "pixelPerfect.opacity", opacity);
        },

        pixelPerfectHelp: function(menuitem) {
            // Add tab, then make active
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
    // Registration

    Firebug.registerModule(Firebug.PixelPerfectModule);

    return Firebug.PixelPerfectModule;

    // ********************************************************************************************* //
});