/* See license.txt for terms of usage */

define([
    "firebug/lib/lib",
    "firebug/lib/trace",
],
function(FBL, FBTrace) {

// var frame = 0,
    // directionForward = true,
    // animationSpeed = 10,
    // spriteSpacing = 170;
// ********************************************************************************************* //
// Custom Module Implementation

Firebug.PPLockAnimationModule = FBL.extend(Firebug.Module,
{
    
    this.frame = 0;
    this.directionForward = true;
    this.animationSpeed = 10;
    this.spriteSpacing = 170;
    this.refreshId = null;

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function(owner)
    {
        Firebug.Module.initialize.apply(this, arguments);

        // TODO: Module initialization (there is one module instance per browser window)

        if (FBTrace.DBG_HELLOAMD)
            FBTrace.sysout("pixelPerfect; PPLockAnimationModule.initialize");
    },

    shutdown: function()
    {
        Firebug.Module.shutdown.apply(this, arguments);

        if (FBTrace.DBG_HELLOAMD)
            FBTrace.sysout("pixelPerfect; PPLockAnimationModule.shutdown");
    },

    run: function() {
        FBTrace.sysout("pixelPerfect; PPLockAnimationModule.run");
        FBTrace.sysout("pixelPerfect; PPLockAnimationModule.run :: current frame => " + frame);

        this.refreshId = setInterval(this.animateNext, this.animationSpeed);
    },

    //TODO: Move this to it's own module
    animateNext: function() {
        FBTrace.sysout("pixelPerfect; PPLockAnimationModule.animateNext :: current frame => " + this.frame);
        if(this.directionForward && this.frame === 31) {
            clearInterval(this.refreshId);
            this.directionForward = false;
            this.frame = 30;
        } else if(!this.directionForward && frame === -1) {
            clearInterval(refreshId);
            this.directionForward = true;
            this.frame = 0;
        } else {
            var top = -1 * (this.spriteSpacing * this.frame);
            // positionControls
            var positionControls = this.getDocuments().panel.getElementById('position-controls');
            positionControls.style.backgroundPosition="'-0px '+top+'px'";
            //$('#position-controls').css('backgroundPosition','-0px '+top+'px');
            if(this.directionForward) {
                this.frame++;
            } else {
                this.frame--;
            }
        }
    }
});

// ********************************************************************************************* //
// Registration

Firebug.registerModule(Firebug.PPLockAnimationModule);

return Firebug.PPLockAnimationModule;

// ********************************************************************************************* //
});