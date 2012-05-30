define([
    "firebug/lib/object",
    "firebug/lib/trace",
    "firebug/lib/locale",
    "firebug/lib/domplate",
    "pixelperfect/slider",
    "pixelperfect/pixelPerfectModule",
    "pixelperfect/pixelPerfectPanelActionsModule",
    "pixelperfect/pixelPerfectUtilsModule"
],
function(Obj, FBTrace, Locale, Domplate, PixelPerfectModule) {

    // ********************************************************************************************* //
    // Custom Panel Implementation

    var panelName = "pixelperfect";

    Firebug.PixelPerfectPanel = function PixelPerfectPanel() {};
    Firebug.PixelPerfectPanel.prototype = Obj.extend(Firebug.Panel,
    {
        name: panelName,
        title: "Pixel Perfect",

        // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
        // Initialization

        initialize: function()
        {
            Firebug.Panel.initialize.apply(this, arguments);

            Firebug.PixelPerfectUtilsModule.loadRequiredJsIntoToMainBrowserOverlay();

            if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelPerfect; PixelPerfectPanel.initialize");

            // TODO: Panel initialization (there is one panel instance per browser tab)

            this.refresh();
        },

        destroy: function(state)
        {
            if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelPerfect; PixelPerfectPanel.destroy");

            Firebug.Panel.destroy.apply(this, arguments);
        },

        show: function(state)
        {
            Firebug.Panel.show.apply(this, arguments);

            if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelPerfect; PixelPerfectPanel.show");
        },

        refresh: function()
        {
            this.PPTemplate.render(this.panelNode);
            
            // refresh fd slider plugin
            var ppPanel = Firebug.currentContext.getPanel(panelName);
            fdSliderController.onload();
            fdSliderController.construct(null, ppPanel.document);
        },

        // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

        /**
         * Extends toolbar for this panel.
         */
        getPanelToolbarButtons: function()
        {
            var buttons = [];

            buttons.push({
                label: "pixelperfect.add.label",
                tooltiptext: "pixelperfect.add.tooltip",
                command: FBL.bindFixed(this.onAddOverlay, this)
            });

            return buttons;
        },

        // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
        // Commands

        onAddOverlay: function()
        {

            Firebug.PixelPerfectModule.addOverlay(this);

             if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelperfect; PixelPerfectPanel.onAddOverlay");
        }
    });

    // ********************************************************************************************* //
    // Panel UI (Domplate)

    // Register locales before the following template definition.
    Firebug.registerStringBundle("chrome://pixelperfect/locale/pixelperfect.properties");

    /**
     * Domplate template used to render panel's content. Note that the template uses
     * localized strings and so, Firebug.registerStringBundle for the appropriate
     * locale file must be already executed at this moment.
     */
    with (Domplate) {
    Firebug.PixelPerfectPanel.prototype.PPTemplate = domplate(
    {
        panelTag:
            DIV({class: "container_4"},
                DIV({id: "overlay-container", class: "grid_2"},
                    DIV({id: "overlay-scroll"},
                        UL({id: "overlay-list"},
                            FOR("item", "overlayEyeElements",
                                TAG("$overlayTag", {item: "$item"})
                            )
                        )
                    )
                ),
                DIV({id: "options", class: "grid_1"},
                    H3("Opacity"),
                    DIV({id: "opacity-toggle"},
                        INPUT({name: "opacity-slider", id: "opacity-slider", type: "text", title: "Range: 10 - 100", class: "fd_range_10_100 fd_hide_input fd_callback_Firebug.PixelPerfectPanelActionsModule.opacitySliderUpdate", value:"50"})
                    ),
                    DIV({id: "position-controls"},
                        DIV({class: "bt-left", onclick: "$leftArrowMove"}),
                        DIV({class: "bt-right", onclick: "$rightArrowMove"}),
                        DIV({class: "bt-up", onclick: "$topArrowMove"}),
                        DIV({class: "bt-down", onclick: "$bottomArrowMove"})
                    ),
                    DIV({id: "position-lock"},
                        INPUT({id: "position-lock-chk", name: "position-lock", type: "checkbox", onclick: "$togglePositionLock"}),
                        H3("Lock?")
                    )
                )
            ),
        overlayTag:
            LI({_myprop: "$item", class: "li_$item.id"},
                IMG({width: "31", height: "23", src: "$item.thumbPath", id: "eye_$item.id", dataId: "$item.file", onclick: "$toggleOverlay"})
            ),
        leftArrowMove: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.leftArrowMove();
        },
        rightArrowMove: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.rightArrowMove();
        },
        topArrowMove: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.topArrowMove();
        },
        bottomArrowMove: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.bottomArrowMove();
        },
        togglePositionLock: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.togglePositionLock(event.target);
        },
        updateZIndex: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.updateZIndex();
        },
        toggleOverlay: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.toggleOverlay(event.target.id, event.target.getAttribute("dataId"));
        },
        deleteOverlay: function(event)
        {
            Firebug.PixelPerfectPanelActionsModule.deleteOverlay(event.target.getAttribute("dataParentId"),event.target.getAttribute("dataEyeId"),event.target.getAttribute("dataFileName"));
        },

        render: function(parentNode)
        {
           var overlayEyeElements = Firebug.PixelPerfectUtilsModule.buildEyeElementData(Firebug.currentContext.getPanel(panelName));

            var args = {
                overlayEyeElements: overlayEyeElements
            };

            this.panelTag.replace(args, parentNode, this);
        },

        addOverlay: function(overlayData) {
            if (FBTrace.DBG_PIXELPERFECT)
                FBTrace.sysout("pixelperfect; PixelPerfectPanel.PPTemplate.addOverlay");

            var args = {
                item: overlayData
            };
            var ppPanel = Firebug.currentContext.getPanel(panelName);

            var existingOverlayElement = ppPanel.document.getElementById("li_" + overlayData.id);
            if(existingOverlayElement == null) {
                this.overlayTag.append(args, ppPanel.document.getElementById("overlay-list"), this);
                FBTrace.sysout("pixelPerfect; PixelPerfectPanel.addOverlay. Added new overlay to grid");
            }
        }
    })}

    // ********************************************************************************************* //
    // Registration

    Firebug.registerPanel(Firebug.PixelPerfectPanel);
    Firebug.registerStylesheet("chrome://pixelperfect/skin/pixelperfect.css");

    if (FBTrace.DBG_PIXELPERFECT)
        FBTrace.sysout("pixelPerfect; PixelPerfectPanel.js, stylesheet registered");

    return Firebug.PixelPerfectPanel;

// ********************************************************************************************* //
});